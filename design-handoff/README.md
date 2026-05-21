# Lion Cub — Paquete de handoff para Claude Code

Este paquete contiene el **rediseño editorial** de Lion Cub Baby Clothing,
listo para que Claude Code lo adapte sobre el código existente del sitio.

## Cómo usarlo

1. Sube **toda esta carpeta** (`claude-code-package/`) dentro de tu
   proyecto Lion Cub (la raíz o `docs/`, donde Claude Code pueda leerla).
2. Abre `design/preview.html` en tu navegador para ver el sistema y todas
   las pantallas mockeadas — sistema · 2 direcciones de home · colección ·
   ficha · carrito · checkout 3 pasos · editorial.
3. Inicia una conversación con Claude Code y pégale como primer mensaje el
   contenido de **`PROMPT.md`**.

## Contenido

| Archivo | Qué es |
|---|---|
| `PROMPT.md` | **Prompt listo para pegar** a Claude Code. |
| `productos.json` | Catálogo completo: marca, categorías, ofertas y 25 productos. |
| `assets/lion-cub-logo*.png` | Logo oficial ilustrado (uso "marketing"). |
| `assets/products/LC-*.jpeg` | 25 fotos de producto — el nombre coincide con el SKU. |
| `design/preview.html` | Mockups navegables — **ábrelo en navegador**. |
| `design/tokens.css` | Sistema visual completo (color, type, spacing, sombras). |
| `design/components.jsx` | Primitivos `LC*` (botones, nav, footer, logo leoncito, product card). |
| `design/system.jsx` | Documentación visual del sistema (lo que ve `preview.html`). |
| `design/home-a.jsx` | Home V1 · **Editorial Letter** (Bonpoint-style). |
| `design/home-b.jsx` | Home V2 · **Quiet Luxury** (más minimal). |
| `design/shop.jsx` | Colección, ficha de producto, estado sin stock, carrito. |
| `design/checkout.jsx` | 3 pasos + confirmación. |
| `design/editorial.jsx` | Historia del Pima — página long-form. |
| `design/mobile.jsx` | Pantallas mobile específicas y drawer de nav. |

## El sistema en una línea

> Lujo discreto inspirado en Bonpoint y Marie-Chantal: crema cálida,
> hairlines en oro champagne, Cormorant Garamond en cursiva + Inter ligero
> + mono como contrapunto. Mucho aire. Voz íntima y específica.

## Estructura de `productos.json`

```json
{
  "brand": { "name", "whatsapp", "instagram", "facebook", "email", "logo" },
  "categories": [{ "id", "name", "desc", "count" }],
  "offers": {
    "bodies":  { "rule": "buy_3_get_15_off_third", "desc": "..." },
    "baberos": { "rule": "buy_3_get_15_off_third", "desc": "..." },
    "mantas":  { "rule": "buy_3_get_15_off_third", "desc": "..." }
  },
  "products": [
    {
      "id": "LC-001",
      "category": "conjuntos",
      "name": "Tiernos Conejitos",
      "tagline": "El primer abrazo suave",
      "desc": "Set de 5 piezas...",
      "price": 79,
      "sizes": ["RN", "0-3m", "3-6m"],
      "colors": ["Blanco"],
      "gender": "Unisex",
      "material": "100% Algodón Pima",
      "hasOffer": false,
      "image": "assets/products/LC-001.jpeg"
    }
  ]
}
```

## Datos de contacto

- WhatsApp: **+51 920 201 943** · `https://wa.me/51920201943`
- Instagram: **@lioncubbabyclothing**
- Facebook: **Lion Cub Baby Clothing**
- Email: **hola@lioncub.pe**
- Web: **lioncub.pe** (próximamente)
