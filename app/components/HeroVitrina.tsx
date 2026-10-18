"use client";

/**
 * Lion Cub — Hero "Vitrina lateral con auto-rotación"
 * ────────────────────────────────────────────────────
 * Desktop ≥768px: columna de texto izquierda + vitrina derecha (cross-fade + Ken Burns).
 * Móvil <768px: imagen arriba (gradiente top→bottom) + texto abajo.
 * El layout es CSS (.lc-hero* en globals.css) y las imágenes usan <picture>:
 * el HTML del servidor ya sale bien en móvil (sin salto al hidratar ni doble descarga).
 * prefers-reduced-motion: no rota ni anima (Ken Burns apagado por CSS).
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
  const [reduced, setReduced] = useState(false);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Solo se escucha la preferencia de movimiento reducido (para no rotar).
  // El layout móvil/escritorio lo resuelve CSS (.lc-hero*) y las imágenes
  // <picture>: el HTML del servidor ya sale correcto en ambos tamaños.
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

  function goTo(i: number) {
    if (i === current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPrev(current);
    setCurrent(i);
    setTimeout(() => setPrev(null), FADE_MS + 50);
  }

  return (
    <section aria-label="Del algodón al abrazo" className="lc-hero">
      {/* ── Vitrina ── */}
      <div className="lc-hero-media">
        {/* Capa desenfocada (solo escritorio, por CSS). Usa las mismas URLs que
            la imagen principal: no agrega descargas. */}
        <div aria-hidden className="lc-hero-blur">
          <SlidePicture slide={slide} alt="" imgClassName="lc-hero-blur-img" />
        </div>

        {prevSlide && (
          <SlidePicture
            key={`prev-${prev}`}
            slide={prevSlide}
            alt=""
            hidden
            imgClassName="lc-hero-img"
            style={{ opacity: 0, transition: `opacity ${FADE_MS}ms linear` }}
          />
        )}

        <SlidePicture
          key={`cur-${current}`}
          slide={slide}
          alt={slide.alt}
          hidden={!slide.alt}
          highPriority={current === 0}
          imgClassName="lc-hero-img lc-hero-img-kb"
          style={{
            opacity: 1,
            transition: `opacity ${FADE_MS}ms linear`,
            animationDuration: `${PAUSE_MS + FADE_MS}ms`,
          }}
        />

        {/* Puntos: botones de 44 px con el punto visible dentro */}
        <div className="lc-hero-dots" role="group" aria-label="Imágenes del inicio">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver imagen ${i + 1} de ${SLIDES.length}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => goTo(i)}
              className="lc-hero-dot"
            >
              <span aria-hidden className={i === current ? "lc-hero-dot-mark is-on" : "lc-hero-dot-mark"} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Texto ── */}
      <div className="lc-hero-text">
        <TextContent />
      </div>
    </section>
  );
}

function SlidePicture({
  slide, alt, hidden = false, highPriority = false, imgClassName, style,
}: {
  slide: Slide;
  alt: string;
  hidden?: boolean;
  highPriority?: boolean;
  imgClassName: string;
  style?: React.CSSProperties;
}) {
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={slide.imgMobile} />
      <img
        src={slide.img}
        alt={alt}
        aria-hidden={hidden || undefined}
        className={imgClassName}
        {...(highPriority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
        style={{ objectPosition: slide.focal, ...style }}
      />
    </picture>
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
        Ropa para bebé tejida en 100&nbsp;% algodón pima peruano,
        hecha para los primeros abrazos y los días que siguen.
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
