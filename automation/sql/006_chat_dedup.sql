-- ============================================================
-- 006: Anti-duplicados atómico para los webhooks del chatbot
-- Meta/WhatsApp reenvía el mismo mensaje entrante varias veces
-- mientras el webhook (lento por IA) aún procesa; sin esto la
-- respuesta se envía 2-3 veces al cliente.
-- Ya aplicado en producción vía Supabase MCP el 2026-07-06.
-- ============================================================

create table if not exists chat_dedup (
  dedup_key  text primary key,
  created_at timestamptz not null default now()
);

create index if not exists chat_dedup_created_at_idx on chat_dedup (created_at);

-- Reclama un mensaje de forma atómica. Devuelve true si es la PRIMERA vez que
-- se ve esta clave dentro de la ventana TTL (procesar), false si es un reenvío
-- reciente (ignorar). El INSERT ... ON CONFLICT ... WHERE es una sola sentencia,
-- por lo que es seguro ante llamadas concurrentes.
create or replace function claim_dedup(p_key text, p_ttl_seconds int default 90)
returns boolean
language plpgsql
as $$
declare
  claimed boolean;
begin
  insert into chat_dedup (dedup_key, created_at)
  values (p_key, now())
  on conflict (dedup_key) do update
    set created_at = now()
    where chat_dedup.created_at < now() - make_interval(secs => p_ttl_seconds)
  returning true into claimed;

  delete from chat_dedup where created_at < now() - interval '1 day';

  return coalesce(claimed, false);
end;
$$;
