"use client";

import Image from "next/image";

/**
 * ShopByAge — 4 cards de edad con fotos reales, fiel al diseño ChatGPT reference.
 * Fondo #faf7f6, grid de 4 columnas, imagen con clip de esquina redondeada.
 */

const AGES = [
  {
    label: "0–3 meses",
    sub: "Sus primeros abrazos",
    img: "/products/bb-0-3m.png",
    alt: "Bebé de 0 a 3 meses con ropa Lion Cub",
    href: "#favoritos",
  },
  {
    label: "4–6 meses",
    sub: "Pequeños descubrimientos",
    img: "/products/bb-3-6m.png",
    alt: "Bebé de 4 a 6 meses con ropa Lion Cub",
    href: "#favoritos",
  },
  {
    label: "7–9 meses",
    sub: "Un mundo por explorar",
    img: "/products/bb-6-12m.png",
    alt: "Bebé de 7 a 9 meses con ropa Lion Cub",
    href: "#favoritos",
  },
  {
    label: "1–2 años",
    sub: "Libertad para jugar",
    img: "/products/bb-1-2a.png",
    alt: "Niña de 1 a 2 años con ropa Lion Cub",
    href: "#favoritos",
  },
];

export default function ShopByAge() {
  return (
    <section id="edades" style={{ background: "#faf7f6", padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 className="lc-sec-heading">Compra por edad</h2>
        <div className="lc-heartline" aria-hidden>♥</div>

        <div className="lc-age-grid">
          {AGES.map((age) => (
            <a
              key={age.label}
              href={age.href}
              className="lc-age-card"
              aria-label={`Ver prendas para ${age.label}`}
            >
              <div className="lc-age-img">
                <Image
                  src={age.img}
                  alt={age.alt}
                  width={280}
                  height={320}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <span className="lc-age-label">
                <strong>{age.label}</strong>
                <span>{age.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .lc-sec-heading {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:700;
          font-size:clamp(1.4rem,3.5vw,2.2rem);
          color:#171815;
          text-align:center;
          margin:0 0 .25rem;
          text-wrap:balance;
        }
        .lc-age-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:clamp(12px,2vw,24px);
          margin-top:clamp(1.5rem,4vw,2.5rem);
        }
        .lc-age-card {
          display:flex;
          flex-direction:column;
          gap:.75rem;
          text-decoration:none;
          cursor:pointer;
          transition:transform .22s;
        }
        .lc-age-card:hover { transform:translateY(-4px); }
        .lc-age-img {
          border-radius:clamp(10px,2.5vw,20px);
          overflow:hidden;
          aspect-ratio:4/5;
          background:#e8e4d4;
        }
        .lc-age-label {
          display:flex;
          flex-direction:column;
          gap:2px;
          padding:0 4px;
        }
        .lc-age-label strong {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:700;
          font-size:clamp(.85rem,1.6vw,1rem);
          color:#171815;
        }
        .lc-age-label span {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-size:clamp(.75rem,1.3vw,.875rem);
          color:#83827f;
          font-weight:400;
        }
        @media(max-width:768px){
          .lc-age-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:480px){
          .lc-age-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
        }
      `}</style>
    </section>
  );
}
