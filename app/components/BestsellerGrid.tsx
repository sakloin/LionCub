"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * BestsellerGrid — Blobs orgánicos con prenda encima, badge ivory, texto debajo.
 * Sin caja blanca, sin etiquetas en inglés.
 */

// Paths orgánicos en viewBox 0 0 200 200
const BLOBS = [
  "M 105,12 C 155,3 198,32 200,84 C 202,136 178,174 135,190 C 92,206 42,196 14,164 C -14,132 -2,82 14,50 C 30,18 68,8 100,9 Q 103,9 105,12 Z",
  "M 95,8 C 148,0 196,34 200,90 C 204,146 178,182 132,196 C 86,210 36,200 10,165 C -16,130 -4,78 14,46 C 32,14 70,4 98,6 Z",
  "M 110,10 C 160,2 200,36 202,94 C 204,152 176,186 130,198 C 84,210 34,198 8,162 C -18,126 -4,74 16,44 C 36,14 74,6 106,8 Q 108,8 110,10 Z",
  "M 100,6 C 152,-2 198,30 202,88 C 206,146 178,182 132,196 C 86,210 36,200 8,166 C -20,132 -6,80 12,48 C 30,16 68,6 100,6 Z",
];

// Blob grande para producto featured (viewBox 0 0 300 260)
const BLOB_FEAT =
  "M 150,14 C 210,4 268,42 272,110 C 276,178 248,220 194,236 C 140,252 78,244 38,208 C -2,172 -4,114 16,74 C 36,34 92,14 136,12 Q 143,11 150,14 Z";

const BLOB_COLORS = ["#F0D9D2", "#DDE6D6", "#D9E2EA", "#E9D7B8"];

type Product = {
  name: string;
  price: string;
  img: string;
  alt: string;
  href: string;
  blobIdx: number;
};

const FEATURED = {
  name: "Ovejita de mis Sueños",
  price: "S/ 59",
  desc: "Conjunto suave en 100 % algodón pima peruano. Perfecto para los primeros meses.",
  img: "/products/LC-014.jpeg",
  alt: "Conjunto Ovejita de mis Sueños — 100% algodón pima peruano",
  href: "/tienda",
};

const PRODUCTS: Product[] = [
  { name: "Tiernos Conejitos", price: "S/ 79", img: "/products/LC-001.jpeg", alt: "Conjunto Tiernos Conejitos", href: "/tienda", blobIdx: 0 },
  { name: "Native Bear",       price: "S/ 69", img: "/products/LC-012.jpeg", alt: "Conjunto Native Bear",       href: "/tienda", blobIdx: 1 },
  { name: "Manta Celestial",   price: "S/ 49", img: "/products/LC-301.jpeg", alt: "Manta Celestial pima",      href: "/tienda", blobIdx: 2 },
  { name: "Body Esencial",     price: "S/ 29", img: "/products/LC-101.jpeg", alt: "Body Esencial Premium",     href: "/tienda", blobIdx: 3 },
];

function SmallCard({ product }: { product: Product }) {
  const blob = BLOBS[product.blobIdx % BLOBS.length];
  const color = BLOB_COLORS[product.blobIdx % BLOB_COLORS.length];

  return (
    <Link href={product.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Blob + prenda */}
      <div style={{ position: "relative" }}>
        <svg viewBox="0 0 200 200" style={{ width: "100%", display: "block" }} aria-hidden>
          <path d={blob} fill={color} />
        </svg>

        {/* Prenda encima del blob */}
        <div style={{
          position: "absolute",
          top: "8%", left: "12%", right: "12%", bottom: "14%",
          borderRadius: "52% 44% 58% 48% / 48% 52% 45% 56%",
          overflow: "hidden",
          zIndex: 2,
        }}>
          <Image
            src={product.img}
            alt={product.alt}
            fill
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
            sizes="(min-width: 768px) 22vw, 45vw"
          />
        </div>

        {/* Badge ivory — inferior izquierdo */}
        <div style={{
          position: "absolute",
          bottom: "14%", left: "7%",
          background: "#FBF7F2",
          borderRadius: "50%",
          width: "50px", height: "50px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(26,20,16,0.10)",
          gap: "2px", zIndex: 3,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M 8,2 C 8,2 14,4 14,9 C 14,12.5 11,14 8,14 C 5,14 2,12.5 2,9 C 2,4 8,2 8,2 Z"
              stroke="#8B9E7A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M 8,2 L 8,14" stroke="#8B9E7A" strokeWidth="1" strokeDasharray="1.5 1.5" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: "var(--font-mono, monospace)", fontSize: "7px",
            fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "#5A5040", lineHeight: 1,
          }}>Pima</span>
        </div>
      </div>

      {/* Nombre y precio directamente sobre el fondo de sección */}
      <p style={{
        fontFamily: "var(--font-title)", fontWeight: 700,
        fontSize: "clamp(0.85rem, 1.5vw, 0.98rem)",
        color: "var(--color-ink)", margin: 0,
      }}>{product.name}</p>
      <p style={{
        fontFamily: "var(--font-title)", fontWeight: 400,
        fontSize: "0.88rem", color: "var(--color-v2-amber)", margin: 0,
      }}>{product.price}</p>
    </Link>
  );
}

