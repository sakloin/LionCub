import Image from "next/image";
import Link from "next/link";

/**
 * ShopByAge — Cuadrícula de edades con cards redondeadas
 */

const AGE_CARDS = [
  { label: "0–3 m",  img: "/hero/planos/desktop/K01.webp", alt: "Ropa para bebé 0 a 3 meses", color: "#F0D9D2", href: "/tienda?edad=0-3m" },
  { label: "3–6 m",  img: "/hero/planos/desktop/K02.webp", alt: "Ropa para bebé 3 a 6 meses", color: "#E9D7B8", href: "/tienda?edad=3-6m" },
  { label: "6–12 m", img: "/hero/planos/desktop/K03.webp", alt: "Ropa para bebé 6 a 12 meses", color: "#DDE6D6", href: "/tienda?edad=6-12m" },
  { label: "1–2 a",  img: "/hero/planos/desktop/K05.webp", alt: "Ropa para bebé 1 a 2 años",  color: "#D5D2BA", href: "/tienda?edad=1-2a" },
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

      {/* Wave bottom */}
      <div aria-hidden style={{ lineHeight: 0, marginTop: "clamp(3rem, 6vw, 4rem)", marginLeft: "-clamp(1.25rem,5vw,3rem)", marginRight: "-clamp(1.25rem,5vw,3rem)" }}>
        <svg viewBox="0 0 1440 70" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,30 C360,70 720,10 1080,50 C1260,70 1380,40 1440,35 L1440,70 L0,70 Z" fill="var(--color-v2-wave)"/>
        </svg>
      </div>
    </section>
  );
}
