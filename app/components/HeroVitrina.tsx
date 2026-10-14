"use client";

/**
 * Lion Cub — Hero "Vitrina lateral con auto-rotación"
 * ────────────────────────────────────────────────────
 * Desktop ≥768px: columna de texto izquierda + vitrina derecha (cross-fade + Ken Burns).
 * Móvil <768px: imagen arriba (gradiente top→bottom) + texto abajo.
 * prefers-reduced-motion: poster estático K04 + texto sin animación.
 */

import { useEffect, useRef, useState } from "react";

type Slide = {
  img: string;
  imgMobile: string;
  focal: string;
  alt: string;
  href?: string;
};

const SLIDES: Slide[] = [
  { img: "/hero/planos/desktop/K01.webp", imgMobile: "/hero/planos/mobile/K01.webp", focal: "50% 60%", alt: "" },
  { img: "/hero/planos/desktop/K02.webp", imgMobile: "/hero/planos/mobile/K02.webp", focal: "50% 50%", alt: "" },
  { img: "/hero/planos/desktop/K03.webp", imgMobile: "/hero/planos/mobile/K03.webp", focal: "50% 50%", alt: "" },
  { img: "/hero/planos/desktop/K04.webp", imgMobile: "/hero/planos/mobile/K04.webp", focal: "50% 30%", alt: "Mamá abrazando a su bebé envuelto en una manta de algodón Pima" },
  { img: "/hero/planos/desktop/K05.webp", imgMobile: "/hero/planos/mobile/K05.webp", focal: "50% 40%", alt: "" },
  { img: "/hero/planos/desktop/K06.webp", imgMobile: "/hero/planos/mobile/K06.webp", focal: "50% 40%", alt: "" },
];

const PAUSE_MS = 4500;
const FADE_MS  = 800;

export default function HeroVitrina() {
  const [reduced, setReduced]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [current, setCurrent]   = useState(0);
  const [prev, setPrev]         = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqM = window.matchMedia("(max-width: 767px)");
    const upd = () => { setReduced(mqR.matches); setIsMobile(mqM.matches); };
    upd();
    mqR.addEventListener("change", upd);
    mqM.addEventListener("change", upd);
    return () => { mqR.removeEventListener("change", upd); mqM.removeEventListener("change", upd); };
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
  const src = (s: Slide) => isMobile ? s.imgMobile : s.img;

  if (reduced) {
    return (
      <section
        aria-label="Del algodón al abrazo"
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          background: "var(--background)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isMobile ? "/hero/poster-mobile.webp" : "/hero/poster-desktop.webp"}
          alt="Mamá abrazando a su bebé envuelto en una manta de algodón Pima"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "relative", zIndex: 2, padding: "0 24px 8svh", maxWidth: "480px", marginLeft: "8%" }}>
          <TextContent />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Del algodón al abrazo"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        background: "var(--background)",
        overflow: "hidden",
      }}
    >
      {/* ── Vitrina ── */}
      <div
        style={{
          order: isMobile ? 0 : 1,
          position: "relative",
          flex: isMobile ? "none" : 1,
          height: isMobile ? "60svh" : "min(88vh, 720px)",
          alignSelf: isMobile ? "auto" : "center",
          borderRadius: isMobile ? 0 : "0 0 0 0",
          overflow: "hidden",
        }}
      >
        {/* Blurry layer — visible only on desktop, masked to left edge */}
        {!isMobile && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(slide)}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: slide.focal,
                filter: "blur(20px)",
                transform: "scale(1.08)",
                WebkitMaskImage: "linear-gradient(to right, black 0%, black 20%, transparent 62%)",
                maskImage: "linear-gradient(to right, black 0%, black 20%, transparent 62%)",
              }}
            />
          </div>
        )}

        {/* Previous slide (fading out) */}
        {prevSlide && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`prev-${prev}`}
            src={src(prevSlide)}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: prevSlide.focal,
              opacity: 0,
              transition: `opacity ${FADE_MS}ms linear`,
              WebkitMaskImage: isMobile
                ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                : "linear-gradient(to left, black 55%, transparent 100%)",
              maskImage: isMobile
                ? "linear-gradient(to bottom, black 60%, transparent 100%)"
                : "linear-gradient(to left, black 55%, transparent 100%)",
            }}
          />
        )}

        {/* Current slide (sharp, Ken Burns) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`cur-${current}`}
          src={src(slide)}
          alt={slide.alt}
          aria-hidden={!slide.alt}
          {...(current === 0 ? { fetchPriority: "high" as "high" } : {})}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: slide.focal,
            opacity: 1,
            transition: `opacity ${FADE_MS}ms linear`,
            animationName: "lc-ken-burns",
            animationDuration: `${PAUSE_MS + FADE_MS}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
            WebkitMaskImage: isMobile
              ? "linear-gradient(to bottom, black 60%, transparent 100%)"
              : "linear-gradient(to left, black 55%, transparent 100%)",
            maskImage: isMobile
              ? "linear-gradient(to bottom, black 60%, transparent 100%)"
              : "linear-gradient(to left, black 55%, transparent 100%)",
          }}
        />

        {/* Dots */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: isMobile ? "12px" : "16px",
            right: isMobile ? "50%" : "20px",
            transform: isMobile ? "translateX(50%)" : "none",
            display: "flex",
            gap: "6px",
            zIndex: 3,
          }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                setPrev(current);
                setCurrent(i);
                setTimeout(() => setPrev(null), FADE_MS + 50);
              }}
              style={{
                width: i === current ? "18px" : "6px",
                height: "6px",
                borderRadius: "999px",
                border: "none",
                background: i === current ? "#fff" : "rgba(255,255,255,0.5)",
                padding: 0,
                cursor: "pointer",
                transition: "all 300ms ease",
                pointerEvents: "auto",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Text column ── */}
      <div
        style={{
          order: isMobile ? 1 : 0,
          flex: isMobile ? "none" : "0 0 42%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "40px 24px 48px" : "0 6% 0 8%",
          zIndex: 2,
          background: isMobile ? "var(--background)" : "transparent",
        }}
      >
        <TextContent />
      </div>
    </section>
  );
}

function TextContent() {
  return (
    <div style={{ maxWidth: "380px" }}>
      <span
        className="lc-eyebrow"
        style={{ display: "block", marginBottom: "20px" }}
      >
        Algodón pima peruano
      </span>

      <h1
        className="lc-display-i"
        style={{
          fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
          lineHeight: 1.08,
          color: "var(--color-ink)",
          margin: "0 0 20px",
          letterSpacing: "-0.015em",
        }}
      >
        Suave como la caricia de mamá.
      </h1>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
          lineHeight: 1.65,
          color: "var(--color-ink-soft)",
          margin: "0 0 36px",
        }}
      >
        Ropa para bebé tejida en 100&nbsp;% algodón pima de Piura,
        hipoalergénica y transpirable — hecha para los primeros abrazos
        y los días que siguen.
      </p>

      <a
        href="#coleccion"
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-bg)",
          background: "var(--color-ink)",
          padding: "14px 28px",
          borderRadius: "999px",
          textDecoration: "none",
          transition: "background 200ms ease, transform 200ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-gold-deep)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-ink)";
        }}
      >
        Descubre la colección
      </a>
    </div>
  );
}
