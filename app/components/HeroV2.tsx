"use client";

/**
 * HeroV2 — SVG text clipPath sobre grid de fotos reales de Lion Cub.
 * Diseño fiel al reference ChatGPT: "LION CUB" en Nunito 900 clipea
 * 4 fotos reales + textura algodón. Wave sage al fondo.
 */
export default function HeroV2() {
  return (
    <section id="inicio" style={{ position: "relative", background: "#faf7f6", overflow: "hidden" }}>

      {/* Doodles flotantes */}
      <svg className="lc-h-sun" aria-hidden viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="10" stroke="#c08a4a" strokeWidth="2" strokeLinecap="round"/>
        {[0,45,90,135,180,225,270,315].map((d, i) => {
          const r = d * Math.PI / 180;
          return <line key={i} x1={30+15*Math.cos(r)} y1={30+15*Math.sin(r)} x2={30+21*Math.cos(r)} y2={30+21*Math.sin(r)} stroke="#c08a4a" strokeWidth="2" strokeLinecap="round"/>;
        })}
      </svg>
      <svg className="lc-h-cloud" aria-hidden viewBox="0 0 104 64" fill="none">
        <path d="M14 50 C6 50 2 43 5 37 C7 32 12 30 18 33 C18 22 26 15 37 15 C44 15 49 18 52 24 C55 18 62 14 70 14 C80 14 87 21 87 31 C91 29 97 31 100 36 C103 41 101 48 96 50 C96 52 94 54 91 54 C88 54 86 53 85 51 C82 53 78 55 74 55 C71 55 68 54 66 52 C63 54 59 55 55 55 C51 55 47 54 44 51 C41 53 37 55 33 55 C28 55 24 52 22 48 C20 50 17 50 14 50 Z" stroke="#d5d5bd" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      <svg className="lc-h-heart" aria-hidden viewBox="0 0 32 32" fill="none">
        <path d="M16 27C16 27 3 19.5 3 10C3 7 5.7 4 9 4C11.6 4 13.9 5.6 15.2 8L16 10L16.8 8C18.1 5.6 20.4 4 23 4C26.3 4 29 6.7 29 10C29 19.5 16 27 16 27Z" stroke="#ffa486" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>

      {/* Letras SVG — LION CUB como clipPath con fotos reales */}
      <svg
        className="lc-h-letters"
        viewBox="0 0 1200 405"
        role="img"
        aria-label="Lion Cub — ropa de bebé en algodón pima peruano"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <defs>
          <clipPath id="brandCut">
            <text
              x="28" y="337"
              fontFamily="var(--font-nunito), Nunito, sans-serif"
              fontWeight="900"
              fontSize="350"
              textLength="1144"
              lengthAdjust="spacingAndGlyphs"
            >
              LION CUB
            </text>
          </clipPath>
        </defs>
        <g clipPath="url(#brandCut)">
          <rect width="1200" height="405" fill="#d5d5bd"/>
          <image href="/products/LC-016.jpeg"                x="15"  y="5"  width="235" height="400" preserveAspectRatio="xMidYMid slice"/>
          <image href="/hero/planos/desktop/K07-algodon.png" x="245" y="0"  width="380" height="405" preserveAspectRatio="xMidYMid slice"/>
          <image href="/products/LC-001.jpeg"                x="590" y="65" width="325" height="405" preserveAspectRatio="xMidYMid slice"/>
          <image href="/products/LC-013.jpeg"                x="945" y="60" width="255" height="405" preserveAspectRatio="xMidYMid slice"/>
        </g>
      </svg>

      {/* Copia */}
      <div className="lc-h-copy">
        <h1>Gran suavidad para<br/>pequeños humanos.</h1>
        <div className="lc-heartline" aria-hidden>♥</div>
        <p>Algodón Pima peruano para bebés de 0 a 2 años.</p>
        <a className="lc-pill" href="#favoritos">
          Explora la colección <span aria-hidden>→</span>
        </a>
      </div>

      {/* Wave sage */}
      <svg
        style={{ display: "block", width: "100%", height: "auto", marginTop: "-2px" }}
        viewBox="0 0 1280 300"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path fill="#d5d5bd" d="M0 25C65 3 98 132 230 144S357 158 418 218S630 310 747 260S822 169 994 135S1074-30 1280 65V300H0Z"/>
      </svg>

      <style>{`
        .lc-h-sun    { position:absolute; top:16px; right:clamp(24px,5vw,80px); width:52px; height:52px; opacity:.75; }
        .lc-h-cloud  { position:absolute; top:8px;  left:clamp(16px,4vw,60px);  width:90px; height:55px; opacity:.6; }
        .lc-h-heart  { position:absolute; bottom:180px; left:clamp(16px,3vw,40px); width:28px; height:28px; opacity:.65; }
        .lc-h-letters { max-height:50vw; }
        .lc-h-copy {
          text-align:center;
          padding: clamp(.75rem,3vw,2rem) clamp(1rem,5vw,3rem) 0;
          max-width:700px;
          margin:0 auto;
        }
        .lc-h-copy h1 {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:700;
          font-size: clamp(1.6rem,4.5vw,3rem);
          color:#171815;
          line-height:1.2;
          text-wrap:balance;
          margin:0 0 .5rem;
        }
        .lc-heartline {
          font-size:1.2rem;
          color:#ffa486;
          margin:.5rem 0;
          letter-spacing:.15em;
        }
        .lc-h-copy p {
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:400;
          font-size:clamp(.95rem,2vw,1.15rem);
          color:#777963;
          margin:0 0 1.5rem;
          line-height:1.6;
        }
        .lc-pill {
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:#ffa486;
          color:#fff;
          font-family: var(--font-figtree,"Figtree",system-ui,sans-serif);
          font-weight:700;
          font-size:clamp(.9rem,1.6vw,1rem);
          padding:14px 30px;
          border-radius:999px;
          text-decoration:none;
          transition:background .2s,transform .2s,box-shadow .2s;
          box-shadow:0 4px 18px rgba(255,164,134,.35);
        }
        .lc-pill:hover {
          background:#e8896e;
          transform:translateY(-2px);
          box-shadow:0 6px 22px rgba(255,164,134,.45);
        }
        @media(max-width:640px){
          .lc-h-sun    { width:36px; height:36px; }
          .lc-h-cloud  { width:64px; height:39px; }
          .lc-h-heart  { bottom:160px; }
        }
      `}</style>
    </section>
  );
}
