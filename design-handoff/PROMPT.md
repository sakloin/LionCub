# Lion Cub — Prompt para Claude Code

Copia y pega lo siguiente como **primer mensaje** a Claude Code, después de
abrir esta carpeta dentro de tu proyecto.

---

## Prompt

Hola Claude. Esta carpeta (`/claude-code-package`) contiene el **rediseño
editorial completo** de Lion Cub Baby Clothing, listo para que lo adaptes
sobre el código actual del sitio.

Antes de tocar archivos, por favor:

1. **Lee el código existente del proyecto** (estructura de páginas,
   framework, componentes UI, sistema de estilos, dónde viven los datos de
   productos y el carrito). Mantén lo que ya funcione — no reescribas el
   stack, **adapta el diseño encima**.
2. **Lee `/claude-code-package/design/tokens.css`** — es la fuente de verdad
   del sistema visual nuevo. Migra esos tokens a la forma que use tu
   proyecto (CSS variables globales, Tailwind config, theme provider, lo
   que sea).
3. **Lee `/claude-code-package/design/components.jsx`** y los demás
   `*.jsx` de `design/` como **referencia de patrones**, no como código
   copy-paste. Están escritos en React + Babel inline para visualización;
   tú los reimplementarás en el estilo del proyecto (componentes
   `.tsx`/`.jsx`, Tailwind classes, CSS modules — lo que aplique).
4. **Lee `/claude-code-package/design/preview.html`** abierto en navegador
   para ver el sistema y todas las pantallas mockeadas (sistema · 2
   direcciones de home · colección · ficha · carrito · checkout 3 pasos ·
   editorial).

### Qué implementar

**Sistema de diseño** (tokens + primitivos)
- Migrar paleta completa de `tokens.css` (crema `#FDFBF6`, tinta `#1A1410`,
  oro champagne `#C9A961`, pasteles desaturados, hairlines).
- Tipografías Google Fonts: **Cormorant Garamond** (display, ital 300),
  **Inter** (UI 300/400/500), **JetBrains Mono** (eyebrows, SKU, números).
- Escala de espaciado 4-128 px (`--lc-s-1` … `--lc-s-10`).
- Botones: primary (tinta sólida) · outline · ghost (con línea animada) ·
  WhatsApp.
- Eyebrow en mono uppercase, tracking 0.28em.
- Pills, hairlines, color swatches.

**Logo nuevo**
- En `/claude-code-package/design/components.jsx` busca `LionMarkSvg` y
  `LCLogo`. Es un leoncito minimalista line-art (cara central rodeada de
  12 "tufts" de melena + dos orejitas + ojos/nariz/boca). Úsalo como mark
  del header y favicon SVG.
- El archivo `assets/lion-cub-logo-transparent.png` sigue siendo el logo
  oficial ilustrado — úsalo en lugares "marketing" (footer, packaging,
  redes), no en el chrome del sitio.

**Pantallas a implementar**

| Pantalla | Mockup | Notas |
|---|---|---|
| Home | `home-a.jsx` (V1 *Editorial Letter*) | **Dirección elegida.** Ignora `home-b.jsx` salvo para inspiración puntual. |
| Colección / Tienda | `shop.jsx` → `Collection_Desktop` + `Collection_Mobile` | Grid asimétrico, filtros por categoría/género, banner de oferta 3×15%. |
| Ficha de producto | `shop.jsx` → `ProductDetail_Desktop` + `_Mobile` | Galería grande, descripción editorial, tallas/colores, CTA principal + WhatsApp secundario. |
| Estado sin stock | `shop.jsx` → `Waitlist_State` | Form de lista de espera. |
| Carrito | `shop.jsx` → `Cart_Desktop` + `_Mobile` | Resumen con hairlines, totales, badge de oferta. |
| Checkout (3 pasos) | `checkout.jsx` → `CheckoutStep1/2/3_Desktop` | Paso 2 incluye fecha + franja horaria de envío. |
| Confirmación | `checkout.jsx` → `Confirmation_Desktop` | CTA prominente a WhatsApp con resumen del pedido. |
| Historia del Pima | `editorial.jsx` → `PimaStory` | Página long-form editorial. |
| Mobile menu / nav | `mobile.jsx` | Drawer lateral. |

**Datos**
- Usa `/claude-code-package/productos.json` como única fuente de productos.
  Mantén el campo `image` (`assets/products/LC-XXX.jpeg`) como ruta
  relativa al directorio público de tu proyecto.
