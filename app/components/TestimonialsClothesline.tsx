/**
 * TestimonialsClothesline — Testimonios en estilo "cuerda de ropa" con polaroids
 *
 * ⚠️  REGLA: Solo testimonios REALES con nombre o apodo autorizado.
 *     Esta sección queda vacía hasta que Heber provea los textos reales.
 *     Para añadir un testimonio, agrégalo al array TESTIMONIALS abajo con:
 *     { name, text, stars, rotate } — rotate es deg de rotación visual (−8 a +8).
 */

type Testimonial = {
  name: string;
  text: string;
  stars: number;
  rotate: number;
};

const TESTIMONIALS: Testimonial[] = [
  // Pendiente: Heber debe proveer testimonios reales antes de activar esta sección.
  // Ejemplo de formato (NO publicar hasta confirmar con Heber):
  // { name: "Lucía M.", text: "La manta llegó hermosa y súper suave. Mi bebé no se la quita.", stars: 5, rotate: -4 },
];

export default function TestimonialsClothesline() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section
      aria-label="Lo que dicen las mamás"
      style={{
        background: "var(--color-v2-bg)",
        padding: "clamp(3rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(2rem, 5vw, 3.5rem)" }}>
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
            Familias Lion Cub
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
            Lo que dicen las mamás
          </h2>
        </div>

        {/* Clothesline */}
        <div
          style={{
            position: "relative",
            paddingTop: "24px",
          }}
        >
          {/* String */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "24px",
              left: "-2%",
              right: "-2%",
              height: "2px",
              background: "linear-gradient(90deg, transparent 0%, var(--color-v2-amber) 5%, var(--color-v2-amber) 95%, transparent 100%)",
              opacity: 0.55,
            }}
          />

          {/* Polaroids */}
          <div
            style={{
              display: "flex",
              gap: "clamp(1rem, 3vw, 2rem)",
              overflowX: "auto",
              padding: "0 4px 1rem",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <article
                key={i}
                aria-label={`Testimonio de ${t.name}`}
                style={{
                  flex: "0 0 clamp(200px, 30vw, 260px)",
                  scrollSnapAlign: "start",
                  transform: `rotate(${t.rotate}deg)`,
                  transformOrigin: "top center",
                  marginTop: "clamp(24px, 4vw, 36px)",
                  position: "relative",
                }}
              >
                {/* Clothespin */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--color-v2-amber)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                  <div
                    style={{
                      width: "4px",
                      height: "14px",
                      background: "var(--color-v2-amber)",
                      opacity: 0.7,
                    }}
                  />
                </div>

                {/* Polaroid */}
                <div
                  style={{
                    background: "#fff",
                    padding: "clamp(12px, 2vw, 16px)",
                    paddingBottom: "clamp(24px, 4vw, 32px)",
                    boxShadow: "0 4px 16px rgba(26,20,16,0.12), 0 1px 4px rgba(26,20,16,0.08)",
                    borderRadius: "2px",
                  }}
                >
                  {/* Stars */}
                  <div style={{ marginBottom: "8px", color: "var(--color-v2-amber)", fontSize: "14px" }}>
                    {"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-title)",
                      fontWeight: 400,
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      color: "var(--color-ink-soft)",
                      margin: "0 0 12px",
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-title)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      color: "var(--color-ink)",
                      margin: 0,
                    }}
                  >
                    — {t.name}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
