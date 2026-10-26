# Mapa de impacto — Lion Cub

> Antes de tocar un módulo, verifica aquí: dependencias, tablas afectadas y casos dorados.

## Módulos principales

| Módulo | Archivos clave | Tablas | Quién lo usa |
|---|---|---|---|
| Catálogo / Home | `app/page.tsx`, `app/components/Collection.tsx`, `app/lib/catalog.ts` | `products`, `product_variants`, `offers` | Clientes |
| Checkout | `app/checkout/page.tsx`, `app/api/orders/route.ts` | `orders`, `order_items`, `product_variants` | Clientes |
| Chatbot | `app/lib/chatbot.ts`, `app/api/chat/**` | `chat_sessions`, `products`, `product_variants` | WhatsApp / ManyChat |
| Pagos | `app/api/payments/culqi/**` | `orders` | Clientes (Culqi) |
| Admin | `app/admin/**`, `app/globals.css` (bloque «Panel admin»: `.lc-admin-in`, `.lc-admin-pop`; usa los tokens compartidos con la tienda) | todas | Heber |
| Automatización | `automation/workflows/**` | `contenido_*` | n8n |
| Legal / Libro de Reclamaciones | `app/lib/legal.ts`, `app/lib/reclamos.ts`, `app/libro-reclamaciones/**`, `app/api/reclamos/route.ts`, `app/terminos`, `app/privacidad`, `Footer.tsx` | `libro_reclamaciones` (ADR 0002 aprobada 2026-10-19; migración `20261018_libro_reclamaciones.sql` sin aplicar) | Clientes / Heber |

## Casos dorados del negocio

### GC-01: Ver catálogo (SSR)
- Precondición: Supabase activo, hay productos activos con variantes.
- Acción: cargar `/` sin JS.
- Criterio: productos en el HTML; no hay "Cargando…".

### GC-02: Añadir a bolsa
- Precondición: producto con variante en stock.
- Acción: seleccionar talla/color → Añadir.
- Criterio: ícono de bolsa muestra cantidad; persiste en localStorage.

### GC-03: Checkout contra entrega (domicilio)
- Precondición: bolsa con ≥1 ítem; Supabase activo.
- Acción: datos → envío domicilio → contra entrega → confirmar.
- Criterio: pedido creado en `orders`; stock decrementado; email enviado.

### GC-04: Contra entrega no disponible con Shalom
- Precondición: estar en paso pago con Shalom seleccionado.
- Criterio: opción "Contra entrega" aparece deshabilitada (opacity-40).

### GC-05: Email requerido para Culqi
- Precondición: Culqi habilitado (`NEXT_PUBLIC_CULQI_ENABLED=true`).
- Acción: seleccionar pago con tarjeta sin correo en paso 1.
- Criterio: aviso naranja visible; botón "Confirmar pedido" deshabilitado.

### GC-06: Resiliencia de colección sin BD
- Precondición: Supabase inactivo / fetch falla.
- Criterio: sección colección muestra estado vacío; no queda en "Cargando…" eterno.

### GC-07: Libro de Reclamaciones sin tabla
- Precondición: la tabla `libro_reclamaciones` no existe (ADR 0002 sin aplicar) o la base no responde.
- Acción: llenar `/libro-reclamaciones` con datos ficticios válidos y enviar.
- Criterio: la API responde 503 con `canal_alterno: true`; la página muestra el aviso con WhatsApp y correo. No se pierde el texto del formulario.

### GC-08: Libro de Reclamaciones con tabla
- Precondición: ADR 0002 aplicada.
- Acción: enviar una hoja con datos ficticios.
- Criterio: respuesta 201 con código `000000001-AAAA` correlativo y `copia_enviada`; la pantalla muestra la hoja completa con «Imprimir / guardar PDF»; llega copia al consumidor y a `ADMIN_EMAIL`; la fila no se puede leer ni insertar con la llave pública y `delete` falla (trigger).

### GC-09: Aceptación de Términos en el checkout
- Precondición: bolsa con ≥ 1 ítem, en el paso de pago.
- Criterio: "Confirmar pedido" está deshabilitado hasta marcar "He leído y acepto los Términos y la Política de privacidad".

### GC-10: Antispam del Libro
- Acción: enviar el formulario antes de 3 s de abrirlo; luego 4 hojas en la misma hora desde la misma IP o el mismo correo.
- Criterio: el envío rápido responde 429 «Espera unos segundos»; el 4.º envío responde 429 con canal alterno; sin token responde 400 «Recarga la página». Prueba automática: `npm test`.

### GC-11: Confirmar pago pide confirmación y no se puede deshacer
- Precondición: admin con sesión; pedido con pago `pendiente` y método distinto de contra entrega.
- Acción: `/admin/pedidos` → «Confirmar pago» (o cambiar el select de pago a «Pagado»).
- Criterio: aparece el diálogo «¿Confirmar el pago?»; con «Volver» o Escape no se escribe nada. Al confirmar, `payment_status = pagado`, se envía **un** correo (`/api/admin/orders/notify-paid`) y el aviso **no** ofrece «Deshacer». Pasar de «Pagado» a otro estado desde el select tampoco ofrece «Deshacer».
- Prueba: manual (el repo no tiene corredor de pruebas; ver DT-26). Verificada con Playwright y Supabase simulado el 2026-10-19.

### GC-12: Deshacer no notifica
- Precondición: pedido `enviado`.
- Acción: «Marcar entregado» → «Deshacer» en el aviso.
- Criterio: el pedido vuelve a `enviado` con una sola escritura `update … where id = X and order_status = 'entregado'`; no se llama a `notify-paid` ni a `notify-shipped`. Si otro cambio llegó antes (el estado ya no es `entregado`), no se escribe nada y aparece «No se deshizo: el pedido cambió mientras tanto».
- Prueba: manual (DT-26).