- Categorías: `conjuntos`, `bodies`, `baberos`, `mantas`.
- Ofertas: productos con `hasOffer: true` muestran badge **"3 × 15 % dto"**
  (la regla está en `offers.<categoria>.rule`).

**Carrito + WhatsApp**
- Botón "Pedir por WhatsApp" abre `https://wa.me/51920201943` con mensaje
  pre-llenado que incluye nombre + SKU + talla + color del producto, o del
  carrito completo si está en /carrito.
- El checkout puede culminar igualmente en WhatsApp (envía resumen) — no
  hace falta pasarela de pago real en esta iteración salvo que ya esté
  hecha.

**Voz y copy** (importante — está en `system.jsx` → sección "Voz")
- **Sí:** segunda persona ("para su piel"), nombrar material/origen/gesto,
  confianza serena, mezclar poético + concreto.
- **No:** emojis decorativos, "los mejores precios", titulares en
  MAYÚSCULAS, promesas vagas.
- Todos los títulos en *sentence case*. La cursiva del display
  (Cormorant ital 300) se reserva para 1–2 palabras de énfasis por título,
  en color oro profundo `#A47C3B`.

**Layout — 4 principios** (también en `system.jsx`)
1. **Mucho aire** · padding generoso, mínimo 80 px entre secciones desktop.
2. **Cuadrícula asimétrica** · editorial, no comercial.
3. **Hairlines, no cajas** · líneas finas color `--lc-rule` en lugar de
   bordes con sombra.
4. **Mono como contrapunto** · mono uppercase equilibra la cursiva del
   display.

### Cómo proceder

1. Hazme primero un **plan de migración**: qué archivos vas a tocar, qué
   componentes nuevos vas a crear, qué dependencias añadir (las Google
   Fonts), y en qué orden. No empieces hasta que confirme.
2. Empieza por **tokens + tipografías + chrome (header/footer)**. Esa base
   por sí sola ya transforma la sensación del sitio.
3. Luego **home**, **ficha de producto**, **colección**.
4. Después **carrito + checkout**.
5. Al final, **páginas editoriales**.

### Reglas duras

- **No uses emojis** en UI ni en copy. Punto.
- **No inventes contenido**: si te falta una imagen lifestyle, déjala como
  placeholder con un comentario `{/* TODO: foto lifestyle */}` — no
  generes SVG decorativos para rellenar.
- **No cambies la paleta** ni la tipografía respecto al sistema. Si una
  combinación no funciona en alguna pantalla, dímelo y proponemos un
  ajuste juntos.
- **Conserva tildes y eñes** en todo el copy (es español de Perú).

Cuando termines cada bloque, despliega para que pueda revisar, y avísame.

¡Gracias!

---

## Archivos que debes cargar a Claude Code

Sube la **carpeta `claude-code-package/` completa** dentro de la raíz de
tu proyecto (o donde tu Claude Code la pueda leer). Contiene:

```
claude-code-package/
├── PROMPT.md                     ← este archivo (el prompt de arriba)
├── README.md                     ← guía rápida del paquete
├── productos.json                ← catálogo completo (25 productos)
├── assets/
│   ├── lion-cub-logo.png         ← logo oficial (ilustrado)
│   ├── lion-cub-logo-transparent.png
│   └── products/
│       └── LC-001.jpeg … LC-302.jpeg   (25 fotos)
└── design/
    ├── preview.html              ← ABRE ESTE en navegador para ver todo
    ├── tokens.css                ← sistema visual (fuente de verdad)
    ├── components.jsx            ← primitivos LC* + logo leoncito
    ├── system.jsx                ← documentación visual del sistema
    ├── home-a.jsx                ← Home V1 · Editorial Letter
    ├── home-b.jsx                ← Home V2 · Quiet Luxury
    ├── shop.jsx                  ← Colección · Ficha · Carrito
    ├── checkout.jsx              ← 3 pasos + confirmación
    ├── editorial.jsx             ← Historia del Pima
    ├── mobile.jsx                ← Pantallas mobile específicas
    ├── design-canvas.jsx         ← (host de mockups — puedes ignorar)
    ├── app.jsx                   ← (host de mockups — puedes ignorar)
    └── demo-data.js              ← (data de demo — usa productos.json en su lugar)
```
