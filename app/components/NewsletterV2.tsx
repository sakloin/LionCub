"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * NewsletterV2 — Newsletter fiel al diseño ChatGPT reference.
 * Fotos de producto a izquierda y derecha, formulario de email al centro.
 * NOTA: El formulario es visual/estructural. Para conectarlo a un proveedor
 * de email se requiere configuración adicional.
 */

export default function NewsletterV2() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    // Visual confirm only — no provider connected yet
    setStatus("success");
  };

  return (
    <section style={{ background: "#faf7f6", overflow: "hidden" }}>
      <div className="lc-nl-inner">
        <Image
          src="/products/LC-007.jpeg"
          alt="Conjunto de algodón pima Lion Cub"
          width={240}
          height={300}
          className="lc-nl-img"
          style={{ objectFit:"cover", borderRadius:"clamp(8px,2vw,16px)" }}
          aria-hidden
        />

        <div className="lc-nl-body">
          <h2 style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"clamp(1.3rem,3.5vw,2rem)", color:"#171815", lineHeight:1.2, margin:"0 0 .75rem", textWrap:"balance" }}>
            Un poquito de amor,<br/>
            <span style={{ color:"#ffa486" }}>en tu correo.</span> ♡
          </h2>
          <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:"clamp(.875rem,1.8vw,1rem)", color:"#777963", lineHeight:1.6, margin:"0 0 1.5rem" }}>
            Nuevas prendas, pequeñas historias y sorpresas<br className="lc-nl-br"/>
            para acompañar cada etapa.
          </p>

          {status === "success" ? (
            <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"1rem", color:"#8f9e68" }}>
              ¡Listo! Te avisaremos cuando lleguen novedades. ♥
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                aria-label="Tu correo electrónico"
                style={{
                  flex:"1 1 200px",
                  padding:"12px 16px",
                  borderRadius:"999px",
                  border:"1.5px solid #d5d5bd",
                  fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)",
                  fontSize:".9rem",
                  color:"#171815",
                  background:"#fff",
                  outline:"none",
                  minWidth:0,
                }}
              />
              <button
                type="submit"
                aria-label="Suscribirme"
                style={{
                  padding:"12px 20px",
                  borderRadius:"999px",
                  border:"none",
                  background:"#ffa486",
                  color:"#fff",
                  fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)",
                  fontWeight:700,
                  fontSize:"1rem",
                  cursor:"pointer",
                  transition:"background .2s",
                  flexShrink:0,
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#e8896e")}
                onMouseOut={e => (e.currentTarget.style.background = "#ffa486")}
              >
                →
              </button>
            </form>
          )}
          <small style={{ display:"block", fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".75rem", color:"#83827f", marginTop:".75rem" }}>
            Solo cosas bonitas. Sin apuros.
          </small>
        </div>

        <Image
          src="/products/LC-001.jpeg"
          alt="Detalles suaves de la colección Lion Cub"
          width={240}
          height={300}
          className="lc-nl-img"
          style={{ objectFit:"cover", borderRadius:"clamp(8px,2vw,16px)" }}
          aria-hidden
        />
      </div>

      <style>{`
        .lc-nl-inner {
          max-width:1100px;
          margin:0 auto;
          padding: clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem);
          display:grid;
          grid-template-columns:auto 1fr auto;
          align-items:center;
          gap:clamp(1.5rem,4vw,3rem);
        }
        .lc-nl-img {
          width:clamp(120px,18vw,220px) !important;
          height:clamp(150px,22vw,280px) !important;
          flex-shrink:0;
        }
        .lc-nl-body { text-align:center; }
        .lc-nl-br { display:none; }
        @media(min-width:768px){ .lc-nl-br { display:block; } }
        @media(max-width:640px){
          .lc-nl-inner { grid-template-columns:1fr; }
          .lc-nl-img { display:none !important; }
          .lc-nl-img:first-child { display:block !important; width:100% !important; height:200px !important; max-width:280px; margin:0 auto; }
        }
      `}</style>
    </section>
  );
}
