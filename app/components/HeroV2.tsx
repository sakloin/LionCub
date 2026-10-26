"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Hero v2 — Wordmark con foto por letra (background-clip:text)
 * Cada letra de LION CUB muestra una imagen diferente de la carpeta /hero/planos.
 * prefers-reduced-motion: usa color sólido en lugar de imagen animada.
 */

type Letter = {
  char: string;
  img: string;             // foto para background-clip:text
  imgFocal: string;        // object-position equivalente para bg
  fallback: string;        // color sólido (reduced motion)
};

const LETTERS: Letter[] = [
  { char: "L", img: "/hero/planos/desktop/K01.webp", imgFocal: "60% 55%", fallback: "#C08A4A" },
  { char: "I", img: "/hero/planos/desktop/K02.webp", imgFocal: "50% 50%", fallback: "#C8965A" },
  { char: "O", img: "/hero/planos/desktop/K03.webp", imgFocal: "50% 50%", fallback: "#8B9E7A" },
  { char: "N", img: "/hero/planos/desktop/K04.webp", imgFocal: "50% 30%", fallback: "#C08A4A" },
  { char: " ", img: "", imgFocal: "", fallback: "" },
  { char: "C", img: "/hero/planos/desktop/K05.webp", imgFocal: "50% 40%", fallback: "#E2765A" },
  { char: "U", img: "/hero/planos/desktop/K06.webp", imgFocal: "50% 40%", fallback: "#9BBBC8" },
  { char: "B", img: "/hero/planos/desktop/K01.webp", imgFocal: "40% 70%", fallback: "#A47C3B" },
];

const DOODLES = {
  cloud: (
    <svg width="68" height="36" viewBox="0 0 68 36" fill="none" aria-hidden>
      <ellipse cx="34" cy="28" rx="32" ry="10" fill="currentColor" opacity="0.18"/>
      <ellipse cx="22" cy="22" rx="16" ry="12" fill="currentColor" opacity="0.22"/>
      <ellipse cx="44" cy="22" rx="18" ry="13" fill="currentColor" opacity="0.22"/>
      <ellipse cx="34" cy="16" rx="14" ry="11" fill="currentColor" opacity="0.28"/>
    </svg>
  ),
  sun: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="9" fill="currentColor" opacity="0.6"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line
          key={i}
          x1="22" y1="22"
          x2={22 + 16 * Math.cos(deg * Math.PI / 180)}
          y2={22 + 16 * Math.sin(deg * Math.PI / 180)}
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"
        />
      ))}
    </svg>
  ),
  heart: (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden>
      <path
        d="M14 22C14 22 2 14 2 7C2 4.239 4.239 2 7 2C9.2 2 11.1 3.3 12.3 5.1L14 7.3L15.7 5.1C16.9 3.3 18.8 2 21 2C23.761 2 26 4.239 26 7C26 14 14 22 14 22Z"
        fill="currentColor" opacity="0.55"
      />
    </svg>
  ),
};

