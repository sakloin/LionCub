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

## Web moderna (Modern Web Guidance)
This project's Baseline target is Baseline Widely available.

- Motivo del objetivo: ecommerce público (lioncub.pe): mamás comprando desde el celular.
- Antes de construir o cambiar interfaz, formularios, animaciones, rendimiento del navegador, seguridad del navegador o manejo de fechas en el cliente, usa la skill `modern-web-guidance` (`.claude/skills/modern-web-guidance`): `search` → `retrieve` → aplicar → verificar.
- Prefiere HTML/CSS nativo (`<dialog>`, `popover`, container queries, `:has()`, View Transitions) antes que librerías JS nuevas.
- Funciones fuera del Baseline del proyecto: solo con mejora progresiva o polyfill cargado de forma condicional. Funciones experimentales y origin trials: apagadas.
- Fechas visibles al usuario: siempre con `timeZone: "America/Lima"` (los servidores corren en UTC).
- El auditor revisa el eje «web moderna»; QA mide Core Web Vitals (LCP < 2,5 s, INP < 200 ms, CLS < 0,1) en fases de interfaz.
- Si una guía contradice estas reglas, una ADR o los patrones de diseño del proyecto, ganan las del proyecto.
- Informe inicial: `docs/auditorias/2026-11-10-web-moderna.md`. Actualizar la skill: `npx modern-web-guidance@latest update`.
