"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * BestsellerGrid — Tarjeta "parent favourite!" + grid 2×2 con badge 100% Pima
 */

type Product = {
  name: string;
  price: string;
  img: string;
  alt: string;
  bg: string;
  href: string;
};

const FEATURED: Product = {
  name: "Conjunto Crema Esencial",
  price: "S/ 89",
  img: "/hero/planos/desktop/K02.webp",
  alt: "Conjunto de bebé en crema — el más vendido",
  bg: "#E9D7B8",
  href: "/tienda",
};

const PRODUCTS: Product[] = [
  { name: "Body Sage",        price: "S/ 55", img: "/hero/planos/desktop/K03.webp", alt: "Body de bebé en sage",     bg: "#DDE6D6", href: "/tienda" },
  { name: "Conjunto Coral",   price: "S/ 85", img: "/hero/planos/desktop/K05.webp", alt: "Conjunto coral para bebé", bg: "#F0D9D2", href: "/tienda" },
  { name: "Manta Pima",       price: "S/ 65", img: "/hero/planos/desktop/K04.webp", alt: "Manta de algodón pima",    bg: "#E9D7B8", href: "/tienda" },
  { name: "Body Mineral",     price: "S/ 55", img: "/hero/planos/desktop/K06.webp", alt: "Body mineral para bebé",   bg: "#D9E2EA", href: "/tienda" },
];

function PimaBadge() {
  return (
    <div
      aria-label="100% Algodón Pima"
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "clamp(52px, 9vw, 68px)",
        height: "clamp(52px, 9vw, 68px)",
        borderRadius: "50%",
        background: "var(--color-v2-amber)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "clamp(7px, 1.1vw, 9px)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        textAlign: "center",
        lineHeight: 1.3,
        boxShadow: "0 2px 10px rgba(192,138,74,0.35)",
        zIndex: 2,
        padding: "6px",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: "clamp(10px, 1.4vw, 13px)" }}>100%</span>
      <span>Pima</span>
    </div>
  );
}

function ProductCard({ product, size = "normal" }: { product: Product; size?: "featured" | "normal" }) {
  const isFeatured = size === "featured";
  return (
    <Link
      href={product.href}
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        borderRadius: "clamp(12px, 2.5vw, 18px)",
        overflow: "hidden",
        background: "var(--color-bg-card, #fff)",
        boxShadow: "0 2px 12px rgba(26,20,16,0.07)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(26,20,16,0.12)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(26,20,16,0.07)";
      }}
    >
      {/* Badge Pima */}
      <PimaBadge />

      {/* "Parent favourite" ribbon — solo en featured */}
      {isFeatured && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            background: "var(--color-v2-cta)",
            color: "#fff",
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
            padding: "5px 14px",
            borderRadius: "999px",
            zIndex: 2,
            boxShadow: "0 2px 8px rgba(226,118,90,0.3)",
          }}
        >
          ⭐ parent favourite!
        </div>
      )}

      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: isFeatured ? "4/3" : "1/1",
          background: product.bg,
          overflow: "hidden",
        }}
      >
        <Image
          src={product.img}
          alt={product.alt}
          fill
          style={{ objectFit: "cover" }}
          sizes={isFeatured ? "(min-width:768px) 40vw, 100vw" : "(min-width:768px) 20vw, 45vw"}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 2vw, 1.25rem)" }}>
        <p
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "clamp(0.85rem, 1.6vw, 1rem)",
            color: "var(--color-ink)",
            margin: "0 0 4px",
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 400,
            fontSize: "0.9rem",
            color: "var(--color-v2-amber)",
            margin: 0,
          }}
        >
          {product.price}
        </p>
      </div>
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
            Los favoritos
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
            Más vendidos
          </h2>
        </div>

        {/* Layout: featured + 2×2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "clamp(0.75rem, 2vw, 1.25rem)",
          }}
          className="bestseller-layout"
        >
          {/* Featured */}
          <ProductCard product={FEATURED} size="featured" />

          {/* 2×2 grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "clamp(0.75rem, 2vw, 1.25rem)",
            }}
          >
            {PRODUCTS.map(p => (
              <ProductCard key={p.name} product={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Responsive: desktop = 2 col (featured + grid) */}
      <style>{`
        @media (min-width: 768px) {
          .bestseller-layout {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
