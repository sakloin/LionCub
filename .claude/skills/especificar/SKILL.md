---
name: especificar
description: Convierte una idea, un pedido de Heber o un acta de reunión en una spec escrita antes de planificar o programar. Úsala cuando empieza una funcionalidad, módulo o cambio de alcance y no hay spec, o cuando el pedido es vago ("que sea más rápido", "agrega pagos"). No la uses para correcciones de una línea.
---

# Especificar

Una spec es el acuerdo entre Heber y los agentes: qué se construye, para quién, y cómo se sabe que está terminado. Programar sin spec es adivinar.

## Paso 0 — Recuperar antes de preguntar
1. Lee `CLAUDE.md`, `plan.md`, `docs/impacto.md`, `docs/estado.json` y las ADR relacionadas en `docs/decisiones/`.
2. Busca en `plan.md` (Notas), `deuda-tecnica.md`, `MONEY.md`, `CULQI_SETUP.md`, `design-handoff/` y en el vault (nota y MOC del proyecto, Índice de fuentes). No preguntes lo que ya está guardado.

## Paso 1 — ¿Es una sola capacidad?
Si el pedido junta varias capacidades que se pueden probar por separado (p. ej. caja + alertas + reportes), primero propón un **mapa de capacidades**, que es pequeño y revisable:

| Módulo | Responsabilidad | Depende de |
|---|---|---|

Usa los nombres de módulo de `docs/impacto.md`. Las dependencias van en un solo sentido. Heber aprueba el mapa y luego se hace una spec por módulo, en orden.

## Paso 2 — Suposiciones a la vista
Antes de escribir, lista lo que estás suponiendo y pide que lo corrijan:

```
SUPOSICIONES:
1. Lo usa el cliente de la tienda desde el celular (o Heber en `/admin`), en español y en inglés.
2. El servidor recalcula precios y cantidades; el cliente no los dicta.
3. Los montos siguen `MONEY.md`: soles `numeric` en la base, cálculos en céntimos enteros (`app/lib/money.ts`) y `formatSoles()` para mostrar.
→ Corrígeme ahora o sigo con estas.
```

Nunca llenes en silencio un requisito ambiguo: pregunta al orquestador.

## Paso 3 — Escribir la spec
Guárdala en `docs/requisitos/<tema>-AAAA-MM-DD.md` con estas secciones:

```markdown
# Spec: <nombre>
## Objetivo (qué, para quién, por qué; en soles o minutos si se puede)
## Usuarios y pantallas (cliente o Heber; celular primero; pocos toques hasta comprar)
## Reglas de negocio (con números de ejemplo)
## Criterios de éxito (verificables: "GC-03 pasa", "LCP < 2.5 s en móvil")
## Casos dorados nuevos o afectados (ver skill caso-dorado)
## Módulos afectados (según docs/impacto.md) y archivos protegidos (🔒 → ADR)
## Límites
- Siempre: ...
- Preguntar antes: cambios de esquema, dependencias nuevas, integraciones externas, costos de API
- Nunca: secretos o datos personales reales de clientes en código/logs; tocar `design-patterns/IDENTIDAD.md` sin Heber; cambios que no sean correcciones durante el congelamiento previo al lanzamiento
## Preguntas abiertas
```

Convierte lo vago en criterios medibles: «más rápido» → «LCP < 2.5 s en móvil».

## Paso 4 — Parar
Resume la spec en pocas líneas, lista las preguntas abiertas y **termina tu turno**. No planifiques ni programes en el mismo turno. El plan (skill `planificar-fase`) empieza solo cuando Heber aprueba.

## Señales de alerta
- Empezar a programar sin criterios escritos.
- Una spec que mezcla varias capacidades independientes.
- Decisiones de arquitectura sin ADR.
- Preguntar algo que ya estaba en el vault o en `docs/`.

## Antes de seguir
- [ ] Suposiciones confirmadas por Heber
- [ ] Criterios de éxito medibles
- [ ] Módulos y archivos protegidos identificados
- [ ] Spec guardada en el repo y aprobada en un turno posterior
