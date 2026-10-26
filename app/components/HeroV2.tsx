"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Slide = {
  img: string;
  focal: string;
  alt: string;
};

const SLIDES: Slide[] = [
  { img: "/hero/planos/desktop/K01.webp", focal: "50% 60%", alt: "" },
  { img: "/hero/planos/desktop/K02.webp", focal: "50% 50%", alt: "" },
  { img: "/hero/planos/desktop/K03.webp", focal: "50% 50%", alt: "" },
  { img: "/hero/planos/desktop/K04.webp", focal: "50% 30%", alt: "Mamá abrazando a su bebé envuelto en una manta de algodón Pima" },
  { img: "/hero/planos/desktop/K05.webp", focal: "50% 40%", alt: "" },
  { img: "/hero/planos/desktop/K06.webp", focal: "50% 40%", alt: "" },
];

const PAUSE_MS = 4500;
const FADE_MS  = 800;

export default function HeroV2() {
  const [reduced, setReduced] = useState(false);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setReduced(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  useEffect(() => {
    if (reduced) return;
    timerRef.current = setTimeout(() => {
      const next = (current + 1) % SLIDES.length;
      setPrev(current);
      setCurrent(next);
      setTimeout(() => setPrev(null), FADE_MS + 50);
    }, PAUSE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, reduced]);

  const slide = SLIDES[current];
  const prevSlide = prev !== null ? SLIDES[prev] : null;

  const wordmarkStyle = (s: Slide, isBase: boolean): React.CSSProperties => ({
    fontFamily: "var(--font-wordmark)",
    fontWeight: 700,
    fontSize: "clamp(4.5rem, 18vw, 16rem)",
    lineHeight: 0.88,
    letterSpacing: "-0.02em",
    backgroundImage: `url(${s.img})`,
    backgroundSize: "cover",
    backgroundPosition: s.focal,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    display: "block",
    userSelect: "none",
    ...(isBase ? {
      position: "relative" as const,
      animationName: reduced ? "none" : "lc-ken-burns",
      animationDuration: `${PAUSE_MS + FADE_MS}ms`,
      animationTimingFunction: "linear",
      animationFillMode: "forwards",
    } : {
      position: "absolute" as const,
      inset: 0,
      opacity: 0,
      transition: `opacity ${FADE_MS}ms linear`,
    }),
  });

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
        padding: "clamp(3rem, 10vw, 6rem) clamp(1rem, 5vw, 4rem)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Wordmark con fotos dentro */}
      <div
        style={{ position: "relative", lineHeight: 0 }}
        aria-hidden
      >
        {/* Capa anterior (fade out) */}
        {prevSlide && (
          <span
            key={`prev-${prev}`}
            style={wordmarkStyle(prevSlide, false)}
          >
            LION CUB
          </span>
        )}
        {/* Capa actual */}
        <span
          key={`cur-${current}`}
          style={wordmarkStyle(slide, true)}
        >
          LION CUB
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: "var(--font-title)",
          fontWeight: 700,
          fontSize: "clamp(1.1rem, 3.5vw, 1.75rem)",
          color: "var(--color-v2-amber)",
          marginTop: "clamp(1rem, 3vw, 2rem)",
          marginBottom: 0,
          letterSpacing: "0.01em",
        }}
      >
        Del algodón al abrazo
      </p>

      {/* Divisor línea — corazón — línea */}
      <div
        aria-hidden
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "clamp(0.75rem, 2vw, 1.25rem)",
          color: "var(--color-v2-cta)",
          width: "min(280px, 60%)",
        }}
      >
        <span style={{ flex: 1, height: "1px", background: "currentColor", opacity: 0.5 }} />
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
          <path
            d="M8 12.5C8 12.5 1 8.5 1 4.5C1 2.567 2.567 1 4.5 1C5.7 1 6.8 1.6 7.5 2.5L8 3.1L8.5 2.5C9.2 1.6 10.3 1 11.5 1C13.433 1 15 2.567 15 4.5C15 8.5 8 12.5 8 12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ flex: 1, height: "1px", background: "currentColor", opacity: 0.5 }} />
      </div>

      {/* Subtítulo */}
      <p
        style={{
          fontFamily: "var(--font-title)",
          fontWeight: 400,
          fontSize: "clamp(0.9rem, 2.5vw, 1.125rem)",
          color: "var(--color-ink-soft)",
          marginTop: "clamp(0.75rem, 2vw, 1.25rem)",
          maxWidth: "36ch",
          lineHeight: 1.55,
        }}
      >
        Ropa de bebé en 100% algodón pima peruano —<br />
        suavidad que se siente desde el primer abrazo.
      </p>

      {/* CTA */}
      <Link
        href="/tienda"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "clamp(1.5rem, 4vw, 2.5rem)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 400,
          padding: "14px 32px",
          background: "var(--color-v2-cta)",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "2px",
          transition: "background 0.25s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#c95e40")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--color-v2-cta)")}
      >
        Ver colección
      </Link>

      {/* Dots */}
      <div
        role="tablist"
        aria-label="Diapositivas"
        style={{
          display: "flex",
          gap: 0,
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Diapositiva ${i + 1}`}
            onClick={() => {
              if (i === current) return;
              if (timerRef.current) clearTimeout(timerRef.current);
              setPrev(current);
              setCurrent(i);
              setTimeout(() => setPrev(null), FADE_MS + 50);
            }}
            style={{
              width: "44px",
              height: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "block",
                width: i === current ? "20px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: i === current ? "var(--color-v2-amber)" : "var(--color-v2-sage)",
                transition: "all 300ms ease",
              }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
