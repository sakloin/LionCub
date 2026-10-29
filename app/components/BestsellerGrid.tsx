"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * BestsellerGrid — "Pequeños favoritos" fiel al diseño ChatGPT reference.
 * Layout: producto featured (izquierda grande) + grid 2×2 (derecha).
 */

const FEATURED = {
  name: "Conejito Dorado",
  price: "S/ 79.00",
  img: "/products/LC-007.jpeg",
  alt: "Conjunto Conejito Dorado — 100% algodón pima peruano",
  href: "#favoritos",
  sizes: ["0–3m", "4–6m", "7–9m"],
};

const PRODUCTS = [
  { name: "Navy Puppy",      price: "S/ 79.00", img: "/products/LC-001.jpeg", alt: "Conjunto Navy Puppy",      href: "#favoritos", badge: "Más vendido" },
  { name: "Floral Baby",     price: "S/ 79.00", img: "/products/LC-002.jpeg", alt: "Conjunto Floral Baby",     href: "#favoritos", badge: null },
  { name: "Body Premium",    price: "S/ 35.00", img: "/products/LC-101.jpeg", alt: "Body Premium Lion Cub",    href: "#favoritos", badge: null },
  { name: "Manta Pima",      price: "S/ 49.00", img: "/products/LC-301.jpeg", alt: "Manta algodón pima suave", href: "#favoritos", badge: "Nuevo" },
];

export default function BestsellerGrid() {
  return (
    <section id="favoritos" style={{ background: "#faf7f6", padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: ".25rem" }}>
          <h2 className="lc-sec-heading" style={{ margin: 0 }}>Pequeños favoritos</h2>
          <Link href="/tienda" style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:".9rem", color:"#171815", textDecoration:"none", borderBottom:"2px solid #ffa486", paddingBottom:"2px" }}>
            Ver todo →
          </Link>
        </div>
        <div className="lc-heartline" aria-hidden>♥</div>

        <div className="lc-bs-layout">
          {/* Feature */}
          <div className="lc-bs-feature">
            <div className="lc-bs-feat-art">
              <h3 style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"clamp(1rem,2.5vw,1.4rem)", color:"#171815", margin:0 }}>
                <small style={{ display:"block", fontWeight:400, fontSize:".8em", color:"#83827f", marginBottom:"4px" }}>Hechos para</small>
                pequeños abrazos
              </h3>
              <div className="lc-bs-fav-tag">¡Suavidad que enamora! <span>↙</span></div>
              <Link href={FEATURED.href}>
                <Image
                  src={FEATURED.img}
                  alt={FEATURED.alt}
                  width={480}
                  height={540}
                  style={{ objectFit:"cover", width:"100%", height:"100%", borderRadius:"clamp(8px,2vw,16px)", display:"block" }}
                />
              </Link>
            </div>
            <div className="lc-bs-feat-info">
              <h3 style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"1.1rem", color:"#171815", margin:"0 0 .5rem" }}>
                <Link href={FEATURED.href} style={{ color:"inherit", textDecoration:"none" }}>{FEATURED.name}</Link>
              </h3>
              <div style={{ display:"flex", alignItems:"center", gap:".75rem", marginBottom:".75rem" }}>
                <span style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".85rem", color:"#83827f" }}>Algodón Pima</span>
                <b style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"1rem", color:"#171815" }}>{FEATURED.price}</b>
              </div>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {FEATURED.sizes.map(s => (
                  <button key={s} style={{ padding:"5px 12px", borderRadius:"999px", border:"1.5px solid #d5d5bd", background:"transparent", fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".8rem", color:"#171815", cursor:"pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid 2x2 */}
          <div className="lc-bs-grid">
            {PRODUCTS.map(p => (
              <Link key={p.name} href={p.href} className="lc-bs-card">
                <div className="lc-bs-card-img">
                  {p.badge && (
                    <span className="lc-bs-badge">{p.badge}</span>
                  )}
                  <Image
                    src={p.img}
                    alt={p.alt}
                    width={280}
                    height={300}
                    style={{ objectFit:"cover", width:"100%", height:"100%" }}
                  />
                </div>
                <div style={{ padding:".75rem .5rem .5rem" }}>
                  <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:".9rem", color:"#171815", margin:"0 0 .25rem" }}>{p.name}</p>
                  <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".85rem", color:"#83827f", margin:0 }}>{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .lc-bs-layout {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:clamp(1.5rem,3vw,3rem);
          margin-top:clamp(1.5rem,3vw,2.5rem);
          align-items:start;
        }
        .lc-bs-feature { display:flex; flex-direction:column; gap:1rem; }
        .lc-bs-feat-art { position:relative; }
        .lc-bs-feat-art h3 { margin-bottom:.75rem; }
        .lc-bs-fav-tag {
          position:absolute;
          top:60px; right:-12px;
          background:#fcf2e3;
          border-radius:8px;
          padding:6px 12px;
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-size:.8rem;
          font-weight:700;
          color:#777963;
          transform:rotate(3deg);
          z-index:2;
          box-shadow:0 2px 8px rgba(0,0,0,.08);
          white-space:nowrap;
        }
        .lc-bs-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:clamp(10px,2vw,20px);
        }
        .lc-bs-card {
          text-decoration:none;
          border-radius:clamp(8px,2vw,14px);
          overflow:hidden;
          background:#fff;
          transition:transform .22s, box-shadow .22s;
          box-shadow:0 1px 4px rgba(0,0,0,.06);
        }
        .lc-bs-card:hover { transform:translateY(-3px); box-shadow:0 6px 20px rgba(0,0,0,.1); }
        .lc-bs-card-img {
          aspect-ratio:4/5;
          overflow:hidden;
          position:relative;
        }
        .lc-bs-badge {
          position:absolute;
          top:8px; left:8px;
          background:#ffa486;
          color:#fff;
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:700;
          font-size:.7rem;
          padding:3px 8px;
          border-radius:999px;
          z-index:1;
        }
        @media(max-width:768px){
          .lc-bs-layout { grid-template-columns:1fr; }
        }
        @media(max-width:480px){
          .lc-bs-grid { gap:8px; }
        }
      `}</style>
    </section>
  );
}
