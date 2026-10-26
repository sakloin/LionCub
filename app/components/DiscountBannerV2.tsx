/**
 * DiscountBannerV2 — Banner de descuento 10% OFF primera compra
 *
 * NOTA: El código LIONCUB10 es solo visual en esta pantalla.
 * Activar el descuento real en el checkout requiere revisión del auditor
 * antes de publicar (toca el flujo de pagos).
 */

export default function DiscountBannerV2() {
  return (
    <section
      aria-label="Descuento primera compra"
      style={{
        background: "var(--color-v2-sage)",
        padding: "clamp(2.5rem, 5vw, 3.5rem) clamp(1.25rem, 5vw, 3rem)",
      }}
    >
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(1rem, 2vw, 1.5rem)",
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11px",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "var(--color-v2-amber)",
            opacity: 0.85,
            margin: 0,
          }}
        >
          Oferta de bienvenida
        </p>

        {/* Big % */}
        <div
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "clamp(3rem, 10vw, 6rem)",
            lineHeight: 1,
            color: "var(--color-v2-amber)",
          }}
        >
          10% OFF
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 400,
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            lineHeight: 1.6,
            color: "var(--color-ink-soft)",
            margin: 0,
            maxWidth: "36ch",
          }}
        >
          En tu primera compra. Aplica en toda la tienda.
        </p>

        {/* Code box */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            border: "1.5px dashed var(--color-v2-amber)",
            borderRadius: "12px",
            padding: "14px 24px",
            background: "rgba(255,255,255,0.55)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "var(--color-ink)",
            }}
          >
            LIONCUB10
          </span>
        </div>

        <p
          style={{
            fontFamily: "var(--font-title)",
            fontSize: "0.8rem",
            color: "var(--color-ink-mute)",
            margin: 0,
          }}
        >
          Ingresa el código al finalizar tu compra
        </p>
      </div>

      {/* Wave bottom */}
      <div aria-hidden style={{ lineHeight: 0, marginTop: "clamp(2.5rem, 5vw, 3.5rem)", marginLeft: "-clamp(1.25rem,5vw,3rem)", marginRight: "-clamp(1.25rem,5vw,3rem)" }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,20 C480,60 960,5 1440,35 L1440,60 L0,60 Z" fill="var(--color-v2-bg)"/>
        </svg>
      </div>
    </section>
  );
}
