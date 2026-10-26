# plan.md — Rediseño y lanzamiento de la tienda Lion Cub

> **Regla 1 (todo agente):** leer este `plan.md` antes de programar.
> **Regla 2:** leer `docs/impacto.md` antes de tocar un módulo.
> Método: método orquestado + `design-patterns/IDENTIDAD.md` (NO tocar) + `design-patterns/PRINCIPIOS.md`.
> Meta de lanzamiento: **fin de octubre 2026**. Prioridad: lo que **impide comprar**.

## 🧑 Tareas de Heber
- [x] ~~Reactivar Supabase `cqwvhfcrmboscivtwkog`~~ — **✅ Activo (2026-10-11)**
- [x] ~~Probar compra real punta a punta (2.5)~~ — **✅ OK (2026-10-11)**
- [x] ~~Aprobar formalmente `IDENTIDAD.md` (Fase 0)~~ — **✅ Aprobada (2026-10-11)**
- [x] ~~Decidir selector de idioma EN/ES para lanzamiento~~ — **✅ Va al lanzamiento (2026-10-11)**

## Estado de fases
| Fase | Qué | Estado |
|---|---|---|
| 0 | Kit de orquestación + `IDENTIDAD.md` + `PRINCIPIOS.md`; congelar alcance | ✅ Completo — IDENTIDAD aprobada por Heber (2026-10-11) |
| 1 | Auditoría móvil + desktop (home, colección, ficha, bolsa, checkout) | ✅ hecha (5 hallazgos) |
| 2 | Críticos de compra | 🔵 en curso |
| 3 | Jerarquía y contenido | ⬜ |
| 4 | Congelamiento + velocidad (LCP < 2.5 s móvil) + prueba de compra real | ⬜ |
| 5 | Lanzamiento | ⬜ |
| A1 | Rediseño del panel admin (navegación, tablero, pedidos, productos) — spec `docs/requisitos/admin-rediseno-2026-10-19.md` | 🟡 implementado en rama `claude/admin-rediseno` (PR borrador) — falta auditor |

