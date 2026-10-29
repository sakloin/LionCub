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
// L=bebé en prenda visible, I=detalle fibra/textil (letra estrecha), O=drapeado tela,
// N=conjunto Lion Cub con detalle reconocible, C=detalle bebé/prenda,
// U=campo de algodón pima (campo = fibra que toca al bebé), B=interacción mamá+bebé
const LETTERS: Letter[] = [
  { char: "L", img: "/products/LC-016.jpeg",             imgFocal: "50% 25%",  fallback: "#C08A4A" },
  { char: "I", img: "/hero/planos/desktop/K02.webp",     imgFocal: "50% 50%",  fallback: "#C8965A" },
  { char: "O", img: "/hero/planos/desktop/K03.webp",     imgFocal: "58% 48%",  fallback: "#8B9E7A" },
  { char: "N", img: "/products/LC-001.jpeg",             imgFocal: "50% 30%",  fallback: "#C08A4A" },
  { char: " ", img: "",                                   imgFocal: "",         fallback: "" },
  { char: "C", img: "/products/LC-013.jpeg",             imgFocal: "50% 38%",  fallback: "#E2765A" },
  { char: "U", img: "/hero/planos/desktop/K07-algodon.png", imgFocal: "50% 32%",  fallback: "#8B9E7A" },
  { char: "B", img: "/hero/planos/desktop/K04.webp",     imgFocal: "54% 4%",   fallback: "#A47C3B" },
];

const DOODLES = {
  cloud: (
    // Nube orgánica: lóbulos de tamaño variable, base suavemente curva, sin aristas rectas
    <svg width="104" height="64" viewBox="0 0 104 64" fill="none" aria-hidden>
      <path
        d="M14 50 C6 50 2 43 5 37 C7 32 12 30 18 33 C18 22 26 15 37 15 C44 15 49 18 52 24 C55 18 62 14 70 14 C80 14 87 21 87 31 C91 29 97 31 100 36 C103 41 101 48 96 50 C96 52 94 54 91 54 C88 54 86 53 85 51 C82 53 78 55 74 55 C71 55 68 54 66 52 C63 54 59 55 55 55 C51 55 47 54 44 51 C41 53 37 55 33 55 C28 55 24 52 22 48 C20 50 17 50 14 50 Z"
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
        background: "var(--color-v2-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "clamp(3rem, 6vw, 4.5rem)",
        paddingBottom: "clamp(4rem, 8vw, 6rem)",
        paddingLeft: "clamp(1.25rem, 5vw, 3rem)",
        paddingRight: "clamp(1.25rem, 5vw, 3rem)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Eyebrow ── */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "var(--color-gold-text)",
          marginBottom: "clamp(1rem, 2.5vw, 1.75rem)",
          opacity: 0.85,
        }}
      >
        Algodón pima peruano
      </p>

      {/* ── Wordmark + doodles — contenedor de composición ── */}
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Nube superior — sobre zona LI */}
        <span
          aria-hidden="true"
          className="lc-doodle-cloud"
          style={{ color: "var(--color-v2-doodle)", pointerEvents: "none", opacity: 0.72 }}
        >
          {DOODLES.cloud}
        </span>
        {/* Nube inferior — zona U/B, parte baja */}
        <span
          aria-hidden="true"
          className="lc-doodle-cloud2"
          style={{ color: "var(--color-v2-doodle)", pointerEvents: "none", opacity: 0.52, transform: "scale(0.50)", transformOrigin: "bottom right" }}
        >
          {DOODLES.cloud}
        </span>
        {/* Sol — integrado con letra B, esquina superior derecha */}
        <span
          aria-hidden="true"
          className="lc-doodle-sun"
          style={{ color: "var(--color-v2-amber)", pointerEvents: "none", opacity: 0.65 }}
        >
          {DOODLES.sun}
        </span>
        {/* Corazón 1 — lado izquierdo de L, zona media */}
        <span
          aria-hidden="true"
          className="lc-doodle-heart"
          style={{ color: "var(--color-v2-cta)", pointerEvents: "none", opacity: 0.62, transform: "scale(0.88)" }}
        >
          {DOODLES.heart}
        </span>
        {/* Corazón 2 — zona inferior de L */}
        <span
          aria-hidden="true"
          className="lc-doodle-heart2"
          style={{ color: "var(--color-v2-cta)", pointerEvents: "none", opacity: 0.48, transform: "scale(0.65)" }}
        >
          {DOODLES.heart}
        </span>
        {/* Caminito punteado — va desde la zona N hacia U con curva y lazo suave */}
        <svg
          aria-hidden="true"
          className="lc-doodle-caminito"
          style={{ pointerEvents: "none", position: "absolute" }}
          width="320" height="180" viewBox="0 0 320 180"
          fill="none"
        >
          <path
            d="M 12,28 C 36,70 62,105 104,112 C 146,119 178,98 186,74 C 194,50 180,30 158,28 C 136,26 120,48 128,70 C 136,92 164,98 200,90 C 240,82 278,62 308,40"
            stroke="var(--color-v2-doodle)" strokeWidth="1.8" strokeDasharray="4 6" strokeLinecap="round"
            opacity="0.55"
          />
        </svg>

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
            // auto X% preserva la relación de aspecto de cada imagen (X% controla zoom por altura)
            // "P% P%" deforma imágenes cuyo ratio no coincide con el de la letra
            const bgSizes: Record<string, string> = {
              L: "auto 130%",
              I: "auto 200%",
              O: "auto 120%",
              N: "auto 140%",
              C: "auto 130%",
              U: "auto 130%",
              B: "auto 200%",
            };

            const style: React.CSSProperties = {
              fontFamily: "var(--font-wordmark)",
              fontWeight: 700,
              fontSize: "clamp(78px, 19vw, 240px)",
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
      </div>

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
        Ver colección →
      </Link>

      <style>{`
        .lc-doodle-cloud   { position: absolute; top: -52px; left: 6%; }
        .lc-doodle-cloud2  { position: absolute; bottom: -16px; right: 12%; }
        .lc-doodle-sun     { position: absolute; top: -40px; right: -10px; }
        .lc-doodle-heart   { position: absolute; top: 18%; left: -38px; }
        .lc-doodle-heart2  { position: absolute; bottom: 22%; left: -30px; transform-origin: bottom left; }
        .lc-doodle-caminito { left: 38%; top: 0%; }
        @media (max-width: 767px) {
          .lc-doodle-cloud {
            top: auto; bottom: -12px; left: 6%;
            transform: scale(0.50);
            transform-origin: bottom left;
          }
          .lc-doodle-cloud2 { display: none; }
          .lc-doodle-sun    { top: -22px; right: 2%; transform: scale(0.80); transform-origin: top right; }
          .lc-doodle-heart  { left: -22px; top: 20%; }
          .lc-doodle-heart2 { left: -18px; bottom: 28%; }
          .lc-doodle-caminito {
            left: 34%; top: 0%;
            transform: scale(0.55);
            transform-origin: top left;
          }
        }
      `}</style>
    </section>
  );
}
