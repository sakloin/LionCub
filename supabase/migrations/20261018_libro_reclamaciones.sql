-- Libro de Reclamaciones virtual (Ley 29571; D.S. 011-2011-PCM mod. D.S. 101-2022-PCM)
-- ADR 0002, aprobada por Heber (2026-10-19). Incluye además:
--   - orders.acepta_terminos_at (DT-17): cuándo aceptó Términos y Privacidad en el checkout.
--   - revoke truncate sobre la tabla (menor del auditor): el trigger no corre en TRUNCATE.

-- Requisito: public.is_admin() debe existir (viene de una auditoría anterior; no se crea
-- en ninguna migración de este repo). Si falta, la migración se detiene aquí.
do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'Falta la función public.is_admin(); créala antes de aplicar esta migración';
  end if;
end;
$$;

create table if not exists public.libro_reclamaciones (
  id                          uuid primary key default gen_random_uuid(),
  numero                      bigint generated always as identity unique,   -- correlativo (puede tener saltos)
  anio                        smallint not null
                                default extract(year from (now() at time zone 'America/Lima'))::smallint,
  created_at                  timestamptz not null default now(),

  tipo                        text not null check (tipo in ('reclamo','queja')),

  consumidor_nombre           text not null check (char_length(consumidor_nombre) between 3 and 150),
  consumidor_tipo_documento   text not null check (consumidor_tipo_documento in ('DNI','CE','PASAPORTE','RUC')),
  consumidor_numero_documento text not null check (char_length(consumidor_numero_documento) between 6 and 15),
  consumidor_domicilio        text not null check (char_length(consumidor_domicilio) between 5 and 250),
  consumidor_telefono         text not null check (char_length(consumidor_telefono) between 6 and 20),
  consumidor_email            text not null check (char_length(consumidor_email) between 5 and 150
                                                   and consumidor_email like '%@%'),
  menor_de_edad               boolean not null default false,
  apoderado_nombre            text check (apoderado_nombre is null or char_length(apoderado_nombre) between 3 and 150),

  bien_tipo                   text not null check (bien_tipo in ('producto','servicio')),
  bien_descripcion            text not null check (char_length(bien_descripcion) between 3 and 500),
  monto_reclamado             numeric(10,2) check (monto_reclamado is null or monto_reclamado >= 0),
  numero_pedido               text check (numero_pedido is null or char_length(numero_pedido) <= 40),

  detalle                     text not null check (char_length(detalle) between 10 and 3000),
  pedido_consumidor           text not null check (char_length(pedido_consumidor) between 5 and 2000),
  acepta_politica             boolean not null check (acepta_politica),

  -- Antispam: HMAC-SHA256 de la IP con sal de servidor. Nunca la IP en claro.
  ip_hash                     text not null check (ip_hash ~ '^[0-9a-f]{64}$'),

  -- Gestión interna (solo admin)
  estado                      text not null default 'pendiente'
                                check (estado in ('pendiente','en_revision','respondido')),
  respuesta                   text,
  respondido_at               timestamptz,

  constraint lr_apoderado_si_menor check (not menor_de_edad or apoderado_nombre is not null)
);

comment on table public.libro_reclamaciones is
  'Hojas del Libro de Reclamaciones virtual. Append-only: no se borran (conservar >= 2 años). Solo el servidor inserta.';

create index if not exists libro_reclamaciones_estado_idx on public.libro_reclamaciones (estado, created_at);
-- Límite de envíos por hora (consultas de la API).
create index if not exists libro_reclamaciones_ip_idx     on public.libro_reclamaciones (ip_hash, created_at);
create index if not exists libro_reclamaciones_email_idx  on public.libro_reclamaciones (consumidor_email, created_at);

alter table public.libro_reclamaciones enable row level security;
alter table public.libro_reclamaciones force row level security;

-- Permisos explícitos. El público NO inserta directo: solo la API de servidor
-- (POST /api/reclamos, con la llave de servicio) crea hojas, después de validar,
-- aplicar el antispam y calcular ip_hash. Sin grant ni política de INSERT para anon.
revoke all on public.libro_reclamaciones from anon, authenticated;

-- TRUNCATE no dispara el trigger de inmutabilidad: nadie (ni la llave de servicio) lo puede usar.
revoke truncate on public.libro_reclamaciones from public, anon, authenticated, service_role;

-- Lectura y gestión: solo admin.
grant select on public.libro_reclamaciones to authenticated;
grant update (estado, respuesta, respondido_at) on public.libro_reclamaciones to authenticated;

drop policy if exists lr_select_admin on public.libro_reclamaciones;
create policy lr_select_admin on public.libro_reclamaciones
  for select to authenticated using (public.is_admin());

drop policy if exists lr_update_admin on public.libro_reclamaciones;
create policy lr_update_admin on public.libro_reclamaciones
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Inmutabilidad: nadie borra hojas y nadie cambia lo que escribió el consumidor
-- (ni siquiera con la llave de servicio). Solo cambian estado/respuesta/respondido_at.
create or replace function public.lr_proteger_hoja()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Las hojas del Libro de Reclamaciones no se pueden borrar';
  end if;
  if (new.id, new.numero, new.anio, new.created_at, new.tipo,
      new.consumidor_nombre, new.consumidor_tipo_documento, new.consumidor_numero_documento,
      new.consumidor_domicilio, new.consumidor_telefono, new.consumidor_email,
      new.menor_de_edad, new.apoderado_nombre, new.bien_tipo, new.bien_descripcion,
      new.monto_reclamado, new.numero_pedido, new.detalle, new.pedido_consumidor,
      new.acepta_politica, new.ip_hash)
     is distinct from
     (old.id, old.numero, old.anio, old.created_at, old.tipo,
      old.consumidor_nombre, old.consumidor_tipo_documento, old.consumidor_numero_documento,
      old.consumidor_domicilio, old.consumidor_telefono, old.consumidor_email,
      old.menor_de_edad, old.apoderado_nombre, old.bien_tipo, old.bien_descripcion,
      old.monto_reclamado, old.numero_pedido, old.detalle, old.pedido_consumidor,
      old.acepta_politica, old.ip_hash) then
    raise exception 'Solo se pueden cambiar estado, respuesta y respondido_at';
  end if;
  return new;
end;
$$;

drop trigger if exists lr_proteger_hoja on public.libro_reclamaciones;
create trigger lr_proteger_hoja
  before update or delete on public.libro_reclamaciones
  for each row execute function public.lr_proteger_hoja();

revoke all on function public.lr_proteger_hoja() from public, anon, authenticated;

-- DT-17: constancia de aceptación de Términos y Privacidad en el checkout.
-- Nullable: los pedidos anteriores (y los del chatbot, por ahora) no la tienen.
alter table public.orders add column if not exists acepta_terminos_at timestamptz;
comment on column public.orders.acepta_terminos_at is
  'Momento (servidor) en que el cliente aceptó Términos y Privacidad en el checkout web.';
