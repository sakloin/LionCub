# ADR 0002 — Libro de Reclamaciones virtual (tabla `libro_reclamaciones`)
- Fecha: 2026-10-18
- Estado: **propuesta, pendiente de Heber** (toca `supabase/migrations/**`, archivo protegido)
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

## Decisión (si Heber la aprueba)
Crear `supabase/migrations/20261018_libro_reclamaciones.sql` con este contenido:

```sql
-- Libro de Reclamaciones virtual (Ley 29571; D.S. 011-2011-PCM mod. D.S. 101-2022-PCM)
create table if not exists public.libro_reclamaciones (
  id                          uuid primary key default gen_random_uuid(),
  numero                      bigint generated always as identity unique,   -- correlativo
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

  -- Gestión interna (solo admin)
  estado                      text not null default 'pendiente'
                                check (estado in ('pendiente','en_revision','respondido')),
  respuesta                   text,
  respondido_at               timestamptz,

  constraint lr_apoderado_si_menor check (not menor_de_edad or apoderado_nombre is not null)
);

comment on table public.libro_reclamaciones is
  'Hojas del Libro de Reclamaciones virtual. Append-only: no se borran (conservar >= 2 años).';

create index if not exists libro_reclamaciones_estado_idx on public.libro_reclamaciones (estado, created_at);

alter table public.libro_reclamaciones enable row level security;

-- Permisos explícitos: nada por defecto.
revoke all on public.libro_reclamaciones from anon, authenticated;

-- El público solo puede INSERTAR las columnas del formulario (nunca numero, estado ni respuesta).
grant insert (
  tipo, consumidor_nombre, consumidor_tipo_documento, consumidor_numero_documento,
  consumidor_domicilio, consumidor_telefono, consumidor_email, menor_de_edad, apoderado_nombre,
  bien_tipo, bien_descripcion, monto_reclamado, numero_pedido, detalle, pedido_consumidor,
  acepta_politica
) on public.libro_reclamaciones to anon, authenticated;

create policy lr_insert_publico on public.libro_reclamaciones
  for insert to anon, authenticated
  with check (estado = 'pendiente' and respuesta is null and respondido_at is null);

-- Lectura y gestión: solo admin.
grant select on public.libro_reclamaciones to authenticated;
grant update (estado, respuesta, respondido_at) on public.libro_reclamaciones to authenticated;

create policy lr_select_admin on public.libro_reclamaciones
  for select to authenticated using (public.is_admin());

create policy lr_update_admin on public.libro_reclamaciones
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Sin política de DELETE: nadie borra hojas (append-only).
```

Notas:
- La API usa el cliente de servidor (`SUPABASE_SERVICE_ROLE_KEY`) para insertar y leer de vuelta el `numero`; las políticas de arriba blindan la tabla si alguien la llama con la llave pública.
- El código visible es `numero` con 9 dígitos + `anio` (`000000001-2026`). El correlativo es global, no se reinicia cada año (más simple y sigue siendo único y correlativo).
- Después de aplicar la migración: probar una hoja real en `/libro-reclamaciones` y confirmar que llegan las dos copias (consumidor y `ADMIN_EMAIL`).

## Consecuencias
- Se cumple el requisito legal en la web. Falta lo físico: el aviso del Libro de Reclamaciones en el taller/punto de entrega, si hay atención presencial.
- Para responder, por ahora Heber usa Supabase (cambia `estado`, escribe `respuesta`). Una vista en `/admin` para responder queda como deuda (DT-08).
- Los datos de la hoja son datos personales: entran en la Política de privacidad (ya se agregó la finalidad).

## Qué necesita Heber
1. Aprobar esta ADR.
2. Agregar `supabase/migrations/20261018_libro_reclamaciones.sql` a `.claude/desbloqueo` (archivo por archivo), aplicar la migración en Supabase y borrar el desbloqueo.
3. Confirmar razón social, RUC y domicilio en `app/lib/legal.ts` para que aparezcan en la hoja y en el pie.
