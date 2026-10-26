# ADR 0001 — Skills del flujo (método v1.3)
- Fecha: 2026-10-18
- Estado: aprobada por Heber (2026-10-18), aplicación de la ADR 0018 de La Receta

## Contexto
En La Receta (`sakloin/lareceta`) Heber aprobó la ADR 0018: 7 skills portables en `.claude/skills/` que escriben *cómo* se hace cada paso del método (definir → planificar → construir → verificar → revisar → cerrar) y una línea por agente que dice qué skill usa. Pidió aplicarla «para que se aplique fácilmente en otros proyectos». La revisión de seguridad del origen (addyosmani/agent-skills, MIT) está en esa ADR: no se instala ningún plugin, script ni hook.

Es la primera ADR de Lion Cub: con ella nace `docs/decisiones/`, la carpeta donde van las ADR que piden `plan.md`, `IDENTIDAD.md` y los agentes.

## Opciones consideradas
1. Dejar Lion Cub sin skills. Descartada: los pasos siguen dependiendo de la memoria del agente.
2. Copiar las skills de La Receta sin cambios. Descartada: citan `npm run verificar`, `npm run test:dorados`, `empresa_id` y ADR que aquí no existen.
3. **Copiar las 7 skills portables y adaptarlas a Lion Cub.** Elegida.

## Decisión
1. `.claude/skills/` con `especificar`, `planificar-fase`, `implementar-por-incrementos`, `caso-dorado`, `revisar-cambio`, `cerrar-fase`, `tabla-con-rls` y su `README.md`. No se copia `extraer-comprobante` (propia de La Receta).
2. Adaptaciones: verificación con `npx tsc --noEmit`, `npm run lint` y `npm run build` (no hay `verificar` ni pruebas automáticas); casos dorados GC-NN de `docs/impacto.md`, comprobados a mano; `tabla-con-rls` sin `empresa_id` (una sola tienda): lectura pública solo de lo activo, escritura con `public.is_admin()`, datos de clientes solo por el servidor; dinero según `MONEY.md`; cierre con `docs/estado.json` y `.claude/estado-panel.json`, PR a `main` y congelamiento previo al lanzamiento. Donde falta una ADR (aislamiento/RLS) la skill lo dice como pendiente.
3. Sección «Skills del flujo (método v1.3)» en `CLAUDE.md`.
4. Una línea de skill en cada agente que existe (auditor, implementador, seguridad; este repo no tiene planificador ni qa), con el texto de la ADR 0018 sin la parte de comprobantes. **Aprobada, aplicación pendiente:** en este repo `.claude/agents/` no está bloqueado, pero la sesión que instaló las skills corría desde La Receta, cuyo guardián protege `.claude/agents/` en cualquier ruta, y el desbloqueo temporal no se autorizó. Se aplica en una sesión abierta en este repo:

```diff
# .claude/agents/implementador.md (regla nueva, al final de «## Reglas»)
+6. Sigue la skill `implementar-por-incrementos` (prueba primero, una rebanada a la vez). Tablas nuevas → skill `tabla-con-rls`.

# .claude/agents/auditor.md (al final)
+Procedimiento y formato del veredicto: skill `revisar-cambio`. Al aprobar, el orquestador cierra con la skill `cerrar-fase`.

# .claude/agents/seguridad.md (al final)
+Tablas y migraciones: verifica con la skill `tabla-con-rls`; usa los ejes de seguridad de la skill `revisar-cambio`.
```

## Consecuencias (qué módulos toca, qué pruebas cambian, qué riesgo asume)
- **Módulos:** ninguno de código. Solo proceso y documentos.
- **Pruebas:** ninguna cambia.
- **Permisos:** sin cambios. Las skills no declaran `allowed-tools` y no tocan `.claude/settings.json`.
- **Riesgo:** una skill mal adaptada puede guiar mal a un agente. Mitigación: `CLAUDE.md` gana en caso de conflicto, el auditor revisa contra las reglas y todo cambio a una skill pasa por PR.
