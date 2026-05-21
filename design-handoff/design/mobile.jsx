// Lion Cub — MOBILE versions of both home directions.
// Mobile width: 390 (iPhone 14). Same aesthetic — denser, vertical rhythm.

function HomeA_Mobile() {
  return (
    <div className="lc-page" style={{ width: 390, fontSize: 14 }}>
      <LCAnnouncement>Envíos a Perú & USA · Empaque tipo regalo</LCAnnouncement>
      <LCNavMobile cartCount={2}/>

      {/* Hero */}
      <section style={{ padding: '32px 20px 0' }}>
        <LCEyebrow>SS · 2026</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 52, lineHeight: 0.92, fontWeight: 300, margin: '14px 0 0', letterSpacing: '-0.02em' }}>
          Suave<br/>como<br/>su <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>piel.</em>
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--lc-ink-soft)', marginTop: 18, lineHeight: 1.7, fontWeight: 300 }}>
          100% algodón Pima peruano. Hipoalergénico, transpirable, hecho a mano en Lima — para los primeros días y los abrazos que vienen.
        </p>
        <div style={{ marginTop: 24 }}>
          <LCButton variant="primary" style={{ width: '100%' }}>Descubrir la colección</LCButton>
        </div>
      </section>

      <section style={{ padding: '32px 20px 0' }}>
        <div className="lc-life tone-pink" style={{ aspectRatio: '4/5' }}>bebé en manta Pima · luz natural</div>
      </section>

      {/* Featured product card */}
      <section style={{ padding: '32px 20px 0' }}>
        <div style={{ background: 'var(--lc-bg-warm)', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 16, alignItems: 'center' }}>
            <div className="lc-plate" style={{ aspectRatio: '1/1' }}>
              <img src="../assets/products/LC-001.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            </div>
            <div>
              <LCEyebrow style={{ fontSize: 9 }}>Edición SS 26</LCEyebrow>
              <div className="lc-display-i" style={{ fontSize: 22, marginTop: 6, lineHeight: 1.1 }}>Tiernos<br/>Conejitos</div>
              <div style={{ fontSize: 12, color: 'var(--lc-ink-soft)', marginTop: 6 }}>Set 5 piezas · S/ 79</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[['200+','familias'],['100%','Pima'],['Lima','hecho a mano']].map(([n,l]) => (
          <div key={l}>
            <div className="lc-display" style={{ fontSize: 22, fontWeight: 300 }}>{n}</div>
            <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </section>

      {/* Material */}
      <section style={{ padding: '64px 20px 64px', marginTop: 48, background: 'var(--lc-bg-warm)' }}>
        <LCEyebrow>01 · El material</LCEyebrow>
        <h2 className="lc-display" style={{ fontSize: 44, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
          La fibra más<br/>suave del<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>mundo.</em>
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--lc-ink-soft)', marginTop: 18, lineHeight: 1.75 }}>
          El algodón Pima crece bajo el sol del Perú. Su hebra extra-larga le da brillo, resistencia y un tacto que se queda.
        </p>
        <div style={{ marginTop: 24 }}>
          <div className="lc-life tone-cream" style={{ aspectRatio: '4/3' }}>hebra de algodón en macro</div>
        </div>
        <div style={{ marginTop: 32, display: 'grid', gap: 16 }}>
          {[['01','Hipoalergénico','Para pieles que apenas están conociendo el mundo.'],['02','Transpirable','Fresco en verano, abrigo en invierno.'],['03','Resistente','La suavidad permanece, lavado tras lavado.']].map(([n,t,d]) => (
            <div key={n} style={{ paddingTop: 16, borderTop: '1px solid var(--lc-rule)' }}>
              <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)' }}>{n}</div>
              <div className="lc-display" style={{ fontSize: 22, marginTop: 6, fontWeight: 400 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', marginTop: 6, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories — vertical */}
      <section style={{ padding: '64px 20px' }}>
        <LCEyebrow>02 · La colección</LCEyebrow>
        <h2 className="lc-display" style={{ fontSize: 44, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
          Cuatro<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>capítulos.</em>
        </h2>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            { name: 'Conjuntos & Ajuares', count: 20, img: 'LC-001', tone: 'pink' },
            { name: 'Bodies', count: 1, img: 'LC-101', tone: 'blue' },
            { name: 'Baberos', count: 2, img: 'LC-202', tone: 'mint' },
            { name: 'Mantas', count: 2, img: 'LC-301', tone: 'cream' },
          ].map((c, i) => (
            <div key={c.name}>
              <div className="lc-plate" style={{ aspectRatio: '3/2', background: `var(--lc-${c.tone}-soft)` }}>
                <img src={`../assets/products/${c.img}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </div>
              <div style={{ paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>0{i+1} · {c.count} {c.count===1?'pieza':'piezas'}</div>
                  <div className="lc-display" style={{ fontSize: 22, fontWeight: 400, marginTop: 4 }}>{c.name}</div>
                </div>
                <span className="lc-mono" style={{ fontSize: 16, color: 'var(--lc-gold-deep)' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured product big */}
      <section style={{ background: '#1A1410', color: '#FDFBF6', padding: '0 0 64px' }}>
        <div style={{ aspectRatio: '1/1', background: 'var(--lc-pink-soft)' }}>
          <img src="../assets/products/LC-010.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        </div>
        <div style={{ padding: '40px 20px 0' }}>
          <LCEyebrow style={{ color: 'var(--lc-gold)' }}>Destacado</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 44, lineHeight: 1, fontWeight: 300, marginTop: 14 }}>
            Mi <em className="lc-display-i" style={{ color: 'var(--lc-gold)' }}>Duraznito.</em>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(253,251,246,.7)', marginTop: 14, lineHeight: 1.7 }}>
            Cinco piezas en algodón Pima durazno con bordados a mano. Para los días que se recuerdan en fotografías.
          </p>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.24em', color: 'rgba(253,251,246,.5)' }}>Desde</div>
              <div className="lc-display" style={{ fontSize: 28, marginTop: 4 }}>S/ 79</div>
            </div>
            <LCButton variant="primary" style={{ background: 'var(--lc-bg)', color: 'var(--lc-ink)' }}>Ver pieza</LCButton>
          </div>
        </div>
      </section>

      {/* Gift teaser */}
      <section style={{ padding: '64px 20px', background: 'var(--lc-bg)' }}>
        <LCEyebrow>03 · Para regalar</LCEyebrow>
        <h2 className="lc-display" style={{ fontSize: 40, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
          El regalo<br/>que se <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>guarda.</em>
        </h2>
        <div className="lc-life tone-pink" style={{ aspectRatio: '4/3', marginTop: 20 }}>caja regalo Lion Cub · lazo crudo</div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[['La Bienvenida','S/ 149','Body + babero + mantita'],['El Ajuar','S/ 289','Set 5 piezas + manta + tarjeta'],['La Despedida','S/ 469','Premium + 2 mantas + caja madera']].map(([n,p,d],i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--lc-rule)' }}>
              <div>
                <div className="lc-display-i" style={{ fontSize: 17 }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--lc-ink-mute)', marginTop: 3 }}>{d}</div>
              </div>
              <div className="lc-display" style={{ fontSize: 16 }}>{p}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ padding: '64px 20px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="lc-display-i" style={{ fontSize: 56, color: 'var(--lc-gold-deep)', lineHeight: 0.4 }}>“</span>
          <p className="lc-display" style={{ fontSize: 22, lineHeight: 1.4, fontWeight: 300, marginTop: 8 }}>
            Cuando vestí a Sofía con el body, sentí que <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>la tela ya la conocía.</em>
          </p>
          <div style={{ marginTop: 20 }} className="lc-mono">María · mamá de Sofía · Lima</div>
        </div>
      </section>

      {/* WhatsApp + Newsletter */}
      <section style={{ padding: '64px 20px', background: 'var(--lc-bg)' }}>
        <LCEyebrow>Estamos cerca</LCEyebrow>
        <h3 className="lc-display" style={{ fontSize: 30, lineHeight: 1, fontWeight: 300, marginTop: 14 }}>
          A un mensaje<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>de distancia.</em>
        </h3>
        <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 14, lineHeight: 1.6 }}>
          Si dudas con la talla, color o si es para regalo, escríbenos. Responde una persona, no un bot.
        </p>
        <div style={{ marginTop: 18 }}>
          <LCWhatsApp>Escribir a Lion Cub</LCWhatsApp>
        </div>
        <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--lc-rule)' }}>
          <LCEyebrow>Carta mensual</LCEyebrow>
          <h3 className="lc-display" style={{ fontSize: 24, lineHeight: 1.1, fontWeight: 300, marginTop: 14 }}>
            Una carta al mes, <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>nada más.</em>
          </h3>
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--lc-ink)', paddingBottom: 8 }}>
            <input className="lc-input" style={{ flex: 1, border: 0, padding: '6px 0', fontSize: 13 }} placeholder="tu@correo.com"/>
            <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>→</span>
          </div>
        </div>
      </section>

      {/* Compact footer */}
      <section style={{ background: '#1A1410', color: '#FDFBF6', padding: '40px 20px 24px' }}>
        <LCLogo size={24} color="#FDFBF6"/>
        <p style={{ marginTop: 18, fontSize: 12, color: 'rgba(253,251,246,.55)', lineHeight: 1.7, fontWeight: 300 }}>
          Hilamos cada prenda en algodón Pima peruano. Para que su piel descanse en lo más fino.
        </p>
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12 }}>
          {['Colección','Para regalar','Historia','Cuidados','Tallas','FAQ','WhatsApp','Instagram'].map(t => <span key={t} style={{ color: 'rgba(253,251,246,.65)' }}>{t}</span>)}
        </div>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(253,251,246,.15)', fontSize: 9, fontFamily: 'var(--lc-font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(253,251,246,.5)' }}>
          © 2026 Lion Cub · Lima, Perú
        </div>
      </section>
    </div>
  );
}

function HomeB_Mobile() {
  return (
    <div className="lc-page" style={{ width: 390, fontSize: 14 }}>
      <LCAnnouncement inverted>Lima · Cusco · Miami · Madrid</LCAnnouncement>
      <div style={{ background: 'var(--lc-bg)', padding: '14px 20px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--lc-rule-soft)' }}>
        <LCWordmark size={0.6}/>
      </div>
      <div style={{ background: 'var(--lc-bg)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--lc-rule-soft)' }}>
        <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Menú</span>
        <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Bolsa (1)</span>
      </div>

      {/* Hero — big italic display */}
      <section style={{ padding: '40px 20px 0', background: 'var(--lc-bg)' }}>
        <div className="lc-life tone-cream" style={{ height: 360, marginBottom: 28 }}>
          editorial 01 · 2026 — la llegada
        </div>
        <LCEyebrow>· Una nota de Lion Cub ·</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 60, lineHeight: 0.92, fontWeight: 300, margin: '14px 0 0', letterSpacing: '-0.02em' }}>
          La fibra<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>más suave</em><br/>del mundo.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--lc-ink-soft)', marginTop: 20, lineHeight: 1.75, fontWeight: 300 }}>
          Cinco años buscando el tacto exacto. Lo encontramos en el algodón Pima peruano. Cada prenda se hace para acompañar — del hospital al primer cumpleaños.
        </p>
        <div style={{ marginTop: 24 }}>
          <LCButton variant="primary" style={{ width: '100%' }}>Ver la colección</LCButton>
        </div>
      </section>

      {/* Marquee word */}
      <section style={{ padding: '40px 20px 0', textAlign: 'center' }}>
        <div className="lc-display-i" style={{ fontSize: 26, lineHeight: 1.3, color: 'var(--lc-ink-soft)' }}>
          suave <span style={{ color: 'var(--lc-gold-deep)' }}>·</span> respirable <span style={{ color: 'var(--lc-gold-deep)' }}>·</span> hipoalergénico <span style={{ color: 'var(--lc-gold-deep)' }}>·</span> hecho a mano
        </div>
      </section>

      {/* Categories editorial */}
      <section style={{ padding: '56px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LCEyebrow>La colección</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 44, lineHeight: 0.95, fontWeight: 300, marginTop: 12 }}>
            Cuatro <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>capítulos.</em>
          </h2>
        </div>
        {[
          { n:'01', name: 'Conjuntos & Ajuares', count: 20, img: 'LC-001', tag: 'El primer abrazo' },
          { n:'02', name: 'Bodies', count: 1, img: 'LC-101', tag: 'La segunda piel' },
          { n:'03', name: 'Baberos', count: 2, img: 'LC-201', tag: 'Cada comida tierna' },
          { n:'04', name: 'Mantas', count: 2, img: 'LC-301', tag: 'Envueltos en cielo' },
        ].map((c, i) => (
          <div key={c.n} style={{ padding: '24px 0', borderTop: '1px solid var(--lc-rule)' }}>
            <div className="lc-display-i" style={{ fontSize: 40, color: 'var(--lc-gold-deep)', lineHeight: 1 }}>{c.n}.</div>
            <h3 className="lc-display" style={{ fontSize: 28, fontWeight: 400, marginTop: 6 }}>{c.name}</h3>
            <div className="lc-display-i" style={{ fontSize: 14, color: 'var(--lc-ink-soft)', marginTop: 4 }}>{c.tag}</div>
            <div className="lc-plate" style={{ marginTop: 16, aspectRatio: '4/3' }}>
              <img src={`../assets/products/${c.img}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>{c.count} {c.count === 1 ? 'pieza' : 'piezas'}</span>
              <LCButton variant="ghost">Explorar →</LCButton>
            </div>
          </div>
        ))}
      </section>

      {/* Pima ingredient (inverted) */}
      <section style={{ background: '#1A1410', color: '#FDFBF6', padding: '64px 20px' }}>
        <LCEyebrow style={{ color: 'var(--lc-gold)' }}>El ingrediente · 01</LCEyebrow>
        <h2 className="lc-display" style={{ fontSize: 80, lineHeight: 0.92, fontWeight: 300, marginTop: 14 }}>
          <em className="lc-display-i" style={{ color: 'var(--lc-gold)' }}>Pima.</em>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(253,251,246,.7)', marginTop: 18, lineHeight: 1.7 }}>
          Único en el mundo. Crece en los valles costeros del Perú. Su hebra extra-larga le da una suavidad que se queda.
        </p>
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'rgba(253,251,246,.1)' }}>
          {[['Origen','Piura'],['Hebra','3.5 cm'],['Cosecha','A mano'],['Cert.','GOTS']].map(([k, v]) => (
            <div key={k} style={{ background: '#1A1410', padding: '18px 16px' }}>
              <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(253,251,246,.4)' }}>{k}</div>
              <div style={{ fontSize: 16, marginTop: 8, fontWeight: 300 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section style={{ padding: '64px 20px', background: 'var(--lc-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <LCEyebrow>Más amadas</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 36, lineHeight: 1, fontWeight: 300, marginTop: 12 }}>
            Las que <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>se repiten.</em>
          </h2>
        </div>
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { id: 'LC-001', name: 'Tiernos Conejitos', tagline: 'El primer abrazo', price: 79, colors: ['Blanco'], gender: 'Unisex' },
            { id: 'LC-101', name: 'Body Esencial', tagline: 'La segunda piel', price: 29, colors: ['Blanco','Celeste','Palo Rosa'], gender: 'Unisex' },
            { id: 'LC-301', name: 'Manta Celestial', tagline: 'Envuelto en cielo', price: 49, colors: ['Celeste'], gender: 'Unisex' },
            { id: 'LC-016', name: 'Nube Celeste', tagline: 'Suavidad hecha ajuar', price: 79, colors: ['Celeste'], gender: 'Unisex' },
          ].map(p => <LCProductCard key={p.id} product={p}/>)}
        </div>
      </section>

      {/* Promise */}
      <section style={{ background: 'var(--lc-bg-warm)', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LCEyebrow>Nuestro compromiso</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 36, lineHeight: 1, fontWeight: 300, marginTop: 12 }}>
            Si no es <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>perfecto,</em><br/>no sale.
          </h2>
        </div>
        {[
          ['01','Algodón certificado','Trazabilidad de la mota a la prenda.'],
          ['02','Hecho en Lima','Taller pequeño, cada costura conocida.'],
          ['03','Empaque consciente','Caja FSC, lazo crudo, sin plásticos.'],
          ['04','Cambio garantizado','15 días sin preguntas, sin costo en Lima.'],
        ].map(([n,t,d]) => (
          <div key={n} style={{ padding: '18px 0', borderTop: '1px solid var(--lc-rule)' }}>
            <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--lc-gold-deep)' }}>{n}</div>
            <div className="lc-display-i" style={{ fontSize: 19, marginTop: 6 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', marginTop: 4, lineHeight: 1.6 }}>{d}</div>
          </div>
        ))}
      </section>

      {/* Closing */}
      <section style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--lc-bg)' }}>
        <h2 className="lc-display" style={{ fontSize: 48, lineHeight: 0.95, fontWeight: 300 }}>
          Llevemos a casa<br/>algo <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>suave.</em>
        </h2>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <LCButton variant="primary" style={{ width: '100%' }}>Ver la colección</LCButton>
          <LCWhatsApp>Hablar con nosotros</LCWhatsApp>
        </div>
      </section>

      <div style={{ background: '#1A1410', color: '#FDFBF6', padding: '32px 20px', fontSize: 10, fontFamily: 'var(--lc-font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', color: 'rgba(253,251,246,.6)' }}>
        © 2026 Lion Cub · Hecho a mano en Lima
      </div>
    </div>
  );
}

window.HomeA_Mobile = HomeA_Mobile;
window.HomeB_Mobile = HomeB_Mobile;
