"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * CarouselV2 — "Campaign" carousel fiel al diseño ChatGPT reference.
 * 3 slides, texto izquierda + imagen derecha, fondo sage, auto-avance 5.5s.
 * Flechas prev/next, dots, pausa, teclado, swipe táctil.
 */

type Slide = {
  line1: string;
  line2: string;
  body: string;
  cta: string;
  img: string;
  imgAlt: string;
};

const SLIDES: Slide[] = [
  {
    line1: "PEQUEÑOS",
    line2: "ESENCIALES",
    body: "Suaves. Ligeros. Hechos para abrazar.\nPrendas de algodón Pima que acompañan sus primeros días.",
    cta: "Descubre la colección →",
    img: "/products/LC-007.jpeg",
    imgAlt: "Conjunto de algodón Pima Lion Cub",
  },
  {
    line1: "PRIMEROS",
    line2: "ABRAZOS",
    body: "Pequeños detalles, grandes recuerdos.\nConoce nuestra colección Navy, ternura para sus primeros días.",
    cta: "Ver conjunto Navy →",
    img: "/products/LC-001.jpeg",
    imgAlt: "Conjunto Navy Puppy de Lion Cub",
  },
  {
    line1: "DULCES",
    line2: "COMIENZOS",
    body: "Un poquito de flores, un montón de amor.\nFloral Baby, delicadeza para sus primeros momentos.",
    cta: "Ver Floral Baby →",
    img: "/products/LC-002.jpeg",
    imgAlt: "Conjunto Floral Baby de Lion Cub",
  },
];

const PAUSE_MS = 5500;

export default function CarouselV2() {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchRef = useRef<number | null>(null);

  const goTo = useCallback((i: number) => {
    setCur(i);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const goNext = useCallback(() => goTo((cur + 1) % SLIDES.length), [cur, goTo]);
  const goPrev = useCallback(() => goTo((cur - 1 + SLIDES.length) % SLIDES.length), [cur, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(goNext, PAUSE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [cur, paused, goNext]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchRef.current;
    if (Math.abs(dx) > 40) dx < 0 ? goNext() : goPrev();
    touchRef.current = null;
  };

  const s = SLIDES[cur];

  return (
    <section
      aria-label="Colecciones destacadas"
      style={{ background: "#d5d5bd", overflow: "hidden", position: "relative" }}
    >
      <div
        className="lc-cmp-shell"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-roledescription="carrusel"
      >
        {/* Slide */}
        <div className="lc-cmp-slide">
          <div className="lc-cmp-copy">
            <h2>
              {s.line1}<br/>
              <span style={{ color: "#ffa486" }}>{s.line2}</span>
            </h2>
            <div className="lc-heartline" aria-hidden>♥</div>
            <p style={{ whiteSpace: "pre-line" }}>{s.body}</p>
            <a href="#favoritos" className="lc-textlink">{s.cta}</a>
          </div>
          <div className="lc-cmp-img-wrap">
            <Image
              src={s.img}
              alt={s.imgAlt}
              width={520}
              height={560}
              style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "clamp(8px,2vw,18px)" }}
              priority={cur === 0}
            />
          </div>
        </div>

        {/* Doodle sol */}
        <svg className="lc-cmp-sun" aria-hidden viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="10" stroke="#ffa486" strokeWidth="2" strokeLinecap="round"/>
          {[0,45,90,135,180,225,270,315].map((d, i) => {
            const r = d * Math.PI / 180;
            return <line key={i} x1={30+15*Math.cos(r)} y1={30+15*Math.sin(r)} x2={30+21*Math.cos(r)} y2={30+21*Math.sin(r)} stroke="#ffa486" strokeWidth="2" strokeLinecap="round"/>;
          })}
        </svg>
      </div>

      {/* Controls */}
      <button className="lc-cmp-btn lc-cmp-prev" onClick={goPrev} aria-label="Colección anterior">←</button>
      <button className="lc-cmp-btn lc-cmp-next" onClick={goNext} aria-label="Siguiente colección">→</button>
      <div className="lc-cmp-dots" role="tablist" aria-label="Navegación de slides">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === cur}
            aria-label={`Mostrar colección ${i + 1}`}
            onClick={() => goTo(i)}
            style={{
              width: i === cur ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === cur ? "#171815" : "rgba(23,24,21,.35)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width .3s, background .3s",
            }}
          />
        ))}
        <button
          className="lc-cmp-pause"
          onClick={() => setPaused(p => !p)}
          aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"}
          aria-pressed={paused}
        >
          {paused ? "▶" : "Ⅱ"}
        </button>
      </div>

      <style>{`
        .lc-cmp-shell {
          max-width:1200px;
          margin:0 auto;
          padding: clamp(2.5rem,6vw,5rem) clamp(1rem,5vw,3rem);
          position:relative;
          outline:none;
        }
        .lc-cmp-slide {
          display:grid;
          grid-template-columns:1fr 1fr;
          align-items:center;
          gap:clamp(1.5rem,4vw,3.5rem);
          min-height:380px;
        }
        .lc-cmp-copy {
          order:0;
        }
        .lc-cmp-copy h2 {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:700;
          font-size:clamp(2rem,5vw,3.5rem);
          line-height:1.05;
          color:#171815;
          letter-spacing:-.02em;
          margin:0 0 .5rem;
        }
        .lc-cmp-copy p {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-size:clamp(.9rem,1.8vw,1.05rem);
          color:#3d3c30;
          line-height:1.65;
          margin:.75rem 0 1.5rem;
        }
        .lc-textlink {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:700;
          font-size:.95rem;
          color:#171815;
          text-decoration:none;
          border-bottom:2px solid #ffa486;
          padding-bottom:2px;
          transition:color .2s,border-color .2s;
        }
        .lc-textlink:hover { color:#ffa486; }
        .lc-cmp-img-wrap {
          height:clamp(260px,40vw,480px);
          border-radius:clamp(8px,2vw,18px);
          overflow:hidden;
        }
        .lc-cmp-sun { position:absolute; bottom:20px; right:clamp(16px,4vw,60px); width:44px; height:44px; opacity:.6; }
        .lc-cmp-btn {
          position:absolute;
          top:50%;
          transform:translateY(-50%);
          width:44px; height:44px;
          border-radius:50%;
          border:2px solid #171815;
          background:#faf7f6;
          color:#171815;
          font-size:1.1rem;
          cursor:pointer;
          transition:background .2s,color .2s;
          z-index:2;
        }
        .lc-cmp-btn:hover { background:#171815; color:#faf7f6; }
        .lc-cmp-prev { left:clamp(6px,2vw,24px); }
        .lc-cmp-next { right:clamp(6px,2vw,24px); }
        .lc-cmp-dots {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          padding-bottom:clamp(1.5rem,4vw,3rem);
        }
        .lc-cmp-pause {
          background:none;
          border:none;
          font-size:.75rem;
          color:#171815;
          cursor:pointer;
          padding:4px 6px;
          opacity:.65;
        }
        @media(max-width:640px){
          .lc-cmp-slide {
            grid-template-columns:1fr;
          }
          .lc-cmp-img-wrap { order:-1; height:clamp(200px,55vw,320px); }
        }
      `}</style>
    </section>
  );
}
