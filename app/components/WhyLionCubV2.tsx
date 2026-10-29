/**
 * WhyLionCubV2 — Máscara orgánica SVG Bézier, 4 círculos de íconos,
 * conexiones Bézier visibles desde las columnas hasta el borde de la foto.
 * Foto central renderizada como SVG <image> nativo (más fiable que CSS clip-path url()).
 */

// Ruta orgánica en coordenadas viewBox 0 0 100 100 (= objectBoundingBox × 100).
const PHOTO_CLIP_PATH_100 =
  "M 52,3 C 68,0 86,7 95,22 " +
  "C 102,34 102,50 98,62 " +
  "C 94,76 86,86 74,94 " +
  "C 62,102 48,102 36,98 " +
  "C 22,92 10,82 4,68 " +
  "C -2,54 0,40 4,28 " +
  "C 10,14 22,6 36,2 " +
  "C 44,0 48,2 52,3 Z";

const FEATURES = [
  {
    side: "left",
    title: "100 % algodón pima",
    body: "La fibra larga del pima peruano: suave y resistente al lavado.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 30 30" fill="none" aria-hidden>
        <path d="M 6,20 C 2,20 1,16 3,13 C 5,10 9,9 12,11 C 13,6 17,3 21,3 C 25,3 29,7 29,12 C 30,12 31,16 29,18 C 28,20 25,20 23,20 Z"
          stroke="var(--color-v2-doodle)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    side: "left",
    title: "Hecho en Perú",
    body: "Producción local con trazabilidad desde la fibra.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 30 30" fill="none" aria-hidden>
        <path d="M 15,3 C 15,3 27,7 27,16 C 27,22 21,27 15,27 C 9,27 3,22 3,16 C 3,7 15,3 15,3 Z"
          stroke="var(--color-v2-doodle)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M 15,3 L 15,27"
          stroke="var(--color-v2-doodle)" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    side: "right",
    title: "Tela transpirable",
    body: "Regula la temperatura sin incomodar la piel sensible del bebé.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 30 30" fill="none" aria-hidden>
        <path d="M 4,9 Q 11,6 15,9 Q 19,12 26,9"
          stroke="var(--color-v2-doodle)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 4,15 Q 11,12 15,15 Q 19,18 26,15"
          stroke="var(--color-v2-doodle)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 4,21 Q 11,18 15,21 Q 19,24 26,21"
          stroke="var(--color-v2-doodle)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    side: "right",
    title: "Diseñado para crecer",
    body: "Costuras y broches pensados para el movimiento y la durabilidad.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 30 30" fill="none" aria-hidden>
        <path d="M 8,22 L 22,8" stroke="var(--color-v2-doodle)" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="21" cy="9" rx="3" ry="4.5" transform="rotate(-45 21 9)"
          stroke="var(--color-v2-doodle)" strokeWidth="2" fill="none"/>
        <path d="M 8,22 Q 14,18 18,14"
          stroke="var(--color-v2-doodle)" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const leftFeatures  = FEATURES.filter(f => f.side === "left");
const rightFeatures = FEATURES.filter(f => f.side === "right");

function FeatureItem({ feat, align }: { feat: typeof FEATURES[0]; align: "left" | "right" }) {
  const isLeft = align === "left";
  return (
    <div style={{
      display: "flex",
      flexDirection: isLeft ? "row-reverse" : "row",
      alignItems: "flex-start",
      gap: "0.75rem",
    }}>
      {/* Círculo de ícono — fondo salvia claro */}
      <div style={{
        width: "clamp(56px, 8vw, 72px)",
        height: "clamp(56px, 8vw, 72px)",
        borderRadius: "50%",
        background: "#E8F0E4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {feat.icon}
      </div>
      {/* Texto */}
      <div style={{ textAlign: isLeft ? "right" : "left" }}>
        <p style={{
          fontFamily: "var(--font-title)", fontWeight: 700,
          fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
          color: "var(--color-ink)", margin: "0 0 4px",
        }}>{feat.title}</p>
        <p style={{
          fontFamily: "var(--font-title)", fontWeight: 400,
          fontSize: "clamp(0.8rem, 1.3vw, 0.88rem)",
          lineHeight: 1.5, color: "var(--color-ink-soft)", margin: 0,
        }}>{feat.body}</p>
      </div>
    </div>
  );
}

export default function WhyLionCubV2() {
  return (
    <section
      aria-label="¿Por qué Lion Cub?"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem) clamp(12rem, 18vw, 15rem)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
          <p style={{
            fontFamily: "var(--font-mono, monospace)", fontSize: "11px",
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: "var(--color-v2-amber)", marginBottom: "0.75rem", opacity: 0.85,
          }}>Nuestra promesa</p>
          <h2 style={{
            fontFamily: "var(--font-title)", fontWeight: 700,
            fontSize: "clamp(1.875rem, 4vw, 2.25rem)",
            color: "var(--color-ink)", margin: 0,
          }}>¿Por qué Lion Cub?</h2>
        </div>

        {/* Trust badges row — 3 items horizontales */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "clamp(1.5rem, 4vw, 3rem)",
          flexWrap: "wrap",
          marginBottom: "clamp(2rem, 4vw, 3rem)",
          paddingBottom: "clamp(1.5rem, 3vw, 2rem)",
          borderBottom: "1px solid rgba(192,138,74,0.18)",
        }}>
          {[
            { icon: "🌿", label: "100% Algodón Pima" },
            { icon: "🤍", label: "Suave para la piel" },
            { icon: "🇵🇪", label: "Hecho en Perú" },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontFamily: "var(--font-title)",
              fontWeight: 600,
              fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
              color: "var(--color-ink)",
            }}>
              <span style={{ fontSize: "1.2em" }} aria-hidden>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Layout: columna izq | foto | columna der
            Por qué: position relative para que las conexiones SVG se ubiquen sobre todo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(1.5rem, 4vw, 3rem)",
            flexWrap: "wrap",
            position: "relative",
          }}
          className="why-layout"
        >
          {/* Columna izquierda */}
          <div style={{
            display: "flex", flexDirection: "column",
            gap: "clamp(1.5rem, 3vw, 2rem)",
            flex: "1 1 200px", minWidth: 0, maxWidth: "230px",
          }}>
            {leftFeatures.map(f => (
              <FeatureItem key={f.title} feat={f} align="left" />
            ))}
          </div>

          {/* Foto con máscara orgánica — SVG <image> nativo evita problemas de CSS clip-path url() */}
          <svg
            viewBox="0 0 100 100"
            style={{
              width: "clamp(240px, 36vw, 420px)",
              height: "clamp(240px, 36vw, 420px)",
              display: "block",
              flexShrink: 0,
              overflow: "visible",
            }}
            aria-label="Tejido de algodón pima peruano — textura y costuras Lion Cub"
          >
            <defs>
              <clipPath id="why-photo-clip-svg">
                <path d={PHOTO_CLIP_PATH_100} />
              </clipPath>
            </defs>
            <image
              href="/products/LC-019.jpeg"
              x="0" y="0"
              width="100" height="100"
              preserveAspectRatio="xMidYMin slice"
              clipPath="url(#why-photo-clip-svg)"
            />
          </svg>

          {/* Columna derecha */}
          <div style={{
            display: "flex", flexDirection: "column",
            gap: "clamp(1.5rem, 3vw, 2rem)",
            flex: "1 1 200px", minWidth: 0, maxWidth: "230px",
          }}>
            {rightFeatures.map(f => (
              <FeatureItem key={f.title} feat={f} align="right" />
            ))}
          </div>

          {/* Conexiones Bézier — overlay sobre todo el layout (solo desktop) */}
          <svg
            viewBox="0 0 920 420"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 3,
              overflow: "visible",
            }}
            className="why-connections"
            aria-hidden
          >
            {/* Izq feature 1 → borde izq foto */}
            <path d="M 215,100 C 240,100 255,130 263,145"
              stroke="var(--color-v2-doodle)" strokeWidth="1.8" fill="none"
              strokeDasharray="4 5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="213" cy="100" r="4" fill="var(--color-v2-doodle)" opacity="0.6"/>

            {/* Izq feature 2 → borde izq foto */}
            <path d="M 215,320 C 240,320 255,285 263,272"
              stroke="var(--color-v2-doodle)" strokeWidth="1.8" fill="none"
              strokeDasharray="4 5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="213" cy="320" r="4" fill="var(--color-v2-doodle)" opacity="0.6"/>

            {/* Der feature 1 → borde der foto */}
            <path d="M 705,100 C 680,100 665,130 657,145"
              stroke="var(--color-v2-doodle)" strokeWidth="1.8" fill="none"
              strokeDasharray="4 5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="707" cy="100" r="4" fill="var(--color-v2-doodle)" opacity="0.6"/>

            {/* Der feature 2 → borde der foto */}
            <path d="M 705,320 C 680,320 665,285 657,272"
              stroke="var(--color-v2-doodle)" strokeWidth="1.8" fill="none"
              strokeDasharray="4 5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="707" cy="320" r="4" fill="var(--color-v2-doodle)" opacity="0.6"/>
          </svg>
        </div>
      </div>

      {/* Onda inferior — flush, sin franja marfil */}
      <div aria-hidden style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        lineHeight: 0,
        pointerEvents: "none",
      }}>
        <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%" }}>
          <path d="M0,110 C300,50 540,165 800,100 C1000,55 1220,155 1440,95 L1440,180 L0,180 Z" fill="var(--color-v2-sage)"/>
        </svg>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .why-layout {
            flex-direction: column !important;
            align-items: center !important;
          }
          .why-layout > div:first-child,
          .why-layout > div:nth-child(3) {
            max-width: 100% !important;
            flex: unset !important;
          }
          .why-connections { display: none; }
        }
        @media (max-width: 900px) {
          .why-connections { display: none; }
        }
      `}</style>
    </section>
  );
}
