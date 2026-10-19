# Spec: Rediseño del panel administrativo (/admin)

> Pedido de Heber (2026-10-19): «revisa el menú administrativo, tenía un diseño bastante rústico, hay que mejorarlo para hacerlo más interactivo y con las mejoras que hemos descubierto de los videos».
> Fuentes: vault `Videos-Diseno-Web-Dashboards.md` (2026-10-18) y `Estandar-Diseno-Apple-Identidad.md`; `design-patterns/IDENTIDAD.md` y `PRINCIPIOS.md`.
> Rama: `claude/admin-rediseno`. Solo UI/UX.

## 1. Auditoría corta del admin actual

Capturas «antes» con datos ficticios (servidor simulado, fuera del repo). Hallazgos con gravedad y regla de `PRINCIPIOS.md`:

| # | Pantalla | Hallazgo | Gravedad | Regla |
|---|---|---|---|---|
| A1 | Todas (`AdminShell.tsx`) | Menú de 10 entradas en una sola lista, sin grupos ni prioridad; «Pedidos» (lo más usado) está en 5.º lugar. El activo solo coincide con la ruta exacta. | alto | Jerarquía |
| A2 | Todas | Paleta propia fuera de los tokens (`#3D2010`, `#D4A520`, `#9B6B45`…): marrón y oro saturado en vez de tinta + oro champagne. El oro relleno cubre botones, barras y activo (> 10 % de superficie). | alto | Color / IDENTIDAD §2 |
| A3 | Todas | Texto secundario `#9B6B45`/`#C4956A` sobre crema: ~3.3:1 y ~2.4:1, no llega a AA. Barras del gráfico `#D4A520` sobre blanco < 3:1. | alto | Accesibilidad / Color |
| A4 | Todas | Botones e íconos de 24–30 px (editar, borrar, chevrons, chips), sin foco visible propio; el menú móvil no se cierra con Escape ni tiene etiqueta. | alto | Botones ≥ 44 px / Accesibilidad |
| A5 | Login | Logo con `font-family: cursive` (Dancing Script retirado), campos sin `<label>`, error sin `role="alert"`. | medio | IDENTIDAD §3 / Accesibilidad |
| A6 | Tablero (`DashboardClient.tsx`) | Solo cifras del mes; no responde «¿qué hago hoy?»: no hay ventas del día/semana, pedidos por estado, pagos por verificar ni lista de espera. Las tarjetas no llevan a ningún lado. El gráfico de 14 días solo suma pedidos del mes en curso (los días del mes anterior salen en 0). | alto | Jerarquía |
| A7 | Tablero | Bloque oscuro final repite «Ingresos» y «Utilidad bruta» ya mostrados arriba. | medio | Contenido (una vez) |
| A8 | Pedidos (`pedidos/page.tsx`) | Sin búsqueda; filtros solo por estado y sin conteos; estados con color de Tailwind al azar y sin ícono; emojis como íconos (📦 🛵 💳 📅). | alto | Jerarquía / reglas «no IA» |
| A9 | Pedidos | «Confirmar pago» (envía correo), «Marcar enviado» (envía WhatsApp) e «Inválido» se ejecutan con un toque, sin confirmación ni deshacer. Cambiar el `select` a «cancelado» también. | crítico | Confirmación en acciones sensibles |
| A10 | Pedidos, Productos, Espera, Compras | «Cargando...» en texto plano que bloquea la pantalla. Vacíos sin acción útil. | medio | Interacción |
| A11 | Productos (`productos/page.tsx`) | En móvil la tabla desborda (574 px en un viewport de 390 px). Sin filtros por estado/stock; el stock bajo solo cambia de color; el interruptor Activo/Oculto no es un `switch` accesible y falla en silencio. | alto | Accesibilidad / Jerarquía |
| A12 | Ofertas, Compras, Configuración | `window.confirm` y `alert` nativos para borrar. | medio | Interacción |
| A13 | Layout admin | `app/admin/layout.tsx` vuelve a declarar `<html>/<body>` dentro del layout raíz → aviso de hidratación en desarrollo. | bajo | — (deuda) |

