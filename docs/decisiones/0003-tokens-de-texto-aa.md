# ADR 0003 — Tokens de texto con contraste AA
- Fecha: 2026-10-18
- Estado: **propuesta, pendiente de Heber** (para registrarlos en `design-patterns/IDENTIDAD.md` §2, archivo protegido)
- Origen: auditoría previa al lanzamiento (2026-10-18), hallazgo #10

## Contexto
`PRINCIPIOS.md` pide contraste AA (4.5:1) en texto. Dos tokens de IDENTIDAD §2 no lo cumplen en texto pequeño:

| Par | Ratio | Uso como texto |
|---|---|---|
| `--color-ink-mute` #9B8D7E / crema #FDF8F0 | 3.05 | precios tachados, stock, métodos de pago, pasos del checkout |
| `--color-ink-mute` / bg-warm #F5ECDC | 2.75 | resumen del checkout |
| `--color-gold-deep` #A47C3B / crema | 3.60 | eyebrows, "Elegir talla →", badges |
| `--color-gold-deep` / bg-warm | 3.24 | sello de origen |

## Decisión (aplicada en la rama, sin tocar IDENTIDAD.md)
1. Dos tokens **solo para texto** en `app/globals.css` (`@theme`), sin cambiar ningún token existente:
   - `--color-gold-text: #86652C` (5.08 sobre crema, 4.58 sobre bg-warm)
   - `--color-ink-mute-text: #756A5E` (4.99 sobre crema, 4.50 sobre bg-warm)
2. Se usan en texto menor a 18 px: `.lc-eyebrow`, `.lc-pill-gold`, numeración de beneficios, CTA de tarjeta, precios tachados, metadatos de bolsa y checkout.
3. El oro champagne `#C9A961` y el oro profundo `#A47C3B` siguen igual para hairlines, superficies, iconos y titulares grandes en cursiva (≥ 18 px, donde basta 3:1).
4. Las etiquetas pequeñas suben a 12 px (escala mínima de PRINCIPIOS).

## Qué necesita Heber
- Aprobar y agregar estas dos filas a la tabla de IDENTIDAD §2 (rol: "Texto pequeño oro" y "Texto tenue AA"). Si no se aprueba, se revierte el commit "Tokens de texto AA (#10)" y vuelven los colores anteriores.

## Fuera de esta ADR
- #12 (proporción del logo: ícono 2× el texto, "Baby Clothing" ≥ 9-10 px o fuera de la navbar) toca el logo definido en IDENTIDAD §1. No se aplicó; requiere decisión de Heber sobre cuál es el logo oficial (PNG o el SVG `LionMark`).
