-- ════════════════════════════════════════════════════════════════════════
-- LION CUB — Corrección: políticas RLS de órdenes y compras
--
-- Problema: supabase-schema.sql creó políticas "Service full access ..."
-- con USING (true) sin restringir el rol. Esto permite que cualquier
-- visitante anónimo consulte la API REST de Supabase con la anon key
-- y lea todos los pedidos con datos personales de clientes
-- (nombre, teléfono, email, dirección).
--
-- El código de la app ya usa supabaseAdmin (service_role) que omite RLS,
-- así que estas políticas NO protegen nada útil — solo exponen datos.
--
-- Solución: eliminar las políticas USING (true) y reemplazarlas por
-- políticas admin-only en las tres tablas afectadas.
-- ════════════════════════════════════════════════════════════════════════

-- ─── orders ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Service full access orders" ON public.orders;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_admin_all ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── order_items ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Service full access order_items" ON public.order_items;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_items_admin_all ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── purchases ────────────────────────────────────────────────────────────
-- purchases ya tiene purchase_items_admin_all desde kardex.sql, pero la
-- política "Service full access purchases" con USING (true) del schema
-- inicial sobrevivía. La eliminamos y dejamos una única política clara.
DROP POLICY IF EXISTS "Service full access purchases" ON public.purchases;

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY purchases_admin_all ON public.purchases
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
