# plan.md — Rediseño y lanzamiento de la tienda Lion Cub

> **Regla 1 (todo agente):** leer este `plan.md` antes de programar.
> **Regla 2:** leer `docs/impacto.md` antes de tocar un módulo.
> Método: método orquestado + `design-patterns/IDENTIDAD.md` (NO tocar) + `design-patterns/PRINCIPIOS.md`.
> Meta de lanzamiento: **fin de octubre 2026**. Prioridad: lo que **impide comprar**.

## 🧑 Bloqueador de Heber (acción manual)
- [ ] **Reactivar el proyecto de Supabase de LionCub** (`cqwvhfcrmboscivtwkog`, estado `INACTIVE`). Mientras siga pausado, la tienda NO muestra productos (la web no puede leer la base). Dashboard → Restore / upgrade de la organización. **Sin esto no hay prueba de compra real.**

## Estado de fases
| Fase | Qué | Estado |
|---|---|---|
| 0 | Kit de orquestación + `IDENTIDAD.md` + `PRINCIPIOS.md`; congelar alcance | 🟡 IDENTIDAD + PRINCIPIOS hechos; falta kit (.claude/*) y aprobación de IDENTIDAD |
| 1 | Auditoría móvil + desktop (home, colección, ficha, bolsa, checkout) | ✅ hecha (5 hallazgos) |
| 2 | Críticos de compra | 🔵 en curso |
| 3 | Jerarquía y contenido | ⬜ |
| 4 | Congelamiento + velocidad (LCP < 2.5 s móvil) + prueba de compra real | ⬜ |
| 5 | Lanzamiento | ⬜ |

## Fase 2 — Críticos de compra
- [x] **2.1 Resiliencia de la colección** (`app/components/Collection.tsx`): `try/catch/finally` en la carga para que un fallo del fetch NO deje "Cargando…" eterno; cae al estado vacío. _(hecho en rama; criterio: con la base caída, la sección no se cuelga)._
- [ ] **2.2 SSR del catálogo**: renderizar productos en el servidor para que SIEMPRE estén en el HTML (resuelve de raíz el "Cargando" y mejora SEO/compartir). Dep: Supabase activo. Criterio: productos visibles con JS desactivado.
- [x] **2.3 Precio por línea en checkout** (`app/checkout/page.tsx:695`): usar `unit_price_at_pick` (precio pagado), no `product.price` base; así cuadra con el subtotal. _(hecho en rama)._
- [ ] **2.4 Validación de checkout**: contra entrega solo con domicilio (no Shalom); validar formato de correo (obligatorio si paga con tarjeta). Criterio: no se puede enviar un pedido contradictorio.
- [ ] **2.5 Prueba de compra real** de punta a punta (requiere Supabase activo): ver producto → variante → bolsa → checkout → Yape/transferencia/tarjeta → pedido registrado.

## Fase 3 — Jerarquía y contenido
- [ ] **3.1** Un beneficio por lugar: quitar repeticiones (hipoalergénico, "200+ familias", "hecho a mano") entre Hero / WhyPima / Pima / stats / footer.
- [ ] **3.2** Subir la colección (menos scroll antes de poder comprar, sobre todo en móvil).
- [ ] **3.3** Prueba junto a cada afirmación: sello/origen para "origen certificado"; foto real en el testimonio.
- [ ] **3.4** Imágenes: confirmar `alt` en todas, sin duplicados; fuentes < 200 KB (las tarjetas ya pasan por next/image).

## Fase 4 — Congelamiento
- [ ] Solo correcciones. Velocidad: LCP < 2.5 s en móvil. Prueba de compra real repetida. Revisión del auditor.

## Notas
- El **inglés ya está implementado** (`t()` en todo el código) — decidir si va al lanzamiento o se oculta el selector (🧑 Heber).
- La skill `auditoria-diseno` aún no existe como skill de Claude Code; crearla/instalarla en Fase 0 si se quiere reutilizable.
- Archivos protegidos (migraciones, pagos, `.env`) solo con ADR aprobada por Heber.
