-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Kardex backend (PR-B del sprint)
--
-- Aplica de manera idempotente (todos los `create … if not exists`,
-- `add column if not exists`, `create or replace function`):
--   1. Extiende `purchases` con columnas del nuevo modelo (master-detail).
--   2. Crea `purchase_items` (renglones por compra).
--   3. Crea `monthly_stock_snapshots` (inventario inicial por mes).
--   4. Crea `audit_log` si no existe (también la usa PR-A).
--   5. Funciones SQL SECURITY DEFINER, admin-only:
--        - register_purchase      → transacción: header + items
--          + actualiza stock + costo promedio ponderado de products.
--        - get_kardex_for_month   → vista del kardex para un mes (TZ Lima).
--        - set_monthly_initial_stock → upsert de snapshots por mes.
--   6. RLS admin-only en las tablas nuevas.
--
-- CERO UI todavía — el código consume esto en el próximo sprint.
-- Correr en SQL Editor de Supabase. Idempotente: se puede correr varias
-- veces sin efecto secundario (`create or replace`, `add column if not exists`).
-- ════════════════════════════════════════════════════════════════════════


-- ─── 1) Extender `purchases` con columnas del nuevo modelo ────────────────
-- Las columnas viejas (product_id, product_name, quantity, unit_cost,
-- total_cost, supplier, purchased_at) se mantienen para no romper
-- /admin/compras. Los registros que cree register_purchase poblan las
-- columnas nuevas y dejan las viejas en NULL — una migración de datos
-- puede hacerse después de refactorizar /admin/compras.
alter table public.purchases add column if not exists supplier_name text;
alter table public.purchases add column if not exists supplier_ruc  text;
alter table public.purchases add column if not exists purchase_date date;
alter table public.purchases add column if not exists proof_url     text;
alter table public.purchases add column if not exists total_cents   integer;
alter table public.purchases add column if not exists created_by    uuid references auth.users(id);


-- ─── 2) Tabla purchase_items ─────────────────────────────────────────────
create table if not exists public.purchase_items (
  id              uuid primary key default gen_random_uuid(),
  purchase_id     uuid not null references public.purchases(id) on delete cascade,
  product_id      text not null references public.products(id),
  quantity        integer not null check (quantity > 0),
  unit_cost_cents integer not null check (unit_cost_cents >= 0),
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  created_at      timestamptz not null default now()
);
create index if not exists purchase_items_purchase_idx on public.purchase_items(purchase_id);
create index if not exists purchase_items_product_idx  on public.purchase_items(product_id);


-- ─── 3) Tabla monthly_stock_snapshots ────────────────────────────────────
create table if not exists public.monthly_stock_snapshots (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references public.products(id),
  year          int  not null,
  month         int  not null check (month between 1 and 12),
  initial_stock integer not null check (initial_stock >= 0),
  notes         text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  unique (product_id, year, month)
);


-- ─── 4) Tabla audit_log (idempotente — también la usa PR-A) ──────────────
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  table_name    text not null,
  record_id     text not null,
  field_changed text not null,
  old_value     text,
  new_value     text,
  changed_by    uuid references auth.users(id),
  changed_at    timestamptz not null default now()
);
create index if not exists audit_log_table_record_idx on public.audit_log(table_name, record_id);
create index if not exists audit_log_changed_at_idx   on public.audit_log(changed_at desc);


