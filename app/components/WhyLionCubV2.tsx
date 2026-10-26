/**
 * WhyLionCubV2 — "¿Por qué Lion Cub?" con 3 razones + diagrama de prenda
 * No contiene claims médicos ("hipoalergénico", "dermatológicamente testeado")
 * sin evidencia — solo ventajas verificables del algodón pima.
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

const GARMENT_FEATURES = [
  { side: "left",  top: "15%", label: "Cuello suave\nsin costuras incómodas" },
  { side: "left",  top: "42%", label: "Broches a presión\nde fácil apertura" },
  { side: "right", top: "20%", label: "Fibra larga pima\nextra suave" },
  { side: "right", top: "50%", label: "Elástico suave\nen cintura y puños" },
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

        {/* Diagrama de prenda */}
        <div
          style={{
            background: "var(--color-v2-wave)",
            borderRadius: "clamp(16px, 3vw, 24px)",
            padding: "clamp(2rem, 5vw, 3.5rem)",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "clamp(1.5rem, 3vw, 2rem)",
          }}
          className="diagram-wrapper"
        >
          <p
            style={{
              fontFamily: "var(--font-title)",
              fontWeight: 700,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "var(--color-ink)",
              margin: 0,
              textAlign: "center",
            }}
          >
            Cada detalle pensado para el bebé
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(1rem, 4vw, 3rem)",
              width: "100%",
              maxWidth: "700px",
              flexWrap: "wrap",
            }}
          >
            {/* Left labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "flex-end", flex: "1 1 160px", minWidth: "0" }}>
              {GARMENT_FEATURES.filter(f => f.side === "left").map(f => (
                <div key={f.label} style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-title)",
                      fontSize: "clamp(0.78rem, 1.3vw, 0.9rem)",
                      lineHeight: 1.4,
                      color: "var(--color-ink-soft)",
                      margin: 0,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {f.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Garment silhouette */}
            <div style={{ flexShrink: 0 }}>
              <svg width="160" height="200" viewBox="0 0 160 200" fill="none" aria-label="Diagrama de prenda Lion Cub">
                {/* Body */}
                <rect x="45" y="80" width="70" height="100" rx="8" fill="white" stroke="var(--color-v2-amber)" strokeWidth="1.5"/>
                {/* Neck */}
                <ellipse cx="80" cy="80" rx="16" ry="8" fill="white" stroke="var(--color-v2-amber)" strokeWidth="1.5"/>
                {/* Shoulders */}
                <path d="M45 80 C20 70 10 90 15 110 L45 105 Z" fill="white" stroke="var(--color-v2-amber)" strokeWidth="1.5"/>
                <path d="M115 80 C140 70 150 90 145 110 L115 105 Z" fill="white" stroke="var(--color-v2-amber)" strokeWidth="1.5"/>
                {/* Snaps */}
                <circle cx="80" cy="160" r="4" fill="var(--color-v2-amber)" opacity="0.6"/>
                <circle cx="80" cy="175" r="4" fill="var(--color-v2-amber)" opacity="0.6"/>
                <circle cx="80" cy="190" r="4" fill="var(--color-v2-amber)" opacity="0.6"/>
                {/* Dotted center line */}
                <line x1="80" y1="95" x2="80" y2="150" stroke="var(--color-v2-amber)" strokeWidth="1" strokeDasharray="4 4"/>
                {/* Dotted lines to labels */}
                <line x1="64" y1="88" x2="20" y2="100" stroke="var(--color-v2-amber)" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="65" y1="125" x2="20" y2="145" stroke="var(--color-v2-amber)" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="96" y1="88" x2="140" y2="100" stroke="var(--color-v2-amber)" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="95" y1="125" x2="140" y2="145" stroke="var(--color-v2-amber)" strokeWidth="1" strokeDasharray="3 3"/>
              </svg>
            </div>

            {/* Right labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "flex-start", flex: "1 1 160px", minWidth: "0" }}>
              {GARMENT_FEATURES.filter(f => f.side === "right").map(f => (
                <div key={f.label}>
                  <p
                    style={{
                      fontFamily: "var(--font-title)",
                      fontSize: "clamp(0.78rem, 1.3vw, 0.9rem)",
                      lineHeight: 1.4,
                      color: "var(--color-ink-soft)",
                      margin: 0,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {f.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div aria-hidden style={{ lineHeight: 0, marginTop: "clamp(3rem, 6vw, 4rem)", marginLeft: "-clamp(1.25rem,5vw,3rem)", marginRight: "-clamp(1.25rem,5vw,3rem)" }}>
        <svg viewBox="0 0 1440 70" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,35 C320,70 640,10 960,45 C1120,65 1320,30 1440,40 L1440,70 L0,70 Z" fill="var(--color-v2-sage)"/>
        </svg>
      </div>
    </section>
  );
}
