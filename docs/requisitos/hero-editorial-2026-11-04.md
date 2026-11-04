# Spec: Hero editorial «Suave como la caricia de mamá» e integración con la home

> Pedido de Heber (2026-11-04): integrar a lioncub.pe el hero nuevo (estructura editorial tomada del prompt MAREN de MotionSites, adaptado a Lion Cub, con movimiento sutil), y que **el diseño actual de la home se adapte a él**, «que se entrelace todo con todo».
> Prototipo: `design-handoff/hero-editorial/index.html` (también publicado como artifact «Lion Cub Hero»). Usa fotos que ya están en el repo: `public/hero/poster-desktop.webp`, `public/hero/poster-mobile.webp`, `public/lc-imgs/p0.webp`.
> Rama: `claude/hero-editorial`. Esta spec **no programa nada**: espera aprobación de Heber.

## 1. Qué hay hoy y qué trae el hero nuevo

| | Home actual (`app/data/lion-cub-body.ts` + `public/lc-styles.css`) | Hero nuevo (prototipo) |
|---|---|---|
| Tono | Lúdico: doodles (sol, nube, corazón), olas salvia, letras «LION CUB» rellenas de fotos | Editorial y sereno: foto grande, grilla de líneas finas, mucho aire |
| Paleta | `--paper #faf7f6`, salvia `#d5d5bd`, oliva, durazno `#ffa486`, Nunito | Crema `#FDF8F0`, tinta cálida, oro como acento |
| Titular | «Suave como la caricia de mamá.» (texto chico bajo las letras) | El mismo titular, protagonista, con «mamá» en serif cursiva |
| Movimiento | Carrusel | Cortinas, plantas, mar y luz que se mueven sutilmente + motas de algodón |
| Firma | Polaroids en el tendedero («Pequeños detalles. Grandes abrazos.») | Polaroid inclinada con un producto (Set Perrito) |

**Hallazgo:** la home publicada no usa la identidad aprobada en `design-patterns/IDENTIDAD.md` (Cormorant Garamond + Inter + JetBrains Mono, oro champagne `#C9A961`, crema `#FDF8F0`). Usa Nunito, salvia y durazno. El hero nuevo se acerca más a IDENTIDAD que la home actual. Hay que decidir cuál manda antes de «entrelazar» (pregunta P1).

## 2. Opciones

| | A · Solo el hero | B · Puente (recomendada) | C · Home editorial completa |
|---|---|---|---|
| Qué cambia | Se reemplaza el hero de letras por el editorial, pintado con la paleta actual | Hero editorial + el resto de la home toma 5 «hilos» del hero (abajo); se conservan secciones, fotos, carrusel y flujo de compra | Todas las secciones se rediseñan en el lenguaje editorial; se retiran doodles y olas |
| Coherencia | Baja: el hero se ve ajeno | Alta, sin rehacer la tienda | Máxima |
| Riesgo para comprar | Mínimo | Bajo (no toca checkout, bolsa ni catálogo) | Medio (toca todo `lc-styles.css`) |
| Tamaño | 1 rebanada | 3–4 rebanadas | 6+ rebanadas |

### Los 5 hilos de la opción B
1. **Tipografía:** titulares de sección con el mismo par del hero: sans ligera + una palabra en serif cursiva («Pequeños *favoritos*», «Compra por *edad*»). Las etiquetas en mono con tracking (IDENTIDAD §3).
2. **Grilla de líneas finas:** la línea de 1 px del hero continúa como separador entre secciones y bajo los titulares. Reemplaza los `♥` centrados y las olas salvia.
3. **Polaroid:** la del hero (Set Perrito) se repite como lenguaje en el tendedero de «Pequeños detalles» y en la ficha del producto destacado; el CTA del hero lleva a `#favoritos`, donde ese producto es el primero.
4. **Motas de algodón:** el mismo efecto del hero, más tenue, de fondo en «¿Por qué elegir Lion Cub?» (sección del Pima). Une la promesa «suave» con la prueba del material.
5. **Paleta:** un solo crema de fondo para toda la home; un solo acento (oro, ≤ 10 % de superficie). Salvia y durazno quedan como pasteles secundarios (fotos, chips de talla), no como bloques.

## 3. Reglas
- El hero no promete lo que no se prueba: solo propiedades reales del Pima, sin «hipoalergénico» ni «certificado» (auditoría #6).
- Movimiento: animaciones de 200–400 ms en la entrada; el ambiente (viento, luz) es lento y sutil. Con `prefers-reduced-motion` todo queda quieto.
- El viento por zonas (filtros SVG) solo en escritorio. En celular: foto fija + luz + motas, para no castigar la batería ni el LCP.
- Un solo CTA primario en el hero: «Ver colección» → `#favoritos`.
- Español peruano; textos también en inglés (el selector EN/ES está en el lanzamiento).

## 4. Criterios de éxito
- LCP < 2.5 s en móvil (PSI) con el hero nuevo; la foto del hero es el LCP y pesa < 200 KB.
- Sin CLS > 0.1 por la entrada animada (las cajas tienen tamaño fijo desde el inicio).
- GC-01 (catálogo SSR), GC-02 (añadir a bolsa) y GC-03 (checkout contra entrega) siguen pasando.
- Contraste AA de todo texto sobre la foto (velo crema detrás del titular y del párrafo).
- Capturas antes/después, móvil y escritorio, en el PR, con veredicto APROBADO del auditor de diseño.
- Con `prefers-reduced-motion: reduce` no se mueve nada.

## 5. Casos dorados
- Afectados (deben seguir igual): GC-01, GC-02, GC-03, GC-06.
- Nuevo: ninguno. No hay regla de negocio nueva.

## 6. Módulos y archivos
- Módulo: Catálogo / Home (`docs/impacto.md`).
- Archivos: `app/data/lion-cub-body.ts` (bloque `section.hero`), `public/lc-styles.css`, `public/lc-app.js` (motas y arranque del movimiento), `app/page.tsx` si se pasa el hero a componente React.
- Protegidos: ninguno. Si P1 cambia la identidad → ADR + aprobación de Heber.

## 7. Límites
- Siempre: fotos reales que ya existen en `public/`; `alt` en todas; < 200 KB.
- Preguntar antes: dependencias nuevas (no hacen falta), video generado con IA, cambios a `IDENTIDAD.md`.
- Nunca: tocar checkout, bolsa, pagos o precios en esta spec.

## 8. Preguntas abiertas para Heber
- **P1 — ¿Qué identidad manda?** (a) la de `IDENTIDAD.md` (Cormorant, oro champagne) o (b) la de la home publicada (Nunito, salvia, durazno). El prototipo está entre ambas. Recomendación: (a), porque ya está aprobada y el hero editorial encaja con ella.
- **P2 — ¿Opción A, B o C?** Recomendación: B.
- **P3 — ¿Seguimos en congelamiento?** El plan dice «solo correcciones desde 2026-10-25». Si la tienda ya lanzó, esto entra como fase nueva (Fase H1).
- **P4 — Etiqueta de temporada:** el prototipo dice «Verano 2027». ¿Nombre real de la colección?
- **P5 — Doodles y olas:** ¿se retiran (B y C) o se guardan solo para redes sociales?
- **P6 — Video del gesto** (mamá toca la nariz del bebé): requiere un generador de video IA (Kling, Runway, Veo). Si Heber lo genera, entra como mejora posterior sobre la misma estructura.
