# Auditoría web moderna — Lion Cub

- Fecha: 2026-11-10
- Herramienta: Modern Web Guidance (`legacy-scan` + revisión de guías de seguridad, accesibilidad, formularios, fechas e imágenes)
- Objetivo de compatibilidad: **Baseline Widely available**
- `legacy-scan`: 4 patrón(es) heredado(s) sobre 33 guías con reglas automáticas (~20 % del catálogo). El resto se revisó a mano; los conteos marcados con «~» son candidatos que se confirman al trabajar cada pieza.

## Hallazgos priorizados

| Prioridad | Área | Hallazgo | Qué hacer | Guía MWG |
|---|---|---|---|---|
| 🟠 | Seguridad | Sin cabeceras de seguridad en `next.config.ts`. Hay checkout con Culqi. **Fase 1 en curso: Report-Only (rama `seguridad/cabeceras-report-only`, PR #124).** | CSP en `Report-Only` permitiendo los dominios de Culqi/Supabase; luego activarla. `app/api/payments/**` es ruta protegida. | `security · secure-external-subresources` |
| 🟢 | Formularios (IME) | 3 atajos de Enter sin `isComposing` en `app/admin/productos/page.tsx:2096, 2126, 2167`. | **Corregido en este PR**. | `ime-safe-enter-submit` |
| 🟢 | Componentes | ~11 capas `fixed inset-0` y ~9 `<div onClick>` (p. ej. `app/components/SizeGuide.tsx`). | Guía de tallas y menús como `<dialog>`/`popover`. | `dialog · navigation-drawer` |
| 🟢 | Rendimiento | Un `addEventListener('scroll')` en JS para efectos de desplazamiento. | Evaluar animaciones guiadas por scroll en CSS (`animation-timeline`) con respaldo. | `scroll-entry-exit-effects · shrinking-header-on-scroll` |
| 🟢 | Fechas | 2 Server Components formatean fechas sin `timeZone`. | Helper con `America/Lima`. | `coordinate-global-events` |

Prioridad: 🔴 riesgo de datos o dinero · 🟠 media · 🟢 baja.

## Lo que ya está bien

El hero ya usa `fetchPriority="high"` para la primera imagen y `loading="lazy"` en el resto; los logins usan `autocomplete` correcto.

## Cómo seguir

1. Cada fila 🟠 se vuelve una fase pequeña en `plan.md` (una rama, casos dorados en verde, auditor APROBADO).
2. Las filas 🟢 se resuelven al tocar ese módulo por otra razón («regla del boy scout»).
3. Para cada arreglo: `npx -y modern-web-guidance@latest retrieve "<guía>"` y seguir la guía.
4. Volver a correr `npx -y modern-web-guidance@latest legacy-scan . --json` al cerrar cada fase.
