-- ============================================================
-- 005: Pausa del chatbot por intervención humana
-- Cuando un agente humano escribe en un chat, el bot queda
-- pausado para ese cliente (bot_paused = true) hasta que el
-- agente escriba exactamente la palabra clave @LionCub.pe
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

create table if not exists chat_sessions (
  phone text primary key,
  messages jsonb,
  last_message_id text,
  updated_at timestamptz default now()
);

alter table chat_sessions
  add column if not exists bot_paused boolean not null default false;
