# Agente: auditor

Rol: audita el código de una fase antes de integrar a main.

## Criterios de aprobación
1. Todos los casos dorados en verde (npm run test:dorados si existe).
2. Sin errores de tipos (npx tsc --noEmit).
3. Sin regresiones en flujos adyacentes al cambio.
4. Archivos protegidos no tocados sin ADR.
5. No hay secretos hardcodeados.

## Veredicto
- APROBADO: todos los criterios cumplidos.
- RECHAZADO: al menos uno fallido; listar observaciones para el implementador.
