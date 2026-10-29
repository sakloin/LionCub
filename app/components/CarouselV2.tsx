"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

/**
 * CarouselV2 — Carrusel de colecciones / promociones
 * Auto-avance a 4200 ms. Flechas prev/next + dots.
 * Slides con imagen a la derecha y texto a la izquierda (desktop).
 * En móvil: imagen arriba, texto abajo.
 */

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  img: string;
  imgAlt: string;
  bg: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Algodón Pima Peruano",
    title: "Del Campo\nal Bebé",
    body: "Cultivado en los valles de la costa peruana. Fibra extra-larga, naturalmente suave desde el primer contacto con la piel del bebé.",
    cta: "Conocer más",
    href: "#coleccion",
    img: "/hero/planos/desktop/K01.webp",
    imgAlt: "Campo de algodón pima peruano — materia prima Lion Cub",
    bg: "#DDE6D6",
  },
  {
    eyebrow: "Colección · Ternura Pima",
    title: "Conjunto\nConejito",
    body: "Bordado artesanal sobre algodón pima: suave, lavable y siempre elegante.",
    cta: "Ver conjunto",
    href: "#coleccion",
    img: "/products/LC-007.jpeg",
    imgAlt: "Conjunto conejito bordado en algodón pima",
    bg: "#E9D7B8",
  },
  {
    eyebrow: "Más vendidos",
    title: "Colección\nFloral Pima",
    body: "Diseños florales en algodón pima: delicados, duraderos y adorables.",
    cta: "Explorar",
    href: "#coleccion",
    img: "/products/LC-010.jpeg",
    imgAlt: "Conjunto floral de algodón pima",
    bg: "#D5D2BA",
  },
  {
    eyebrow: "Nuevo ingreso",
    title: "Nuevos\nColores",
    body: "Tonos coral y arándano para la nueva temporada.",
    cta: "Ver novedades",
    href: "#coleccion",
    img: "/products/LC-005.jpeg",
    imgAlt: "Conjunto en nuevos colores temporada",
    bg: "#F0D9D2",
  },
];

const PAUSE_MS = 4200;
const FADE_MS  = 600;

export default function CarouselV2() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setReduced(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  const goTo = useCallback((i: number) => {
    if (i === current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPrev(current);
    setCurrent(i);
    setTimeout(() => setPrev(null), FADE_MS + 50);
  }, [current]);

  const goNext = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (reduced) return;
    timerRef.current = setTimeout(goNext, PAUSE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, reduced, goNext]);

  const slide = SLIDES[current];

  return (
    <section
      aria-label="Colecciones destacadas"
      style={{
        background: "var(--color-v2-wave)",
        padding: "0 0 clamp(2.5rem, 5vw, 4rem)",
        position: "relative",
      }}
    >
      {/* Wave top (from hero) */}
      <div aria-hidden style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,0 L1440,0 L1440,60 C1200,30 960,60 720,40 C480,20 240,55 0,30 Z" fill="var(--color-v2-bg)"/>
        </svg>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 clamp(1.25rem, 5vw, 3rem)",
          position: "relative",
        }}
      >
        {/* Slide container */}
        <div
          style={{
            position: "relative",
            borderRadius: "var(--lc-radius-lg, 22px)",
            overflow: "hidden",
            background: slide.bg,
            transition: reduced ? "none" : `background ${FADE_MS}ms ease`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {SLIDES.map((s, i) => {
            const isActive = i === current;
            const isPrev   = i === prev;
            if (!isActive && !isPrev) return null;
            return (
              <div
                key={i}
                style={{
                  position: isActive ? "relative" : "absolute",
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  transition: reduced ? "none" : `opacity ${FADE_MS}ms ease`,
                  display: "flex",
                  flexDirection: "column" as const,
                }}
              >
                {/* Desktop: split row. Mobile: stacked */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    flex: 1,
                  }}
                  className="md-carousel-grid"
                >
                  {/* Text side */}
                  <div
                    style={{
                      padding: "clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 5vw, 3rem)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: "clamp(0.75rem, 2vw, 1.25rem)",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "var(--font-title)",
                        fontWeight: 700,
                        fontSize: "clamp(2.5rem, 7vw, 5rem)",
                        lineHeight: 1.05,
                        color: "var(--color-ink)",
                        margin: 0,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {s.title}
                    </h2>
                    <p
                      style={{
                        fontFamily: "var(--font-title)",
                        fontWeight: 400,
                        fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
                        lineHeight: 1.6,
                        color: "var(--color-ink-soft)",
                        margin: 0,
                        maxWidth: "32ch",
                      }}
                    >
                      {s.body}
                    </p>
                    <a
                      href={s.href}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-title)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "var(--color-ink)",
                        textDecoration: "none",
                        marginTop: "0.5rem",
                        width: "fit-content",
                      }}
                    >
                      {s.cta}
                      <span aria-hidden style={{ display: "inline-block", width: "20px", height: "1px", background: "currentColor", verticalAlign: "middle" }} />
                    </a>
                  </div>

                  {/* Image side */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      minHeight: "200px",
                    }}
                  >
                    <Image
                      src={s.img}
                      alt={s.imgAlt}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(0.5rem, 2vw, 1.5rem)",
            marginTop: "clamp(1rem, 2.5vw, 1.5rem)",
          }}
        >
          {/* Prev */}
          <button
            onClick={goPrev}
            aria-label="Diapositiva anterior"
            style={{
              width: "44px", height: "44px",
              borderRadius: "50%",
              border: "1px solid var(--color-v2-amber)",
              background: "transparent",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-v2-amber)",
              transition: "background 0.2s ease",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dots */}
          <div role="group" aria-label="Navegación de diapositivas" style={{ display: "flex", gap: "4px" }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a diapositiva ${i + 1} de ${SLIDES.length}`}
                aria-current={i === current ? "true" : undefined}
                style={{
                  width: "44px", height: "44px",
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: i === current ? "22px" : "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: i === current ? "var(--color-v2-amber)" : "var(--color-v2-sage)",
                    transition: "all 300ms ease",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            aria-label="Siguiente diapositiva"
            style={{
              width: "44px", height: "44px",
              borderRadius: "50%",
              border: "1px solid var(--color-v2-amber)",
              background: "transparent",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-v2-amber)",
              transition: "background 0.2s ease",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Responsive grid style (desktop: 2 columns) */}
      <style>{`
        @media (min-width: 768px) {
          .md-carousel-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
