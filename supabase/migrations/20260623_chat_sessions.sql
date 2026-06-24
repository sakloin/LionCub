-- Chat sessions for WhatsApp bot
-- Run this in Supabase SQL Editor once before using the bot

create table if not exists chat_sessions (
  id           uuid        primary key default gen_random_uuid(),
  phone        text        not null unique,
  messages     jsonb       not null default '[]',
  last_message_id text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Only the service role (backend) can access this table
alter table chat_sessions enable row level security;

-- Auto-update updated_at on every write
create or replace function update_chat_session_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chat_sessions_updated_at on chat_sessions;
create trigger chat_sessions_updated_at
  before update on chat_sessions
  for each row execute function update_chat_session_timestamp();

-- Optional: auto-delete sessions older than 30 days (keep DB clean)
-- You can schedule this as a pg_cron job or run manually:
-- delete from chat_sessions where updated_at < now() - interval '30 days';
