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
// Curva suave tipo "mordisco redondeado": entra desde la base (x≈0.52) y
// sube por la izquierda con una curva cúbica amplia y natural.
const NOTCH_PATH =
  "M 0.08,0 L 0.92,0 Q 1,0 1,0.08 " +
  "L 1,0.92 Q 1,1 0.92,1 " +
  "L 0.52,1 C 0.30,0.98 0.06,0.86 0.02,0.66 " +
  "C 0.00,0.56 0,0.30 0,0.08 Q 0,0 0.08,0 Z";

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
              {/* Contenedor 4:3 — fondo marfil = sección, queda expuesto en el notch */}
              <div style={{
                position: "relative",
                aspectRatio: "4/3",
                background: "var(--color-v2-bg)",
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

                {/* Etiqueta en el espacio expuesto del notch — sin pastilla */}
                <div style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "7%",
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

      {/* Onda inferior — flush, sin franja marfil */}
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
