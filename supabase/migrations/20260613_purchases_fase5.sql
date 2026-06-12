-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Fase 5 · Compras por variante
--
-- Reactiva el flujo de registro de compras (estaba en "modo lectura" desde
-- Fase 1 porque escribía a products.stock). Ahora cada compra se asocia a
-- una variante específica (talla × color), incrementa atómicamente
-- product_variants.stock y guarda snapshots de nombre de producto, talla
-- y color para que el historial sobreviva renombres o reorgs futuras.
--
-- Cambios al schema:
--   - purchases.variant_id (FK a product_variants, nullable para filas
--     viejas pre-Fase 5; nuevas compras siempre la traen).
--   - purchases.selected_size, selected_color (snapshots de texto).
--   - índice por variant_id.
--
-- Nuevo RPC `register_purchase(...)`:
--   1) Mira la variante + producto para snapshot del nombre/talla/color.
--   2) Inserta la fila de purchases.
--   3) Llama a adjust_variant_stock(variant_id, +qty) — atómica, ya existe
--      desde Fase 1. Si falla, la transacción del RPC hace rollback de
--      todo (la inserción incluida).
--   4) Devuelve el id de la compra creada.
--
-- IDEMPOTENTE.
-- ════════════════════════════════════════════════════════════════════════


-- ─── 1) Columnas nuevas en purchases ─────────────────────────────────────
alter table public.purchases
  add column if not exists variant_id     uuid references public.product_variants(id) on delete set null,
  add column if not exists selected_size  text,
  add column if not exists selected_color text;

create index if not exists idx_purchases_variant_id
  on public.purchases(variant_id) where variant_id is not null;


-- ─── 2) RPC register_purchase ────────────────────────────────────────────
-- security definer para que el RLS del admin no bloquee el insert; aún así
-- chequeamos is_admin() para que solo el panel pueda llamarlo.
create or replace function public.register_purchase(
  p_variant_id    uuid,
  p_quantity      integer,
  p_unit_cost     numeric,
  p_supplier      text default null,
  p_notes         text default null,
  p_purchased_at  date default current_date
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_product_id  text;
  v_product_name text;
  v_size_name   text;
  v_color_name  text;
  v_new_stock   integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a 0';
  end if;
  if p_unit_cost is null or p_unit_cost < 0 then
    raise exception 'El costo unitario no puede ser negativo';
  end if;

  -- Snapshot product + size + color from the variant.
  select v.product_id, p.name, s.name, c.name
    into v_product_id, v_product_name, v_size_name, v_color_name
    from public.product_variants v
    join public.products       p on p.id = v.product_id
    left join public.product_sizes  s on s.id = v.size_id
    left join public.product_colors c on c.id = v.color_id
   where v.id = p_variant_id;

  if v_product_id is null then
    raise exception 'Variante no encontrada';
  end if;

  insert into public.purchases (
    product_id, product_name, variant_id, selected_size, selected_color,
    quantity, unit_cost, total_cost, supplier, notes, purchased_at
  ) values (
    v_product_id, v_product_name, p_variant_id, v_size_name, v_color_name,
    p_quantity, p_unit_cost, p_unit_cost * p_quantity,
    p_supplier, p_notes, p_purchased_at
  )
  returning id into v_purchase_id;

  -- Atomically bump the variant's stock. adjust_variant_stock returns NULL
  -- if it would push stock below zero — impossible here since we always
  -- add — but we still trap it for safety.
  v_new_stock := public.adjust_variant_stock(p_variant_id, p_quantity);
  if v_new_stock is null then
    raise exception 'No se pudo actualizar el stock';
  end if;

  return v_purchase_id;
end;
$$;

revoke all on function public.register_purchase(uuid, integer, numeric, text, text, date) from public;
grant execute on function public.register_purchase(uuid, integer, numeric, text, text, date)
  to authenticated, service_role;
