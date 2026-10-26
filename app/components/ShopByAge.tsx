import Image from "next/image";
import Link from "next/link";

/**
 * ShopByAge — Cuadrícula de edades con cards redondeadas
 */

const AGE_CARDS = [
  { label: "0–3 m",  img: "/products/LC-016.jpeg", alt: "Ropa para bebé 0 a 3 meses — Nube Celeste Premium", color: "#F0D9D2", href: "/tienda?edad=0-3m" },
  { label: "3–6 m",  img: "/products/LC-001.jpeg", alt: "Ropa para bebé 3 a 6 meses — Tiernos Conejitos",   color: "#E9D7B8", href: "/tienda?edad=3-6m" },
  { label: "6–12 m", img: "/products/LC-012.jpeg", alt: "Ropa para bebé 6 a 12 meses — Native Bear",        color: "#DDE6D6", href: "/tienda?edad=6-12m" },
  { label: "1–2 a",  img: "/products/LC-019.jpeg", alt: "Ropa para bebé 1 a 2 años — Hilo de Algodón Nativo", color: "#D5D2BA", href: "/tienda?edad=1-2a" },
];

export default function ShopByAge() {
  return (
    <section
      aria-label="Compra por edad"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-v2-amber)",
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
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Compra por edad
          </h2>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(0.75rem, 2vw, 1.25rem)",
          }}
        >
          {AGE_CARDS.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              style={{
                display: "block",
                borderRadius: "clamp(14px, 3vw, 22px)",
                overflow: "hidden",
                textDecoration: "none",
                position: "relative",
                aspectRatio: "3/4",
                background: card.color,
              }}
            >
              <Image
                src={card.img}
                alt={card.alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="(min-width: 768px) 25vw, 50vw"
              />
              {/* Label pill */}
              <span
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fff",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-title)",
                  fontWeight: 700,
                  fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
                  padding: "6px 18px",
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(26,20,16,0.12)",
                }}
              >
                {card.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Colina orgánica inferior */}
      <div aria-hidden style={{ lineHeight: 0, marginTop: "clamp(3rem, 6vw, 4rem)", marginLeft: "-clamp(1.25rem,5vw,3rem)", marginRight: "-clamp(1.25rem,5vw,3rem)" }}>
        <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block" }}>
          <path d="M0,120 C280,55 520,170 780,105 C1000,55 1240,160 1440,100 L1440,180 L0,180 Z" fill="var(--color-v2-wave)"/>
        </svg>
      </div>
    </section>
  );
}
