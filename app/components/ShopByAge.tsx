"use client";

import Image from "next/image";
import Link from "next/link";

const AGE_CARDS = [
  {
    range: "0–3 meses",
    desc: "Suave para piel recién nacida",
    img: "/products/LC-016.jpeg",
    alt: "Ropa para bebé 0 a 3 meses",
    href: "/tienda?edad=0-3m",
    objPos: "center 20%",
  },
  {
    range: "3–6 meses",
    desc: "Comodidad para cada explorador",
    img: "/products/LC-001.jpeg",
    alt: "Ropa para bebé 3 a 6 meses",
    href: "/tienda?edad=3-6m",
    objPos: "center 18%",
  },
  {
    range: "6–12 meses",
    desc: "Diseñado para primeros movimientos",
    img: "/products/LC-012.jpeg",
    alt: "Ropa para bebé 6 a 12 meses",
    href: "/tienda?edad=6-12m",
    objPos: "center 18%",
  },
  {
    range: "1–2 años",
    desc: "Listo para jugar todo el día",
    img: "/products/LC-019.jpeg",
    alt: "Ropa para bebé 1 a 2 años",
    href: "/tienda?edad=1-2a",
    objPos: "center 15%",
  },
];

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
        {/* Header — igual que NUBI: título centrado + línea acento */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-gold-text)",
              marginBottom: "0.75rem",
              opacity: 0.85,
            }}
          >
            Para cada etapa
          </p>
          <h2
            style={{
              fontFamily: "var(--font-title)",
              fontWeight: 700,
              fontSize: "clamp(1.875rem, 4vw, 2.25rem)",
              color: "var(--color-ink)",
              margin: "0 0 0.75rem",
            }}
          >
            Compra por edad
          </h2>
          {/* Línea acento estilo NUBI */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <div style={{ width: "40px", height: "2px", background: "var(--color-v2-amber)", borderRadius: "2px" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-v2-amber)" }} />
            <div style={{ width: "40px", height: "2px", background: "var(--color-v2-amber)", borderRadius: "2px" }} />
          </div>
        </div>

        {/* Grid — 4 cols desktop, 2 cols mobile */}
        <div
          className="shop-age-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "clamp(0.75rem, 2vw, 1.5rem)",
          }}
        >
          {AGE_CARDS.map((card) => (
            <Link
              key={card.range}
              href={card.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              {/* Foto retrato con bordes suaves — idéntico al modelo NUBI */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "3 / 4",
                  borderRadius: "20px",
                  overflow: "hidden",
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

              {/* Texto debajo de la foto — igual que NUBI */}
              <div
                style={{
                  marginTop: "1rem",
                  paddingLeft: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 700,
                    fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)",
                    color: "var(--color-ink)",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  {card.range}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 400,
                    fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)",
                    color: "var(--color-ink-soft)",
                    display: "block",
                    letterSpacing: "0.01em",
                  }}
                >
                  {card.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Onda inferior */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          lineHeight: 0,
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 1440 180"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%" }}
        >
          <path
            d="M0,120 C280,55 520,170 780,105 C1000,55 1240,160 1440,100 L1440,180 L0,180 Z"
            fill="var(--color-v2-wave)"
          />
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
