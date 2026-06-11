-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Fase 1 del sprint de variantes
--
-- WIPE TOTAL del catálogo + pedidos + compras + waitlist, y rediseño del
-- schema para variantes (talla × color × stock).
--
-- IDEMPOTENTE — se puede correr varias veces (drop … if exists,
-- create … if not exists, on conflict do nothing, alter column if exists).
--
-- ORDEN DE EJECUCIÓN:
--   1. Wipe de datos
--   2. Cleanup de tablas legacy (kardex sin uso) + columnas legacy de products
--   3. Nuevas tablas: product_sizes, product_colors, product_variants
--   4. Seed inicial de sizes (0,1,2) y colors (12)
--   5. order_items.variant_id
--   6. Función RPC adjust_variant_stock (reemplaza adjust_product_stock)
--   7. RLS para las nuevas tablas
--
-- TODO LO QUE NO ESTÁ AQUÍ NO SE TOCA:
--   - categories (las 4 actuales siguen)
--   - audit_log (sirve igual para variantes)
--   - purchases (vacía; la rediseñamos en Fase 3 cuando refactor compras)
--   - is_admin() helper
--   - products_admin_write y demás policies de la auditoría
-- ════════════════════════════════════════════════════════════════════════


-- ─── 1) WIPE DE DATOS ─────────────────────────────────────────────────────
-- Borra TODO el contenido transaccional. Los registros se eliminan, no las
-- tablas. La FK order_items → products dejaría huérfano: lo evitamos
-- borrando primero order_items.
delete from order_items;
delete from orders;
delete from purchases;
delete from waitlist;
delete from products;
-- audit_log opcional — lo mantengo por integridad histórica. Si quieres
-- también limpiarlo, descomenta:
-- delete from audit_log;


-- ─── 2) CLEANUP LEGACY ────────────────────────────────────────────────────
-- Las tablas del Kardex (PR-B) están vacías y su schema asume el modelo
-- viejo de products. Las dejamos limpias para el rediseño de Fase 3.
drop table if exists public.monthly_stock_snapshots cascade;
drop table if exists public.purchase_items          cascade;

-- Quitar la función RPC vieja de stock por producto. La reemplaza
-- adjust_variant_stock más abajo.
drop function if exists public.adjust_product_stock(text, integer);

-- Columnas de products que ya no aplican (todo eso se mueve a variantes).
alter table public.products drop column if exists stock;
alter table public.products drop column if exists sizes;
alter table public.products drop column if exists colors;


-- ─── 3) NUEVAS TABLAS ────────────────────────────────────────────────────

create table if not exists public.product_sizes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_sizes_sort_idx on public.product_sizes(sort_order);

create table if not exists public.product_colors (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  hex_code   text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_colors_name_idx on public.product_colors(name);

create table if not exists public.product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      text not null references public.products(id) on delete cascade,
  size_id         uuid not null references public.product_sizes(id) on delete restrict,
  color_id        uuid not null references public.product_colors(id) on delete restrict,
  sku_variant     text not null unique,
  stock           int  not null default 0 check (stock >= 0),
  cost            numeric,  -- si NULL → usar products.cost
  price_override  numeric,  -- si NULL → usar products.price
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (product_id, size_id, color_id)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_variants_active_idx  on public.product_variants(active) where active = true;


-- ─── 4) SEED INICIAL ────────────────────────────────────────────────────
-- Tallas: 0 (recién nacido), 1 (1 mes), 2 (2 meses). El admin puede
-- añadir más desde la UI más adelante.
insert into public.product_sizes (name, sort_order) values
  ('0', 1),
  ('1', 2),
  ('2', 3)
on conflict (name) do nothing;

-- Colores: 12 con hex codes editoriales (mismo paleta del rediseño).
insert into public.product_colors (name, hex_code) values
  ('Blanco',    '#FAF7EF'),
  ('Crema',     '#F5ECDC'),
  ('Beige',     '#E9DDC4'),
  ('Celeste',   '#C9D9E4'),
  ('Azul',      '#A8B8CB'),
  ('Rosado',    '#F2C9C2'),
  ('Palo rosa', '#EDD3CC'),
  ('Lila',      '#E2DCE5'),
  ('Verde',     '#C8D6BD'),
  ('Amarillo',  '#F4E4A6'),
  ('Marrón',    '#B8A082'),
  ('Gris',      '#C5C5C5')
on conflict (name) do nothing;


-- ─── 5) order_items.variant_id ──────────────────────────────────────────
-- Nullable porque tabla recién vaciada — el siguiente order que entre lo
-- llena. La columna `product_id` se mantiene como respaldo del snapshot.
alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null;
create index if not exists order_items_variant_idx on public.order_items(variant_id);


-- ─── 6) RPC adjust_variant_stock ────────────────────────────────────────
-- Reemplazo atómico de adjust_product_stock. Usa el mismo patrón:
-- negativo decrementa (NULL si dejaría stock < 0), positivo incrementa.
create or replace function public.adjust_variant_stock(
  p_variant_id uuid,
  p_qty_change integer
)
returns integer
language sql
volatile
as $$
  update public.product_variants
     set stock      = stock + p_qty_change,
         updated_at = now()
   where id = p_variant_id
     and stock + p_qty_change >= 0
  returning stock;
$$;
revoke all on function public.adjust_variant_stock(uuid, integer) from public;
grant execute on function public.adjust_variant_stock(uuid, integer) to authenticated, anon, service_role;


-- ─── 7) RLS ─────────────────────────────────────────────────────────────
-- Las tres tablas tienen lectura pública restringida a `active = true`
-- y escritura solo admin. is_admin() viene de la auditoría anterior.

alter table public.product_sizes enable row level security;
drop policy if exists product_sizes_public_read on public.product_sizes;
create policy product_sizes_public_read on public.product_sizes
  for select to anon, authenticated
  using (active = true or public.is_admin());
drop policy if exists product_sizes_admin_write on public.product_sizes;
create policy product_sizes_admin_write on public.product_sizes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.product_colors enable row level security;
drop policy if exists product_colors_public_read on public.product_colors;
create policy product_colors_public_read on public.product_colors
  for select to anon, authenticated
  using (active = true or public.is_admin());
drop policy if exists product_colors_admin_write on public.product_colors;
create policy product_colors_admin_write on public.product_colors
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.product_variants enable row level security;
drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read on public.product_variants
  for select to anon, authenticated
  using (active = true or public.is_admin());
drop policy if exists product_variants_admin_write on public.product_variants;
create policy product_variants_admin_write on public.product_variants
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- ─── 8) VERIFICACIÓN RÁPIDA (opcional, descomenta) ──────────────────────
-- select 'sizes'    as tbl, count(*) from public.product_sizes
-- union all
-- select 'colors',   count(*) from public.product_colors
-- union all
-- select 'variants', count(*) from public.product_variants
-- union all
-- select 'products', count(*) from public.products;
-- → debes ver: sizes=3, colors=12, variants=0, products=0
