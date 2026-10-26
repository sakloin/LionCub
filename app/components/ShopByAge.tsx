"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * ShopByAge — Cards 4:3 con recorte inferior-izquierdo (SVG clipPath)
 * La etiqueta se apoya en el espacio libre que produce el notch.
 */

const AGE_CARDS = [
  { label: "0–3 m",  img: "/products/LC-016.jpeg", alt: "Ropa para bebé 0 a 3 meses",  color: "#F0D9D2", href: "/tienda?edad=0-3m",  objPos: "center 28%" },
  { label: "3–6 m",  img: "/products/LC-001.jpeg", alt: "Ropa para bebé 3 a 6 meses",  color: "#E9D7B8", href: "/tienda?edad=3-6m",  objPos: "center 22%" },
  { label: "6–12 m", img: "/products/LC-012.jpeg", alt: "Ropa para bebé 6 a 12 meses", color: "#DDE6D6", href: "/tienda?edad=6-12m", objPos: "center 20%" },
  { label: "1–2 a",  img: "/products/LC-019.jpeg", alt: "Ropa para bebé 1 a 2 años",   color: "#D5D2BA", href: "/tienda?edad=1-2a",  objPos: "center 18%" },
];

// objectBoundingBox (0–1): rectángulo redondeado con notch cóncavo inferior-izquierdo
// El notch abarca ≈ 48 % del ancho y ≈ 20 % del alto desde abajo.
const NOTCH_PATH =
  "M 0.07,0 L 0.93,0 Q 1,0 1,0.07 " +
  "L 1,0.93 Q 1,1 0.93,1 " +
  "L 0.48,1 Q 0.12,0.70 0,0.82 " +
  "L 0,0.07 Q 0,0 0.07,0 Z";

export default function ShopByAge() {
  return (
    <section
      aria-label="Compra por edad"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
      }}
    >
      {/* SVG defs — debe estar en el DOM para que clip-path:url(#…) funcione */}
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden>
        <defs>
          <clipPath id="shop-age-clip" clipPathUnits="objectBoundingBox">
            <path d={NOTCH_PATH} />
          </clipPath>
        </defs>
      </svg>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
          <p style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11px",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "var(--color-v2-amber)",
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
              key={card.label}
              href={card.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              {/* Contenedor 4:3 con el color de fondo visible en el notch */}
              <div style={{
                position: "relative",
                aspectRatio: "4/3",
                background: card.color,
                borderRadius: "clamp(12px, 2.5vw, 16px)",
              }}>
                {/* Foto recortada al contorno del notch */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: "url(#shop-age-clip)",
                  WebkitClipPath: "url(#shop-age-clip)",
                }}>
                  <Image
                    src={card.img}
                    alt={card.alt}
                    fill
                    style={{ objectFit: "cover", objectPosition: card.objPos }}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>

                {/* Etiqueta en el espacio libre del notch — inferior izquierdo */}
                <div style={{
                  position: "absolute",
                  bottom: "8%",
                  left: "6%",
                  background: "#FBF7F2",
                  borderRadius: "6px",
                  padding: "4px 11px",
                }}>
                  <span style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 700,
                    fontSize: "clamp(0.78rem, 1.4vw, 0.88rem)",
                    color: "var(--color-ink)",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}>
                    {card.label}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Colina orgánica inferior */}
      <div aria-hidden style={{
        lineHeight: 0,
        marginTop: "clamp(3rem, 6vw, 4rem)",
        marginLeft: "-clamp(1.25rem,5vw,3rem)",
        marginRight: "-clamp(1.25rem,5vw,3rem)",
      }}>
        <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block" }}>
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
