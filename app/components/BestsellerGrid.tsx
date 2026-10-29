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

// Versiones normalizadas (÷200) de BLOBS para clipPath objectBoundingBox en HTML
const BLOBS_NORM = [
  "M 0.525,0.06 C 0.775,0.015 0.99,0.16 1.00,0.42 C 1.01,0.68 0.89,0.87 0.675,0.95 C 0.46,1.03 0.21,0.98 0.07,0.82 C -0.07,0.66 -0.01,0.41 0.07,0.25 C 0.15,0.09 0.34,0.04 0.50,0.045 Q 0.515,0.045 0.525,0.06 Z",
  "M 0.475,0.04 C 0.74,0.00 0.98,0.17 1.00,0.45 C 1.02,0.73 0.89,0.91 0.66,0.98 C 0.43,1.05 0.18,1.00 0.05,0.825 C -0.08,0.65 -0.02,0.39 0.07,0.23 C 0.16,0.07 0.35,0.02 0.49,0.03 Z",
  "M 0.55,0.05 C 0.80,0.01 1.00,0.18 1.01,0.47 C 1.02,0.76 0.88,0.93 0.65,0.99 C 0.42,1.05 0.17,0.99 0.04,0.81 C -0.09,0.63 -0.02,0.37 0.08,0.22 C 0.18,0.07 0.37,0.03 0.53,0.04 Q 0.54,0.04 0.55,0.05 Z",
  "M 0.50,0.03 C 0.76,-0.01 0.99,0.15 1.01,0.44 C 1.03,0.73 0.89,0.91 0.66,0.98 C 0.43,1.05 0.18,1.00 0.04,0.83 C -0.10,0.66 -0.03,0.40 0.06,0.24 C 0.15,0.08 0.34,0.03 0.50,0.03 Z",
];

// Blob grande para producto featured (viewBox 0 0 300 260)
const BLOB_FEAT =
  "M 150,14 C 210,4 268,42 272,110 C 276,178 248,220 194,236 C 140,252 78,244 38,208 C -2,172 -4,114 16,74 C 36,34 92,14 136,12 Q 143,11 150,14 Z";

// Normalizado (x÷300, y÷260) para clipPath objectBoundingBox
const BLOB_FEAT_NORM =
  "M 0.500,0.054 C 0.700,0.015 0.893,0.162 0.907,0.423 C 0.920,0.685 0.827,0.846 0.647,0.908 C 0.467,0.969 0.260,0.938 0.127,0.800 C -0.007,0.662 -0.013,0.438 0.053,0.285 C 0.120,0.131 0.307,0.054 0.453,0.046 Q 0.477,0.042 0.500,0.054 Z";

const BLOB_COLORS = ["#F0D9D2", "#DDE6D6", "#D9E2EA", "#E9D7B8"];

type Product = {
  name: string;
  price: string;
  img: string;
  alt: string;
  href: string;
  blobIdx: number;
  sizes: string;
};

const FEATURED = {
  name: "Ovejita de mis Sueños",
  price: "S/ 59",
  desc: "Conjunto suave en 100 % algodón pima peruano. Perfecto para los primeros meses.",
  img: "/products/LC-014.jpeg",
  alt: "Conjunto Ovejita de mis Sueños — 100% algodón pima peruano",
  href: "/tienda",
  sizes: "0–3m · 3–6m · 6–12m",
};