export default function HeroV2() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setReduced(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  return (
    <section
      aria-label="Lion Cub — Ropa de bebé en algodón pima peruano"
      style={{
        minHeight: "100svh",
        background: "var(--color-v2-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(5rem, 12vw, 8rem) clamp(1.25rem, 5vw, 3rem) clamp(4rem, 8vw, 6rem)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Doodles de fondo ── */}
      <span
        aria-hidden
        style={{ position: "absolute", top: "12%", left: "5%", color: "var(--color-v2-doodle)", pointerEvents: "none" }}
      >
        {DOODLES.cloud}
      </span>
      <span
        aria-hidden
        style={{ position: "absolute", top: "8%", right: "8%", color: "var(--color-v2-amber)", pointerEvents: "none", transform: "scale(0.7)" }}
      >
        {DOODLES.sun}
      </span>
      <span
        aria-hidden
        style={{ position: "absolute", bottom: "22%", left: "8%", color: "var(--color-v2-cta)", pointerEvents: "none", transform: "scale(0.8)" }}
      >
        {DOODLES.heart}
      </span>
      <span
        aria-hidden
        style={{ position: "absolute", bottom: "20%", right: "6%", color: "var(--color-v2-doodle)", pointerEvents: "none", transform: "scale(0.65)" }}
      >
        {DOODLES.cloud}
      </span>

      {/* ── Eyebrow ── */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "var(--color-v2-amber)",
          marginBottom: "clamp(1rem, 2.5vw, 1.75rem)",
          opacity: 0.85,
        }}
      >
        Algodón pima peruano
      </p>

      {/* ── Wordmark per-letter ── */}
      <h1
        aria-label="Lion Cub"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          lineHeight: 0.88,
          letterSpacing: "-0.02em",
          gap: "0 2px",
          userSelect: "none",
        }}
      >
        {LETTERS.map((l, i) => {
          if (l.char === " ") {
            return <span key={i} style={{ width: "0.28em", display: "inline-block" }} aria-hidden />;
          }
          const style: React.CSSProperties = {
            fontFamily: "var(--font-wordmark)",
            fontWeight: 700,
            fontSize: "clamp(68px, 15vw, 176px)",
            lineHeight: 0.88,
            display: "inline-block",
            ...(reduced || !l.img
              ? { color: l.fallback }
              : {
                  backgroundImage: `url(${l.img})`,
                  backgroundSize: "200% 200%",
                  backgroundPosition: l.imgFocal,
                  backgroundRepeat: "no-repeat",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }),
          };
          return (
            <span key={i} aria-hidden style={style}>
              {l.char}
            </span>
          );
        })}
      </h1>

      {/* ── Tagline ── */}
      <p
        style={{
          fontFamily: "var(--font-title)",
          fontWeight: 700,
          fontSize: "clamp(1rem, 3vw, 1.5rem)",
          color: "var(--color-v2-amber)",
          marginTop: "clamp(1rem, 2.5vw, 1.75rem)",
          letterSpacing: "0.01em",
        }}
      >
        Del algodón al abrazo
      </p>

      {/* ── Línea con corazón ── */}
      <div
        aria-hidden
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "clamp(0.75rem, 1.5vw, 1rem)",
          color: "var(--color-v2-cta)",
          width: "min(260px, 55%)",
        }}
      >
        <span style={{ flex: 1, height: "1px", background: "currentColor", opacity: 0.4 }} />
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
          <path
            d="M7 11C7 11 1 7.5 1 4C1 2.343 2.343 1 4 1C5.1 1 6.1 1.6 6.6 2.5L7 3.1L7.4 2.5C7.9 1.6 8.9 1 10 1C11.657 1 13 2.343 13 4C13 7.5 7 11 7 11Z"
            fill="currentColor" opacity="0.7"
          />
        </svg>
        <span style={{ flex: 1, height: "1px", background: "currentColor", opacity: 0.4 }} />
      </div>

      {/* ── Subtítulo ── */}
      <p
        style={{
          fontFamily: "var(--font-title)",
          fontWeight: 400,
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          color: "var(--color-ink-soft)",
          marginTop: "clamp(0.75rem, 1.5vw, 1rem)",
          maxWidth: "38ch",
          lineHeight: 1.6,
        }}
      >
        Ropa de bebé en 100&nbsp;% algodón pima peruano —{" "}
        <br className="hidden sm:block" />
        suavidad que se siente desde el primer abrazo.
      </p>

      {/* ── CTA pill ── */}
      <Link
        href="#coleccion"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "clamp(1.75rem, 4vw, 2.5rem)",
          fontFamily: "var(--font-title)",
          fontWeight: 700,
          fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
          letterSpacing: "0.01em",
          padding: "14px 30px",
          background: "var(--color-v2-cta)",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "999px",
          boxShadow: "0 4px 18px rgba(226,118,90,0.35)",
          transition: "background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#c95e40";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 22px rgba(226,118,90,0.45)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "var(--color-v2-cta)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 18px rgba(226,118,90,0.35)";
        }}
      >
        Explorar colección · Verano 2027
      </Link>

      {/* ── Ola inferior ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          lineHeight: 0,
          pointerEvents: "none",
        }}
      >
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,50 C240,20 480,80 720,50 C960,20 1200,70 1440,45 L1440,80 L0,80 Z"
            fill="var(--color-v2-wave)"
          />
        </svg>
      </div>
    </section>
  );
}
