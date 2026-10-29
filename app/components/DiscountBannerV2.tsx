"use client";

import { useState } from "react";

/**
 * DiscountBannerV2 — Layout dividido: contenido a la izquierda, composición visual a la derecha.
 * El código LIONCUB10 es solo visual; activar descuento real requiere revisión del auditor.
 * El botón copia el código al portapapeles con confirmación visible.
 */

function CopyCodeButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("LIONCUB10");
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback: seleccionar texto si clipboard falla
      const el = document.querySelector<HTMLElement>(".lc-code-text");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Código copiado" : "Copiar código LIONCUB10"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        border: "1.5px dashed var(--color-v2-amber)",
        borderRadius: "14px",
        padding: "14px 22px",
        background: copied ? "rgba(192,138,74,0.10)" : "rgba(255,255,255,0.55)",
        cursor: "pointer",
        transition: "background 0.22s ease, border-color 0.22s ease",
        outline: "none",
        width: "fit-content",
      }}
    >
      <span
        className="lc-code-text"
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "var(--color-ink)",
          userSelect: "all",
        }}
      >
        LIONCUB10
      </span>
      <span style={{
        fontFamily: "var(--font-title)",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: copied ? "var(--color-v2-amber)" : "var(--color-ink-soft)",
        letterSpacing: "0.04em",
        minWidth: "65px",
        transition: "color 0.2s ease",
      }}>
        {copied ? "¡Copiado!" : "Copiar"}
      </span>
      {/* Icono copiar / check */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        {copied ? (
          <path d="M3 8l3.5 3.5L13 4" stroke="var(--color-v2-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        ) : (
          <>
            <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v8A1.5 1.5 0 003.5 13H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </>
        )}
      </svg>
    </button>
  );
}

// Silueta decorativa derecha — prendas SVG estilizadas (composición placeholder)
// Para reemplazar con PNGs con canal alfa reales cuando estén disponibles.
function GarmentComposition() {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "clamp(220px, 40vw, 360px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Prenda izquierda - body silueta */}
      <div style={{
        position: "absolute",
        left: "10%",
        bottom: "8%",
        width: "clamp(80px, 18vw, 140px)",
        aspectRatio: "3/4",
        borderRadius: "40% 40% 30% 30% / 20% 20% 50% 50%",
        background: "#E9D7B8",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        transform: "rotate(-8deg)",
        overflow: "hidden",
      }} aria-hidden />

      {/* Prenda central - conjunto principal */}
      <div style={{
        position: "absolute",
        left: "30%",
        bottom: "0%",
        width: "clamp(100px, 22vw, 170px)",
        aspectRatio: "3/4",
        borderRadius: "40% 40% 28% 28% / 18% 18% 55% 55%",
        background: "#DDE6D6",
        boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
        transform: "rotate(3deg)",
        overflow: "hidden",
      }} aria-hidden />

      {/* Prenda derecha */}
      <div style={{
        position: "absolute",
        right: "8%",
        bottom: "12%",
        width: "clamp(70px, 15vw, 120px)",
        aspectRatio: "3/4",
        borderRadius: "38% 38% 28% 28% / 18% 18% 52% 52%",
        background: "#F0D9D2",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        transform: "rotate(10deg)",
        overflow: "hidden",
      }} aria-hidden />

      {/* Doodle corazón flotante */}
      <svg style={{ position: "absolute", top: "10%", right: "18%", opacity: 0.55 }} width="26" height="23" viewBox="0 0 34 30" fill="none" aria-hidden>
        <path d="M17 27C17 27 3 19 3 10C3 6.7 5.7 4 9 4C11.6 4 13.9 5.6 15.2 8L17 10.5L18.8 8C20.1 5.6 22.4 4 25 4C28.3 4 31 6.7 31 10C31 19 17 27 17 27Z"
          stroke="var(--color-v2-cta)" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>

      {/* Doodle sol flotante */}
      <svg style={{ position: "absolute", top: "8%", left: "22%", opacity: 0.50 }} width="32" height="32" viewBox="0 0 52 52" fill="none" aria-hidden>
        <circle cx="26" cy="26" r="9" stroke="var(--color-v2-amber)" strokeWidth="1.8"/>
        {[0,60,120,180,240,300].map((deg, i) => {
          const rad = deg * Math.PI / 180;
          return <line key={i} x1={26 + 14 * Math.cos(rad)} y1={26 + 14 * Math.sin(rad)} x2={26 + 20 * Math.cos(rad)} y2={26 + 20 * Math.sin(rad)} stroke="var(--color-v2-amber)" strokeWidth="1.8" strokeLinecap="round"/>;
        })}
      </svg>

      {/* Nota: reemplazar las siluetas con PNG con canal alfa real de las prendas */}
    </div>
  );
}

export default function DiscountBannerV2() {
  return (
    <section
      aria-label="Descuento primera compra"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(2.5rem, 5vw, 3.5rem) 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 clamp(1.25rem, 5vw, 3rem)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "clamp(2rem, 5vw, 3rem)",
          alignItems: "center",
        }}
        className="discount-layout"
      >
        {/* ── Columna izquierda: contenido ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "clamp(0.75rem, 1.8vw, 1.25rem)",
        }}>
          {/* Eyebrow */}
          <p style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11px",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "var(--color-v2-amber)",
            opacity: 0.85,
            margin: 0,
          }}>
            Oferta de bienvenida
          </p>

          {/* Título */}
          <h2 style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
            color: "var(--color-ink)",
            margin: 0,
            lineHeight: 1.1,
          }}>
            Bienvenido a{" "}
            <span style={{ color: "var(--color-v2-amber)" }}>Lion Cub</span>
          </h2>

          {/* Descuento prominente */}
          <div style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            lineHeight: 1,
            color: "var(--color-ink)",
          }}>
            10% OFF
          </div>

          {/* Descripción */}
          <p style={{
            fontFamily: "var(--font-title)",
            fontWeight: 400,
            fontSize: "clamp(0.9rem, 1.8vw, 1rem)",
            lineHeight: 1.6,
            color: "var(--color-ink-soft)",
            margin: 0,
            maxWidth: "34ch",
          }}>
            En tu primera compra. Ingresa el código al finalizar tu pedido.
          </p>

          {/* Botón de código con copy */}
          <CopyCodeButton />

          <p style={{
            fontFamily: "var(--font-title)",
            fontSize: "0.78rem",
            color: "var(--color-ink-mute)",
            margin: 0,
            opacity: 0.7,
          }}>
            Válido para la primera compra · Sujeto a condiciones
          </p>
        </div>

        {/* ── Columna derecha: composición visual ── */}
        <div className="discount-garments">
          <GarmentComposition />
        </div>
      </div>

      {/* Wave bottom */}
      <div aria-hidden style={{ lineHeight: 0, marginTop: "clamp(2rem, 4vw, 3rem)" }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,20 C480,60 960,5 1440,35 L1440,60 L0,60 Z" fill="var(--color-v2-bg)"/>
        </svg>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .discount-layout { grid-template-columns: 1fr 1fr !important; }
          .discount-garments { display: block !important; }
        }
        @media (max-width: 767px) {
          .discount-garments { display: none; }
        }
      `}</style>
    </section>
  );
}
