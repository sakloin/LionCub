# Skills del flujo · Método orquestado v1.3

Procedimientos que Claude Code carga solo cuando la tarea los necesita (Agent Skills). Los **agentes** de `.claude/agents/` dicen *quién* trabaja; las **skills** dicen *cómo* se hace cada paso, siempre igual.

| Etapa del método | Skill | La usa |
|---|---|---|
| Definir | `especificar` | planificador |
| Planificar | `planificar-fase` | planificador |
| Construir | `implementar-por-incrementos` | implementador |
| Verificar | `caso-dorado` | qa, implementador |
| Revisar | `revisar-cambio` | auditor, seguridad |
| Cerrar / publicar | `cerrar-fase` | orquestador |
| Estándar de datos | `tabla-con-rls` | implementador + seguridad |

Son las 7 skills **portables** del kit (La Receta, Biopack, Contalia…). Se instalaron el 2026-10-18 desde La Receta (ADR 0018 de `sakloin/lareceta`) y están **adaptadas a Lion Cub**: rutas, comandos, ADR y casos dorados de este repo. Cada una lee además el `CLAUDE.md`, el `plan.md` y el `docs/impacto.md` del proyecto. Adopción en este repo: ADR 0001 (`docs/decisiones/`). Este repo todavía no tiene `npm run verificar` ni `npm run test:dorados`: las skills usan `npx tsc --noEmit`, `npm run lint`, `npm run build` y los casos dorados manuales GC-xx de `docs/impacto.md`.

## Reglas de seguridad de estas skills
- Ninguna skill declara `allowed-tools`: **no amplían permisos**. Cada agente conserva las herramientas que ya tenía.
- Ninguna trae scripts ni hooks. Son instrucciones en texto.
- No reemplazan reglas del `CLAUDE.md`. Si hay conflicto, gana `CLAUDE.md`.

## Origen
Ideas adaptadas (no copiadas) de [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT, © 2025 Addy Osmani), revisión del 2026-10-18 (commit `aeac41d`). Detalle de la revisión de seguridad y de lo que se adoptó o descartó: ADR 0018 de La Receta.
