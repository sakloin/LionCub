# plan.md — Rediseño y lanzamiento de la tienda Lion Cub

> **Regla 1 (todo agente):** leer este `plan.md` antes de programar.
> **Regla 2:** leer `docs/impacto.md` antes de tocar un módulo.
> Método: método orquestado + `design-patterns/IDENTIDAD.md` (NO tocar) + `design-patterns/PRINCIPIOS.md`.
> Meta de lanzamiento: **fin de octubre 2026**. Prioridad: lo que **impide comprar**.

## 🧑 Tareas de Heber
- [x] ~~Reactivar Supabase `cqwvhfcrmboscivtwkog`~~ — **✅ Activo (2026-10-11)**
- [ ] Probar compra real punta a punta (2.5) cuando PR #99 esté en main
- [ ] Aprobar formalmente `IDENTIDAD.md` (Fase 0)
- [ ] Decidir selector de idioma EN/ES para lanzamiento

## Estado de fases
| Fase | Qué | Estado |
|---|---|---|
| 0 | Kit de orquestación + `IDENTIDAD.md` + `PRINCIPIOS.md`; congelar alcance | 🟡 IDENTIDAD + PRINCIPIOS hechos; `.claude/*` + `docs/` instalados (2026-10-11); falta aprobación formal de IDENTIDAD por Heber |
| 1 | Auditoría móvil + desktop (home, colección, ficha, bolsa, checkout) | ✅ hecha (5 hallazgos) |
| 2 | Críticos de compra | 🔵 en curso |
| 3 | Jerarquía y contenido | ⬜ |
| 4 | Congelamiento + velocidad (LCP < 2.5 s móvil) + prueba de compra real | ⬜ |
| 5 | Lanzamiento | ⬜ |

## Fase 2 — Críticos de compra
- [x] **2.1 Resiliencia de la colección** (`app/components/Collection.tsx`): `try/catch/finally` en la carga para que un fallo del fetch NO deje "Cargando…" eterno; cae al estado vacío. _(hecho en rama; criterio: con la base caída, la sección no se cuelga)._
- [x] **2.2 SSR del catálogo**: `app/lib/catalog.ts` trae productos+ofertas en el servidor; `page.tsx` (async, `revalidate=60`) se los pasa a `Collection` como props. `Collection` ya no pide datos al navegador → el catálogo SIEMPRE está en el HTML (resuelve de raíz el "Cargando" y mejora SEO). _(hecho; criterio: productos en el HTML sin depender del cliente)._
- [x] **2.3 Precio por línea en checkout** (`app/checkout/page.tsx:695`): usar `unit_price_at_pick` (precio pagado), no `product.price` base; así cuadra con el subtotal. _(hecho en rama)._
- [x] **2.4 Validación de checkout** (`app/checkout/page.tsx`): contra entrega deshabilitada con Shalom + auto-switch a Yape; email obligatorio para Culqi con aviso inline. _(mergeado en main — PR #99, 2026-10-11)._
- [ ] **2.5 Prueba de compra real** de punta a punta (requiere Supabase activo): ver producto → variante → bolsa → checkout → Yape/transferencia/tarjeta → pedido registrado.

## Fase 3 — Jerarquía y contenido
- [x] **3.1** Un beneficio por lugar: Hero paragraph sin claims de TrustBar ("hipoalergénica, transpirable"); stat "Lima hecho a mano" removido (vive en OurStory + Footer). _(2026-10-11)_
- [x] **3.2** Colección sube a posición 2 en `page.tsx` (justo después del Hero, antes de TrustBar). _(2026-10-11)_
- [~] **3.3** Sello de origen junto a "Origen certificado" en WhyPima (🇵🇪 Piura · Lambayeque · cosecha a mano). Testimonios con avatar de iniciales. Foto real de testimonio: 🧑 Heber.
- [x] **3.4** Alt text confirmado en todas las imágenes de contenido; `alt=""` correcto en imágenes decorativas; next/image cubre optimización. _(2026-10-11)_

## Fase 4 — Congelamiento
- [ ] Solo correcciones. Velocidad: LCP < 2.5 s en móvil. Prueba de compra real repetida. Revisión del auditor.

## Notas
- El **inglés ya está implementado** (`t()` en todo el código) — decidir si va al lanzamiento o se oculta el selector (🧑 Heber).
- La skill `auditoria-diseno` aún no existe como skill de Claude Code; crearla/instalarla en Fase 0 si se quiere reutilizable.
- Archivos protegidos (migraciones, pagos, `.env`) solo con ADR aprobada por Heber.
