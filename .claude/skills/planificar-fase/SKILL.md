---
name: planificar-fase
description: Convierte una spec aprobada en fases y tareas pequeñas dentro de plan.md, con criterio de terminado, verificación, dependencias y módulos afectados. Úsala cuando ya hay spec o requisitos claros y hay que repartir el trabajo entre subagentes, o cuando una fase se siente demasiado grande para empezar.
---

# Planificar una fase

Una buena partición decide si un subagente termina bien o deja un enredo. Cada tarea debe poder hacerse, probarse y verificarse en una sola sesión.

## Paso 1 — Leer sin escribir código
Lee la spec, `plan.md`, `docs/impacto.md`, `.claude/protegidos.txt` y el código de los módulos afectados. Anota patrones existentes, riesgos y dudas.

## Paso 2 — Grafo de dependencias
Dibuja qué depende de qué (esquema → dominio → API → pantalla). Se construye de abajo hacia arriba.

## Paso 3 — Rebanadas verticales
Cada tarea entrega algo que funciona de punta a punta: «el cliente paga con Yape y recibe su correo» (API + pantalla + caso dorado), no «toda la base», luego «toda la API», luego «todas las pantallas».

## Paso 4 — Escribir la fase en plan.md
Agrega o actualiza la fila de la fase en «Estado de fases» (Fase · Qué · Estado) y su sección `## Fase N — …` con tareas numeradas (`- [ ] **N.M** …`), como las existentes. Detalla cada tarea así:

```markdown
### Tareas de la fase X.Y
- [ ] T1 · <título corto>
  - Criterio: <condición comprobable>
  - Verificar: `npx tsc --noEmit` · `npm run lint` · `npm run build` · casos dorados GC-xx a mano: <cuáles>
  - Archivos probables: `app/lib/...`, `app/components/...`, `app/api/...`
  - Tamaño: S (1–2 archivos) | M (3–5)
  - Depende de: —
- [ ] Punto de control tras T1–T3: pruebas en verde, flujo completo funciona, revisión con Heber
```

## Tamaños
| Tamaño | Archivos | Acción |
|---|---|---|
| XS / S / M | 1–5 | bien |
| L | 5–8 | partir si se puede |
| XL | 8+ | **partir siempre** |

Parte la tarea si no cabe en una sesión, si necesitas más de 3 criterios para describirla, si toca dos subsistemas independientes o si el título lleva «y».

## Paso 5 — Orden y control
1. Primero lo de mayor riesgo (que falle temprano).
2. Cada tarea deja el sistema funcionando.
3. Un punto de control cada 2–3 tareas.
4. Lo que toca archivos protegidos lleva 🔒 y una ADR aprobada **antes** de empezar.
5. Paralelizar solo rebanadas independientes. Las migraciones y los contratos compartidos van en secuencia: primero se define el contrato.

## Reglas
- **Nunca sobrescribas un plan con tareas pendientes de otro trabajo.** Si es otra cosa, para y pregunta.
- Nada entra a `plan.md` como aprobado sin el OK explícito de Heber (agente planificador).
- Riesgos y preguntas abiertas van en la spec. Los atajos conocidos van a `deuda-tecnica.md`.

## Antes de entregar el plan
- [ ] Cada tarea tiene criterio y forma de verificarse
- [ ] Orden por dependencias; ninguna tarea XL
- [ ] Módulos según `docs/impacto.md`; casos dorados nombrados
- [ ] Rutas protegidas marcadas 🔒 con su ADR
- [ ] Heber revisó y aprobó
