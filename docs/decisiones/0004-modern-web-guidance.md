# 0004. Modern Web Guidance como estándar de calidad web

- Fecha: 2026-11-10
- Estado: aceptada (Heber pidió adoptarlo en todos los proyectos, nuevos y existentes)

## Contexto
Los agentes de IA tienden a escribir front-end con patrones viejos, desconocen APIs recientes y no respetan la compatibilidad de navegadores del proyecto. Chrome publicó Modern Web Guidance: una skill con más de 100 guías verificadas y datos Baseline; según Google mejora en promedio 37 puntos porcentuales el cumplimiento de buenas prácticas modernas.

## Decisión
- Se instala la skill en `.claude/skills/modern-web-guidance` (copia real, no enlace simbólico, para que funcione en Windows) y se registra en `skills-lock.json`.
- Objetivo de compatibilidad: **Baseline Widely available** — ecommerce público (lioncub.pe): mamás comprando desde el celular.
- Se agrega la sección «Web moderna» al `CLAUDE.md`.
- Los hallazgos de la auditoría inicial (`docs/auditorias/2026-11-10-web-moderna.md`) entran a `deuda-tecnica.md` y se pagan por fases con el método de siempre (implementador → QA → auditor).

## Consecuencias
- Fronts más livianos, accesibles y seguros; menos rondas de corrección del auditor.
- Las guías están en vista previa y cambian: se actualizan con `npx modern-web-guidance@latest update`.
- La skill no amplía permisos ni toca rutas protegidas; si contradice una regla del proyecto, gana la regla.
