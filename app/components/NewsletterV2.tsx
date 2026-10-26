"use client";

import { useState } from "react";

/**
 * NewsletterV2 — Sección de suscripción al final de la página.
 * NOTA: El formulario es visual/estructural. Para conectarlo a un proveedor de email
 * (Mailchimp, Klaviyo, etc.) se requiere configuración adicional.
 * No se simula que el email fue registrado — se confirma solo la acción local.
 */

type SubmitState = "idle" | "loading" | "success" | "error";

export default function NewsletterV2() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Por favor ingresa un correo válido.");
      return;
    }
    setErrorMsg("");
    setState("loading");

    // Sin proveedor conectado: simular solo el estado visual.
    // Para activar: conectar a Klaviyo/Mailchimp/n8n con la API correspondiente.
    setTimeout(() => {
      setState("success");
    }, 900);
  };

  return (
    <section
      aria-label="Suscribirse a novedades"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Onda superior */}
      <div aria-hidden style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        lineHeight: 0,
        pointerEvents: "none",
      }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%" }}>
          <path d="M0,0 L1440,0 L1440,60 C1200,30 960,60 720,40 C480,20 240,55 0,30 Z" fill="var(--color-v2-wave)"/>
        </svg>
      </div>

      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "clamp(2rem, 5vw, 3rem)",
        alignItems: "center",
        paddingTop: "clamp(1rem, 2vw, 1.5rem)",
      }} className="newsletter-layout">

        {/* Columna de contenido */}
        <div style={{
          display: "flex",
          flexDirection: "column",
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
            Mantente al día
          </p>

          {/* Título */}
          <h2 style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
            color: "var(--color-ink)",
            margin: 0,
            lineHeight: 1.15,
          }}>
            Recibe novedades<br />
            <span style={{ color: "var(--color-v2-amber)" }}>de Lion Cub</span>
          </h2>

          {/* Descripción */}
          <p style={{
            fontFamily: "var(--font-title)",
            fontWeight: 400,
            fontSize: "clamp(0.9rem, 1.8vw, 1rem)",
            lineHeight: 1.6,
            color: "var(--color-ink-soft)",
            margin: 0,
            maxWidth: "36ch",
          }}>
            Nuevas colecciones, consejos de cuidado para tu bebé y ofertas exclusivas.
            Sin spam, solo lo que importa.
          </p>

          {/* Formulario */}
          {state === "success" ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 20px",
              background: "rgba(192,138,74,0.08)",
              borderRadius: "14px",
              border: "1px solid rgba(192,138,74,0.25)",
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M4 10l4 4 8-8" stroke="var(--color-v2-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{
                fontFamily: "var(--font-title)",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "var(--color-v2-amber)",
                margin: 0,
              }}>
                ¡Gracias! Te avisaremos cuando haya novedades.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "420px" }}
            >
              <label htmlFor="newsletter-email" style={{
                fontFamily: "var(--font-title)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-ink-soft)",
              }}>
                Correo electrónico
              </label>

              <div style={{
                display: "flex",
                borderRadius: "999px",
                border: "1.5px solid rgba(192,138,74,0.45)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.7)",
                transition: "border-color 0.2s ease",
              }}>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  disabled={state === "loading"}
                  aria-describedby={errorMsg ? "newsletter-error" : undefined}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "13px 20px",
                    fontFamily: "var(--font-title)",
                    fontSize: "0.9rem",
                    color: "var(--color-ink)",
                    background: "transparent",
                  }}
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  style={{
                    padding: "0 22px",
                    background: "var(--color-v2-cta)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0 999px 999px 0",
                    fontFamily: "var(--font-title)",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: state === "loading" ? "wait" : "pointer",
                    transition: "background 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                >
                  {state === "loading" ? "..." : (
                    <>
                      Suscribirse
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <p id="newsletter-error" role="alert" style={{
                  fontFamily: "var(--font-title)",
                  fontSize: "0.82rem",
                  color: "#c0392b",
                  margin: 0,
                }}>
                  {errorMsg}
                </p>
              )}

              <p style={{
                fontFamily: "var(--font-title)",
                fontSize: "0.75rem",
                color: "var(--color-ink-mute)",
                margin: 0,
                opacity: 0.65,
              }}>
                Sin spam. Cancela cuando quieras.
              </p>
            </form>
          )}
        </div>

        {/* Columna decorativa — sobre + prenda + doodles */}
        <div className="newsletter-illustration" style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "clamp(160px, 28vw, 240px)",
        }} aria-hidden>
          {/* Sobre estilizado */}
          <svg width="clamp(120px,22vw,180px)" height="clamp(90px,16vw,135px)" viewBox="0 0 180 135" fill="none">
            {/* Cuerpo del sobre */}
            <rect x="8" y="30" width="164" height="97" rx="10" fill="var(--color-v2-wave)" stroke="var(--color-v2-amber)" strokeWidth="1.8"/>
            {/* Solapa V */}
            <path d="M8 40 L90 88 L172 40" stroke="var(--color-v2-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {/* Líneas interiores */}
            <line x1="30" y1="100" x2="90" y2="100" stroke="var(--color-v2-amber)" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
            <line x1="30" y1="112" x2="74" y2="112" stroke="var(--color-v2-amber)" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
            {/* Corazón sello */}
            <path d="M140 58 C140 58 132 52 132 46 C132 43 134.7 41 138 41 C139.6 41 141 42 141.5 43.5 L143 45.5 L144.5 43.5 C145 42 146.4 41 148 41 C151.3 41 154 43 154 46 C154 52 143 58 143 58Z"
              fill="var(--color-v2-cta)" opacity="0.7"/>
          </svg>

          {/* Doodles alrededor */}
          <svg style={{ position: "absolute", top: "5%", right: "15%", opacity: 0.48 }} width="22" height="22" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="9" stroke="var(--color-v2-amber)" strokeWidth="1.8"/>
            {[0,60,120,180,240,300].map((deg, i) => {
              const rad = deg * Math.PI / 180;
              return <line key={i} x1={26+14*Math.cos(rad)} y1={26+14*Math.sin(rad)} x2={26+20*Math.cos(rad)} y2={26+20*Math.sin(rad)} stroke="var(--color-v2-amber)" strokeWidth="1.8" strokeLinecap="round"/>;
            })}
          </svg>

          <svg style={{ position: "absolute", bottom: "10%", left: "12%", opacity: 0.45 }} width="20" height="18" viewBox="0 0 34 30" fill="none">
            <path d="M17 27C17 27 3 19 3 10C3 6.7 5.7 4 9 4C11.6 4 13.9 5.6 15.2 8L17 10.5L18.8 8C20.1 5.6 22.4 4 25 4C28.3 4 31 6.7 31 10C31 19 17 27 17 27Z"
              stroke="var(--color-v2-cta)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .newsletter-layout { grid-template-columns: 3fr 2fr !important; }
        }
        @media (max-width: 767px) {
          .newsletter-illustration { display: none; }
        }
      `}</style>
    </section>
  );
}
