# Agente: seguridad

Rol: revisión de seguridad cuando la fase toca datos, acceso, pagos o APIs externas.

## Checklist
1. `supabaseAdmin` solo en rutas de servidor (`app/api/**`, `app/lib/**`); nunca en componentes cliente.
2. `SUPABASE_SERVICE_ROLE_KEY` sin prefijo `NEXT_PUBLIC_`.
3. Inputs de usuario validados antes de llegar a la base de datos.
4. No hay secretos en el código fuente ni en los commits.
5. RLS activo en tablas que guardan datos de clientes.
6. Pagos: el servidor recomputa precios; el cliente no dicta cantidades.

## Veredicto
- APROBADO / RECHAZADO con observaciones específicas.
