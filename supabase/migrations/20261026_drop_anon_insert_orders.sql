-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Eliminar políticas anon INSERT residuales en orders / order_items
--
-- orders_anon_insert y oi_anon_insert eran políticas del setup inicial que
-- permitían insertar pedidos directamente con la anon key. El checkout de
-- la app usa supabaseAdmin (service_role) que omite RLS, por lo que estas
-- políticas no aportan nada y son una superficie de ataque innecesaria
-- (spam de pedidos falsos).
--
-- Verificado: ningún flujo del código usa la anon key para insertar
-- en orders u order_items.
-- ════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS orders_anon_insert ON public.orders;
DROP POLICY IF EXISTS oi_anon_insert     ON public.order_items;
