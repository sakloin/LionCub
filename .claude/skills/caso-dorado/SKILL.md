---
name: caso-dorado
description: Agrega o modifica un caso dorado (flujo representativo de la tienda con resultado congelado) en docs/impacto.md y, cuando exista corredor de pruebas, su prueba automática. Úsala cuando una spec o fase introduce una regla de negocio nueva (dinero, stock, impuestos, tiempos, permisos), o cuando alguien quiere cambiar el resultado de un caso existente.
---

# Caso dorado

Un caso dorado es un ejemplo representativo del cliente con números exactos que **nunca** cambian sin ADR. Es la red que impide que un agente «arregle» algo y rompa la plata del cliente.

## Agregar un caso nuevo
1. **Elegir el caso:** un flujo de compra o un producto representativo de la tienda. Prefiere el que más pesa en soles o en riesgo.
2. **Escribirlo en `docs/impacto.md` → Casos dorados**, con el formato existente:
   ```markdown
   ### GC-NN: <título en lenguaje del negocio>
   - Precondición: <estado de la base, del carrito, variables como `NEXT_PUBLIC_CULQI_ENABLED`>.
   - Acción: <pasos del cliente>.
   - Criterio: <resultado verificable; con montos, el cálculo a la vista, p. ej. 2 × S/ 59.90 + S/ 10.00 = S/ 129.80>.
   ```
   En este repo los IDs son `GC-NN` (GC-01 … GC-06). Usa el siguiente número libre.
3. **Nombrar el módulo** que cubre (tabla «Módulos principales»).
4. **Prueba:** hoy los GC se comprueban a mano (o con el navegador) y el resultado se anota en la fase de `plan.md`. (pendiente: este repo aún no tiene corredor de pruebas ni `npm run test:dorados`; agregarlo es una dependencia nueva y se pregunta antes.) Cuando exista, un archivo por caso, `gc-NN-<tema>.test.ts`, con datos literales que nunca se calculan con el mismo código que se prueba.
5. **Comprobar** el caso en la **misma rama y fase que lo implementa**, antes del PR. Mientras la fase no empieza, el caso vive solo en `docs/impacto.md`. Nunca se salta un caso.

## Cambiar un caso existente
- **Solo con una ADR aprobada por Heber** que diga qué cambia, por qué y desde cuándo rige.
- Se conserva el caso viejo si el cambio es por vigencia (p. ej. una oferta o un costo de envío que cambia desde una fecha): se agrega una variante, no se borra la historia.
- QA nunca edita una prueba dorada para que pase.

## Calidad de un buen caso dorado
- [ ] Montos reales o realistas del negocio (no «redondos» que esconden el redondeo); personas siempre ficticias
- [ ] El esperado muestra el cálculo, no solo el resultado
- [ ] Cubre el borde que más duele (umbral, redondeo, vigencia, base caída, sin stock)
- [ ] Redondeo explícito, según `MONEY.md`
- [ ] Sin datos personales reales (Ley 29733): nombres y documentos inventados, nunca de trabajadores ni clientes
