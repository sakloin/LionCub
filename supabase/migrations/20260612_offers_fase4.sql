-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Fase 4 · Sistema real de ofertas
--
-- Reemplaza el flag boolean `products.has_offer` (manual, sin %) con una
-- tabla `offers` que soporta:
--   - Descuento por % (sólo % en v1; monto fijo y 2x1 quedan para v2)
--   - Alcance "product" (un producto específico) o "category" (todos los
--     productos de una categoría)
--   - Fechas opcionales starts_at / ends_at
--   - Flag `active` para pausar sin borrar
--
-- `products.has_offer` se mantiene pero se vuelve DERIVADO: un trigger lo
-- recomputa cuando cambian las ofertas. La UI admin del formulario de
-- producto deja de exponer ese flag.
--
-- El cálculo del descuento es server-authoritative: /api/orders refetch-ea
-- offers y recomputa el precio final. El cliente jamás envía precios.
--
-- IDEMPOTENTE — se puede correr varias veces sin error.
-- ════════════════════════════════════════════════════════════════════════


-- ─── 1) Tabla offers ────────────────────────────────────────────────────
create table if not exists public.offers (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  discount_percent  numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 90),
  scope_type        text not null check (scope_type in ('product','category')),
  product_id        uuid references public.products(id) on delete cascade,
  category          text,
  starts_at         timestamptz,
  ends_at           timestamptz,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint offer_scope_consistent check (
    (scope_type = 'product'  and product_id is not null and category is null) or
    (scope_type = 'category' and category is not null   and product_id is null)
  ),
  constraint offer_dates_valid check (
    starts_at is null or ends_at is null or ends_at > starts_at
  )
);

create index if not exists idx_offers_product
  on public.offers(product_id) where product_id is not null;
create index if not exists idx_offers_category
  on public.offers(category) where category is not null;
create index if not exists idx_offers_active
  on public.offers(active, starts_at, ends_at) where active = true;


-- ─── 2) updated_at touch ────────────────────────────────────────────────
create or replace function public.touch_offers_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_offers_touch on public.offers;
create trigger trg_offers_touch before update on public.offers
  for each row execute function public.touch_offers_updated_at();


-- ─── 3) Sincronización products.has_offer ───────────────────────────────
-- Sólo se considera "live" una oferta que esté activa Y dentro de su
-- ventana (starts_at <= now() <= ends_at, nulls = abiertos).

create or replace function public.refresh_product_has_offer(p_ids uuid[])
returns void language plpgsql as $$
begin
  if p_ids is null or array_length(p_ids, 1) is null then
    return;
  end if;
  update public.products p
     set has_offer = exists (
       select 1 from public.offers o
        where o.active
          and (o.starts_at is null or o.starts_at <= now())
          and (o.ends_at   is null or o.ends_at   >= now())
          and (
            (o.scope_type = 'product'  and o.product_id = p.id) or
            (o.scope_type = 'category' and o.category   = p.category)
          )
     )
   where p.id = any (p_ids);
end;
$$;

create or replace function public.offers_sync_has_offer() returns trigger
language plpgsql as $$
declare
  affected uuid[];
begin
  if (tg_op = 'DELETE') then
    if old.scope_type = 'product' then
      affected := array[old.product_id];
    else
      affected := array(select id from public.products where category = old.category);
    end if;
  else
    -- INSERT or UPDATE
    if new.scope_type = 'product' then
      affected := array[new.product_id];
    else
      affected := array(select id from public.products where category = new.category);
    end if;
    -- UPDATE: agrega los del scope viejo si cambió
    if (tg_op = 'UPDATE') then
      if old.scope_type = 'product'
         and old.product_id is not null
         and (new.scope_type <> 'product' or old.product_id is distinct from new.product_id) then
        affected := affected || array[old.product_id];
      end if;
      if old.scope_type = 'category'
         and old.category is not null
         and (new.scope_type <> 'category' or old.category is distinct from new.category) then
        affected := affected || array(select id from public.products where category = old.category);
      end if;
    end if;
  end if;
  perform public.refresh_product_has_offer(affected);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_offers_sync_has_offer on public.offers;
create trigger trg_offers_sync_has_offer
  after insert or update or delete on public.offers
  for each row execute function public.offers_sync_has_offer();


-- ─── 4) RLS ────────────────────────────────────────────────────────────
-- Lectura pública sólo de ofertas vigentes (active + dentro de la ventana).
-- Admin puede leer y escribir todas.
alter table public.offers enable row level security;

drop policy if exists offers_public_read on public.offers;
create policy offers_public_read on public.offers
  for select to anon, authenticated
  using (
    public.is_admin()
    or (
      active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at   is null or ends_at   >= now())
    )
  );

drop policy if exists offers_admin_write on public.offers;
create policy offers_admin_write on public.offers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- ─── 5) Limpieza inicial ───────────────────────────────────────────────
-- Resetea has_offer en todos los productos para arrancar el sistema
-- consistente. Cualquier producto que tenía has_offer=true manualmente
-- pero no tiene ninguna oferta en la nueva tabla quedará en false.
update public.products set has_offer = false where has_offer = true;
