import Image from "next/image";

/**
 * WhyLionCubV2 — "¿Por qué Lion Cub?" con 3 razones + foto de producto con callouts
 * Sin claims médicos. Solo ventajas verificables del algodón pima.
 */

const REASONS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="14" stroke="var(--color-v2-amber)" strokeWidth="1.5"/>
        <path d="M10 16.5C10 13.467 12.686 11 16 11C19.314 11 22 13.467 22 16.5C22 19.533 19.314 22 16 22" stroke="var(--color-v2-amber)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 22C14.343 22 13 20.657 13 19C13 17.343 14.343 16 16 16C17.657 16 19 17.343 19 19" stroke="var(--color-v2-amber)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "100% algodón pima",
    body: "La fibra larga del algodón pima peruano produce una tela excepcionalmente suave y resistente al lavado.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="14" stroke="var(--color-v2-amber)" strokeWidth="1.5"/>
        <path d="M11 16C11 12 16 9 16 9C16 9 21 12 21 16C21 20 18 22 16 22C14 22 11 20 11 16Z" stroke="var(--color-v2-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 9V22" stroke="var(--color-v2-amber)" strokeWidth="1.5" strokeDasharray="2 2"/>
      </svg>
    ),
    title: "Hecho en Perú",
    body: "Producción local que apoya el trabajo artesanal peruano y garantiza trazabilidad desde la fibra.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="14" stroke="var(--color-v2-amber)" strokeWidth="1.5"/>
        <path d="M10 18L14 22L22 12" stroke="var(--color-v2-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Diseñado para crecer",
    body: "Ojales, broches y costuras pensadas para el movimiento del bebé y para que las prendas duren más.",
  },
];

const PHOTO_FEATURES = [
  { side: "left",  title: "100% algodón pima", body: "Fibra larga del pima peruano — más suave y resistente al lavado." },
  { side: "left",  title: "Broches seguros",   body: "Cierres a presión fáciles de abrir para cambios rápidos." },
  { side: "right", title: "Costuras internas", body: "Sin costuras ásperas: la piel sensible del bebé lo nota." },
  { side: "right", title: "Tela transpirable", body: "Regula la temperatura en climas cálidos sin incomodar." },
];

export default function WhyLionCubV2() {
  return (
    <section
      aria-label="¿Por qué Lion Cub?"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--color-v2-amber)",
              marginBottom: "0.75rem",
              opacity: 0.85,
            }}
          >
            Nuestra promesa
          </p>
          <h2
            style={{
              fontFamily: "var(--font-title)",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            ¿Por qué Lion Cub?
          </h2>
        </div>

        {/* 3 razones */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "clamp(1.5rem, 3vw, 2.5rem)",
            marginBottom: "clamp(3rem, 7vw, 5rem)",
          }}
        >
          {REASONS.map(r => (
            <div key={r.title} style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "56px", height: "56px",
                  borderRadius: "14px",
                  background: "var(--color-v2-wave)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {r.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-title)",
                  fontWeight: 700,
                  fontSize: "clamp(1rem, 2vw, 1.15rem)",
                  color: "var(--color-ink)",
                  margin: 0,
                }}
              >
                {r.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-title)",
                  fontWeight: 400,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: "var(--color-ink-soft)",
                  margin: 0,
                }}
              >
                {r.body}
              </p>
            </div>
          ))}
        </div>

        {/* ── Foto de producto + callouts ── */}
        <div style={{ textAlign: "center", marginBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
          <p
            style={{
              fontFamily: "var(--font-title)",
              fontWeight: 700,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Cada detalle, pensado para tu bebé
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(1.25rem, 4vw, 3.5rem)",
            flexWrap: "wrap",
          }}
          className="photo-callout-layout"
        >
          {/* Left callouts */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(1.5rem, 3vw, 2.5rem)",
              flex: "1 1 190px",
              minWidth: 0,
              maxWidth: "220px",
              alignItems: "flex-end",
              textAlign: "right",
            }}
          >
            {PHOTO_FEATURES.filter(f => f.side === "left").map(f => (
              <div key={f.title}>
                <p
                  style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 700,
                    fontSize: "clamp(0.82rem, 1.4vw, 0.95rem)",
                    color: "var(--color-ink)",
                    margin: "0 0 4px",
                  }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 400,
                    fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)",
                    lineHeight: 1.5,
                    color: "var(--color-ink-soft)",
                    margin: 0,
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          {/* Foto con forma orgánica */}
          <div
            style={{
              position: "relative",
              width: "clamp(210px, 32vw, 300px)",
              aspectRatio: "3/4",
              borderRadius: "58% 42% 50% 50% / 60% 55% 45% 40%",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 8px 32px rgba(26,20,16,0.13)",
            }}
          >
            <Image
              src="/products/LC-019.jpeg"
              alt="Detalle de tejido — Hilo de Algodón Nativo en 100% pima peruano"
              fill
              style={{ objectFit: "cover", objectPosition: "center top" }}
              sizes="(min-width: 768px) 32vw, 80vw"
            />
          </div>

          {/* Right callouts */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(1.5rem, 3vw, 2.5rem)",
              flex: "1 1 190px",
              minWidth: 0,
              maxWidth: "220px",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            {PHOTO_FEATURES.filter(f => f.side === "right").map(f => (
              <div key={f.title}>
                <p
                  style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 700,
                    fontSize: "clamp(0.82rem, 1.4vw, 0.95rem)",
                    color: "var(--color-ink)",
                    margin: "0 0 4px",
                  }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-title)",
                    fontWeight: 400,
                    fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)",
                    lineHeight: 1.5,
                    color: "var(--color-ink-soft)",
                    margin: 0,
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colina orgánica inferior */}
      <div aria-hidden style={{ lineHeight: 0, marginTop: "clamp(3rem, 6vw, 4rem)", marginLeft: "-clamp(1.25rem,5vw,3rem)", marginRight: "-clamp(1.25rem,5vw,3rem)" }}>
        <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block" }}>
          <path d="M0,110 C300,50 540,165 800,100 C1000,55 1220,155 1440,95 L1440,180 L0,180 Z" fill="var(--color-v2-sage)"/>
        </svg>
      </div>

      <style>{`
        .photo-callout-layout {
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .photo-callout-layout {
            flex-direction: column !important;
            align-items: center !important;
          }
          .photo-callout-layout > div:first-child,
          .photo-callout-layout > div:last-child {
            max-width: 100% !important;
            flex: unset !important;
            text-align: left !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}
