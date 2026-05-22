// Lion Cub — Shared primitives & components for the new design system.
// All components prefixed `LC` to avoid collisions in the canvas.

const { useState, useMemo } = React;

// ───── Logo ─────
// Minimal editorial lion cub: a face circle ringed by 12 small "tuft" circles
// for the mane, two tiny pointed ears, a triangular nose, and a soft mouth.
function LionMarkSvg({ size = 64, color = 'currentColor' }) {
  const cx = 32, cy = 34, faceR = 12.5, maneR = 16, tuftR = 3.4;
  const tufts = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    return [cx + maneR * Math.cos(a), cy + maneR * Math.sin(a)];
  });
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Lion Cub">
      {/* Mane tufts */}
      {tufts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={tuftR} stroke={color} strokeWidth="1.3" fill="none"/>
      ))}
      {/* Tiny pointed ears, peeking through the mane */}
      <path d={`M${cx - 9} ${cy - 13} L${cx - 7} ${cy - 16.5} L${cx - 5} ${cy - 13} Z`} stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <path d={`M${cx + 5} ${cy - 13} L${cx + 7} ${cy - 16.5} L${cx + 9} ${cy - 13} Z`} stroke={color} strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      {/* Face circle on top of mane */}
      <circle cx={cx} cy={cy} r={faceR} stroke={color} strokeWidth="1.5" fill="none"/>
      {/* Eyes */}
      <circle cx={cx - 5} cy={cy - 2} r="1.1" fill={color}/>
      <circle cx={cx + 5} cy={cy - 2} r="1.1" fill={color}/>
      {/* Nose (triangle) */}
      <path d={`M${cx - 1.8} ${cy + 2.6} L${cx + 1.8} ${cy + 2.6} L${cx} ${cy + 4.6} Z`} fill={color}/>
      {/* Mouth */}
      <path d={`M${cx} ${cy + 4.6} L${cx} ${cy + 6.2}`} stroke={color} strokeWidth="1" strokeLinecap="round"/>
      <path d={`M${cx} ${cy + 6.2} Q${cx - 2.4} ${cy + 7.6} ${cx - 3.8} ${cy + 6.6}`} stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d={`M${cx} ${cy + 6.2} Q${cx + 2.4} ${cy + 7.6} ${cx + 3.8} ${cy + 6.6}`} stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function LCLogo({ size = 32, color = 'currentColor' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
      <LionMarkSvg size={size} color={color}/>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 2 }}>
        <span className="lc-display-i" style={{ fontSize: size * 0.7, color, letterSpacing: '-0.02em' }}>Lion Cub</span>
        <span className="lc-mono" style={{ fontSize: size * 0.22, color, letterSpacing: '0.32em', textTransform: 'uppercase', opacity: 0.6 }}>Baby Clothing</span>
      </div>
    </div>
  );
}

function LCLogoMark({ size = 64, color = 'currentColor' }) {
  return <LionMarkSvg size={size} color={color}/>;
}

// ───── Wordmark / monogram — for hero ─────
function LCWordmark({ color = 'currentColor', size = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * size, lineHeight: 1 }}>
      <div className="lc-display-i" style={{ fontSize: 48 * size, color, letterSpacing: '-0.02em' }}>Lion Cub</div>
      <div className="lc-mono" style={{ fontSize: 9 * size, color, letterSpacing: '0.46em', textTransform: 'uppercase', opacity: 0.65 }}>· baby clothing · est. lima ·</div>
    </div>
  );
}

// ───── Eyebrow ─────
function LCEyebrow({ children, color, style }) {
  return <div className="lc-eyebrow" style={{ color, ...style }}>{children}</div>;
}

// ───── Buttons ─────
function LCButton({ children, variant = 'primary', as = 'button', href, style, ...rest }) {
  const cls = `lc-btn lc-btn-${variant}`;
  const props = { className: cls, style, ...rest };
  if (as === 'a' || href) return <a href={href} {...props}>{children}</a>;
  return <button {...props}>{children}</button>;
}

