# ADR 0002 — Libro de Reclamaciones virtual (tabla `libro_reclamaciones`)
- Fecha: 2026-10-18 (revisada el mismo día tras el RECHAZO del auditor: B1 antispam, B2 solo servidor + inmutabilidad, B3 constancia)
- Estado: **aprobada por Heber (2026-10-19)**. Migración creada en el repo: `supabase/migrations/20261018_libro_reclamaciones.sql` (incluye `orders.acepta_terminos_at` de DT-17 y `revoke truncate`). **Falta aplicarla en Supabase.**
- Origen: auditoría previa al lanzamiento (2026-10-18), hallazgo #1 (bloqueante legal)

> Numeración: la ADR 0001 (skills del flujo) vive en la rama `claude/skills-del-flujo-v13`. Esta es la 0002 para no chocar con ella.

## Contexto
Todo proveedor que vende en línea en el Perú debe tener un Libro de Reclamaciones virtual (Ley 29571, Código de Protección y Defensa del Consumidor, y su Reglamento del Libro de Reclamaciones, D.S. 011-2011-PCM, modificado por el D.S. 101-2022-PCM). La hoja debe tener número correlativo, entregar copia al consumidor y responderse en un plazo no mayor a 15 días hábiles. Las hojas se conservan al menos 2 años.

En esta rama ya están listas:
- la página `/libro-reclamaciones` (formulario con los campos del Anexo I: consumidor, bien contratado, reclamo o queja, detalle y pedido), enlazada desde el pie, Términos y checkout;
- la ruta `POST /api/reclamos` (valida con `app/lib/reclamos.ts`, inserta con el cliente de servidor, devuelve el código `000000001-2026` y envía la copia por correo con Resend).

Falta la tabla. Las migraciones están protegidas, así que no se creó: **mientras no exista, la API responde 503 con un mensaje claro y la página muestra WhatsApp y correo como canal alterno.** El formulario no pierde datos: el consumidor ve el aviso y los botones para enviarlos por esos canales.

## Opciones consideradas
1. Solo enlazar a WhatsApp o correo. Descartada: no hay número correlativo ni copia automática; el reglamento pide la hoja con su formato.
2. Usar un servicio externo de libro de reclamaciones. Descartada: costo mensual y datos de clientes fuera de nuestra base.
3. **Tabla propia con RLS, inserción solo por la API de servidor y lectura solo admin.** Elegida.

## Decisión (aprobada por Heber el 2026-10-19)
Crear `supabase/migrations/20261018_libro_reclamaciones.sql` con este contenido:

```sql
-- Libro de Reclamaciones virtual (Ley 29571; D.S. 011-2011-PCM mod. D.S. 101-2022-PCM)
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

-- Lectura y gestión: solo admin.
grant select on public.libro_reclamaciones to authenticated;
grant update (estado, respuesta, respondido_at) on public.libro_reclamaciones to authenticated;

create policy lr_select_admin on public.libro_reclamaciones
  for select to authenticated using (public.is_admin());

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

create trigger lr_proteger_hoja
  before update or delete on public.libro_reclamaciones
  for each row execute function public.lr_proteger_hoja();

revoke all on function public.lr_proteger_hoja() from public, anon, authenticated;
```

Notas:
- **Solo el servidor inserta** (revisión del auditor, B2): `POST /api/reclamos` usa `SUPABASE_SERVICE_ROLE_KEY`. Con la llave pública no se puede leer, insertar, editar ni borrar.
- **Antispam** (B1): la API exige un token de carga firmado en el servidor (`GET /api/reclamos`) y rechaza envíos en menos de 3 s; además cuenta en esta tabla los envíos de la última hora por `ip_hash` y por `consumidor_email` (máximo 3 de cada uno). `ip_hash` = HMAC-SHA256 de la IP con la sal `RECLAMOS_SAL` (o, si no existe, una derivada de la llave de servicio).
- El código visible es `numero` con 9 dígitos + `anio` (`000000001-2026`). El correlativo es global y **puede tener saltos**: una identidad de Postgres no reutiliza valores si un insert falla o se revierte. Los saltos no significan hojas borradas (el trigger impide borrar).
- Después de aplicar la migración: probar una hoja real en `/libro-reclamaciones`, confirmar que llegan las dos copias (consumidor y `ADMIN_EMAIL`), que un 4.º envío en la misma hora responde 429 y que `delete` falla.
- Recomendado: crear `RECLAMOS_SAL` (cadena aleatoria larga) en Vercel, solo servidor.

## Consecuencias
- Se cumple el requisito legal en la web. Falta lo físico: el aviso del Libro de Reclamaciones en el taller/punto de entrega, si hay atención presencial.
- Para responder, por ahora Heber usa Supabase (cambia `estado`, escribe `respuesta`). Una vista en `/admin` para responder queda como deuda (DT-08).
- Los datos de la hoja son datos personales: entran en la Política de privacidad (finalidad, conservación ≥ 2 años y encargados fuera del Perú ya agregados).
- Aparte (no es de esta tabla): la aceptación de Términos del checkout se valida en `/api/orders`, pero guardarla requiere una columna `orders.acepta_terminos_at timestamptz` en otra migración (DT-17).

## Agregados al aprobar (2026-10-19)
- `revoke truncate ... from public, anon, authenticated, service_role` (menor del auditor: el trigger no corre en `TRUNCATE`).
- `alter table public.orders add column if not exists acepta_terminos_at timestamptz` (DT-17); `/api/orders` la llena con la hora del servidor y, si la columna aún no existe, guarda el pedido sin ella.
- Un bloque inicial que detiene la migración si no existe `public.is_admin()`: se usa en migraciones anteriores, pero ninguna migración del repo la crea.

## Qué necesita Heber
1. ~~Aprobar esta ADR.~~ ✅ Aprobada (2026-10-19).
2. Aplicar `supabase/migrations/20261018_libro_reclamaciones.sql` en Supabase (ver la descripción del PR #109).
3. Confirmar razón social, RUC y domicilio en `app/lib/legal.ts` para que aparezcan en la hoja y en el pie.
