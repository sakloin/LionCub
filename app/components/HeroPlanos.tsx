"use client";

/**
 * Lion Cub — Hero "modo ligero" (6 planos K01–K06, cross-fade + Ken Burns por scroll)
 * ────────────────────────────────────────────────────────────────────────────────────
 * Narrativa: K01 campo de algodón → K02 fibras → K03 macro manta →
 *            K04 abrazo mamá+bebé → K05 mano acercándose → K06 caricia + slogan.
 *
 * Contrato de imágenes (Heber coloca los WebP de Drive/web/ aquí):
 *   /public/hero/planos/desktop/K01.webp … K06.webp   (1920×1080)
 *   /public/hero/planos/mobile/K01.webp  … K06.webp   (1080×1920)
 *   /public/hero/poster-desktop.webp   /public/hero/poster-mobile.webp   (= K04)
 *
 * Mientras las imágenes no existan el hero muestra el fondo marfil + slogan.
 * prefers-reduced-motion → poster estático + slogan como texto.
 */

import { useEffect, useRef, useState } from "react";

const PLANES = 6;
const SCROLL_VH = PLANES * 90; // ≈540vh — recorrido total del cinematic scroll
const K = Array.from({ length: PLANES }, (_, i) => `K0${i + 1}`);

export default function HeroPlanos() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef  = useRef(0);
  const [reduced,  setReduced]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sloganIn, setSloganIn] = useState(false);

  // Detectar reduced-motion y breakpoint móvil
  useEffect(() => {
    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqM = window.matchMedia("(max-width: 768px)");
    const upd = () => { setReduced(mqR.matches); setIsMobile(mqM.matches); };
    upd();
    mqR.addEventListener("change", upd);
    mqM.addEventListener("change", upd);
    return () => { mqR.removeEventListener("change", upd); mqM.removeEventListener("change", upd); };
  }, []);

  // Scroll → cross-fade + Ken Burns
  useEffect(() => {
    if (reduced) return;

    const seg  = 1 / PLANES;
    const fade = seg * 0.9; // ventana de solape entre planos

    const opacityFor = (p: number, i: number) => {
      const center = (i + 0.5) * seg;
      let o = 1 - Math.abs(p - center) / fade;
      if (i === 0 && p < center) o = 1;           // sostener primer plano al inicio
      if (i === PLANES - 1 && p > center) o = 1;  // sostener último plano al final
      return Math.max(0, Math.min(1, o));
    };

    const render = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect  = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p     = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      imgRefs.current.forEach((img: HTMLImageElement | null, i: number) => {
        if (!img) return;
        const o = opacityFor(p, i);
        img.style.opacity   = String(o);
        img.style.transform = `scale(${(1 + 0.04 * (1 - o)).toFixed(4)})`; // leve zoom Ken Burns
      });
      setSloganIn(p > 0.8); // slogan aparece durante K06
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(render);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", render);
    render();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", render);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, isMobile]);

  const dir    = isMobile ? "mobile" : "desktop";
  const poster = isMobile ? "/hero/poster-mobile.webp" : "/hero/poster-desktop.webp";

  // Fallback para reduced-motion: poster estático
  if (reduced) {
    return (
      <section
        aria-label="Del algodón al abrazo"
        style={{ position: "relative", height: "100svh", background: "var(--background)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt="Mamá abrazando a su bebé envuelto en una manta de algodón Pima"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <HeroOverlay show />
      </section>
    );
  }

  return (
    <section
      ref={wrapRef}
      aria-label="Del algodón al abrazo"
      style={{ position: "relative", height: `${SCROLL_VH}vh`, background: "var(--background)" }}
    >
      <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}>
        {K.map((k, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={k}
            ref={(el: HTMLImageElement | null) => { imgRefs.current[i] = el; }}
            src={`/hero/planos/${dir}/${k}.webp`}
            alt={i === 3 ? "Mamá abrazando a su bebé envuelto en la manta de algodón Pima" : ""}
            aria-hidden={i !== 3}
            /* fetchPriority es prop estándar en React 19 */
            {...(i === 0 ? { fetchPriority: "high" } : {})}
            style={{
              position:   "absolute",
              inset:      0,
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              opacity:    i === 0 ? 1 : 0,
              willChange: "opacity, transform",
              transition: "opacity 120ms linear",
            }}
          />
        ))}

        <HeroOverlay show={sloganIn} />

        {/* Indicador de scroll */}
        {!sloganIn && (
          <div
            aria-hidden
            style={{
              position: "absolute", bottom: "3svh", left: 0, right: 0,
              textAlign: "center", color: "#fff",
              fontFamily: "var(--font-body, Inter, system-ui)",
              fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase",
              opacity: 0.8, textShadow: "0 1px 10px rgba(0,0,0,.4)",
            }}
          >
            Desliza
          </div>
        )}
      </div>
    </section>
  );
}

function HeroOverlay({ show }: { show: boolean }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-end",
        textAlign: "center", padding: "0 24px 12svh", pointerEvents: "none",
      }}
    >
      <h1
        style={{
          fontFamily:  "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
          fontWeight:  300,
          color:       "#fff",
          fontSize:    "clamp(2rem, 5vw, 3.5rem)",
          lineHeight:  1.1,
          margin:      0,
          textShadow:  "0 2px 24px rgba(0,0,0,.4)",
          opacity:     show ? 1 : 0,
          transform:   show ? "none" : "translateY(16px)",
          transition:  "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        Suave como la caricia de mamá.
      </h1>
      <a
        href="#coleccion"
        style={{
          pointerEvents: "auto",
          marginTop:     "1.5rem",
          fontFamily:    "var(--font-body, Inter, system-ui)",
          fontSize:      ".8rem",
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color:         "#1a1410",
          background:    "#fdf8f0",
          padding:       "14px 26px",
          borderRadius:  "999px",
          textDecoration:"none",
          opacity:       show ? 1 : 0,
          transition:    "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        Descubre la colección
      </a>
    </div>
  );
}