## Fase 2 — Críticos de compra
- [x] **2.1 Resiliencia de la colección** (`app/components/Collection.tsx`): `try/catch/finally` en la carga para que un fallo del fetch NO deje "Cargando…" eterno; cae al estado vacío. _(hecho en rama; criterio: con la base caída, la sección no se cuelga)._
- [x] **2.2 SSR del catálogo**: `app/lib/catalog.ts` trae productos+ofertas en el servidor; `page.tsx` (async, `revalidate=60`) se los pasa a `Collection` como props. `Collection` ya no pide datos al navegador → el catálogo SIEMPRE está en el HTML (resuelve de raíz el "Cargando" y mejora SEO). _(hecho; criterio: productos en el HTML sin depender del cliente)._
- [x] **2.3 Precio por línea en checkout** (`app/checkout/page.tsx:695`): usar `unit_price_at_pick` (precio pagado), no `product.price` base; así cuadra con el subtotal. _(hecho en rama)._
- [x] **2.4 Validación de checkout** (`app/checkout/page.tsx`): contra entrega deshabilitada con Shalom + auto-switch a Yape; email obligatorio para Culqi con aviso inline. _(mergeado en main — PR #99, 2026-10-11)._
- [x] **2.5 Prueba de compra real** de punta a punta — **✅ OK (2026-10-11)**

## Fase 3 — Jerarquía y contenido
- [x] **3.1** Un beneficio por lugar: Hero paragraph sin claims de TrustBar ("hipoalergénica, transpirable"); stat "Lima hecho a mano" removido (vive en OurStory + Footer). _(2026-10-11)_
- [x] **3.2** Colección sube a posición 2 en `page.tsx` (justo después del Hero, antes de TrustBar). _(2026-10-11)_
- [~] **3.3** Sello de origen junto a "Origen certificado" en WhyPima (🇵🇪 Piura · Lambayeque · cosecha a mano). Testimonios con avatar de iniciales. Foto real de testimonio: 🧑 Heber.
- [x] **3.4** Alt text confirmado en todas las imágenes de contenido; `alt=""` correcto en imágenes decorativas; next/image cubre optimización. _(2026-10-11)_

## Fase 4 — Congelamiento
- [x] **4.1 Velocidad** (2026-10-11): `priority` en primeros 4 cards de Collection (ahora posición 2 → LCP candidato); AVIF habilitado en next.config; Hero images ya tenían `priority`. _(mergeado PR #101)_
- [x] **4.2 Prueba de compra real** (punta a punta, repetida) — **✅ OK (2026-10-11)**
- [ ] **4.3 Congelamiento**: solo correcciones desde 2026-10-25. Revisión final del auditor.

## UX — Paquete sonner + mejoras (2026-10-13)
- [x] `sonner` instalado — toast notifications para confirmación de carrito
- [x] SelectionSheet rediseñado: galería de imágenes de producto (aspect 4:3, prev/next, dots), guía de tallas inline
- [x] `SizeGuide.tsx` — tabla con 8 tallas RN→2T, peso, altura, nota sobre holgura Pima
- [x] `AnnouncementBar` dismissible — botón X + `localStorage` para persistir la decisión
- [x] DT-01 y DT-02 verificados como ya resueltos en código; actualizados en `deuda-tecnica.md`

## Correcciones de la auditoría previa al lanzamiento (2026-10-18)
Rama `claude/correcciones-auditoria-lanzamiento` (PR en borrador). Fuente: `LionCub-Auditoria-2026-10-18.md` (vault). Estado: 🟡 en revisión (falta veredicto del auditor y decisiones de Heber).
- [x] **#1** Libro de Reclamaciones virtual: página + `POST /api/reclamos` listas. ADR 0002 aprobada por Heber (2026-10-19); migración `20261018_libro_reclamaciones.sql` en el repo (incluye `orders.acepta_terminos_at`, DT-17). 🧑 **Falta aplicarla en Supabase** (DT-08).
- [x] **#2** Bloque legal en el pie (Términos, Privacidad, Libro). 🧑 Razón social, RUC y domicilio: `PENDIENTE_HEBER` en `app/lib/legal.ts` (DT-09).
- [x] **#3** Feed de Meta: enlace a `/#coleccion` e imagen de respaldo que existe.
- [x] **#4** Sin "USA" en el anuncio ni en el pie.
- [x] **#5** Métodos de pago únicos (bolsa, pie, checkout); sin IZIPAY; tarjeta = Culqi solo con el flag.
- [x] **#6** Sin "80% del Pima mundial", "Origen certificado" ni "Hipoalergénico" en la web.
- [x] **#7** Correo único hola@lioncub.pe en Términos y Privacidad; sin domicilio no confirmado.
- [x] **#8** Checkout: 16 px, foco visible, etiquetas, autocomplete y aceptación de Términos y Privacidad.
- [x] **#9** Hero por CSS + `<picture>`; sin `priority` en tarjetas. Medir con PSI (DT-15).
- [x] **#10** Tokens de texto AA en `globals.css`; ADR 0003 aprobada por Heber (2026-10-19) y tokens registrados en IDENTIDAD §2 (DT-13 resuelto).
- [x] **#11** Áreas táctiles ≥ 44 px.
- [ ] **#12** Logo: solo se corrigió el enlace a `/`; la proporción espera decisión de Heber (DT-12).
- [x] **#13** Bolsa inert, modales accesibles, tarjeta `<article>`.
- [x] **#14** Precio tachado formateado, sin código LC en la bolsa, tope de stock.
- [x] **#15** Host canónico www, sin hreflang falso, sitemap real, checkout noindex.
- [x] **#16** `logo-512.png` (49 KB) para apple-touch-icon, JSON-LD y feed.

## Fase A1 — Rediseño del panel admin (2026-10-19)
> Pedido de Heber: admin «rústico» → más interactivo, con las mejoras de los videos. Solo UI/UX; sin cambios de lógica, auth ni esquema.
- [x] **A1.1** Navegación agrupada (`AdminShell`): íconos, grupos, activo accesible, cajón + barra inferior en móvil, login accesible, toaster propio del admin.
- [x] **A1.2** Tablero: KPI de hoy/7 días, pedidos por estado, stock bajo, lista de espera, acciones rápidas, saludo con contexto, contadores, skeleton.
- [x] **A1.3** Pedidos: búsqueda, filtros con conteo, estados color+ícono+texto, acción principal por pedido, confirmación y deshacer.
- [x] **A1.4** Productos (lista): filtros, stock con texto, interruptor accesible con deshacer, móvil sin desborde, skeleton.
- [ ] **A1.5** Auditor: veredicto APROBADO antes de integrar. Pendientes en `deuda-tecnica.md` (DT-21 a DT-29).
- [ ] **A1.6** Siguiente rebanada: Ofertas, Compras, Configuración, Reportes, Contenido, Lista de espera y formulario de producto con las mismas piezas (DT-25).

## Notas
- El **inglés va al lanzamiento** — selector EN/ES visible. Aprobado por Heber 2026-10-11.
- La skill `auditoria-diseno` aún no existe como skill de Claude Code; crearla/instalarla en Fase 0 si se quiere reutilizable.
- Archivos protegidos (migraciones, pagos, `.env`) solo con ADR aprobada por Heber.
