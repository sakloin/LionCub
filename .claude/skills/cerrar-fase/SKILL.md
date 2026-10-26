---
name: cerrar-fase
description: Lista de terminado y de salida a producción para cerrar una fase de plan.md o publicar una versión. Úsala cuando el auditor dio APROBADO y hay que integrar, marcar ✅, actualizar documentos y el vault, o cuando se prepara un despliegue al servidor del cliente.
---

# Cerrar una fase

Los **criterios de terminado** de cada fase dicen «¿construimos lo correcto?». Esta lista, igual para todas las fases, dice «¿está terminado a nuestro estándar?». Hacen falta las dos.

## Definición de terminado (toda fase)
**Corrección**
- [ ] Criterio de terminado de `plan.md` cumplido, verificado ejecutando y no solo compilando
- [ ] Casos dorados GC-xx de la fase comprobados (a mano mientras no haya `npm run test:dorados`)
- [ ] `npx tsc --noEmit` · `npm run lint` · `npm run build` en verde
- [ ] Sin regresiones en los módulos de `docs/impacto.md`

**Revisión**
- [ ] Veredicto **APROBADO** del auditor (skill `revisar-cambio`), y de seguridad si toca datos, acceso, pagos o SUNAT
- [ ] Hallazgos menores registrados en `deuda-tecnica.md`

**Documentos**
- [ ] `plan.md`: fase en ✅ con una línea de lo entregado
- [ ] `docs/impacto.md`: módulos, tablas, reglas y pruebas al día
- [ ] ADR nuevas en `docs/decisiones/` (estado correcto)
- [ ] `docs/estado.json` (LionCub Radar) con avance y hallazgos al día
- [ ] `.claude/estado-panel.json` actualizado por la sesión principal (avance real, `pendientes_heber`)

**Vault (cerebro)**
- [ ] Línea en la Bitácora de la nota del proyecto
- [ ] Decisiones, enlaces y specs volcados; Índice de fuentes al día
- [ ] Si mejoró el método: línea en la «Bitácora de mejoras al método» y nueva versión del kit

**Aprobación**
- [ ] OK del dueño del proyecto (Heber) para el cierre

## Lista previa a producción (cuando la fase se despliega)
- [ ] Integración solo por PR a `main` (nunca push directo)
- [ ] Migraciones de `supabase/migrations/` probadas antes en una copia o rama de Supabase; plan para volver atrás escrito
- [ ] Respaldo de Supabase verificado antes de aplicar la migración
- [ ] Secretos solo en `.env.local` y en las variables de Vercel; nada nuevo en git
- [ ] Monitoreo: salud de la API, jobs vivos, alertas al canal de soporte del proyecto
- [ ] Prueba de compra real de punta a punta en celular (como 2.5 y 4.2)
- [ ] Interruptor en `app/lib/feature-flags.ts` para apagar lo riesgoso sin redeplegar, si aplica
- [ ] Respetar el congelamiento previo al lanzamiento (solo correcciones)
- [ ] Después: revisar errores y métricas a las 24 h y anotar en el vault

## Señales de alerta
- «Está listo, solo falta correrlo»: si no se ejecutó, no está listo.
- Cambiar el estándar por apuro.
- Marcar ✅ sin veredicto del auditor o sin el OK de Heber.