function LCWhatsApp({ children = 'WhatsApp', style }) {
  return (
    <a href="https://wa.me/51920201943" target="_blank" rel="noopener" className="lc-btn lc-btn-whatsapp" style={style}>
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.77 1.58 5.39L2 22l4.84-1.27a9.86 9.86 0 0 0 5.2 1.48h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm5.51 13.93c-.24.67-1.4 1.28-1.94 1.36-.49.07-1.12.1-1.81-.12-.42-.13-.96-.32-1.65-.62-2.91-1.26-4.81-4.19-4.96-4.38-.14-.2-1.19-1.58-1.19-3.01 0-1.43.75-2.13 1.02-2.43.27-.29.59-.36.78-.36.2 0 .39 0 .56.01.18 0 .42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.18-.31.39-.44.53-.15.15-.3.31-.13.6.17.29.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.37 1.47.29.15.46.13.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.71.81 2 .96.29.15.48.22.55.34.07.12.07.69-.17 1.36z"/></svg>
      {children}
    </a>
  );
}

// ───── Product card ─────
function LCProductCard({ product, layout = 'default' }) {
  return (
    <div style={{ cursor: 'pointer' }}>
      <div className="lc-plate" style={{ aspectRatio: '4/5', borderRadius: 0 }}>
        <img src={`../assets/products/${product.id}.jpeg`} alt={product.name} />
      </div>
      <div style={{ paddingTop: 16 }}>
        {product.gender && product.gender !== 'Unisex' && (
          <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.24em', color: 'var(--lc-ink-mute)', textTransform: 'uppercase', marginBottom: 4 }}>{product.gender}</div>
        )}
        <div className="lc-display" style={{ fontSize: 18, fontWeight: 400, color: 'var(--lc-ink)', letterSpacing: '-0.01em' }}>{product.name}</div>
        {product.tagline && (
          <div className="lc-display-i" style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', marginTop: 2 }}>{product.tagline}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {(product.colors || []).slice(0, 4).map(c => (
              <span key={c} className="lc-sw" style={{ background: COLOR_HEX[c] || c }}/>
            ))}
          </div>
          <div className="lc-display" style={{ fontSize: 15, color: 'var(--lc-ink)' }}>
            <span className="lc-mono" style={{ fontSize: 10, color: 'var(--lc-ink-mute)', marginRight: 4 }}>S/</span>{product.price}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───── Color map ─────
const COLOR_HEX = {
  'Blanco': '#FAF7EF',
  'Beige': '#E9DDC4',
  'Celeste': '#C9D9E4',
  'Rosa': '#F2C9C2',
  'Palo Rosa': '#EDD3CC',
  'Azul': '#A8B8CB',
  'Crema': '#F0E3CB',
  'Durazno': '#EDC8B0',
  'Verde menta': '#C8D6BD',
  'Floral': 'linear-gradient(45deg, #F2C9C2, #C8D6BD)',
};

// ───── Page chrome: header & footer for the website mockups ─────
function LCNav({ inverted = false, cartCount = 0, scrollY = 60 }) {
  const ink = inverted ? '#FDFBF6' : 'var(--lc-ink)';
  return (
    <div style={{
      position: 'relative',
      background: inverted ? 'transparent' : 'var(--lc-bg)',
      padding: '20px 64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: inverted ? '1px solid rgba(255,255,255,.12)' : '1px solid var(--lc-rule-soft)',
      color: ink,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <a href="#" className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: ink, textDecoration: 'none' }}>Colección</a>
        <a href="#" className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: ink, textDecoration: 'none' }}>Para regalar</a>
        <a href="#" className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: ink, textDecoration: 'none' }}>Historia</a>
        <a href="#" className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: ink, textDecoration: 'none' }}>Cuidados</a>
      </div>
      <LCLogo size={28} color={ink}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, color: ink }}>
        <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>ES · EN</span>
        <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>Buscar</span>
        <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer' }}>Cuenta</span>
        <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Bolsa
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 999, background: 'var(--lc-gold)', color: '#1A1410', fontSize: 9, padding: '0 6px' }}>{cartCount}</span>
        </span>
      </div>
    </div>
  );
}

function LCNavMobile({ inverted = false, cartCount = 0 }) {
  const ink = inverted ? '#FDFBF6' : 'var(--lc-ink)';
  return (
    <div style={{
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: ink,
      borderBottom: inverted ? '1px solid rgba(255,255,255,.14)' : '1px solid var(--lc-rule-soft)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer' }}>
        <span style={{ width: 18, height: 1, background: ink }}/>
        <span style={{ width: 18, height: 1, background: ink }}/>
      </div>
      <LCLogo size={22} color={ink}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Buscar</span>
        <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Bolsa
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 16, height: 16, borderRadius: 999, background: 'var(--lc-gold)', color: '#1A1410', fontSize: 9, padding: '0 5px' }}>{cartCount}</span>
        </span>
      </div>
    </div>
  );
}

