# IDENTIDAD — Lion Cub Baby Clothing

> Lo que **NO se toca** en el rediseño. Apple pone los criterios (espacio, jerarquía, tipografía, interacción → ver `PRINCIPIOS.md`); Lion Cub pone su identidad: color, voz, fotografía, símbolos.
> Fuente: sitio actual (`app/globals.css`, `app/layout.tsx`) + vault `Lion-Cub-Rediseno-Tienda-Lanzamiento`. **Aprobado por:** _(pendiente — Heber)_.

---

## 1. Marca y logo
- **Wordmark:** "Lion Cub Baby Clothing" (completo) · "Lion Cub" (corto). Escritura con mayúscula inicial en cada palabra; nunca "Lioncub" ni "LionCub" pegado en texto visible.
- **Logo:** `public/logo-solid.png` (también favicon y OG). El cachorro de león + wordmark.
- **Espacio de respeto:** mínimo = altura de la "L" del wordmark alrededor del logo. No colocarlo sobre fotos con detalle ni sobre el oro; va sobre crema o blanco.
- **Tagline de marca:** _"Suave como su piel, puro como su llegada."_

## 2. Paleta (con roles — del sistema de tokens actual)
**Regla Apple:** neutros dominan; el oro (acento) ocupa ≤ 10% de la superficie; el rojo solo para errores/alertas (no es color de marca).

| Rol | Token | Hex |
|---|---|---|
| Fondo principal (crema) | `--color-bg` | `#FDFBF6` |
| Crema cálido (escenario de foto) | `--color-bg-warm` | `#F5ECDC` |
| Crema suave (secciones) | `--color-bg-soft` | `#F8F2E7` |
| Tarjeta / blanco | `--color-bg-card` | `#FFFFFF` |
| Fondo oscuro (franjas) | `--color-bg-ink` | `#1A1410` |
| Texto principal (casi negro cálido) | `--color-ink` | `#1A1410` |
| Texto secundario | `--color-ink-soft` | `#5B4F42` |
| Texto tenue / metadatos | `--color-ink-mute` | `#9B8D7E` |
| Líneas finas (hairline) | `--color-rule` | `#E8DFCB` |
| **Acento — oro champagne** | `--color-gold` | `#C9A961` |
| Oro profundo (texto sobre crema) | `--color-gold-deep` | `#A47C3B` |
| Oro pálido | `--color-gold-pale` | `#EFE0BB` |
| Pasteles bebé (desaturados) | pink / blue / mint / lav | `#F0D9D2` · `#D9E2EA` · `#DDE6D6` · `#E2DCE5` |

⚠️ **A confirmar (Heber):** el crema del `theme-color` del navegador es `#FDF8F0` pero el fondo real del sitio es `#FDFBF6`. Hay que elegir **uno** como crema canónico. _(No lo cambio sin tu OK — es identidad.)_

## 3. Tipografías
- **Display / titulares:** **Cormorant Garamond** (serif, peso 300, cursiva para acentos poéticos). Es la voz visual de la marca.
- **Cuerpo / UI:** **Inter** (≥ 16 px en web, interlínea 1.4–1.6).
- **Etiquetas / "eyebrows" / botones:** **JetBrains Mono** en MAYÚSCULAS, con tracking amplio (ej. `CAPÍTULO 01 · EL MATERIAL`).
- Máximo estas 2 familias + la mono de etiquetas. **Retirar** la cursiva *Dancing Script* (`.font-brand`, legado) del público.
- `/admin` conserva su propia **Nunito** — no se toca.

## 4. Voz y tono
Cálida, poética, boutique peruana. Habla de la piel del bebé y del primer abrazo, no de "features".
- **Ejemplos reales (conservar el registro):** "Suave como su piel, puro como su llegada." · "La fibra más suave del mundo." · "Para pieles que apenas están conociendo el mundo."
- **Español peruano.** Nunca mexicanismos (órale, chido, qué onda, "te late"), nunca "mi favorito / yo me iría por"; prueba social = "los que más llevan".
- **Palabras prohibidas / cuidado:** jerga publicitaria vacía, mayúsculas gritando, signos de apertura `¿ ¡` en el chat (en la web sí van, es gramática), afirmaciones sin prueba ("hipoalergénico", "origen certificado") si no hay evidencia al lado.
- **Estructura editorial:** capítulos numerados (`01 · MATERIAL`, `CAPÍTULO 02 · QUIÉNES SOMOS`), datos grandes (200+, 100%, 3×, Lima).

## 5. Fotografía
- Real y consistente; **el producto es el protagonista** sobre escenario crema (`--color-bg-warm`).
- Props suaves (madera, trenzado, eucalipto) sin robar protagonismo; para baberos, foto del modelo solo (sin bebé) como imagen principal.
- Peso **< 200 KB** (WebP/AVIF), nunca 2 MB. `alt` descriptivo **siempre**. Sin imágenes duplicadas.

## 6. Elementos firma (lo que hace "Lion Cub")
- **Carta escrita a mano** en cada pedido ("Carta del primer abrazo").
- **Algodón Pima peruano**, hebra extra-larga, costa norte (Piura, Lambayeque).
- **Hecho a mano en Lima**, origen peruano como orgullo.
- **Hairlines de oro champagne**, etiquetas mono, numeración por capítulos, escenario crema.
- Contacto de marca: WhatsApp +51 920 201 943 · hola@lioncub.pe · IG @lioncubbabyclothing

---

### Qué pasa con este archivo
- El **auditor** del método verifica en cada fase que el rediseño **no** contradiga este documento.
- Cambiar cualquier cosa de aquí (un color, una tipografía, la voz) requiere tu aprobación explícita (ADR).