## 2. Objetivos
1. Que Heber sepa **en 5 segundos** qué atender hoy (pedidos nuevos, pagos por verificar, stock bajo, interesados en lista de espera) y llegue ahí en **1 toque**.
2. Atender un pedido (verificar pago → enviar) en **≤ 2 toques + 1 confirmación**, con deshacer cuando la acción no notifica al cliente.
3. Panel coherente con la marca: tokens de `globals.css`/IDENTIDAD (tinta, crema, oro champagne como acento), AA, objetivos de 44 px.

## 3. Ideas de los videos que se aplican
| Video (nota del vault) | Aplicación aquí |
|---|---|
| #1 Carga 10× (sesión local + paralelo) | Se mantiene `getSession()` local y `Promise.all`; las consultas nuevas del tablero van en el mismo `Promise.all`. |
| #9 Dashboard con Recharts y tarjetas KPI | Fila de KPI con ícono, cifra grande y comparación; Recharts ya instalado. |
| #16 Bento grid responsiva | Tablero en rejilla: 1 columna en móvil, 4–6 en escritorio, orden DOM = orden visual (sin `grid-auto-flow: dense`). |
| #18 Microinteracciones de dashboard | Contadores que suben al cargar (≤ 600 ms, solo texto; nada si `prefers-reduced-motion`), saludo con contexto («3 pedidos nuevos, 2 pagos por verificar»), entrada escalonada ≤ 300 ms con `transform`/`opacity`. |
| #19 Sidebar (rescatable) | Menú agrupado en secciones con títulos pequeños (etiquetas mono de la marca). |
| #13 Sidebar básico (descartado) | No se copia; se usa lo que ya existe (lucide-react + tokens). |
| #17 Navbar vidrio | Solo la barra superior móvil lleva desenfoque ≤ 12 px con respaldo sólido; es la única capa con blur. |
| Reglas «no hecho por IA» | Sin emojis como íconos, sin degradados morados, microcopy en la voz de Lion Cub. |
| Reglas de rendimiento | Skeletons en vez de «Cargando…»; sin librerías nuevas (sonner, lucide y recharts ya están). |

## 4. Qué cambia por pantalla
- **Navegación (`AdminShell`)**: menú agrupado (Hoy · Tienda · Inventario y números · Marca · Sistema), íconos, activo con barra de oro y `aria-current`, rutas hijas también activas, contador de pedidos nuevos en «Pedidos». Móvil: barra superior + cajón con Escape/foco + **barra inferior** con Inicio, Pedidos, Productos y Menú. Login con logo, etiquetas y error accesible. Notificaciones del admin en su propio `Toaster` (arriba a la derecha) para no chocar con la barra inferior ni con los toasts de la tienda.
- **Tablero (`page.tsx` + `DashboardClient`)**: saludo con contexto; KPI clicables: ventas de hoy, ventas de 7 días (con variación vs. 7 días previos), pedidos por atender, stock bajo; fila «pedidos por estado» que lleva a Pedidos filtrado; lista de espera pendiente; acciones rápidas; gráfico de 14 días con color AA y días en hora de Lima; top productos; resumen del mes (ingresos, costo, compras, utilidad, margen) sin repetir. `loading.tsx` con skeleton.
- **Pedidos**: búsqueda (nombre, teléfono, código, distrito), chips de estado con conteo, filtro de pago, `?estado=` en la URL desde el tablero. Tarjeta con código, fecha relativa, insignias de estado y pago con ícono + texto, íconos lucide en vez de emojis, **una acción principal** sugerida según el estado (Confirmar pago → Marcar enviado → Marcar entregado). Confirmación antes de: confirmar pago, marcar enviado, comprobante inválido y cancelar. Deshacer (toast) en cambios de estado que no notifican al cliente. Skeleton y vacío útil.
- **Productos (solo la lista y el diálogo de borrar)**: búsqueda con ícono y limpiar, chips Todos/Activos/Ocultos/Stock bajo/Agotados con conteo y filtro de categoría, stock con insignia de texto («Agotado», «Bajo»), interruptor accesible (`role="switch"`) con toast + deshacer, botones de 44 px con `aria-label`, columna Costo oculta en móvil (sin desborde), skeleton y vacío útil, diálogo de borrar con Escape y `role="dialog"`.

