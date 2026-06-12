-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Fase 3 del sprint de variantes: galería de imágenes
--
-- Tabla product_images: varias imágenes por producto con dos roles
-- especiales (portada y hover). Una sola fila puede ser is_primary por
-- producto y una sola fila puede ser is_hover (índices únicos parciales).
--
-- Backwards compat: products.image_url se mantiene y se queda sincronizado
-- con la imagen primary desde el código (al hacer set-primary el admin
-- también escribe products.image_url). De esa forma cart, checkout, admin
-- tabla y demás vistas que leen products.image_url siguen funcionando.
--
-- IDEMPOTENTE: create … if not exists, drop policy if exists.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references public.products(id) on delete cascade,
  url           text not null,
  -- Path relativo dentro del bucket product-images (products/<id>/<uuid>.<ext>).
  -- Lo usamos para borrar el archivo cuando el admin elimina una imagen.
  storage_path  text not null,
  sort_order    int  not null default 0,
  is_primary    boolean not null default false,
  is_hover      boolean not null default false,
  alt_text      text,
  -- Etiqueta libre del prompt original (principal | detalle | modelo | flatlay | otro)
  -- — opcional, sin enum. El admin puede ignorarlo en Fase 3.
  image_type    text,
  -- Para asociar una imagen a un color del producto en una iteración futura.
  color_id      uuid references public.product_colors(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images(product_id, sort_order);

-- Exactamente 0 o 1 portada por producto.
create unique index if not exists product_images_one_primary
  on public.product_images(product_id) where is_primary;

-- Exactamente 0 o 1 hover por producto.
create unique index if not exists product_images_one_hover
  on public.product_images(product_id) where is_hover;

-- ─── RLS ──────────────────────────────────────────────────────────────────
alter table public.product_images enable row level security;

-- Lectura pública: cualquiera puede leer imágenes de productos activos.
-- (Admin lee todas — incluidas imágenes de productos inactivos para edición.)
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
  for select to anon, authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.active = true
    )
  );

-- Escritura solo admin.
drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_admin_write on public.product_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─── Verificación rápida (opcional, descomenta) ──────────────────────────
-- select count(*) as total_images from public.product_images;
