---
name: tabla-con-rls
description: Procedimiento para crear o modificar una tabla en Supabase con RLS activa, lectura pública solo de lo publicable, escritura solo de admin o del servidor, auditoría si es sensible y comprobación. Úsala siempre que una fase agregue una tabla, una columna con datos de clientes o una migración en supabase/migrations/.
---

# Tabla con RLS (Lion Cub)

Estándar fijo del método: **toda tabla con datos de negocio lleva RLS, con comprobación**. Lion Cub **no es multiempresa**: es una sola tienda y no hay `empresa_id`. El aislamiento es **por rol**: el público (`anon`) solo lee lo publicable (productos y variantes activas), el admin (`public.is_admin()`) gestiona, y el servidor (`supabaseAdmin`, service role) escribe pedidos y pagos. Una tabla sin RLS, o con escritura abierta, expone datos de clientes con la llave pública.

## Antes de tocar nada
1. `supabase/migrations/**` y `app/api/payments/**` están bloqueados en `.claude/settings.json` (`permissions.deny`) y listados en `.claude/protegidos.txt`. Hace falta una ADR aprobada por Heber en `docs/decisiones/` y que Heber habilite la edición. Sin eso, para.
2. Lee `MONEY.md` y migraciones modelo: `supabase/migrations/20260530_kardex.sql` (solo admin y `audit_log`) y `supabase/migrations/20260601_variants_fase1.sql` (lectura pública de activos + escritura admin). (pendiente: este repo aún no tiene ADR de aislamiento/RLS; hoy el patrón vive en esas migraciones y en el checklist del agente seguridad.)
3. Declara la tabla en `docs/impacto.md` (módulo, archivos clave, quién la usa).

## La tabla
- `id uuid primary key default gen_random_uuid()` (o el código de producto, como `products`).
- Dinero en soles con `numeric` en la base; los cálculos en céntimos enteros con `app/lib/money.ts` y se muestra con `formatSoles()` (`MONEY.md`). Nunca `float` para sumar.
- Fechas `timestamptz` (UTC); la lógica convierte a hora de Lima.
- Migración nueva `AAAAMMDD_<tema>.sql`, idempotente (`create table if not exists`, `drop policy if exists`).

## La política (copiar el patrón del repo, no inventarlo)
```sql
alter table public."<tabla>" enable row level security;

-- Lectura pública SOLO si el dato es publicable (catálogo activo).
drop policy if exists "<tabla>_public_read" on public."<tabla>";
create policy "<tabla>_public_read" on public."<tabla>"
  for select to anon, authenticated
  using (active = true or public.is_admin());

-- Escritura: solo admin.
drop policy if exists "<tabla>_admin_write" on public."<tabla>";
create policy "<tabla>_admin_write" on public."<tabla>"
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```
- Datos de clientes (pedidos, chats, teléfonos): **sin** política para `anon`; los escribe el servidor con `supabaseAdmin` (service role, que salta RLS), como `chat_sessions`.
- **Nunca** `for all using (true)` sin rol: abre la tabla a cualquiera con la llave pública.
- `SECURITY DEFINER` solo con `set search_path` fijo, comprobando `public.is_admin()` dentro y con `revoke all … from public` + `grant execute` explícito (como `register_purchase`).
- `SUPABASE_SERVICE_ROLE_KEY` sin prefijo `NEXT_PUBLIC_`; `supabaseAdmin` solo en `app/api/**` y `app/lib/**`.
- El servidor recalcula precios y cantidades; el cliente no los dicta.

## Si la tabla es sensible
Pedidos, pagos, stock, precios o datos personales: registro en `audit_log` (admin lee e inserta; sin UPDATE ni DELETE) con **lista blanca de campos** (jamás tokens, llaves ni datos de tarjeta).

## Comprobación (obligatoria)
Este repo no tiene pruebas automáticas de la base. Antes de cerrar la fase:
1. Con la llave pública (`anon`), `select` de la tabla devuelve solo lo publicable (o nada) e `insert`/`update`/`delete` fallan.
2. Con un usuario autenticado que no es admin, no escribe.
3. `relrowsecurity = true` en `pg_class` y el asesor de Supabase sin alertas críticas.
Anota el resultado en la fase de `plan.md`; si no se pudo comprobar, va a `deuda-tecnica.md`.

## Revisión
Fase con agente **seguridad** además del auditor. Datos personales: revisar Ley 29733 (finalidad, consentimiento, enmascarado en logs).
