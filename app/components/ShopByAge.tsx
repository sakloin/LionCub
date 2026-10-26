"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * ShopByAge — Forma orgánica SVG con concavidad inferior-izquierda (Bézier)
 * La concavidad ondulante reserva espacio real para la etiqueta de edad en dos líneas.
 * Misma familia de forma en las 4 tarjetas.
 */

const AGE_CARDS = [
  { range: "0–3",  unit: "meses", img: "/products/LC-016.jpeg", alt: "Ropa para bebé 0 a 3 meses",  color: "#F0D9D2", href: "/tienda?edad=0-3m",  objPos: "center 28%" },
  { range: "3–6",  unit: "meses", img: "/products/LC-001.jpeg", alt: "Ropa para bebé 3 a 6 meses",  color: "#E9D7B8", href: "/tienda?edad=3-6m",  objPos: "center 22%" },
  { range: "6–12", unit: "meses", img: "/products/LC-012.jpeg", alt: "Ropa para bebé 6 a 12 meses", color: "#DDE6D6", href: "/tienda?edad=6-12m", objPos: "center 20%" },
  { range: "1–2",  unit: "años",  img: "/products/LC-019.jpeg", alt: "Ropa para bebé 1 a 2 años",   color: "#D5D2BA", href: "/tienda?edad=1-2a",  objPos: "center 18%" },
];

// Forma orgánica SVG con entrada ondulante cóncava en esquina inferior-izquierda.
// Coordenadas normalizadas (objectBoundingBox 0–1).
// El borde inferior arranca en x≈0.54 y sube fluidamente hacia la izquierda
// creando un espacio libre donde la etiqueta puede posarse sin tocar la foto.
// Misma contorno para las 4 tarjetas.
const ORGANIC_PATH =
  "M 0.10,0.02 " +
  "C 0.32,0.00 0.68,0.00 0.90,0.02 " +
  "C 1.00,0.04 1.02,0.18 1.00,0.32 " +
  "C 1.02,0.52 1.02,0.72 0.98,0.84 " +
  "C 0.94,0.98 0.80,1.04 0.66,1.02 " +
  "L 0.52,1.00 " +
  "C 0.38,0.96 0.22,0.84 0.12,0.70 " +
  "C 0.04,0.58 0.00,0.46 0.00,0.34 " +
  "C -0.02,0.18 0.02,0.08 0.08,0.04 " +
  "C 0.09,0.03 0.10,0.02 0.10,0.02 Z";

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
      {/* SVG defs — clipPath orgánico con Bézier; width/height 0 para no ocupar espacio */}
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden>
        <defs>
          <clipPath id="shop-age-organic" clipPathUnits="objectBoundingBox">
            <path d={ORGANIC_PATH} />
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
              key={card.range}
              href={card.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              {/* Contenedor 4:3 — fondo de sección queda expuesto en la concavidad inferior-izquierda */}
              <div style={{
                position: "relative",
                aspectRatio: "4/3",
                background: "var(--color-v2-bg)",
              }}>
                {/* Imagen recortada al contorno orgánico con Bézier */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: "url(#shop-age-organic)",
                  WebkitClipPath: "url(#shop-age-organic)",
                }}>
                  <Image
                    src={card.img}
                    alt={card.alt}
                    fill
                    style={{ objectFit: "cover", objectPosition: card.objPos }}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>

                {/* Etiqueta en 2 líneas — ocupa el espacio cóncavo expuesto */}
                <div style={{
                  position: "absolute",
                  bottom: "9%",
                  left: "9%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  lineHeight: 1.1,
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
                    fontSize: "clamp(0.7rem, 1.2vw, 0.8rem)",
                    color: "var(--color-ink-soft)",
                    display: "block",
                    letterSpacing: "0.02em",
                  }}>
                    {card.unit}
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
