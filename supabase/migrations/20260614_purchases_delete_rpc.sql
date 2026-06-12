-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Fase 5b · Eliminar compra con safety check
--
-- Permite borrar una fila de purchases SOLO si todavía hay stock suficiente
-- de su variante para revertirla. Si parte de esa compra ya se vendió
-- (variant.stock < purchase.quantity), la función rechaza el delete con
-- un mensaje claro para que el admin no rompa el inventario.
--
-- Idempotente.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.delete_purchase(p_purchase_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_purchase   public.purchases;
  v_new_stock  integer;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  select * into v_purchase from public.purchases where id = p_purchase_id;
  if v_purchase.id is null then
    raise exception 'Compra no encontrada';
  end if;

  -- Purchases registered before Fase 5 may have no variant_id; nothing to
  -- revert on stock, just delete the historical row.
  if v_purchase.variant_id is null then
    delete from public.purchases where id = p_purchase_id;
    return;
  end if;

  -- Try to subtract the purchase qty from the variant's stock. The RPC
  -- returns NULL if the result would be negative — that's our signal that
  -- units from this batch already left as sales, so we refuse to delete.
  v_new_stock := public.adjust_variant_stock(v_purchase.variant_id, -v_purchase.quantity);
  if v_new_stock is null then
    raise exception 'Esta compra ya no se puede eliminar: parte (o toda) la mercadería ya se vendió';
  end if;

  delete from public.purchases where id = p_purchase_id;
end;
$$;

revoke all on function public.delete_purchase(uuid) from public;
grant execute on function public.delete_purchase(uuid) to authenticated, service_role;