function FeaturedCard() {
  return (
    <Link href={FEATURED.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Texto breve encima */}
      <div style={{ padding: "0 0.25rem" }}>
        <p style={{
          fontFamily: "var(--font-mono, monospace)", fontSize: "10px",
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--color-v2-amber)", opacity: 0.85, margin: "0 0 5px",
        }}>Selección Lion Cub</p>
        <p style={{
          fontFamily: "var(--font-title)", fontWeight: 700,
          fontSize: "clamp(1rem, 2vw, 1.15rem)",
          color: "var(--color-ink)", margin: "0 0 5px",
        }}>{FEATURED.name}</p>
        <p style={{
          fontFamily: "var(--font-title)", fontWeight: 400,
          fontSize: "clamp(0.82rem, 1.4vw, 0.9rem)",
          color: "var(--color-ink-soft)", lineHeight: 1.55, margin: 0, maxWidth: "26ch",
        }}>{FEATURED.desc}</p>
      </div>

      {/* Blob grande + prenda + flecha editorial */}
      <div style={{ position: "relative" }}>
        <svg viewBox="0 0 300 260" style={{ width: "100%", display: "block" }} aria-hidden>
          <path d={BLOB_FEAT} fill="#DDE6D6" />
          {/* Flecha editorial a mano alzada */}
          <path d="M 252,30 C 242,42 228,50 215,56"
            stroke="#8B9E7A" strokeWidth="1.8" fill="none"
            strokeLinecap="round" strokeDasharray="4 4" />
          <path d="M 215,56 L 222,50 M 215,56 L 218,64"
            stroke="#8B9E7A" strokeWidth="1.8" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
          <text x="256" y="26" fill="#8B9E7A" fontSize="8.5"
            fontFamily="monospace" letterSpacing="0.04em">pima</text>
        </svg>

        {/* Prenda featured encima del blob */}
        <div style={{
          position: "absolute",
          top: "5%", left: "8%", right: "8%", bottom: "7%",
          borderRadius: "55% 45% 52% 48% / 50% 52% 48% 52%",
          overflow: "hidden", zIndex: 2,
        }}>
          <Image
            src={FEATURED.img}
            alt={FEATURED.alt}
            fill
            style={{ objectFit: "cover", objectPosition: "center 15%" }}
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>

        {/* Badge */}
        <div style={{
          position: "absolute", bottom: "12%", left: "7%",
          background: "#FBF7F2", borderRadius: "50%",
          width: "58px", height: "58px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(26,20,16,0.12)", zIndex: 3,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M 9,2 C 9,2 16,5 16,10 C 16,13.5 13,16 9,16 C 5,16 2,13.5 2,10 C 2,5 9,2 9,2 Z"
              stroke="#8B9E7A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <path d="M 9,2 L 9,16" stroke="#8B9E7A" strokeWidth="1" strokeDasharray="1.5 2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "7px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5A5040", lineHeight: 1 }}>Pima</span>
        </div>
      </div>

      {/* Precio */}
      <p style={{
        fontFamily: "var(--font-title)", fontWeight: 700,
        fontSize: "clamp(0.95rem, 1.8vw, 1.08rem)",
        color: "var(--color-ink)", margin: 0, padding: "0 0.25rem",
      }}>
        {FEATURED.name}{" "}
        <span style={{ color: "var(--color-v2-amber)", fontWeight: 400 }}>{FEATURED.price}</span>
      </p>
    </Link>
  );
}

export default function BestsellerGrid() {
  return (
    <section
      aria-label="Más vendidos"
      style={{
        background: "var(--color-v2-wave)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
          <p style={{
            fontFamily: "var(--font-mono, monospace)", fontSize: "11px",
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: "var(--color-v2-amber)", marginBottom: "0.75rem", opacity: 0.85,
          }}>Para ti</p>
          <h2 style={{
            fontFamily: "var(--font-title)", fontWeight: 700,
            fontSize: "clamp(1.875rem, 4vw, 2.25rem)",
            color: "var(--color-ink)", margin: 0,
          }}>Selección Lion Cub</h2>
        </div>

        {/* Layout: featured | 2×2 grid */}
        <div className="bestseller-layout" style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "clamp(1.5rem, 3vw, 2.5rem)",
          alignItems: "start",
        }}>
          <FeaturedCard />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(1rem, 2.5vw, 1.75rem)",
            alignItems: "start",
          }}>
            {PRODUCTS.map(p => <SmallCard key={p.name} product={p} />)}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .bestseller-layout { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}
