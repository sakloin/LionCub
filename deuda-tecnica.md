# Deuda técnica — Lion Cub

> Los atajos van aquí. No bloquean el lanzamiento salvo que se indique.

| ID | Descripción | Módulo | Urgencia | Anotado |
|---|---|---|---|---|
| ~~DT-01~~ | ~~`whatsapp/route.ts` ignora `result.images`~~ — **resuelto**: el bucle `for (const img of images.slice(0,3))` ya envía las fotos. | `app/api/chat/whatsapp/route.ts` | ~~alta~~ | 2026-10-11 → ✅ 2026-10-13 |
| ~~DT-02~~ | ~~Meta Graph API v20.0~~ — **resuelto**: `GRAPH_URL` ya usa `v21.0`. | `app/lib/whatsapp.ts` | ~~media~~ | 2026-10-11 → ✅ 2026-10-13 |
| DT-03 | Errores de tipos pre-existentes en admin/catalogo (react-pdf, lucide-react) | `app/admin/catalogo/**` | baja | 2026-10-11 |
| DT-04 | Skill `auditoria-diseno` no instalada en Claude Code | `.claude/` | baja | 2026-10-11 |
| DT-05 | Foto real en testimonios pendiente — usar avatares de iniciales hasta que Heber provea fotos en `/public/testimonios/` | `app/components/Testimonials.tsx` | baja | 2026-10-11 |
| DT-06 | Selector de idioma EN/ES visible — decisión pendiente de Heber (ocultar o mantener para lanzamiento) | `app/components/LanguageSwitcher.tsx` | baja | 2026-10-11 |
| DT-07 | `app/admin/layout.tsx` declara su propio `<html>/<body>` dentro del layout raíz → aviso de hidratación («attributes didn't match») en todo `/admin`. Pasar a un `<div>` contenedor o a un route group con layout raíz propio. | `app/admin/layout.tsx` | media | 2026-10-19 |
| DT-08 | Falta token de error en IDENTIDAD (`--color-danger`): el admin usa `red-50/200/700/800` de Tailwind para errores y acciones destructivas. Requiere ADR. | `app/admin/components/ui.tsx` | baja | 2026-10-19 |
| DT-09 | IDENTIDAD dice que `/admin` conserva Nunito, pero `body` resuelve primero `--font-inter` del layout raíz: hoy el admin se ve en Inter. Decidir con Heber y alinear. | `app/admin/layout.tsx`, `app/globals.css` | baja | 2026-10-19 |
| DT-10 | El tablero (`app/admin/page.tsx`) consulta en el servidor con la clave anónima, sin sesión del admin. Si la RLS de `orders`/`order_items`/`waitlist` se restringe al correo admin, el tablero saldrá en cero. Mover a cliente con sesión o a ruta API con verificación. | `app/admin/page.tsx` | media | 2026-10-19 |
| DT-11 | Rediseño A1 pendiente en Ofertas, Compras, Configuración, Reportes, Contenido, Catálogo PDF, Lista de espera y el formulario de producto: siguen con colores fuera de tokens, «Cargando…» bloqueante y `confirm()/alert()` nativos (Compras, Ofertas, Configuración). | `app/admin/**` | media | 2026-10-19 |
| DT-12 | Sin pruebas automáticas de UI del admin (el repo no tiene runner de pruebas). Confirmaciones, deshacer, filtros y cajón se verificaron a mano con Playwright y un Supabase simulado con datos ficticios. | `app/admin/**` | baja | 2026-10-19 |
| DT-13 | El contador de pedidos nuevos del menú se refresca al navegar, no en tiempo real (Supabase Realtime) ni tras cambiar un estado en la misma página. | `app/admin/components/AdminShell.tsx` | baja | 2026-10-19 |
| DT-14 | «Comprobante inválido» abre WhatsApp con `window.open` después de un `await` (y ahora tras el diálogo de confirmación): algunos bloqueadores de ventanas pueden impedirlo. Conducta previa; mostrar enlace en el aviso si se bloquea. | `app/admin/pedidos/page.tsx` | baja | 2026-10-19 |
