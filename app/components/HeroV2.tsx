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

// bgSize controla el zoom individual de cada letra
// bgPos define qué parte de la imagen aparece dentro de la letra
const LETTERS: Letter[] = [
  { char: "L", img: "/hero/planos/desktop/K01.webp", imgFocal: "58% 52%", fallback: "#C08A4A" },
  { char: "I", img: "/hero/planos/desktop/K02.webp", imgFocal: "48% 42%", fallback: "#C8965A" },
  { char: "O", img: "/hero/planos/desktop/K03.webp", imgFocal: "50% 45%", fallback: "#8B9E7A" },
  { char: "N", img: "/hero/planos/desktop/K04.webp", imgFocal: "45% 28%", fallback: "#C08A4A" },
  { char: " ", img: "", imgFocal: "", fallback: "" },
  { char: "C", img: "/hero/planos/desktop/K05.webp", imgFocal: "50% 38%", fallback: "#E2765A" },
  { char: "U", img: "/hero/planos/desktop/K06.webp", imgFocal: "52% 38%", fallback: "#9BBBC8" },
  { char: "B", img: "/hero/planos/desktop/K01.webp", imgFocal: "38% 65%", fallback: "#A47C3B" },
];

const DOODLES = {
  cloud: (
    <svg width="90" height="56" viewBox="0 0 90 56" fill="none" aria-hidden>
      <path
        d="M18 43 C7 43 3 35 7 29 C9 24 15 22 21 25 C23 15 31 10 41 10 C51 10 58 17 59 26 C63 24 69 25 73 29 C78 33 78 41 73 43 Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),
  sun: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
      <circle cx="26" cy="26" r="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = deg * Math.PI / 180;
        return (
          <line
            key={i}
            x1={26 + 14 * Math.cos(rad)} y1={26 + 14 * Math.sin(rad)}
            x2={26 + 20 * Math.cos(rad)} y2={26 + 20 * Math.sin(rad)}
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          />
        );
      })}
    </svg>
  ),
  heart: (
    <svg width="34" height="30" viewBox="0 0 34 30" fill="none" aria-hidden>
      <path
        d="M17 27 C17 27 3 19 3 10 C3 6.7 5.7 4 9 4 C11.6 4 13.9 5.6 15.2 8 L17 10.5 L18.8 8 C20.1 5.6 22.4 4 25 4 C28.3 4 31 6.7 31 10 C31 19 17 27 17 27 Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
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
      {/* ── Doodles de fondo — trazo a mano ── */}
      <span
        aria-hidden
        style={{ position: "absolute", top: "10%", left: "4%", color: "var(--color-v2-doodle)", pointerEvents: "none", opacity: 0.7 }}
      >
        {DOODLES.cloud}
      </span>
      <span
        aria-hidden
        style={{ position: "absolute", top: "7%", right: "7%", color: "var(--color-v2-amber)", pointerEvents: "none", opacity: 0.65 }}
      >
        {DOODLES.sun}
      </span>
      <span
        aria-hidden
        style={{ position: "absolute", bottom: "28%", left: "7%", color: "var(--color-v2-cta)", pointerEvents: "none", opacity: 0.6, transform: "scale(0.85)" }}
      >
        {DOODLES.heart}
      </span>

      {/* ── Dotted path — lado derecho ── */}
      <svg
        aria-hidden
        style={{ position: "absolute", right: "3%", top: "14%", pointerEvents: "none" }}
        width="58" height="260" viewBox="0 0 58 260"
        fill="none"
      >
        <path
          d="M 42,8 C 55,48 22,88 46,128 C 62,155 30,205 40,255"
          stroke="var(--color-v2-doodle)" strokeWidth="1.8" strokeDasharray="4 6" strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

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
          // Zoom individual por letra (backgroundSize) para que el sujeto sea reconocible
          const bgSizes: Record<string, string> = {
            L: "175% 175%",
            I: "320% 320%",
            O: "155% 155%",
            N: "195% 195%",
            C: "175% 175%",
            U: "225% 225%",
            B: "165% 165%",
          };

          const style: React.CSSProperties = {
            fontFamily: "var(--font-wordmark)",
            fontWeight: 700,
            fontSize: "clamp(80px, 18vw, 196px)",
            lineHeight: 0.88,
            display: "inline-block",
            ...(reduced || !l.img
              ? { color: l.fallback }
              : {
                  backgroundImage: `url(${l.img})`,
                  backgroundSize: bgSizes[l.char] ?? "200% 200%",
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

      {/* ── Colina orgánica inferior ── */}
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
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block" }}>
          <path
            d="M0,130 C200,70 420,175 680,120 C860,80 1040,165 1260,110 C1340,90 1400,130 1440,115 L1440,200 L0,200 Z"
            fill="var(--color-v2-wave)"
          />
        </svg>
      </div>
    </section>
  );
}
