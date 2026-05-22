// Lion Cub — HOME · Direction B · "Quiet Luxury"
// Inspired by Marie-Chantal + Aesop. More monochrome cream, centered editorial,
// less color blocking, more typography-driven.

function HomeB_Desktop() {
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement inverted>Lima · Cusco · Miami · Madrid — entregamos donde el bebé esté</LCAnnouncement>

      {/* Centered nav variant */}
      <div style={{ background: 'var(--lc-bg)', padding: '32px 64px 24px', textAlign: 'center', borderBottom: '1px solid var(--lc-rule-soft)', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 64, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 24 }}>
          {['Colección','Para regalar','Historia'].map(t => <span key={t} className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>{t}</span>)}
        </div>
        <LCWordmark size={0.85}/>
        <div style={{ position: 'absolute', right: 64, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 24, alignItems: 'center' }}>
          <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>ES · EN</span>
          <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>Buscar</span>
          <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>Cuenta</span>
          <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink)' }}>Bolsa (1)</span>
        </div>
      </div>

      {/* HERO — single hero portrait, headline below */}
      <section style={{ padding: '88px 64px 0', background: 'var(--lc-bg)' }}>
        <div className="lc-life tone-cream" style={{ height: 680, marginBottom: 56, position: 'relative' }}>
          <span style={{ position: 'absolute', top: 24, left: 24 }} className="lc-mono">Editorial 01 · 2026 — la llegada</span>
          <span style={{ position: 'absolute', top: 24, right: 24 }} className="lc-mono">Vol. 26 · No. 01</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 96, alignItems: 'end' }}>
          <h1 className="lc-display" style={{ fontSize: 140, lineHeight: 0.92, fontWeight: 300, margin: 0, letterSpacing: '-0.03em' }}>
            La fibra<br/>
            <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>más suave</em><br/>
            del mundo.
          </h1>
          <div>
            <LCEyebrow>· Una nota de Lion Cub ·</LCEyebrow>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--lc-ink-soft)', marginTop: 20, fontWeight: 300 }}>
              Llevamos cinco años buscando el tacto exacto. Lo encontramos en el algodón Pima peruano: hebra larga, brillo sereno, hipoalergénico por naturaleza. Cada prenda Lion Cub se hace para acompañar — del hospital a las fotografías, del primer abrazo al primer cumpleaños.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 20 }}>
              <LCButton variant="primary">Ver la colección</LCButton>
              <LCButton variant="ghost">Por qué Pima</LCButton>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee — running text */}
      <section style={{ padding: '72px 0 0', background: 'var(--lc-bg)' }}>
        <div className="lc-display-i" style={{ fontSize: 64, color: 'var(--lc-ink)', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 300, opacity: 0.9 }}>
          suave <span style={{ color: 'var(--lc-gold-deep)' }}>·</span> respirable <span style={{ color: 'var(--lc-gold-deep)' }}>·</span> hipoalergénico <span style={{ color: 'var(--lc-gold-deep)' }}>·</span> hecho a mano <span style={{ color: 'var(--lc-gold-deep)' }}>·</span> en lima
        </div>
      </section>

      {/* Categories — single column editorial list */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <LCEyebrow>La colección</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 76, lineHeight: 0.95, fontWeight: 300, marginTop: 18, letterSpacing: '-0.02em' }}>
            Cuatro <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>capítulos.</em>
          </h2>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {[
            { n:'01', name: 'Conjuntos & Ajuares', count: 20, img: 'LC-001', tag: 'El primer abrazo', desc: 'Sets completos hechos para la llegada a casa y los días que siguen.', bg: 'var(--lc-bg-warm)' },
            { n:'02', name: 'Bodies', count: 1, img: 'LC-101', tag: 'La segunda piel', desc: 'La prenda base del guardarropa — suave, versátil, esencial.', bg: 'var(--lc-blue-soft)' },
            { n:'03', name: 'Baberos', count: 2, img: 'LC-201', tag: 'Cada comida tierna', desc: 'Los detalles que cuidan cada momento del día.', bg: 'var(--lc-mint-soft)' },
            { n:'04', name: 'Mantas', count: 2, img: 'LC-301', tag: 'Envueltos en cielo', desc: 'Abrigos ligeros que envuelven con dulzura.', bg: 'var(--lc-pink-soft)' },
          ].map((c, i) => (
            <div key={c.name} style={{ display: 'grid', gridTemplateColumns: i % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr', gap: 80, alignItems: 'center', padding: '60px 0', borderTop: '1px solid var(--lc-rule)' }}>
              {i % 2 === 0 ? <>
                <div style={{ background: c.bg, aspectRatio: '4/5' }}>
                  <img src={`../assets/products/${c.img}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </div>
                <CatBody c={c}/>
              </> : <>
                <CatBody c={c} right/>
                <div style={{ background: c.bg, aspectRatio: '4/5' }}>
                  <img src={`../assets/products/${c.img}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </div>
              </>}
            </div>
          ))}
        </div>
      </section>

      {/* PIMA story — ingredient card style */}
      <section style={{ background: '#1A1410', color: '#FDFBF6', padding: '128px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'center' }}>
          <div>
            <LCEyebrow style={{ color: 'var(--lc-gold)' }}>El ingrediente · 01</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 96, lineHeight: 0.92, fontWeight: 300, marginTop: 24, letterSpacing: '-0.02em' }}>
              <em className="lc-display-i" style={{ color: 'var(--lc-gold)' }}>Pima.</em>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(253,251,246,.7)', marginTop: 32, maxWidth: 460, fontWeight: 300 }}>
              Único en el mundo. Crece en los valles costeros del Perú con riego natural, sol constante y rocío del Pacífico. Su hebra extra-larga le da una suavidad que se queda — incluso después de cien lavados.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'rgba(253,251,246,.1)' }}>
            {[
              ['Origen','Piura, Lambayeque'],
              ['Hebra','Extra-larga · 3.5 cm'],
              ['Color natural','Crema · marrón nativo'],
              ['Cosecha','A mano · sin defoliantes'],
              ['Certificación','GOTS · Algodón Pima 100%'],
              ['Tacto','Sedoso · fresco'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#1A1410', padding: '28px 24px' }}>
                <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(253,251,246,.4)' }}>{k}</div>
                <div style={{ fontSize: 17, color: '#FDFBF6', marginTop: 10, fontWeight: 300 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers grid */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <LCEyebrow>Más amadas</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 60, lineHeight: 0.95, fontWeight: 300, marginTop: 16, letterSpacing: '-0.02em' }}>
            Las que <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>se repiten.</em>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--lc-ink-soft)', marginTop: 20, maxWidth: 500, margin: '20px auto 0', lineHeight: 1.7 }}>
            Las piezas que las familias vuelven a pedir — para hermanitos, sobrinos, amigos que también esperan.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { id: 'LC-001', name: 'Tiernos Conejitos', tagline: 'El primer abrazo', price: 79, colors: ['Blanco'], gender: 'Unisex' },
            { id: 'LC-101', name: 'Body Esencial Premium', tagline: 'La segunda piel', price: 29, colors: ['Blanco','Celeste','Palo Rosa','Beige'], gender: 'Unisex' },
            { id: 'LC-301', name: 'Manta Celestial', tagline: 'Envuelto en cielo', price: 49, colors: ['Celeste'], gender: 'Unisex' },
            { id: 'LC-016', name: 'Nube Celeste Premium', tagline: 'La suavidad hecha ajuar', price: 79, colors: ['Celeste'], gender: 'Unisex' },
          ].map(p => <LCProductCard key={p.id} product={p}/>)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <LCButton variant="outline">Explorar las 25 piezas</LCButton>
        </div>
      </section>

      {/* Promise + commitment */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <LCEyebrow>Nuestro compromiso</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 60, lineHeight: 0.95, fontWeight: 300, marginTop: 16, letterSpacing: '-0.02em' }}>
              Si no es <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>perfecto,</em><br/>no sale del taller.
            </h2>
          </div>
          <div style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              ['Algodón certificado','Trazabilidad de la mota a la prenda. Sin mezclas, sin compromisos.'],
              ['Hecho a mano en Lima','En un taller pequeño donde conocemos cada costura por su nombre.'],
              ['Empaque consciente','Caja FSC, lazo de algodón crudo, sin plástico de un solo uso.'],
              ['Cambio garantizado','15 días para cambiar la talla — sin preguntas, sin costo en Lima.'],
            ].map(([t, d], i) => (
              <div key={t} style={{ padding: '32px 24px', borderRight: i < 3 ? '1px solid var(--lc-rule)' : 'none' }}>
                <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--lc-gold-deep)' }}>0{i+1}</div>
                <div className="lc-display-i" style={{ fontSize: 22, marginTop: 14, lineHeight: 1.2 }}>{t}</div>
                <p style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', marginTop: 12, lineHeight: 1.7 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press / mentions */}
      <section style={{ padding: '80px 64px', background: 'var(--lc-bg)', borderTop: '1px solid var(--lc-rule)', borderBottom: '1px solid var(--lc-rule)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
          <LCEyebrow style={{ color: 'var(--lc-ink-mute)' }}>Hablan de nosotros</LCEyebrow>
          {['VOGUE NIÑOS','EL COMERCIO','PERÚ.COM','MAMÁ XXI','LA REPÚBLICA'].map(n => (
            <span key={n} className="lc-display-i" style={{ fontSize: 22, fontWeight: 300, color: 'var(--lc-ink-soft)', letterSpacing: '0.05em' }}>{n}</span>
          ))}
        </div>
      </section>

      {/* Closing CTA — large */}
      <section style={{ padding: '160px 64px', background: 'var(--lc-bg)', textAlign: 'center' }}>
        <h2 className="lc-display" style={{ fontSize: 112, lineHeight: 0.92, fontWeight: 300, letterSpacing: '-0.03em' }}>
          Llevemos a casa<br/>algo <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>suave.</em>
        </h2>
        <div style={{ marginTop: 56, display: 'inline-flex', gap: 20 }}>
          <LCButton variant="primary">Ver la colección</LCButton>
          <LCWhatsApp>Hablar con nosotros</LCWhatsApp>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

function CatBody({ c, right }) {
  return (
    <div style={{ paddingLeft: right ? 0 : 0, paddingRight: right ? 0 : 0 }}>
      <div className="lc-display-i" style={{ fontSize: 80, fontWeight: 300, color: 'var(--lc-gold-deep)', lineHeight: 1 }}>{c.n}.</div>
      <h3 className="lc-display" style={{ fontSize: 52, fontWeight: 300, lineHeight: 1, marginTop: 18, letterSpacing: '-0.02em' }}>
        {c.name.split(' & ')[0]}{c.name.includes('&') && <> <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>& {c.name.split(' & ')[1]}</em></>}
      </h3>
      <div className="lc-display-i" style={{ fontSize: 17, color: 'var(--lc-ink-soft)', marginTop: 10 }}>{c.tag}</div>
      <p style={{ fontSize: 14, color: 'var(--lc-ink-soft)', marginTop: 20, maxWidth: 420, lineHeight: 1.75 }}>{c.desc}</p>
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
        <LCButton variant="ghost">Explorar capítulo {c.n}</LCButton>
        <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>{c.count} {c.count === 1 ? 'pieza' : 'piezas'}</span>
      </div>
    </div>
  );
}

window.HomeB_Desktop = HomeB_Desktop;
