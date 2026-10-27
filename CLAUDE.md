@AGENTS.md

## Skills del flujo (método v1.3)
Procedimientos en `.claude/skills/` que se cargan solos según la tarea: `especificar` → `planificar-fase` → `implementar-por-incrementos` → `caso-dorado` → `revisar-cambio` → `cerrar-fase`; además `tabla-con-rls` (toda tabla nueva). No amplían permisos. Si una skill contradice estas reglas, ganan estas reglas. (ADR 0001; origen: ADR 0018 de La Receta.)

## Reglas de trabajo
- Todo cambio que toque interfaz necesita el veredicto APROBADO del auditor-diseno, además del auditor de código. Sin las capturas antes/después en el PR, no se integra.

## Panel de control (obligatorio)
- Mantén SIEMPRE actualizado `.claude/estado-panel.json` en la raíz del proyecto, con la estructura que ya tiene.
- Actualízalo: al terminar cada tarea, al cambiar de fase, al encontrar un bloqueo, cada vez que le pidas algo a Heber (agrégalo a `pendientes_heber`) y cuando él responda o lo marque como hecho.
- Antes de editarlo, léelo: Heber marca sus pendientes como hechos desde el panel; respeta esos cambios.
- Escribe en español simple. `avance_pct` debe reflejar el avance real del proyecto completo.
- Solo la sesión principal lo edita; los agentes en worktrees no lo tocan, le reportan al orquestador.