const PRODUCTS: Product[] = [
  { name: "Tiernos Conejitos", price: "S/ 79", img: "/products/LC-001.jpeg", alt: "Conjunto Tiernos Conejitos", href: "/tienda", blobIdx: 0, sizes: "0–3m · 3–6m" },
  { name: "Native Bear",       price: "S/ 69", img: "/products/LC-012.jpeg", alt: "Conjunto Native Bear",       href: "/tienda", blobIdx: 1, sizes: "3–6m · 6–12m" },
  { name: "Manta Celestial",   price: "S/ 49", img: "/products/LC-301.jpeg", alt: "Manta Celestial pima",      href: "/tienda", blobIdx: 2, sizes: "Talla única" },
  { name: "Body Esencial",     price: "S/ 29", img: "/products/LC-101.jpeg", alt: "Body Esencial Premium",     href: "/tienda", blobIdx: 3, sizes: "0–3m · 3–6m · 6–12m" },
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

        {/* Prenda sobre blob — recortada al contorno orgánico */}
        <div style={{
          position: "absolute",
          inset: 0,
          clipPath: `url(#blob-clip-${product.blobIdx})`,
          WebkitClipPath: `url(#blob-clip-${product.blobIdx})`,
          zIndex: 2,
        }}>
          <Image
            src={product.img}
            alt={product.alt}
            fill
            loading="eager"
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

      {/* Nombre */}
      <p style={{
        fontFamily: "var(--font-title)", fontWeight: 700,
        fontSize: "clamp(0.85rem, 1.5vw, 0.98rem)",
        color: "var(--color-ink)", margin: 0,
      }}>{product.name}</p>
      {/* Fila precio */}
      <p style={{
        fontFamily: "var(--font-title)", fontWeight: 600,
        fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
        color: "var(--color-v2-amber)", margin: 0,
      }}>{product.price}</p>
      {/* Tallas / edades */}
      <p style={{
        fontFamily: "var(--font-mono, monospace)", fontWeight: 400,
        fontSize: "10px", letterSpacing: "0.06em",
        color: "var(--color-ink-soft)", margin: 0, opacity: 0.75,
      }}>{product.sizes}</p>
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

        {/* Prenda featured — recortada al contorno orgánico */}
        <div style={{
          position: "absolute",
          inset: 0,
          clipPath: "url(#blob-clip-feat)",
          WebkitClipPath: "url(#blob-clip-feat)",
          zIndex: 2,
        }}>
          <Image
            src={FEATURED.img}
            alt={FEATURED.alt}
            fill
            loading="eager"
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

      {/* Fila precio */}
      <div style={{ padding: "0 0.25rem", display: "flex", flexDirection: "column", gap: "3px" }}>
        <p style={{
          fontFamily: "var(--font-title)", fontWeight: 700,
          fontSize: "clamp(0.95rem, 1.8vw, 1.08rem)",
          color: "var(--color-v2-amber)", margin: 0,
        }}>{FEATURED.price}</p>
        {/* Tallas disponibles */}
        <p style={{
          fontFamily: "var(--font-mono, monospace)", fontWeight: 400,
          fontSize: "10px", letterSpacing: "0.06em",
          color: "var(--color-ink-soft)", margin: 0, opacity: 0.75,
        }}>{FEATURED.sizes}</p>
      </div>
    </Link>
  );
}

const gridStyles = `
  @media (min-width: 768px) {
    .bestseller-layout { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 767px) {
    .bestseller-viewall { display: none !important; }
  }
`;

export default function BestsellerGrid() {
  return (
    <section
      aria-label="Más vendidos"
      style={{
        background: "var(--color-v2-wave)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
      }}
    >
      {/* Defs SVG para recortar imágenes al contorno del blob (objectBoundingBox) */}
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden>
        <defs>
          {BLOBS_NORM.map((path, i) => (
            <clipPath key={i} id={`blob-clip-${i}`} clipPathUnits="objectBoundingBox">
              <path d={path} />
            </clipPath>
          ))}
          <clipPath id="blob-clip-feat" clipPathUnits="objectBoundingBox">
            <path d={BLOB_FEAT_NORM} />
          </clipPath>
        </defs>
      </svg>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header — título centrado + "Ver todos" a la derecha, igual a NUBI */}
        <div style={{ marginBottom: "clamp(2rem, 4vw, 3rem)", position: "relative", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-title)", fontWeight: 700,
            fontSize: "clamp(1.875rem, 4vw, 2.25rem)",
            color: "var(--color-ink)", margin: "0 0 0.6rem",
          }}>Lo más vendido</h2>
          {/* Acento coral — igual a NUBI */}
          <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "0" }}>
            <div style={{ width: "30px", height: "2px", background: "var(--color-v2-cta)", borderRadius: "2px" }} />
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-v2-cta)" }} />
            <div style={{ width: "30px", height: "2px", background: "var(--color-v2-cta)", borderRadius: "2px" }} />
          </div>
          {/* "Ver todos →" posicionado arriba a la derecha */}
          <a
            href="/tienda"
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-title)",
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "var(--color-ink)",
              textDecoration: "none",
              border: "1.5px solid var(--color-ink)",
              borderRadius: "999px",
              padding: "8px 18px",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
            className="bestseller-viewall"
          >
            Ver todos
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
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

        {/* Botón "Ver todos" */}
        <div style={{ textAlign: "center", marginTop: "clamp(2rem, 4vw, 3rem)" }}>
          <Link
            href="/tienda"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "var(--font-title)",
              fontWeight: 700,
              fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
              letterSpacing: "0.01em",
              padding: "13px 28px",
              border: "1.5px solid var(--color-v2-amber)",
              color: "var(--color-v2-amber)",
              textDecoration: "none",
              borderRadius: "999px",
              background: "transparent",
              transition: "background 0.22s ease, color 0.22s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-v2-amber)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-v2-amber)";
            }}
          >
            Ver todos los productos
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>

      <style>{gridStyles}</style>
    </section>
  );
}