## 5. Qué NO cambia
- Lógica de negocio, cálculos de utilidad/margen, escrituras a la base (mismas tablas, campos y valores), notificaciones (correo/WhatsApp) y su momento de disparo.
- Autenticación/autorización del admin (`isAllowed`, allowlist, RLS).
- Formulario de edición de producto, importadores, Ofertas, Compras, Reportes, Catálogo PDF, Contenido, Configuración y Lista de espera por dentro (heredan la navegación nueva; su rediseño queda pendiente).
- Archivos protegidos: `supabase/migrations/**`, `app/api/payments/**`, `.env*`, `IDENTIDAD.md`, `PRINCIPIOS.md`.
- Sin dependencias nuevas.

Lecturas nuevas (solo `select`, sin escrituras): en el tablero, pedidos desde el inicio del mes o 13 días atrás (lo que sea antes), pedidos abiertos (`nuevo`/`procesando`) de cualquier fecha y conteo de `waitlist` pendiente; en el menú, conteo de pedidos `nuevo`.

## 6. Criterios de terminado
- [ ] `npx tsc --noEmit` sin errores nuevos; `npm run build` OK con variables ficticias; `eslint` sin errores nuevos en los archivos tocados.
- [ ] Móvil 390 px: sin desborde horizontal en Tablero, Pedidos y Productos.
- [ ] Todo control interactivo nuevo ≥ 44×44 px y con foco visible; textos con contraste ≥ 4.5:1 (secundario = `--color-ink-soft`).
- [ ] Confirmar pago, marcar enviado, comprobante inválido y cancelar piden confirmación; los cambios sin notificación ofrecen «Deshacer».
- [ ] Ningún «Cargando…» bloqueante en Tablero, Pedidos y Productos (skeleton).
- [ ] Estados siempre con color + ícono + texto.
- [ ] Capturas antes/después (móvil y escritorio) con datos ficticios.
- [ ] Veredicto del auditor (APROBADO) antes de integrar.

## 7. Casos dorados
No cambia ninguna regla de negocio (dinero, stock, impuestos). Los casos GC-01 a GC-06 no se ven afectados.

## 8. Pendientes / preguntas abiertas
- **Token de error (ADR):** IDENTIDAD dice «rojo solo para errores» pero no define el token. Se usa el rojo de Tailwind (`red-50/700`) que ya usaba el admin. Proponer `--color-danger`.
- **Tokens de estado:** se usan pasteles existentes (blue, gold-pale, lav, mint) con texto en tinta; si Heber quiere colores de estado propios, ADR.
- **Tipografía del admin:** IDENTIDAD dice que `/admin` conserva Nunito, pero el `body` resuelve `--font-inter` del layout raíz primero, así que hoy se ve en Inter. No se cambia aquí; decidir.
- **Datos del tablero en servidor:** `app/admin/page.tsx` consulta con la clave anónima en el servidor (sin sesión). Si la RLS de `orders` se restringe al correo admin, el tablero saldría en cero. Revisar cuando se endurezca la RLS.
- Rediseño interno de Ofertas, Compras (cambiar `confirm/alert`), Configuración, Reportes, Contenido, Lista de espera y el formulario de producto.
- Búsqueda global / atajo ⌘K.
