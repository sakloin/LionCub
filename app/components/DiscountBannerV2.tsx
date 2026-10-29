"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * DiscountBannerV2 — Sección "promo" fiel al diseño ChatGPT reference.
 * 10% OFF en primer pedido, cupón LION10 copiable.
 * Nota visible: "promoción por confirmar" (coherente con el HTML de referencia).
 */

export default function DiscountBannerV2() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("LION10");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: seleccionar texto
    }
  };

  return (
    <section style={{ background: "#fcf2e3", overflow: "hidden" }}>
      <div className="lc-promo-inner">
        <div className="lc-promo-title">
          <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".9rem", color:"#777963", margin:0 }}>Bienvenido a LION CUB ♡</p>
          <strong style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"clamp(3rem,9vw,6rem)", color:"#171815", lineHeight:1 }}>10% OFF</strong>
        </div>

        <div className="lc-promo-copy">
          <h3 style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"clamp(1.1rem,3vw,1.6rem)", color:"#171815", margin:"0 0 .75rem", textTransform:"uppercase", lineHeight:1.2 }}>
            En tu<br/>PRIMER PEDIDO
          </h3>
          <button
            onClick={handleCopy}
            style={{
              display:"inline-flex",
              alignItems:"center",
              gap:"8px",
              padding:"10px 20px",
              borderRadius:"999px",
              border:"2px solid #171815",
              background: copied ? "#171815" : "transparent",
              color: copied ? "#faf7f6" : "#171815",
              fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)",
              fontWeight:700,
              fontSize:".9rem",
              cursor:"pointer",
              transition:"background .2s, color .2s",
              letterSpacing:".05em",
            }}
            aria-label="Copiar código de descuento LION10"
          >
            {copied ? "¡Copiado!" : "Código: LION10"}
          </button>
          <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".75rem", color:"#83827f", marginTop:".75rem", fontStyle:"italic" }}>
            Propuesta visual · promoción por confirmar.
          </p>
        </div>

        <div className="lc-promo-img">
          <Image
            src="/products/LC-001.jpeg"
            alt="Prendas de algodón pima Lion Cub"
            width={300}
            height={340}
            style={{ objectFit:"cover", width:"100%", height:"100%", borderRadius:"clamp(8px,2vw,16px)" }}
          />
        </div>
      </div>

      <style>{`
        .lc-promo-inner {
          max-width:1100px;
          margin:0 auto;
          padding: clamp(2.5rem,6vw,4rem) clamp(1rem,5vw,3rem);
          display:grid;
          grid-template-columns:auto 1fr auto;
          align-items:center;
          gap:clamp(1.5rem,4vw,3rem);
        }
        .lc-promo-title { text-align:left; }
        .lc-promo-copy { text-align:center; }
        .lc-promo-img {
          width:clamp(150px,22vw,260px);
          height:clamp(170px,25vw,300px);
          flex-shrink:0;
        }
        @media(max-width:640px){
          .lc-promo-inner {
            grid-template-columns:1fr;
            text-align:center;
          }
          .lc-promo-title { text-align:center; }
          .lc-promo-img { width:100%; height:220px; max-width:260px; margin:0 auto; }
        }
      `}</style>
    </section>
  );
}
