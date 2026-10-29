"use client";

import Image from "next/image";

/**
 * WhyLionCubV2 — Sección "why" fiel al diseño ChatGPT reference.
 * Barra de beneficios + grid 3 columnas: lista izquierda / imagen centro / lista derecha.
 */

const BENEFITS_BAR = [
  { icon: "cloud",   text: "100% algodón Pima" },
  { icon: "shield",  text: "Hecho en Perú" },
  { icon: "truck",   text: "Envíos a todo el Perú" },
];

const LEFT_BENEFITS = [
  {
    icon: "cloud",
    title: "Ultra suave",
    desc: "Un abrazo en cada prenda.",
  },
  {
    icon: "leaf",
    title: "Algodón Pima",
    desc: "Suavidad de origen peruano.",
  },
];

const RIGHT_BENEFITS = [
  {
    icon: "move",
    title: "Para moverse",
    desc: "Descubrir, jugar y volver a empezar.",
  },
  {
    icon: "heart",
    title: "Con mucho amor",
    desc: "Detalles que acompañan su día.",
  },
];

const ICON_SVGS: Record<string, React.ReactNode> = {
  cloud: (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <path d="M6 19C3.8 19 2 17.2 2 15C2 13 3.5 11.4 5.4 11.1C5.1 10.5 5 9.8 5 9C5 6.2 7.2 4 10 4C12 4 13.7 5.1 14.6 6.7C15 6.3 15.5 6 16 6C17.7 6 19 7.3 19 9C19 9.3 19 9.6 18.9 9.9C20.7 10.5 22 12.1 22 14C22 16.2 20.2 18 18 18L6 19Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <path d="M17 8C8 10 5.9 16.2 3.1 21.7L5 19C7 16 10 14 14 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 4C18 4 10 2 4 8C10 8 14 10 14 16C14 16 18 12 20 6L18 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  move: (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <polyline points="5 9 2 12 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 5 12 2 15 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="15 19 12 22 9 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="19 9 22 12 19 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <path d="M20.8 4.6C20.3 4.1 19.7 3.7 19.1 3.5C18.4 3.2 17.7 3 17 3C16.3 3 15.6 3.2 14.9 3.5C14.2 3.8 13.6 4.3 13.1 4.9L12 6.1L10.9 4.9C9.9 3.8 8.5 3 7 3C5.5 3 4.1 3.8 3.2 4.9C2.2 6 1.8 7.5 2.1 9C2.3 10.1 2.9 11.1 3.7 11.9L12 20L20.3 11.9C21.1 11.1 21.7 10.1 21.9 9C22.2 7.5 21.8 6 20.8 4.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <path d="M12 22C12 22 3 17 3 10V5L12 2L21 5V10C21 17 12 22 12 22Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <rect x="1" y="3" width="15" height="13" rx="1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
};

function BenefitItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="lc-benefit">
      <span className="lc-bubble">{ICON_SVGS[icon]}</span>
      <div>
        <h3 style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:"1rem", color:"#171815", margin:"0 0 4px" }}>{title}</h3>
        <p style={{ fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontSize:".875rem", color:"#83827f", margin:0, lineHeight:1.55 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function WhyLionCubV2() {
  return (
    <section id="pima" style={{ background: "#faf7f6", padding: "clamp(3rem,7vw,5rem) clamp(1rem,5vw,3rem)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2 className="lc-sec-heading">¿Por qué elegir LION CUB?</h2>
        <div className="lc-heartline" aria-hidden>♥</div>

        {/* Benefits bar */}
        <div className="lc-benefits-bar">
          {BENEFITS_BAR.map(b => (
            <span key={b.text} style={{ display:"flex", alignItems:"center", gap:"8px", fontFamily:"var(--font-figtree,'Figtree',system-ui,sans-serif)", fontWeight:700, fontSize:".9rem", color:"#171815" }}>
              {ICON_SVGS[b.icon]}{b.text}
            </span>
          ))}
        </div>

        {/* 3-column why grid */}
        <div className="lc-why-grid">
          <div className="lc-feature-list">
            {LEFT_BENEFITS.map(b => <BenefitItem key={b.title} {...b}/>)}
          </div>

          <div className="lc-fabric-img">
            <Image
              src="/hero/planos/desktop/K07-algodon.png"
              alt="Detalle textura suave del algodón pima peruano"
              width={340}
              height={440}
              style={{ objectFit:"cover", width:"100%", height:"100%", borderRadius:"clamp(10px,2.5vw,20px)" }}
            />
          </div>

          <div className="lc-feature-list">
            {RIGHT_BENEFITS.map(b => <BenefitItem key={b.title} {...b}/>)}
          </div>
        </div>
      </div>

      <style>{`
        .lc-benefits-bar {
          display:flex;
          justify-content:center;
          gap:clamp(1.5rem,4vw,3.5rem);
          flex-wrap:wrap;
          margin: clamp(1.5rem,3vw,2rem) 0;
          padding: clamp(.75rem,2vw,1rem) clamp(1rem,3vw,2rem);
          background:#fcf2e3;
          border-radius:clamp(8px,2vw,14px);
        }
        .lc-why-grid {
          display:grid;
          grid-template-columns:1fr auto 1fr;
          align-items:center;
          gap:clamp(1.5rem,4vw,3rem);
        }
        .lc-feature-list {
          display:flex;
          flex-direction:column;
          gap:clamp(1.5rem,3vw,2.5rem);
        }
        .lc-benefit {
          display:flex;
          align-items:flex-start;
          gap:1rem;
        }
        .lc-bubble {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:40px;
          height:40px;
          border-radius:50%;
          background:#d5d5bd;
          color:#3d3c30;
          flex-shrink:0;
        }
        .lc-fabric-img {
          width:clamp(180px,22vw,280px);
          height:clamp(240px,30vw,380px);
        }
        @media(max-width:768px){
          .lc-why-grid {
            grid-template-columns:1fr;
          }
          .lc-fabric-img {
            width:100%;
            max-width:320px;
            margin:0 auto;
            height:260px;
          }
        }
        @media(max-width:560px){
          .lc-benefits-bar { gap:1rem; }
        }
      `}</style>
    </section>
  );
}
