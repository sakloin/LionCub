// Lion Cub — Editorial pages: Pima story, Gift box, Size guide, FAQ.

// ════════════════════════════════════════════════════════════════
// PIMA STORY — long-form editorial
// ════════════════════════════════════════════════════════════════
function PimaStory() {
  return (
    <div className="lc-page" style={{ width: 1280 }}>
      <LCAnnouncement>Capítulo del taller</LCAnnouncement>
      <LCNav cartCount={2}/>

      {/* Hero: huge italic word */}
      <section style={{ padding: '96px 80px 64px', textAlign: 'center', background: 'var(--lc-bg)' }}>
        <LCEyebrow>El ingrediente · Capítulo 01</LCEyebrow>
        <h1 className="lc-display-i" style={{ fontSize: 200, lineHeight: 0.92, fontWeight: 300, marginTop: 28, color: 'var(--lc-ink)', letterSpacing: '-0.04em' }}>
          Pima.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--lc-ink-soft)', marginTop: 28, maxWidth: 620, margin: '28px auto 0', lineHeight: 1.75, fontWeight: 300 }}>
          La historia de la fibra más suave del mundo — y por qué crece solo aquí, en los valles que miran al Pacífico.
        </p>
        <div className="lc-mono" style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 32 }}>
          Lectura · 4 minutos
        </div>
      </section>

      {/* Long photo */}
      <section style={{ padding: '0 80px' }}>
        <div className="lc-life tone-cream" style={{ height: 480 }}>campo de algodón Pima en Piura · luz del amanecer · vista aérea</div>
      </section>

      {/* Body paragraphs — drop cap */}
      <section style={{ padding: '96px 80px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 96 }}>
          <div>
            <LCEyebrow>Apartado 01</LCEyebrow>
            <h2 className="lc-display-i" style={{ fontSize: 36, lineHeight: 1, fontWeight: 300, marginTop: 14, position: 'sticky', top: 24 }}>
              Donde<br/>nace.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: 'var(--lc-ink-soft)', fontWeight: 300, margin: 0 }}>
              <span className="lc-display-i" style={{ float: 'left', fontSize: 88, lineHeight: 0.85, color: 'var(--lc-gold-deep)', paddingRight: 14, paddingTop: 8, fontWeight: 300 }}>E</span>l algodón Pima crece en los valles costeros del norte del Perú — Piura, Lambayeque, La Libertad. Es un microclima particular: sol constante todo el año, baja humedad, riego con agua que baja de los Andes. Esa combinación produce una hebra excepcionalmente larga, de hasta 3.5 centímetros, contra los 2 cm del algodón convencional.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: 'var(--lc-ink-soft)', fontWeight: 300, marginTop: 28 }}>
              Esa hebra extra-larga es lo que lo hace especial. Se enreda menos durante el hilado, lo que permite hilarla más fina sin perder resistencia. El resultado es una tela sedosa al tacto, con brillo natural, hipoalergénica y termorreguladora.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: 'var(--lc-ink-soft)', fontWeight: 300, marginTop: 28 }}>
              El Pima representa apenas el 3 % de la producción mundial de algodón. El Perú aporta cerca del 80 % de ese total. Es, literalmente, un material peruano.
            </p>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section style={{ padding: '64px 80px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span className="lc-display-i" style={{ fontSize: 96, color: 'var(--lc-gold-deep)', lineHeight: 0.5 }}>“</span>
          <p className="lc-display" style={{ fontSize: 44, lineHeight: 1.25, fontWeight: 300, marginTop: 18, letterSpacing: '-0.01em' }}>
            La hebra larga no es un dato técnico —<br/>es una <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>sensación.</em> Se nota cuando un body se desliza por la cabeza del bebé sin que él lo sienta.
          </p>
        </div>
      </section>

      {/* Side by side comparison */}
      <section style={{ padding: '96px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <LCEyebrow>Apartado 02</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
            Pima vs. <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>algodón común.</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {[
            { t: 'Algodón común', ink: 'var(--lc-ink-mute)', data: [['Hebra','~2 cm'],['Suavidad','Mediana, se pierde con el lavado'],['Brillo','Mate'],['Tacto','Áspero después de varios usos'],['Producción','Industrial, 80% del mundo']] },
            { t: 'Algodón Pima', ink: 'var(--lc-gold-deep)', data: [['Hebra','~3.5 cm — extra larga'],['Suavidad','Sedosa, permanente'],['Brillo','Natural, propio de la fibra'],['Tacto','Se mantiene tras cientos de lavados'],['Producción','Artesanal, 3% del mundo']] },
          ].map((side, i) => (
            <div key={side.t} style={{ background: i === 1 ? 'var(--lc-bg-warm)' : 'var(--lc-bg)', padding: 40, border: '1px solid var(--lc-rule)' }}>
              <div className="lc-display-i" style={{ fontSize: 28, color: side.ink, fontWeight: 300 }}>{side.t}</div>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {side.data.map(([k, v]) => (
                  <div key={k} style={{ padding: '14px 0', borderBottom: '1px solid var(--lc-rule)', display: 'grid', gridTemplateColumns: '100px 1fr', gap: 16 }}>
                    <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>{k}</span>
                    <span style={{ fontSize: 14, color: 'var(--lc-ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process — timeline */}
      <section style={{ padding: '96px 80px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <LCEyebrow>Apartado 03</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
            De la mota a la <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>prenda.</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
          {[
            ['01','Siembra','Octubre · Piura. Semillas de Pima en surcos abiertos a la mano.'],
            ['02','Cosecha','Marzo–Mayo. Recolección a mano, mota por mota, sin defoliantes químicos.'],
            ['03','Hilado','Trujillo. Hilatura fina, certificada GOTS, sin mezclas.'],
            ['04','Tejido','Lima. Tejido de punto suave en telares de baja velocidad.'],
            ['05','Confección','El taller. Costuras planas, broches sin níquel, bordados a mano.'],
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)' }}>{n}</div>
              <div className="lc-display" style={{ fontSize: 24, fontWeight: 400, marginTop: 10 }}>{t}</div>
              <p style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', marginTop: 10, lineHeight: 1.7 }}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, height: 1, background: 'var(--lc-rule)', position: 'relative' }}>
          {[0,1,2,3,4].map(i => (
            <span key={i} style={{ position: 'absolute', left: `${10 + i * 20}%`, top: -3, width: 7, height: 7, borderRadius: 99, background: 'var(--lc-gold-deep)' }}/>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '128px 80px', textAlign: 'center' }}>
        <h2 className="lc-display" style={{ fontSize: 72, lineHeight: 0.92, fontWeight: 300 }}>
          Tócalo para <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>entenderlo.</em>
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--lc-ink-soft)', marginTop: 28, maxWidth: 480, margin: '28px auto 0', lineHeight: 1.7 }}>
          La diferencia del Pima no se argumenta — se siente. Pide tu primera prenda y devuélvela en 15 días si no es lo que dijimos.
        </p>
        <div style={{ marginTop: 36 }}>
          <LCButton variant="primary">Ir a la colección</LCButton>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// GIFT BOX page
// ════════════════════════════════════════════════════════════════
function GiftBox() {
  return (
    <div className="lc-page" style={{ width: 1280 }}>
      <LCAnnouncement>Empaque tipo regalo · siempre · gratis</LCAnnouncement>
      <LCNav cartCount={0}/>

      {/* Hero */}
      <section style={{ padding: '96px 80px 0', background: 'var(--lc-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'center' }}>
          <div>
            <LCEyebrow>Para regalar</LCEyebrow>
            <h1 className="lc-display" style={{ fontSize: 96, lineHeight: 0.92, fontWeight: 300, marginTop: 22, letterSpacing: '-0.02em' }}>
              El regalo<br/>que se <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>guarda.</em>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--lc-ink-soft)', marginTop: 32, lineHeight: 1.8, maxWidth: 460, fontWeight: 300 }}>
              Cajas curadas a mano en papel reciclado, lazo de algodón crudo y carta manuscrita para los nuevos papás. Tres tamaños, personalización gratuita — la caja queda como recuerdo.
            </p>
          </div>
          <div className="lc-life tone-pink" style={{ aspectRatio: '4/5' }}>caja regalo Lion Cub · papel kraft + lazo crudo · sobre fondo crema</div>
        </div>
      </section>

      {/* Three boxes */}
      <section style={{ padding: '128px 80px', background: 'var(--lc-bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <LCEyebrow>Tres cajas</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
            Para cada <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>llegada.</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { n: '01', name: 'La Bienvenida', price: 149, color: 'pink', pieces: ['Body Esencial Premium','Babero Safari','Manta Celestial'], desc: 'Para amigos cercanos. Lo esencial, envuelto con calma.' },
            { n: '02', name: 'El Ajuar', price: 289, color: 'cream', pieces: ['Set 5 piezas a elección','Manta Dulces Pétalos','Tarjeta personalizada'], desc: 'El regalo intermedio. Suma una pieza completa al guardarropa.', featured: true },
            { n: '03', name: 'La Despedida del Hospital', price: 469, color: 'mint', pieces: ['Ajuar premium completo','2 mantas Pima','Caja de madera grabada'], desc: 'Para abuelos, padrinos, o el regalo del baby shower.' },
          ].map(b => (
            <div key={b.n} style={{ background: b.featured ? '#1A1410' : 'var(--lc-bg)', color: b.featured ? '#FDFBF6' : 'var(--lc-ink)', padding: 32, border: '1px solid ' + (b.featured ? 'transparent' : 'var(--lc-rule)'), display: 'flex', flexDirection: 'column' }}>
              <div className={"lc-life tone-" + (b.featured ? 'ink' : b.color)} style={{ aspectRatio: '5/4', marginBottom: 24 }}>caja {b.name.toLowerCase()}</div>
              <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: b.featured ? 'var(--lc-gold)' : 'var(--lc-gold-deep)' }}>Set · {b.n}</div>
              <h3 className="lc-display" style={{ fontSize: 32, lineHeight: 1, fontWeight: 300, marginTop: 14 }}>{b.name}</h3>
              <p style={{ fontSize: 13, color: b.featured ? 'rgba(253,251,246,.7)' : 'var(--lc-ink-soft)', marginTop: 12, lineHeight: 1.7, flex: 'none' }}>{b.desc}</p>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${b.featured ? 'rgba(253,251,246,.15)' : 'var(--lc-rule)'}` }}>
                <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: b.featured ? 'rgba(253,251,246,.5)' : 'var(--lc-ink-mute)', marginBottom: 10 }}>Incluye</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {b.pieces.map(p => (
                    <li key={p} style={{ fontSize: 13, color: b.featured ? 'rgba(253,251,246,.85)' : 'var(--lc-ink)', paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: 9, width: 8, height: 1, background: b.featured ? 'var(--lc-gold)' : 'var(--lc-gold-deep)' }}/>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div className="lc-display" style={{ fontSize: 32, fontWeight: 300 }}>S/ {b.price}</div>
                <LCButton variant={b.featured ? 'primary' : 'outline'} style={{ background: b.featured ? 'var(--lc-bg)' : undefined, color: b.featured ? 'var(--lc-ink)' : undefined }}>Elegir set</LCButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customization */}
      <section style={{ padding: '128px 80px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 96, alignItems: 'center' }}>
          <div>
            <LCEyebrow>Personalización</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 60, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
              La carta y el<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>nombre,</em><br/>los pones tú.
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--lc-ink-soft)', marginTop: 24, lineHeight: 1.75, maxWidth: 460 }}>
              Cada caja lleva una carta hecha a mano con la dedicatoria que nos envíes. Si quieres, bordamos el nombre del bebé en una de las piezas — 5 días extra de producción, sin costo adicional.
            </p>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380 }}>
              {[
                ['Carta manuscrita','Gratis · siempre'],
                ['Bordado del nombre','Gratis · +5 días'],
                ['Caja de madera grabada','+ S/ 39'],
                ['Envío programado a fecha exacta','Gratis'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--lc-rule)' }}>
                  <span style={{ fontSize: 14, color: 'var(--lc-ink)' }}>{k}</span>
                  <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-gold-deep)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lc-life tone-pink" style={{ aspectRatio: '1/1' }}>detalle de carta manuscrita y caja Lion Cub abierta</div>
        </div>
      </section>

      {/* Build your own */}
      <section style={{ padding: '128px 80px', background: 'var(--lc-bg)', textAlign: 'center' }}>
        <LCEyebrow>O construye el tuyo</LCEyebrow>
        <h2 className="lc-display" style={{ fontSize: 64, lineHeight: 0.95, fontWeight: 300, marginTop: 18 }}>
          Crea tu propio <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>set.</em>
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--lc-ink-soft)', marginTop: 22, maxWidth: 540, margin: '22px auto 0', lineHeight: 1.7 }}>
          Elige hasta 5 piezas — nosotros las envolvemos como una sola. Personalización y caja, gratis.
        </p>
        <div style={{ marginTop: 36 }}>
          <LCButton variant="primary">Empezar a armar →</LCButton>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SIZE GUIDE + CARE
// ════════════════════════════════════════════════════════════════
function SizeGuide() {
  return (
    <div className="lc-page" style={{ width: 1280 }}>
      <LCAnnouncement>Si dudas con la talla, escríbenos por WhatsApp — te ayudamos</LCAnnouncement>
      <LCNav/>

      <section style={{ padding: '96px 80px 0', textAlign: 'center' }}>
        <LCEyebrow>Para mamás y papás</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 88, lineHeight: 0.92, fontWeight: 300, marginTop: 20 }}>
          Tallas y <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>cuidados.</em>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--lc-ink-soft)', marginTop: 24, maxWidth: 560, margin: '24px auto 0', lineHeight: 1.7 }}>
          Lo que aprendimos en cinco años — la talla justa, el lavado que conserva, los gestos que estiran la vida de la prenda.
        </p>
      </section>

      {/* Size table */}
      <section style={{ padding: '96px 80px' }}>
        <LCEyebrow>Tabla de tallas Lion Cub</LCEyebrow>
        <h2 className="lc-display" style={{ fontSize: 44, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
          La talla <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>justa</em> es la talla siguiente.
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--lc-ink-soft)', marginTop: 16, maxWidth: 520, lineHeight: 1.7 }}>
          Los bebés crecen entre 1 y 3 cm por mes. Recomendamos siempre la talla siguiente — duerme mejor con holgura, y la prenda dura más.
        </p>

        <div style={{ marginTop: 56, border: '1px solid var(--lc-rule)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 1fr 1fr 1fr', background: 'var(--lc-ink)', color: 'var(--lc-bg)' }}>
            {['Talla','Edad','Peso','Altura','Notas'].map(h => (
              <div key={h} className="lc-mono" style={{ padding: '18px 20px', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {[
            ['RN','Recién nacido','2.5 – 3.5 kg','46 – 50 cm','Para hospital y primera semana en casa.'],
            ['0 – 3m','1 a 3 meses','3.5 – 5.5 kg','50 – 58 cm','La talla más vendida — usable de la 1ª a la 12ª semana.'],
            ['3 – 6m','3 a 6 meses','5.5 – 7.5 kg','58 – 66 cm','Crecimiento rápido — toma esta si dudas entre dos.'],
            ['6 – 9m','6 a 9 meses','7.5 – 9 kg','66 – 72 cm','Empieza a sentarse, gatear. Necesita más libertad.'],
            ['9 – 12m','9 a 12 meses','9 – 11 kg','72 – 78 cm','Caminando o por hacerlo. Talla generosa.'],
          ].map((row, i) => (
            <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 1fr 1fr 1fr', borderTop: '1px solid var(--lc-rule)' }}>
              {row.map((c, j) => (
                <div key={j} style={{ padding: '24px 20px', fontSize: j === 0 ? 17 : 13, color: j === 0 ? 'var(--lc-ink)' : 'var(--lc-ink-soft)', fontFamily: j === 0 ? 'var(--lc-font-display)' : 'inherit', fontStyle: j === 0 ? 'italic' : 'normal' }}>{c}</div>
              ))}
            </div>
          ))}
        </div>

        {/* Marisol quote */}
        <div style={{ marginTop: 56, padding: 40, background: 'var(--lc-bg-warm)', display: 'grid', gridTemplateColumns: '60px 1fr', gap: 24, alignItems: 'start' }}>
          <span className="lc-display-i" style={{ fontSize: 56, color: 'var(--lc-gold-deep)', lineHeight: 0.5 }}>“</span>
          <div>
            <p className="lc-display" style={{ fontSize: 26, lineHeight: 1.35, fontWeight: 300 }}>
              "La RN solo sirve hasta los 3.5 kg. Si tu bebé pesa más, recomiendo 0–3m — y si vas al hospital, lleva las dos. Vale la pena."
            </p>
            <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 14 }}>Marisol · costurera mayor del taller</div>
          </div>
        </div>
      </section>

      {/* Care */}
      <section style={{ padding: '96px 80px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 96 }}>
          <div>
            <LCEyebrow>Cuidados</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
              Para que la suavidad se <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>quede.</em>
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--lc-ink-soft)', marginTop: 18, lineHeight: 1.75 }}>
              El Pima resiste — pero responde mejor a un trato pequeño. Estos gestos hacen que la prenda dure años.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {[
              { i: '○', t: 'Agua tibia', d: 'Hasta 30°. Nunca caliente — la fibra se acorta.' },
              { i: '◐', t: 'Ciclo delicado', d: 'O a mano. Sin centrifugado fuerte.' },
              { i: '✕', t: 'Sin suavizantes', d: 'Bloquean la respirabilidad natural del Pima.' },
              { i: '☼', t: 'Secado a la sombra', d: 'El sol directo aclara los tonos pastel.' },
              { i: '◇', t: 'Plancha tibia', d: 'Solo si es necesario. Del revés para los bordados.' },
              { i: '☐', t: 'Guardado plano', d: 'Mejor doblado que colgado. Evita la deformación.' },
            ].map(c => (
              <div key={c.t} style={{ paddingTop: 18, borderTop: '1px solid var(--lc-rule)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 99, border: '1px solid var(--lc-ink)', fontFamily: 'var(--lc-font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--lc-gold-deep)' }}>{c.i}</span>
                  <div className="lc-display" style={{ fontSize: 19, fontWeight: 400 }}>{c.t}</div>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', marginTop: 12, lineHeight: 1.7 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// FAQ — papás primerizos
// ════════════════════════════════════════════════════════════════
function FAQ() {
  const sections = [
    {
      t: 'Para el hospital y los primeros días',
      items: [
        ['¿Qué tallas comprar antes del nacimiento?','Recomendamos llevar talla RN y 0–3m. RN sirve hasta 3.5 kg; muchos bebés nacen ya en 0–3m. Si esperas mellizos o gemelos, lleva más unidades de RN.'],
        ['¿Cuántos bodies y conjuntos llevar al hospital?','Para 2 días en clínica: 3 bodies + 2 conjuntos + 1 mantita. Después de la clínica, 5–7 bodies y 3–4 conjuntos para la primera semana.'],
        ['¿Qué pieza para la salida del hospital?','Un ajuar completo: chaqueta, vestido o pelele, gorrito, manta. Mi Duraznito o Nube Celeste Premium son nuestros más pedidos.'],
        ['¿Es seguro estrenar la ropa sin lavarla?','Recomendamos lavar siempre antes del primer uso, aunque nuestras prendas vienen sin químicos. Es un gesto extra de cuidado.'],
      ],
    },
    {
      t: 'Sobre el algodón Pima',
      items: [
        ['¿Es realmente más suave?','Sí, y se nota desde el primer contacto. La hebra extra-larga le da un tacto sedoso que se mantiene tras cientos de lavados.'],
        ['¿Es hipoalergénico?','Es naturalmente hipoalergénico, sin químicos añadidos. Ideal para pieles sensibles, eczema atópico y dermatitis del pañal.'],
        ['¿Por qué es más caro que el algodón normal?','Porque representa solo el 3% del algodón mundial, se cosecha a mano y se hila en lotes pequeños. Un body Lion Cub dura el doble que uno común.'],
        ['¿Mantiene el color tras los lavados?','Sí — siempre que sigas las indicaciones de cuidado. Los tonos pastel pueden suavizarse muy ligeramente con el sol directo.'],
      ],
    },
    {
      t: 'Compras, envíos y devoluciones',
      items: [
        ['¿Cómo funcionan los envíos?','Lima · 24–48 h · gratis desde S/ 199. Provincia · 3–5 días. USA · 7–10 días, declaramos como regalo para evitar aduanas.'],
        ['¿Puedo cambiar la talla si no le queda?','Sí, hasta 15 días después de recibido. En Lima recogemos sin costo; en provincia y USA cubrimos hasta S/ 25 del envío.'],
        ['¿Cómo se paga?','Visa, Mastercard, Amex, Yape y Plin a través de Culqi (pago seguro 3-D Secure). Para USA aceptamos también PayPal.'],
        ['¿Y si prefiero coordinar por WhatsApp?','Perfecto. Responde una persona, no un bot. Te ayudamos con tallas, colores y armamos el pedido contigo.'],
      ],
    },
    {
      t: 'Para regalar',
      items: [
        ['¿Todas las piezas vienen en empaque tipo regalo?','Sí, siempre. Caja FSC con lazo de algodón crudo. Sin costo extra.'],
        ['¿Puedo enviarlo directo a la mamá con carta?','Sí. Pones tu mensaje al cerrar el pedido, lo escribimos a mano y lo enviamos a la dirección que prefieras.'],
        ['¿Puedo programar la fecha de entrega?','Sí — útil para baby showers o regalos sorpresa. Indícanos la fecha al pagar.'],
        ['¿Hay opción de gift card?','Sí, desde S/ 99. La envía Lion Cub directo al destinatario con tu mensaje.'],
      ],
    },
  ];

  return (
    <div className="lc-page" style={{ width: 1280 }}>
      <LCAnnouncement>Si tu pregunta no está aquí, escríbenos por WhatsApp</LCAnnouncement>
      <LCNav/>

      <section style={{ padding: '96px 80px 0', textAlign: 'center' }}>
        <LCEyebrow>Para mamás y papás primerizos</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 88, lineHeight: 0.92, fontWeight: 300, marginTop: 18 }}>
          Las preguntas que <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>importan.</em>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--lc-ink-soft)', marginTop: 22, maxWidth: 560, margin: '22px auto 0', lineHeight: 1.7 }}>
          Lo que aprendimos de cientos de familias — y lo que nos hubiera gustado saber con el primero.
        </p>
      </section>

      <section style={{ padding: '96px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 2fr', gap: 96 }}>
          {/* Sidebar nav */}
          <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
            <LCEyebrow>Capítulos</LCEyebrow>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sections.map((s, i) => (
                <a key={s.t} href={`#faq-${i}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)' }}>0{i+1}</div>
                  <div className="lc-display-i" style={{ fontSize: 19, color: i === 0 ? 'var(--lc-ink)' : 'var(--lc-ink-soft)', marginTop: 2, lineHeight: 1.2 }}>{s.t}</div>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 40, padding: 20, background: 'var(--lc-bg-warm)' }}>
              <LCEyebrow>¿No está tu pregunta?</LCEyebrow>
              <div className="lc-display-i" style={{ fontSize: 19, marginTop: 8, lineHeight: 1.3 }}>Escríbenos por WhatsApp.</div>
              <div style={{ marginTop: 14 }}>
                <LCWhatsApp/>
              </div>
            </div>
          </div>

          {/* FAQ list */}
          <div>
            {sections.map((s, i) => (
              <div key={s.t} id={`faq-${i}`} style={{ marginBottom: 56 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--lc-ink)' }}>
                  <span className="lc-display-i" style={{ fontSize: 28, color: 'var(--lc-gold-deep)' }}>0{i+1}.</span>
                  <h2 className="lc-display" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.01em' }}>{s.t}</h2>
                </div>
                {s.items.map((it, j) => (
                  <details key={j} open={i === 0 && j === 0} style={{ padding: '24px 0', borderBottom: '1px solid var(--lc-rule)' }}>
                    <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '40px 1fr 30px', alignItems: 'baseline', gap: 16 }}>
                      <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)' }}>{String(j+1).padStart(2,'0')}</span>
                      <div className="lc-display-i" style={{ fontSize: 21, color: 'var(--lc-ink)', lineHeight: 1.3 }}>{it[0]}</div>
                      <span className="lc-mono" style={{ fontSize: 18, color: 'var(--lc-ink-mute)', textAlign: 'right' }}>{i === 0 && j === 0 ? '−' : '+'}</span>
                    </summary>
                    <div style={{ marginTop: 18, paddingLeft: 56, fontSize: 14.5, color: 'var(--lc-ink-soft)', lineHeight: 1.8, maxWidth: 620 }}>{it[1]}</div>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

window.PimaStory = PimaStory;
window.GiftBox = GiftBox;
window.SizeGuide = SizeGuide;
window.FAQ = FAQ;
