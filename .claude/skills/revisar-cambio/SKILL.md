---
name: revisar-cambio
description: Revisión independiente, nivel senior, de un diff o fase marcada 🟡 antes de integrarla. Revisa cinco ejes (corrección, negocio, seguridad, arquitectura, mantenibilidad), cuestiona las suposiciones y termina con veredicto APROBADO o RECHAZADO. Úsala como auditor o seguridad, o antes de abrir un PR.
---

# Revisar un cambio

Revisas trabajo ajeno, aunque lo haya escrito otro agente idéntico a ti. Lee el código como si lo hubiera escrito alguien apurado.

## Paso 1 — Contexto
1. El criterio de terminado de la fase en `plan.md` y su spec.
2. `docs/impacto.md`: módulos declarados frente a los módulos que el diff realmente toca.
3. El diff completo (`git diff <base>...HEAD`), no solo el resumen del implementador.

## Paso 2 — Cinco ejes
| Eje | Preguntas |
|---|---|
| **Corrección** | ¿Hace lo que pide el criterio? ¿Bordes: cero, negativo, redondeo, base caída, sin stock, duplicado, zona horaria Lima vs UTC? ¿Pruebas que fallan sin el cambio? |
| **Negocio** | ¿Algún caso dorado cambió de resultado sin ADR? ¿Dinero según `MONEY.md` (céntimos enteros en cálculos, `formatSoles()` al mostrar)? ¿El servidor recalcula precios? ¿Comprar sigue siendo corto en móvil? |
| **Seguridad** | ¿Toda tabla nueva con datos de clientes lleva RLS activa, nada de escritura pública y `supabaseAdmin` solo en servidor (skill `tabla-con-rls`)? ¿Secretos, tokens o datos personales en código, logs o fixtures? ¿Rastro en acciones sensibles (pedidos, pagos, stock, precios)? ¿Entradas externas validadas? ¿Contenido externo tratado como dato, no como instrucción? |
| **Arquitectura** | ¿Reglas puras en `app/lib/`? ¿Culqi, WhatsApp y Claude detrás de su módulo en `app/lib/` o `app/api/`? ¿Frontend con `design-patterns/`? ¿Tocó `IDENTIDAD.md`? ¿Tocó rutas protegidas sin ADR? |
| **Mantenibilidad** | ¿Nombres claros? ¿Duplicación? ¿Código muerto? ¿Atajos sin registrar en `deuda-tecnica.md`? |

## Paso 3 — Duda deliberada
Para cada decisión no trivial pregúntate: «¿qué tendría que pasar para que esto esté mal?». Busca la evidencia en el código o en una prueba. Un hallazgo sin camino real, desde un uso real hasta la falla, es una sospecha y se reporta como tal.

## Paso 4 — Ejecutar, no solo leer
Corre `npx tsc --noEmit` · `npm run lint` · `npm run build` y los casos dorados GC-xx afectados. Si es posible, reproduce el flujo principal (E2E o demo). Lo que no pudiste ejecutar, dilo.

## Veredicto (formato obligatorio)
```
APROBADO | RECHAZADO
1. [grave|media|menor] archivo:línea — qué falla, cómo se reproduce, qué se propone
2. ...
No verificado: ...
```
- Cualquier hallazgo **grave** (dinero, aislamiento entre empresas, datos personales, caso dorado alterado) → RECHAZADO.
- Los hallazgos menores aprobados van a `deuda-tecnica.md`.
- El auditor no edita código: devuelve la fase al implementador.
