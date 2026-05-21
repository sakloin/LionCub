// Lion Cub — HOME · Direction A · "Editorial Letter"
// Inspired by Bonpoint + Marie-Chantal. Large hero, generous whitespace,
// asymmetric magazine compositions, full-bleed lifestyle.

function HomeA_Desktop() {
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Envíos a Perú · USA · Carta del recién nacido en cada pedido</LCAnnouncement>
      <LCNav cartCount={2}/>

      {/* HERO — magazine-cover style */}
      <section style={{ position: 'relative', padding: '40px 64px 96px', background: 'var(--lc-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 64, alignItems: 'center' }}>
          {/* Left: text */}
          <div>
            <LCEyebrow>Carta del primer abrazo · SS · 2026</LCEyebrow>
            <h1 className="lc-display" style={{ fontSize: 96, lineHeight: 0.92, fontWeight: 300, margin: '24px 0 0', letterSpacing: '-0.03em' }}>
              Suave como<br/>su <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>piel,</em><br/>
              puro como<br/>su <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>llegada.</em>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--lc-ink-soft)', marginTop: 32, maxWidth: 440, fontWeight: 300 }}>
              Hilamos cada prenda en algodón Pima peruano — la fibra más suave del mundo. Hipoalergénica, transpirable y delicada, pensada para los primeros días, las primeras noches y los abrazos que vienen.
            </p>
            <div style={{ marginTop: 40, display: 'flex', gap: 16, alignItems: 'center' }}>
              <LCButton variant="primary">Descubrir la colección</LCButton>
              <LCButton variant="ghost">Por qué Pima</LCButton>
            </div>
            <div style={{ marginTop: 56, display: 'flex', gap: 36 }}>
              {[['200+','familias acompañadas'],['100%','algodón Pima'],['Lima','hecho a mano']].map(([n,l]) => (
                <div key={l}>
                  <div className="lc-display" style={{ fontSize: 28, fontWeight: 300, color: 'var(--lc-ink)' }}>{n}</div>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero image stack */}
          <div style={{ position: 'relative', height: 680 }}>
            <div style={{ position: 'absolute', inset: '40px 0 0 60px', background: 'var(--lc-pink-soft)', borderRadius: 2 }}>
              <div className="lc-life tone-pink" style={{ position: 'absolute', inset: 0 }}>
                bebé recién nacido envuelto en manta Pima — luz natural, fondo crema
              </div>
            </div>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 220, height: 280, overflow: 'hidden', boxShadow: 'var(--lc-shadow-2)' }}>
              <img src="../assets/products/LC-001.jpeg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 24, width: 180, padding: 20, background: 'var(--lc-bg)', boxShadow: 'var(--lc-shadow-2)' }}>
              <LCEyebrow style={{ marginBottom: 10 }}>Edición SS 26</LCEyebrow>
              <div className="lc-display-i" style={{ fontSize: 22, lineHeight: 1.1, fontWeight: 300 }}>Tiernos<br/>Conejitos</div>
              <div style={{ fontSize: 11, color: 'var(--lc-ink-mute)', marginTop: 8 }}>Set 5 piezas · desde S/ 79</div>
              <div style={{ marginTop: 12, height: 1, background: 'var(--lc-rule)' }}/>
              <div className="lc-mono" style={{ marginTop: 10, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lc-gold-deep)' }}>Ver pieza →</div>
            </div>
          </div>
        </div>
        {/* Bottom hairline with scroll cue */}
        <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>Continuar</span>
          <span style={{ flex: 1, height: 1, background: 'var(--lc-rule)' }}/>
          <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>01 · Material</span>
        </div>
      </section>

      {/* MATERIAL — quiet, factual */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 96, alignItems: 'center' }}>
          <div>
            <LCEyebrow>Capítulo 01 · El material</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 76, lineHeight: 0.95, fontWeight: 300, marginTop: 24, letterSpacing: '-0.02em' }}>
              La fibra más<br/>suave del <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>mundo.</em>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--lc-ink-soft)', marginTop: 28, maxWidth: 460, fontWeight: 300 }}>
              El algodón Pima crece bajo el sol constante de la costa norte del Perú. Su hebra extra-larga le da un brillo natural, una resistencia silenciosa y un tacto que se mantiene lavado tras lavado.
            </p>
            <div style={{ marginTop: 36 }}>
              <LCButton variant="outline">Leer la historia completa</LCButton>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="lc-life tone-cream" style={{ aspectRatio: '3/4' }}>campo de algodón Pima al amanecer</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="lc-life tone-cream" style={{ aspectRatio: '4/3' }}>hebra de algodón en detalle macro</div>
              <div style={{ background: 'var(--lc-bg)', padding: 28, flex: 1 }}>
                <LCEyebrow style={{ marginBottom: 12 }}>Hebra</LCEyebrow>
                <div className="lc-display" style={{ fontSize: 36, fontWeight: 300, lineHeight: 1 }}>3×</div>
                <div style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 6, lineHeight: 1.5 }}>más larga que el algodón convencional</div>
                <div style={{ margin: '20px 0', height: 1, background: 'var(--lc-rule)' }}/>
                <LCEyebrow style={{ marginBottom: 12 }}>Origen</LCEyebrow>
                <div style={{ fontSize: 13, color: 'var(--lc-ink-soft)' }}>Piura, Lambayeque · cosecha a mano</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 promises */}
        <div style={{ marginTop: 96, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
          {[
            ['Hipoalergénico','Libre de químicos agresivos. Para pieles que apenas están conociendo el mundo.'],
            ['Transpirable','Regula la temperatura naturalmente: fresco en verano, abrigo en invierno.'],
            ['Resistente','La hebra larga aguanta el uso diario y el lavado constante. La suavidad permanece.'],
          ].map(([t, d], i) => (
            <div key={t} style={{ paddingTop: 20, borderTop: '1px solid var(--lc-rule)' }}>
              <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--lc-gold-deep)' }}>0{i+1}</span>
              <div className="lc-display" style={{ fontSize: 28, fontWeight: 400, marginTop: 12 }}>{t}</div>
              <p style={{ fontSize: 13.5, color: 'var(--lc-ink-soft)', marginTop: 10, lineHeight: 1.7 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COLLECTION shortcut — editorial */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 56 }}>
          <div>
            <LCEyebrow>Capítulo 02 · La colección</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 76, lineHeight: 0.95, fontWeight: 300, marginTop: 24, letterSpacing: '-0.02em' }}>
              Piezas para los<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>primeros días.</em>
            </h2>
          </div>
          <LCButton variant="ghost">Ver las 25 piezas</LCButton>
        </div>

        {/* Category strip — editorial */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { name: 'Conjuntos & Ajuares', count: 20, img: 'LC-001', tag: 'el primer abrazo' },
            { name: 'Bodies', count: 1, img: 'LC-101', tag: 'la segunda piel' },
            { name: 'Baberos', count: 2, img: 'LC-202', tag: 'cada comida tierna' },
            { name: 'Mantas', count: 2, img: 'LC-301', tag: 'envueltos en cielo' },
          ].map((c, i) => (
            <div key={c.name}>
              <div className="lc-plate" style={{ aspectRatio: '3/4', background: ['var(--lc-pink-soft)','var(--lc-blue-soft)','var(--lc-mint-soft)','var(--lc-bg-warm)'][i] }}>
                <img src={`../assets/products/${c.img}.jpeg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
              <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>0{i+1} · {c.count} piezas</div>
                  <div className="lc-display" style={{ fontSize: 22, fontWeight: 400, marginTop: 6 }}>{c.name}</div>
                  <div className="lc-display-i" style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 2 }}>{c.tag}</div>
                </div>
                <span className="lc-mono" style={{ fontSize: 16, color: 'var(--lc-gold-deep)' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCT — full-bleed editorial */}
      <section style={{ background: 'var(--lc-bg-ink)', color: '#FDFBF6', padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0, alignItems: 'stretch' }}>
          <div style={{ background: 'var(--lc-pink-soft)', minHeight: 720, position: 'relative' }}>
            <img src="../assets/products/LC-010.jpeg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <div style={{ padding: '120px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <LCEyebrow style={{ color: 'var(--lc-gold)' }}>Pieza destacada · Ajuar premium</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 60, lineHeight: 1, fontWeight: 300, marginTop: 24, letterSpacing: '-0.02em' }}>
              Mi <em className="lc-display-i" style={{ color: 'var(--lc-gold)' }}>Duraznito.</em>
            </h2>
            <div className="lc-display-i" style={{ fontSize: 18, color: 'rgba(253,251,246,.7)', marginTop: 10 }}>Dulce como su nombre.</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'rgba(253,251,246,.75)', marginTop: 28, maxWidth: 420, fontWeight: 300 }}>
              Cinco piezas hiladas en algodón Pima color durazno: chaqueta, vestido con bordado floral hecho a mano, bloomer con volantes, lazo y zapatitos. Para los días que se recuerdan en fotografías.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 32, alignItems: 'baseline' }}>
              <div>
                <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'rgba(253,251,246,.5)' }}>Desde</div>
                <div className="lc-display" style={{ fontSize: 36, color: '#FDFBF6', fontWeight: 300, marginTop: 4 }}>S/ 79</div>
              </div>
              <span style={{ width: 1, height: 60, background: 'rgba(253,251,246,.2)' }}/>
              <div>
                <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'rgba(253,251,246,.5)' }}>Tallas</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  {['RN','0-3m','3-6m'].map(s => <span key={s} className="lc-pill" style={{ background: 'transparent', borderColor: 'rgba(253,251,246,.3)', color: '#FDFBF6' }}>{s}</span>)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 44, display: 'flex', gap: 16 }}>
              <LCButton variant="primary" style={{ background: 'var(--lc-bg)', color: 'var(--lc-ink)' }}>Agregar a la bolsa</LCButton>
              <LCButton variant="outline" style={{ borderColor: 'rgba(253,251,246,.4)', color: '#FDFBF6' }}>Ver detalles</LCButton>
            </div>
          </div>
        </div>
      </section>

      {/* GIFT BOX teaser */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'center' }}>
          <div>
            <LCEyebrow>Capítulo 03 · Para regalar</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 64, lineHeight: 0.95, fontWeight: 300, marginTop: 24, letterSpacing: '-0.02em' }}>
              El regalo<br/>que se <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>guarda.</em>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--lc-ink-soft)', marginTop: 24, maxWidth: 440, fontWeight: 300 }}>
              Cajas curadas a mano en papel reciclado, lazo de algodón crudo y carta manuscrita para los nuevos papás. Tres tamaños · personalización gratuita.
            </p>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
              {[
                ['La Bienvenida','S/ 149','Body + babero + mantita'],
                ['El Ajuar','S/ 289','Set 5 piezas + manta + tarjeta'],
                ['La Despedida del Hospital','S/ 469','Ajuar premium + 2 mantas + caja madera'],
              ].map(([n,p,d]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid var(--lc-rule)' }}>
                  <div>
                    <div className="lc-display-i" style={{ fontSize: 18, color: 'var(--lc-ink)' }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--lc-ink-mute)', marginTop: 3 }}>{d}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="lc-display" style={{ fontSize: 18, color: 'var(--lc-ink)' }}>{p}</div>
                    <span className="lc-mono" style={{ fontSize: 14, color: 'var(--lc-gold-deep)' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lc-life tone-pink" style={{ aspectRatio: '4/5' }}>
            caja de regalo Lion Cub envuelta en lazo crema, sobre fondo crema cálido
          </div>
        </div>
      </section>

      {/* TESTIMONIAL — single, large, intimate */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg-warm)', position: 'relative' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
          <span className="lc-display-i" style={{ fontSize: 80, color: 'var(--lc-gold-deep)', lineHeight: 0.5, display: 'inline-block' }}>“</span>
          <p className="lc-display" style={{ fontSize: 36, lineHeight: 1.3, fontWeight: 300, marginTop: 16, letterSpacing: '-0.01em' }}>
            Llegó en una caja preciosa. Cuando vestí a Sofía con el body por primera vez, sentí que <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>la tela ya la conocía.</em> No se ha irritado nunca.
          </p>
          <div style={{ marginTop: 32, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div className="lc-mono" style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>María · mamá de Sofía</div>
            <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>Lima · 4 meses</div>
          </div>
        </div>
        {/* dot pagination */}
        <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 10 }}>
          {[0,1,2].map(i => <span key={i} style={{ width: i===0?24:6, height: 1, background: i===0?'var(--lc-ink)':'var(--lc-rule)' }}/>)}
        </div>
      </section>

      {/* Care notes / FAQ teaser */}
      <section style={{ padding: '128px 64px', background: 'var(--lc-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 96 }}>
          <div>
            <LCEyebrow>Para mamás y papás primerizos</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 300, marginTop: 24, letterSpacing: '-0.02em' }}>
              Las preguntas<br/>que importan al<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>llegar a casa.</em>
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--lc-ink-soft)', marginTop: 24, maxWidth: 360 }}>
              Lo que aprendimos de cientos de familias — y lo que nos hubiera gustado saber con el primero.
            </p>
            <div style={{ marginTop: 28 }}>
              <LCButton variant="outline">Ver la guía completa</LCButton>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--lc-rule)' }}>
            {[
              ['¿Qué tallas comprar para el hospital?','RN para bebés bajo 3.5 kg, 0–3m para el resto. Recomendamos llevar de las dos.'],
              ['¿Cómo lavar el algodón Pima?','Agua tibia, ciclo delicado, sin suavizantes. Se seca a la sombra; la fibra recupera su forma sola.'],
              ['¿Cuánto demora el envío?','24–48 h en Lima · 3–5 días en provincia · 7–10 días a USA. Empaque tipo regalo en todos.'],
              ['¿Se puede cambiar la talla?','Sí, hasta 15 días después de recibido. Sin costo dentro de Lima.'],
            ].map(([q,a], i) => (
              <div key={i} style={{ padding: '26px 0', borderBottom: '1px solid var(--lc-rule)', display: 'grid', gridTemplateColumns: '40px 1fr 1.4fr 20px', gap: 24, alignItems: 'start' }}>
                <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)' }}>0{i+1}</span>
                <div className="lc-display-i" style={{ fontSize: 19, color: 'var(--lc-ink)', lineHeight: 1.3 }}>{q}</div>
                <div style={{ fontSize: 13.5, color: 'var(--lc-ink-soft)', lineHeight: 1.7 }}>{a}</div>
                <span className="lc-mono" style={{ fontSize: 16, color: 'var(--lc-ink-mute)', textAlign: 'right' }}>+</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / WhatsApp dual */}
      <section style={{ padding: '96px 64px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <LCEyebrow>La carta Lion Cub</LCEyebrow>
            <h3 className="lc-display" style={{ fontSize: 40, lineHeight: 1, fontWeight: 300, marginTop: 16 }}>
              Una carta al mes,<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>nada más.</em>
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--lc-ink-soft)', marginTop: 16, maxWidth: 380, lineHeight: 1.7 }}>
              Historias, cuidados, preventas. Sin promos agresivas — solo lo que querrías leer con un café.
            </p>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--lc-ink)', maxWidth: 440, paddingBottom: 10 }}>
              <input className="lc-input" style={{ flex: 1, border: 0, padding: '8px 0' }} placeholder="tu@correo.com"/>
              <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer' }}>Suscribirme →</span>
            </div>
          </div>
          <div style={{ background: 'var(--lc-bg)', padding: 40, borderRadius: 2 }}>
            <LCEyebrow>¿Prefieres conversar?</LCEyebrow>
            <h3 className="lc-display" style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 300, marginTop: 14 }}>
              Estamos a un mensaje<br/>de distancia.
            </h3>
            <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 14, lineHeight: 1.6 }}>
              Si dudas con la talla, el color o si es para regalo — escríbenos. Responde una persona, no un bot.
            </p>
            <div style={{ marginTop: 22 }}>
              <LCWhatsApp>Escribir a Lion Cub</LCWhatsApp>
            </div>
          </div>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

window.HomeA_Desktop = HomeA_Desktop;