function LCAnnouncement({ children = "Envío gratis en Lima desde S/ 199 · Envíos a USA disponibles", inverted = false }) {
  return (
    <div style={{
      background: inverted ? '#1A1410' : 'var(--lc-bg-warm)',
      color: inverted ? '#FDFBF6' : 'var(--lc-ink-soft)',
      padding: '8px 20px',
      textAlign: 'center',
      fontFamily: 'var(--lc-font-mono)',
      fontSize: 10,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
    }}>{children}</div>
  );
}

function LCFooter({ inverted = true }) {
  const bg = inverted ? '#1A1410' : 'var(--lc-bg-warm)';
  const ink = inverted ? '#FDFBF6' : 'var(--lc-ink)';
  const mute = inverted ? 'rgba(253,251,246,.6)' : 'var(--lc-ink-mute)';
  return (
    <div style={{ background: bg, color: ink, padding: '80px 64px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.2fr', gap: 48, alignItems: 'start' }}>
        <div>
          <LCLogo size={28} color={ink}/>
          <p style={{ marginTop: 24, fontSize: 13, color: mute, lineHeight: 1.7, fontWeight: 300, maxWidth: 280 }}>
            Hilamos cada prenda con algodón Pima peruano — la fibra más suave del mundo. Para que su piel descanse en lo más fino.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            {['IG','FB','WA'].map(s => <span key={s} className="lc-mono" style={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${mute}`, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 9, letterSpacing: '0.1em', color: ink }}>{s}</span>)}
          </div>
        </div>
        {[
          { t: 'Comprar', l: ['Todo','Conjuntos & Ajuares','Bodies','Baberos','Mantas','Para regalar'] },
          { t: 'Lion Cub', l: ['Nuestra historia','El algodón Pima','Compromiso','Prensa','Contacto'] },
          { t: 'Ayuda', l: ['Guía de tallas','Cuidados','Envíos','Cambios y devoluciones','FAQ'] },
        ].map(c => (
          <div key={c.t}>
            <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: ink, marginBottom: 18 }}>{c.t}</div>
            <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
              {c.l.map(i => <span key={i} style={{ fontSize: 13, color: mute, fontWeight: 300, cursor:'pointer' }}>{i}</span>)}
            </div>
          </div>
        ))}
        <div>
          <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: ink, marginBottom: 18 }}>Carta Lion Cub</div>
          <p style={{ fontSize: 13, color: mute, lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>Suma a tu correo nuestra carta mensual: historias, cuidados y preventas.</p>
          <div style={{ display:'flex', alignItems:'center', borderBottom: `1px solid ${mute}`, paddingBottom: 8 }}>
            <span style={{ fontSize: 13, color: mute, fontWeight: 300, flex: 1 }}>tu@correo.com</span>
            <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform:'uppercase', color: ink, cursor: 'pointer' }}>Suscribirme →</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 64, paddingTop: 24, borderTop: `1px solid ${mute}`, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--lc-font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: mute }}>
        <span>© 2026 Lion Cub Baby Clothing · Lima, Perú</span>
        <span>Hecho a mano con amor en el Perú</span>
        <span>Términos · Privacidad</span>
      </div>
    </div>
  );
}

// ───── Section header (consistent vocabulary across pages) ─────
function LCSectionHeader({ eyebrow, title, italicWord, intro, align = 'center', maxWidth = 560, style }) {
  return (
    <div style={{ textAlign: align, maxWidth: maxWidth, margin: align === 'center' ? '0 auto' : 0, ...style }}>
      {eyebrow && <LCEyebrow style={{ marginBottom: 18 }}>{eyebrow}</LCEyebrow>}
      <h2 className="lc-display" style={{ fontSize: 52, fontWeight: 300, lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}>
        {title} {italicWord && <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>{italicWord}</em>}
      </h2>
      {intro && <p style={{ fontSize: 15, color: 'var(--lc-ink-soft)', marginTop: 22, lineHeight: 1.7, fontWeight: 300 }}>{intro}</p>}
    </div>
  );
}

Object.assign(window, {
  LCLogo, LCLogoMark, LCWordmark,
  LCEyebrow, LCButton, LCWhatsApp, LCProductCard,
  LCNav, LCNavMobile, LCAnnouncement, LCFooter, LCSectionHeader,
  COLOR_HEX,
});
