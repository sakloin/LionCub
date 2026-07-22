-- ============================================================
-- 007: Blindaje de seguridad (advisories de Supabase, 2026-07)
-- Ya aplicado en producción vía Supabase MCP.
-- ============================================================

-- 1) chat_dedup estaba expuesta sin RLS (aviso CRÍTICO del correo de Supabase).
--    Solo la usa el servidor vía claim_dedup (service role, que ignora RLS),
--    así que habilitar RLS sin políticas la cierra al público sin romper nada.
alter table public.chat_dedup enable row level security;

-- 2) Funciones sensibles (compras/stock/kardex) eran ejecutables por "anon"
--    (cualquiera con la clave pública). Se les quita el acceso a anon.
--    El panel admin las llama como usuario AUTENTICADO (logueado), no anon.
revoke execute on function public.register_purchase(jsonb, jsonb[]) from anon;
revoke execute on function public.register_purchase(uuid, integer, numeric, text, text, date) from anon;
revoke execute on function public.delete_purchase(uuid) from anon;

-- 3) Estas 3 funciones NO las usa el código en ningún lado → se cierran del todo
--    (revoke a PUBLIC, que incluye anon y authenticated). Service role las conserva.
revoke execute on function public.decrement_variant_stock(text, text, text, integer) from public;
revoke execute on function public.get_kardex_for_month(integer, integer) from public;
revoke execute on function public.set_monthly_initial_stock(integer, integer, jsonb[]) from public;

-- NOTA: register_purchase / delete_purchase YA se auto-protegen: tienen dentro
--  un `if not public.is_admin() then raise exception 'No autorizado'`, e is_admin()
--  solo acepta el correo del dueño (sakloin@gmail.com). Aunque el advisor las marca
--  como "ejecutables por authenticated", la función misma rechaza a los no-admin,
--  así que están seguras. No requieren cambio (revocar a authenticated rompería el
--  panel admin, que entra logueado). El revoke a anon de arriba es defensa extra.
--
-- Warnings menores restantes (opcionales, no urgentes): search_path de funciones,
--  vista contenido_dashboard (security definer), listado del bucket product-images,
--  y activar la protección de contraseñas filtradas en Auth (dashboard).