-- ─── 5) Función register_purchase ────────────────────────────────────────
-- p_purchase JSONB:
--   { supplier_name, supplier_ruc, purchase_date(YYYY-MM-DD),
--     proof_url, notes }
-- p_items    JSONB[]:  each item is
--   { product_id, quantity, unit_cost_cents }
--
-- Transacción implícita de la función: si cualquier UPDATE/INSERT lanza,
-- todo lo previo se revierte. Retorna el uuid de la purchase creada.
create or replace function public.register_purchase(
  p_purchase jsonb,
  p_items    jsonb[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_total_cents integer := 0;
  v_item        jsonb;
  v_qty         integer;
  v_unit        integer;
  v_subtotal    integer;
begin
  if not public.is_admin() then
    raise exception 'permission denied: not an admin';
  end if;
  if p_items is null or coalesce(array_length(p_items, 1), 0) = 0 then
    raise exception 'register_purchase: requires at least one item';
  end if;

  -- Calcular total
  foreach v_item in array p_items loop
    v_total_cents := v_total_cents
      + (v_item->>'quantity')::int * (v_item->>'unit_cost_cents')::int;
  end loop;

  -- Header
  insert into purchases (
    supplier_name, supplier_ruc, purchase_date,
    proof_url, total_cents, notes, created_by
  ) values (
    p_purchase->>'supplier_name',
    p_purchase->>'supplier_ruc',
    (p_purchase->>'purchase_date')::date,
    p_purchase->>'proof_url',
    v_total_cents,
    p_purchase->>'notes',
    auth.uid()
  )
  returning id into v_purchase_id;

  -- Líneas + stock + costo promedio ponderado
  foreach v_item in array p_items loop
    v_qty      := (v_item->>'quantity')::int;
    v_unit     := (v_item->>'unit_cost_cents')::int;
    v_subtotal := v_qty * v_unit;

    insert into purchase_items (
      purchase_id, product_id, quantity, unit_cost_cents, subtotal_cents
    ) values (
      v_purchase_id, v_item->>'product_id', v_qty, v_unit, v_subtotal
    );

    -- Promedio ponderado en soles:
    --   nuevo_cost = (stock_actual * cost_actual + qty * unit_soles)
    --              / (stock_actual + qty)
    -- Si stock_actual = 0 → nuevo_cost = unit_soles directo.
    update products
       set stock = stock + v_qty,
           cost  = case
             when stock = 0 then v_unit::numeric / 100.0
             else (stock::numeric * cost
                   + v_qty::numeric * v_unit::numeric / 100.0)
                  / (stock + v_qty)::numeric
           end
     where id = v_item->>'product_id';
  end loop;

  return v_purchase_id;
end;
$$;
revoke all on function public.register_purchase(jsonb, jsonb[]) from public;
grant execute on function public.register_purchase(jsonb, jsonb[]) to authenticated;


-- ─── 6) Función get_kardex_for_month ─────────────────────────────────────
-- Devuelve una fila por producto con:
--   initial_stock(_source) — del snapshot si existe; 0 + source='none' si no
--                            (UI puede marcar amarillo). El fallback al
--                            final_stock del mes anterior queda para una
--                            iteración futura.
--   month_purchases — Σ purchase_items.quantity de purchases en el mes.
--   month_sales     — Σ order_items.quantity de orders del mes pagados
--                     o entregados.
--   reserved        — Σ order_items.quantity de orders cuyo order_status
--                     no es entregado ni cancelado (todos los meses).
--   final_stock     — initial + purchases - sales - reserved.
--   avg_cost        — products.cost actual.
--   stock_value     — final_stock * avg_cost.
-- Zona horaria: America/Lima para los límites del mes.
create or replace function public.get_kardex_for_month(
  p_year  int,
  p_month int
)
returns table (
  product_id           text,
  product_name         text,
  product_image_url    text,
  initial_stock        int,
  initial_stock_source text,
  month_purchases      int,
  month_sales          int,
  reserved             int,
  final_stock          int,
  avg_cost             numeric,
  stock_value          numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_end   timestamptz;
begin
  if not public.is_admin() then
    raise exception 'permission denied: not an admin';
  end if;

  v_start := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'America/Lima');
  v_end   := v_start + interval '1 month';

  return query
  with base as (
    select
      p.id                  as product_id,
      p.name                as product_name,
      p.image_url           as product_image_url,
      coalesce(p.cost, 0)   as avg_cost,
      coalesce(
        (select s.initial_stock
           from monthly_stock_snapshots s
          where s.product_id = p.id and s.year = p_year and s.month = p_month),
        0
      )::int as initial_stock,
      case
        when exists (
          select 1 from monthly_stock_snapshots s
           where s.product_id = p.id and s.year = p_year and s.month = p_month
        ) then 'snapshot'::text
        else 'none'::text
      end as initial_stock_source,
      coalesce((
        select sum(pi.quantity)::int
          from purchase_items pi
          join purchases pu on pu.id = pi.purchase_id
         where pi.product_id = p.id
           and pu.purchase_date >= v_start::date
           and pu.purchase_date <  v_end::date
      ), 0)::int as month_purchases,
      coalesce((
        select sum(oi.quantity)::int
          from order_items oi
          join orders o on o.id = oi.order_id
         where oi.product_id = p.id
           and o.created_at >= v_start
           and o.created_at <  v_end
           and (o.payment_status = 'pagado' or o.order_status = 'entregado')
      ), 0)::int as month_sales,
      coalesce((
        select sum(oi.quantity)::int
          from order_items oi
          join orders o on o.id = oi.order_id
         where oi.product_id = p.id
           and o.order_status not in ('entregado', 'cancelado')
      ), 0)::int as reserved
    from products p
  )
  select
    b.product_id,
    b.product_name,
    b.product_image_url,
    b.initial_stock,
    b.initial_stock_source,
    b.month_purchases,
    b.month_sales,
    b.reserved,
    (b.initial_stock + b.month_purchases - b.month_sales - b.reserved)::int as final_stock,
    b.avg_cost,
    ((b.initial_stock + b.month_purchases - b.month_sales - b.reserved)::numeric * b.avg_cost) as stock_value
  from base b
  order by b.product_id;
end;
$$;
revoke all on function public.get_kardex_for_month(int, int) from public;
grant execute on function public.get_kardex_for_month(int, int) to authenticated;


-- ─── 7) Función set_monthly_initial_stock ────────────────────────────────
-- p_items JSONB[]: each { product_id, initial_stock, notes? }
-- Upsert idempotente sobre la unique (product_id, year, month).
create or replace function public.set_monthly_initial_stock(
  p_year  int,
  p_month int,
  p_items jsonb[]
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  v_item  jsonb;
begin
  if not public.is_admin() then
    raise exception 'permission denied: not an admin';
  end if;
  if p_items is null or coalesce(array_length(p_items, 1), 0) = 0 then
    return 0;
  end if;

  foreach v_item in array p_items loop
    insert into monthly_stock_snapshots (
      product_id, year, month, initial_stock, notes, created_by
    ) values (
      v_item->>'product_id',
      p_year,
      p_month,
      (v_item->>'initial_stock')::int,
      v_item->>'notes',
      auth.uid()
    )
    on conflict (product_id, year, month)
      do update set
        initial_stock = excluded.initial_stock,
        notes         = excluded.notes,
        created_by    = excluded.created_by;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;
revoke all on function public.set_monthly_initial_stock(int, int, jsonb[]) from public;
grant execute on function public.set_monthly_initial_stock(int, int, jsonb[]) to authenticated;


-- ─── 8) RLS para las tablas nuevas ───────────────────────────────────────
-- Las funciones de arriba son SECURITY DEFINER + chequean is_admin(), así
-- que escriben/leen estas tablas regardless de RLS cuando se invocan
-- correctamente. Las policies siguientes son para acceso directo desde
-- el cliente admin (read-only desde UI) y para defensa en profundidad.

