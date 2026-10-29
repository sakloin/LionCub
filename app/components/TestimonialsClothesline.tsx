/**
 * TestimonialsClothesline — Sección "story" fiel al diseño ChatGPT reference.
 * Las tarjetas colgadas contienen MENSAJES DE MARCA, no reseñas inventadas.
 * Esta sección siempre se muestra (no depende de testimonios reales).
 *
 * ⚠️  REGLA: Si en el futuro se agregan testimonios reales de clientes, crear
 *     un componente separado. Esta sección siempre muestra los mensajes de marca.
 */

import Image from "next/image";

const BRAND_MESSAGES = [
  {
    hearts: "♥ ♥ ♥ ♥ ♥",
    quote: "La suavidad de un abrazo, en cada pequeño detalle.",
    label: "Nuestra inspiración",
  },
  {
    hearts: "♥ ♥ ♥ ♥ ♥",
    quote: "Hecho para sus primeros días y todos los que vienen.",
    label: "De 0 a 2 años",
  },
  {
    hearts: "♥ ♥ ♥ ♥ ♥",
    quote: "Algodón peruano. Amor que se siente cerquita.",
    label: "El mundo Lion Cub",
  },
];

export default function TestimonialsClothesline() {
  return (
    <section
      id="historia"
      style={{
        background: "#d5d5bd",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Wave top */}
      <svg style={{ display:"block", width:"100%", height:"auto", marginBottom:"-1px" }} viewBox="0 0 1280 100" preserveAspectRatio="none" aria-hidden>
        <path fill="#faf7f6" d="M0 0H1280V70C1100 25 1110 140 845 72S616 25 440 65S210-30 0 55Z"/>
      </svg>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"clamp(2.5rem,6vw,4.5rem) clamp(1rem,5vw,3rem)" }}>
        <h2 className="lc-sec-heading">Pequeños detalles. Grandes abrazos.</h2>
        <div className="lc-heartline" aria-hidden>♥</div>

        <div className="lc-clothesline">
          {/* Polaroid foto */}
          <div className="lc-polaroid">
            <Image
              src="/products/LC-012.jpeg"
              alt="Una sonrisa llena de ternura — Lion Cub"
              width={200}
              height={240}
              style={{ objectFit:"cover", width:"100%", height:"100%", display:"block" }}
            />
          </div>

          {/* Mensajes de marca */}
          {BRAND_MESSAGES.map((msg, i) => (
            <article
              key={i}
              className="lc-note"
              style={{ transform: `rotate(${[-3, 2, -2][i % 3]}deg)` }}
            >
              <div style={{ color:"#ffa486", fontSize:".8rem", letterSpacing:".1em", marginBottom:".5rem" }}>{msg.hearts}</div>
              <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".95rem", color:"#171815", lineHeight:1.55, margin:"0 0 .5rem", fontStyle:"italic" }}>
                &ldquo;{msg.quote}&rdquo;
              </p>
              <small style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".75rem", color:"#777963", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>
                {msg.label}
              </small>
            </article>
          ))}
        </div>

        {/* Love tag */}
        <div className="lc-love-tag">
          <strong>100% Pima</strong> Para pequeños humanos y grandes momentos.&nbsp;&nbsp;♡
        </div>
      </div>

      {/* Wave bottom */}
      <svg style={{ display:"block", width:"100%", height:"auto", marginTop:"-1px" }} viewBox="0 0 1280 180" preserveAspectRatio="none" aria-hidden>
        <path fill="#faf7f6" d="M0 105C50 170 110 40 230 30S375 15 440 0H775C870 42 996 35 1060 100S1180 155 1280 105V180H0Z"/>
      </svg>

      <style>{`
        .lc-clothesline {
          display:flex;
          align-items:flex-start;
          gap:clamp(1rem,2.5vw,2rem);
          flex-wrap:wrap;
          justify-content:center;
          margin: clamp(1.5rem,3vw,2.5rem) 0 clamp(1.5rem,3vw,2rem);
        }
        .lc-polaroid {
          background:#fff;
          padding:10px 10px 30px;
          box-shadow:0 4px 18px rgba(0,0,0,.12);
          transform:rotate(-2deg);
          width:clamp(120px,18vw,180px);
          flex-shrink:0;
        }
        .lc-note {
          background:#fff;
          border-radius:6px;
          padding:clamp(.875rem,2vw,1.25rem);
          box-shadow:0 4px 18px rgba(0,0,0,.1);
          width:clamp(160px,22vw,220px);
          flex-shrink:0;
        }
        .lc-love-tag {
          text-align:center;
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-size:clamp(.875rem,1.8vw,1rem);
          color:#3d3c30;
          background:#fcf2e3;
          display:inline-flex;
          padding:.75rem 1.5rem;
          border-radius:999px;
          margin:0 auto;
          display:block;
          max-width:fit-content;
        }
        .lc-love-tag strong { color:#171815; }
        @media(max-width:480px){
          .lc-clothesline { flex-direction:column; align-items:center; }
          .lc-polaroid, .lc-note { transform:none !important; width:200px; }
        }
      `}</style>
    </section>
  );
}
