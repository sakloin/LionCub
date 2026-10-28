"use client";

import Image from "next/image";
import Link from "next/link";

const AGE_CARDS = [
  { range: "0–3",  unit: "meses", img: "/products/LC-016.jpeg", alt: "Ropa para bebé 0 a 3 meses",  href: "/tienda?edad=0-3m",  objPos: "center 28%" },
  { range: "3–6",  unit: "meses", img: "/products/LC-001.jpeg", alt: "Ropa para bebé 3 a 6 meses",  href: "/tienda?edad=3-6m",  objPos: "center 22%" },
  { range: "6–12", unit: "meses", img: "/products/LC-012.jpeg", alt: "Ropa para bebé 6 a 12 meses", href: "/tienda?edad=6-12m", objPos: "center 20%" },
  { range: "1–2",  unit: "años",  img: "/products/LC-019.jpeg", alt: "Ropa para bebé 1 a 2 años",   href: "/tienda?edad=1-2a",  objPos: "center 18%" },
];

// Blob orgánico en coordenadas absolutas viewBox "0 0 100 75" (ratio 4:3).
// Concavidad inferior-izquierda preservada del diseño original.
const BLOB_PATH =
  "M 10,1.5 C 32,0 68,0 90,1.5 C 100,3 102,13.5 100,24 " +
  "C 102,39 102,54 98,63 C 94,73.5 80,78 66,76.5 " +
  "L 52,75 C 38,72 22,63 12,52.5 C 4,43.5 0,34.5 0,25.5 " +
  "C -2,13.5 2,6 8,3 C 9,2.25 10,1.5 10,1.5 Z";

// mask-image via data URI evita el bug de Chromium donde clip-path:url(#id)
// falla silencioso cuando un ancestro tiene overflow:hidden.
const MASK_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"><path d="${BLOB_PATH}" fill="black"/></svg>`
);
const MASK_URL = `url("data:image/svg+xml,${MASK_SVG}")`;

export default function ShopByAge() {
  return (
    <section
      aria-label="Compra por edad"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem) clamp(12rem, 18vw, 15rem)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
          <p style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11px",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "var(--color-gold-text)",
            marginBottom: "0.75rem",
            opacity: 0.85,
          }}>
            Para cada etapa
          </p>
          <h2 style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "clamp(1.875rem, 4vw, 2.25rem)",
            color: "var(--color-ink)",
            margin: 0,
          }}>
            Compra por edad
          </h2>
        </div>

        {/* Grid — 4 cols desktop, 2 cols mobile */}
        <div
          className="shop-age-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "clamp(0.75rem, 2vw, 1.25rem)",
          }}
        >
          {AGE_CARDS.map((card) => (
            <Link
              key={card.range}
              href={card.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              {/* Foto con forma orgánica vía mask-image */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  WebkitMaskImage: MASK_URL,
                  maskImage: MASK_URL,
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                }}
              >
                <Image
                  src={card.img}
                  alt={card.alt}
                  fill
                  style={{ objectFit: "cover", objectPosition: card.objPos }}
                  sizes="(max-width: 767px) 50vw, 25vw"
                />
              </div>

              {/* Etiqueta debajo del cuadro, con espacio */}
              <div style={{
                marginTop: "0.75rem",
                paddingLeft: "0.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                lineHeight: 1.2,
              }}>
                <span style={{
                  fontFamily: "var(--font-title)",
                  fontWeight: 700,
                  fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
                  color: "var(--color-ink)",
                  display: "block",
                }}>
                  {card.range}
                </span>
                <span style={{
                  fontFamily: "var(--font-title)",
                  fontWeight: 400,
                  fontSize: "clamp(0.7rem, 1.2vw, 0.85rem)",
                  color: "var(--color-ink-soft)",
                  display: "block",
                  letterSpacing: "0.02em",
                }}>
                  {card.unit}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Onda inferior */}
      <div aria-hidden style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        lineHeight: 0,
        pointerEvents: "none",
      }}>
        <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%" }}>
          <path d="M0,120 C280,55 520,170 780,105 C1000,55 1240,160 1440,100 L1440,180 L0,180 Z" fill="var(--color-v2-wave)"/>
        </svg>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .shop-age-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