-- purchase_items: solo admin (todas las ops)
alter table public.purchase_items enable row level security;
drop policy if exists purchase_items_admin_all on public.purchase_items;
create policy purchase_items_admin_all on public.purchase_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- monthly_stock_snapshots: solo admin
alter table public.monthly_stock_snapshots enable row level security;
drop policy if exists snapshots_admin_all on public.monthly_stock_snapshots;
create policy snapshots_admin_all on public.monthly_stock_snapshots
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- audit_log: admin lee + admin inserta (no update/delete por integridad).
alter table public.audit_log enable row level security;
drop policy if exists audit_log_admin_read on public.audit_log;
create policy audit_log_admin_read on public.audit_log
  for select to authenticated using (public.is_admin());
drop policy if exists audit_log_admin_insert on public.audit_log;
create policy audit_log_admin_insert on public.audit_log
  for insert to authenticated with check (public.is_admin());

-- purchases: la policy admin-only del Sección 2 anterior ya cubre lectura
-- y escritura. Si por alguna razón no está, descomenta las 3 líneas:
-- alter table public.purchases enable row level security;
-- drop policy if exists purchases_admin_all on public.purchases;
-- create policy purchases_admin_all on public.purchases for all to authenticated
--   using (public.is_admin()) with check (public.is_admin());


-- ─── 9) Test rápido (comentado — descomentar para verificar) ─────────────
-- Compra de prueba (sustituye los ids si tu BD difiere):
-- select public.register_purchase(
--   jsonb_build_object(
--     'supplier_name', 'Test Gamarra',
--     'supplier_ruc',  '12345678901',
--     'purchase_date', current_date::text,
--     'proof_url',     null,
--     'notes',         'prueba del backend'
--   ),
--   array[
--     jsonb_build_object('product_id', 'LC-002', 'quantity', 2, 'unit_cost_cents', 1500)
--   ]
-- );
--
-- Kardex del mes actual:
-- select * from public.get_kardex_for_month(
--   extract(year  from current_date at time zone 'America/Lima')::int,
--   extract(month from current_date at time zone 'America/Lima')::int
-- )
-- order by product_id limit 10;
--
-- Inventario inicial para un par de productos:
-- select public.set_monthly_initial_stock(
--   2026, 5,
--   array[
--     jsonb_build_object('product_id', 'LC-002', 'initial_stock', 10, 'notes', 'test')
--   ]
-- );
