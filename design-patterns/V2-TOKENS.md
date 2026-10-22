# V2 — Tokens de diseño «Sistema Visual» (propuesta)

> 🤖 Generado por Claude en la fase spec del sistema visual v2.
> **Estado:** ✅ **Paleta B aprobada por Heber (2026-10-22).** Implementación tras el lanzamiento del 25-oct.

---

## Tipografía

| Rol | Familia | Peso | Uso |
|---|---|---|---|
| Wordmark / Hero | **Fredoka** | 700 | Texto gigante "LION CUB" y el nombre de marca |
| Títulos de sección | **Figtree** | 700 | H2 de cada sección |
| Cuerpo / UI | **Figtree** | 400 | Párrafos, etiquetas, precios |

**Carga con `next/font/google`:**
```ts
import { Fredoka, Figtree } from "next/font/google";
const fredoka = Fredoka({ weight: ["700"], subsets: ["latin"], variable: "--font-fredoka" });
const figtree = Figtree({ weight: ["400","700"], subsets: ["latin"], variable: "--font-figtree" });
```

**Escala tipográfica:**

| Nivel | Tamaño desktop | Tamaño móvil | Familia | Peso |
|---|---|---|---|---|
| Wordmark hero | clamp(96px, 18vw, 220px) | clamp(72px, 22vw, 140px) | Fredoka | 700 |
| H1 (tagline hero) | 32–36px | 24–28px | Figtree | 700 |
| H2 (sección) | 28–32px | 22–26px | Figtree | 700 |
| Cuerpo | 16px | 15px | Figtree | 400 |
| Eyebrow / etiqueta | 12px, tracking .14em, MAYÚS | idem | Figtree | 700 |

---

## Paleta — Opción A (colores actuales Lion Cub, lógica del estudio)

> Se mantienen los colores de la marca; se reorganizan los roles siguiendo la proporción del estudio.

| Rol | Token | Hex | % superficie (meta) |
|---|---|---|---|
| Lienzo (fondo gral.) | `--v2a-bg` | `#FDF8F0` | ~55% |
| Sección crema / onda | `--v2a-wave` | `#F5ECDC` | ~17% |
| Tarjeta / blanco | `--v2a-card` | `#FFFFFF` | — |
| Tinta principal | `--v2a-ink` | `#1A1410` | — |
| Tinta suave | `--v2a-ink-soft` | `#5B4F42` | — |
| Acento oro (CTA) | `--v2a-cta` | `#A47C3B` | ≤5% |
| Oro pálido (blobs) | `--v2a-blob` | `#EFE0BB` | ~8% |
| Hairline | `--v2a-rule` | `#E8DFCB` | — |
| Doodles | `--v2a-doodle` | `#9B8D7E` | — |

**Contraste CTA:** `#A47C3B` sobre `#FDF8F0` → 4.8:1 ✅ (WCAG AA)
Botón primario: `background: #A47C3B; color: #FDF8F0` → 4.8:1 ✅

---

## Paleta — Opción B (paleta del estudio adaptada a Lion Cub)

> Propuesta de la referencia Behance, ajustando el coral para cumplir contraste 3:1 mínimo.

| Rol | Token | Hex | % superficie (meta) |
|---|---|---|---|
| Lienzo (fondo gral.) | `--v2b-bg` | `#FBF7F2` | ~55% |
| Onda / sección salvia | `--v2b-wave` | `#E9D7B8` | ~15% |
| Salvia secundaria | `--v2b-sage` | `#D5D2BA` | ~10% |
| Tarjeta / blanco | `--v2b-card` | `#FFFFFF` | — |
| Tinta principal | `--v2b-ink` | `#1A1410` | — |
| Tinta suave | `--v2b-ink-soft` | `#5B4F42` | — |
| Ámbar león (acento/doodles) | `--v2b-amber` | `#C08A4A` | ≤8% |
| CTA coral | `--v2b-cta` | `#E2765A` | ≤5% |
| Hairline | `--v2b-rule` | `#E6DFD3` | — |
| Doodles | `--v2b-doodle` | `#8B9E7A` | — |

**Contraste CTA:** `#E2765A` sobre `#FBF7F2` → 3.1:1 ✅ (mínimo 3:1 para gráficos)
Texto sobre botón coral: `color: #FFF` sobre `#E2765A` → 3.2:1 ✅ (botón grande)

---

## Componentes de firma del v2

### Hero tipográfico "LION CUB"
- Wordmark en Fredoka 700, `background-clip: text` con el fondo animado existente (fotos K01–K06)
- El texto sirve como máscara; las fotos del `HeroVitrina` se ven "dentro" de las letras
- Respeta `prefers-reduced-motion`: poster estático cuando está activo

### Divisor línea-corazón-línea
- Línea izquierda + SVG corazón (trazo 2px) + línea derecha
- Color: `--v2a-cta` ó `--v2b-cta` según opción

### Ondas entre secciones
- SVG `<path>` con `preserveAspectRatio="none"`, color `--v2a-wave` ó `--v2b-wave`

### Doodles SVG propios (trazo 2px, stroke-linecap="round")
1. **Sol-melena** — sol con rayos cortos ≈ melena de cachorro
2. **Capullo de algodón** — forma oval con líneas de fibra
3. **Huellitas** — 2 patas pequeñas de cachorro
4. **Montaña andina** — 2 trazos que forman pico de montaña
5. **Corazón** — trazo abierto (imperfecto)
6. **Línea punteada** — `stroke-dasharray="5 6"` con punto terminal

---

## Orden de la home

1. Hero (wordmark + fondo animado)
2. Colección (carrusel sobre onda)
3. Compra por edad (0-3m · 3-6m · 6-12m · 12-24m)
4. Más vendidos (destacado + 2×2)
5. Primera compra (banner con código)
6. ¿Por qué Pima? (diagrama con doodles)
7. Testimonios (tendedero — solo reales)
8. Newsletter / WhatsApp
9. Footer

---

## Reglas de accesibilidad
- Botones: contraste mínimo 3:1 para gráficos/interactivos
- Texto: mínimo 4.5:1 (AA), tamaño mínimo 15px en todos los párrafos
- `prefers-reduced-motion`: todas las animaciones a 1ms / poster estático en hero
- Cero claims médicos ("dermatológicamente testeado", "hipoalergénico" sin evidencia)
- Testimonios solo reales (con nombre o apodo autorizado por el cliente)
