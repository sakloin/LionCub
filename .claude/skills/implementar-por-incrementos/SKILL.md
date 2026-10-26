---
name: implementar-por-incrementos
description: Programa una fase aprobada en rebanadas finas, con la prueba primero (rojo → verde → limpiar) y verificación después de cada rebanada. Úsala al implementar cualquier tarea de plan.md que toque más de un archivo, al corregir un bug o al cambiar una regla de negocio.
---

# Implementar por incrementos

Avanzar en pasos pequeños y comprobados. Nunca escribir 500 líneas y probar al final.

## Antes de empezar
1. Lee `CLAUDE.md`, tu fase en `plan.md` y `docs/impacto.md`. Marca la fase 🔵.
2. Confirma qué archivos puedes tocar. Si necesitas otro módulo o una ruta protegida, **para y avisa** al orquestador.
3. Asegura que lo que vas a cambiar esté cubierto por un caso dorado GC-xx de `docs/impacto.md` (y, si se puede, por una prueba automática). Este repo aún no tiene corredor de pruebas: agregar uno es una dependencia nueva y se pregunta antes.

## El ciclo, por cada rebanada
1. **Rojo:** escribe el caso (GC-xx o prueba) que describe el comportamiento nuevo, o reproduce el bug. Confirma que **falla por la razón correcta**.
2. **Verde:** escribe el mínimo código que la hace pasar.
3. **Limpiar:** mejora nombres y duplicación sin cambiar comportamiento; las pruebas siguen en verde.
4. **Verificar:** `npx tsc --noEmit` · `npm run lint` · `npm run build` (no hay hook que lo haga solo).
5. **Commit:** uno por rebanada, en español, que diga qué cambia para el negocio. Rama propia por fase y PR a `main`; nunca push directo a `main`.

Un bug se corrige igual: primero la prueba que falla, luego el arreglo.

## Disciplina de alcance
- Solo lo que pide la tarea. Nada de «ya que estoy» ni refactors que nadie pidió.
- Las reglas de negocio van puras en `app/lib/` (dinero con `app/lib/money.ts`, `MONEY.md`). La pantalla solo llama.
- El frontend solo usa `design-patterns/` (`IDENTIDAD.md` + `PRINCIPIOS.md`; `IDENTIDAD.md` no se toca sin Heber).
- Sin dependencias nuevas sin preguntar.
- Claude API (chatbot) y Culqi: en pruebas, respuestas simuladas o modo sandbox; nunca cobros reales.
- Fixtures solo con datos ficticios: ningún nombre, teléfono ni correo real de clientes.

## Excusas que no valen
| Excusa | Realidad |
|---|---|
| «Escribo las pruebas al final» | Sin la prueba primero no sabes si prueba algo. |
| «Es un cambio chiquito» | Entonces la prueba también es chiquita. |
| «La prueba vieja estaba mal, la ajusto» | Nunca se modifica una prueba existente para que pase. Si el resultado debe cambiar, se pide ADR. |
| «Lo arreglo después» | Va a `deuda-tecnica.md` ahora, con fecha, riesgo y cuándo se paga. |

## Al terminar
- [ ] `npx tsc --noEmit` · `npm run lint` · `npm run build` en verde y casos dorados GC-xx afectados probados
- [ ] Cada comportamiento nuevo tiene una prueba que falla sin el cambio
- [ ] Sin código muerto, `console.log` ni bloques comentados
- [ ] Atajos registrados en `deuda-tecnica.md`
- [ ] Fase marcada 🟡, `docs/estado.json` al día y resumen al orquestador: archivos cambiados, módulos afectados, deuda nueva
