// Lion Cub — Shop pages: Collection, Product Detail, Cart (desktop + mobile)

// ════════════════════════════════════════════════════════════════
// COLLECTION (desktop)
// ════════════════════════════════════════════════════════════════
function Collection_Desktop() {
  const products = window.LC_DEMO_PRODUCTS || [];
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Envío gratis en Lima desde S/ 199 · Empaque tipo regalo siempre</LCAnnouncement>
      <LCNav cartCount={2}/>

      {/* Page header */}
      <section style={{ padding: '64px 64px 32px' }}>
        <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>
          Inicio &nbsp;/&nbsp; Colección &nbsp;/&nbsp; Todo
        </div>
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'end' }}>
          <div>
            <LCEyebrow>SS · 26 — la colección completa</LCEyebrow>
            <h1 className="lc-display" style={{ fontSize: 88, lineHeight: 0.92, fontWeight: 300, marginTop: 18, letterSpacing: '-0.02em' }}>
              Veinticinco<br/>piezas, un solo<br/><em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>hilo.</em>
            </h1>
          </div>
          <p style={{ fontSize: 15, color: 'var(--lc-ink-soft)', lineHeight: 1.8, fontWeight: 300, maxWidth: 380 }}>
            Cada pieza está hilada en algodón Pima 100%. Desde el body más esencial hasta el ajuar para la salida del hospital — diseñados para los primeros días y para muchos más.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ padding: '0 64px', position: 'sticky', top: 0, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderTop: '1px solid var(--lc-rule)', borderBottom: '1px solid var(--lc-rule)' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Pill active>Todo · 25</Pill>
            <Pill>Conjuntos · 20</Pill>
            <Pill>Bodies · 1</Pill>
            <Pill>Baberos · 2</Pill>
            <Pill>Mantas · 2</Pill>
            <span style={{ width: 1, height: 28, background: 'var(--lc-rule)', alignSelf: 'center', margin: '0 8px' }}/>
            <Pill>Unisex</Pill>
            <Pill>Niña</Pill>
            <Pill>Niño</Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>Filtrar +</span>
            <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>Ordenar · Más amadas ▾</span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '64px 64px 128px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, rowGap: 64 }}>
          {products.slice(0, 12).map((p, i) => (
            <React.Fragment key={p.id}>
              {i === 4 && (
                /* editorial break tile */
                <div style={{ gridColumn: '1 / span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 24px' }}>
                  <LCEyebrow>Nota del taller</LCEyebrow>
                  <div className="lc-display-i" style={{ fontSize: 36, lineHeight: 1.2, fontWeight: 300, marginTop: 14, letterSpacing: '-0.01em' }}>
                    "La Talla RN solo sirve hasta los 3.5 kg. Si tu bebé pesa más, te recomendamos 0–3m."
                  </div>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--lc-ink-mute)', marginTop: 18 }}>Marisol · costurera mayor</div>
                </div>
              )}
              <LCProductCard product={p}/>
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <span className="lc-mono" style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>Cargando 12 de 25 piezas</span>
          <div style={{ margin: '14px auto 0', width: 280, height: 1, background: 'var(--lc-rule)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '48%', height: 1, background: 'var(--lc-gold-deep)' }}/>
          </div>
          <div style={{ marginTop: 28 }}>
            <LCButton variant="outline">Ver más piezas</LCButton>
          </div>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

function Pill({ active, children }) {
  return (
    <span style={{
      padding: '8px 14px',
      borderRadius: 999,
      border: '1px solid ' + (active ? 'var(--lc-ink)' : 'var(--lc-rule)'),
      background: active ? 'var(--lc-ink)' : 'transparent',
      color: active ? 'var(--lc-bg)' : 'var(--lc-ink-soft)',
      fontFamily: 'var(--lc-font-mono)',
      fontSize: 10,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      cursor: 'pointer',
    }}>{children}</span>
  );
}

// ════════════════════════════════════════════════════════════════
// PRODUCT DETAIL (desktop)
// ════════════════════════════════════════════════════════════════
function ProductDetail_Desktop() {
  const p = {
    id: 'LC-010', name: 'Mi Duraznito', tagline: 'Dulce como su nombre',
    desc: 'Ajuar premium hilado en algodón Pima color durazno. Compuesto por cinco piezas pensadas para la salida del hospital y los días posteriores: chaqueta kimono con cinta de raso, vestido con bordado floral hecho a mano, bloomer con volantes, lazo y zapatitos de algodón. Cada bordado toma cerca de tres horas; cada caja se cierra a mano.',
    price: 79, sizes: ['RN','0-3m','3-6m'],
    colors: [['Durazno','#EDC8B0'],['Crema','#F0E3CB'],['Palo Rosa','#EDD3CC']],
    gender: 'Niña', material: '100% Algodón Pima', sku: 'LC-010', pieces: 5,
  };
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Envío exprés en 24h en Lima · Cambios sin preguntas en 15 días</LCAnnouncement>
      <LCNav cartCount={2}/>

      <section style={{ padding: '24px 64px 0' }}>
        <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>
          Inicio &nbsp;/&nbsp; Colección &nbsp;/&nbsp; Conjuntos &amp; Ajuares &nbsp;/&nbsp; <span style={{ color: 'var(--lc-ink)' }}>Mi Duraznito</span>
        </div>
      </section>

      {/* Main */}
      <section style={{ padding: '32px 64px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* thumb column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 24 }}>
            {[0,1,2,3].map(i => (
              <div key={i} className="lc-plate" style={{ aspectRatio: '1/1', border: i===0?'1px solid var(--lc-ink)':'1px solid var(--lc-rule)', cursor: 'pointer', background: 'var(--lc-pink-soft)' }}>
                {i === 0 && <img src="../assets/products/LC-010.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
                {i > 0 && <span className="lc-mono" style={{ fontSize: 8, color: 'var(--lc-ink-mute)' }}>0{i+1}</span>}
              </div>
            ))}
          </div>
          {/* main image */}
          <div>
            <div className="lc-plate" style={{ aspectRatio: '4/5', background: 'var(--lc-pink-soft)' }}>
              <img src="../assets/products/LC-010.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>01 / 04 · zoom +</span>
              <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>← →</span>
            </div>
          </div>

          {/* info */}
          <div style={{ paddingLeft: 32 }}>
            <LCEyebrow>{p.gender} · {p.pieces} piezas</LCEyebrow>
            <h1 className="lc-display" style={{ fontSize: 64, lineHeight: 0.95, fontWeight: 300, margin: '14px 0 0', letterSpacing: '-0.02em' }}>{p.name}</h1>
            <div className="lc-display-i" style={{ fontSize: 19, color: 'var(--lc-ink-soft)', marginTop: 8 }}>{p.tagline}</div>
            <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 14 }}>SKU · {p.sku}</div>

            <div style={{ margin: '32px 0', height: 1, background: 'var(--lc-rule)' }}/>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div className="lc-display" style={{ fontSize: 40, fontWeight: 300 }}>
                <span className="lc-mono" style={{ fontSize: 13, color: 'var(--lc-ink-mute)', marginRight: 6 }}>S/</span>{p.price}.00
              </div>
              <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-gold-deep)' }}>En stock · listo para enviar</span>
            </div>

            {/* Color */}
            <div style={{ marginTop: 36 }}>
              <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)', marginBottom: 14 }}>Color · <span style={{ color: 'var(--lc-ink)' }}>{p.colors[0][0]}</span></div>
              <div style={{ display: 'flex', gap: 14 }}>
                {p.colors.map(([n, h], i) => (
                  <div key={n} style={{ position: 'relative', cursor: 'pointer' }}>
                    <span style={{ display: 'block', width: 36, height: 36, borderRadius: 999, background: h, border: '1px solid rgba(0,0,0,.06)', boxShadow: i === 0 ? '0 0 0 1px var(--lc-ink), 0 0 0 5px var(--lc-bg)' : 'none' }}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>Talla · <span style={{ color: 'var(--lc-ink)' }}>0–3m</span></span>
                <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-gold-deep)', cursor:'pointer' }}>Guía de tallas →</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {p.sizes.map((s, i) => (
                  <span key={s} style={{
                    flex: 1, textAlign: 'center', padding: '14px 0',
                    fontFamily: 'var(--lc-font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                    border: '1px solid ' + (i === 1 ? 'var(--lc-ink)' : 'var(--lc-rule)'),
                    background: i === 1 ? 'var(--lc-ink)' : 'transparent',
                    color: i === 1 ? 'var(--lc-bg)' : 'var(--lc-ink-soft)',
                    cursor: 'pointer',
                  }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Quantity + CTA */}
            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--lc-rule)', padding: '14px 16px' }}>
                <span style={{ cursor: 'pointer', color: 'var(--lc-ink-mute)' }}>−</span>
                <span style={{ fontFamily: 'var(--lc-font-mono)', fontSize: 13 }}>1</span>
                <span style={{ cursor: 'pointer', color: 'var(--lc-ink)' }}>+</span>
              </div>
              <LCButton variant="primary" style={{ width: '100%' }}>Agregar a la bolsa · S/ 79</LCButton>
            </div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <LCButton variant="outline">♡ Guardar para después</LCButton>
              <LCWhatsApp>Preguntar por esta pieza</LCWhatsApp>
            </div>

            {/* Gift toggle */}
            <div style={{ marginTop: 28, padding: 20, background: 'var(--lc-bg-warm)', display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--lc-gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="lc-display-i" style={{ fontSize: 16, color: 'var(--lc-gold-deep)' }}>✎</span>
              </div>
              <div>
                <div className="lc-display-i" style={{ fontSize: 16, color: 'var(--lc-ink)' }}>¿Es para regalar?</div>
                <div style={{ fontSize: 12, color: 'var(--lc-ink-soft)', marginTop: 2 }}>Empaque premium + carta manuscrita · Gratis</div>
              </div>
              <span style={{ width: 36, height: 20, borderRadius: 99, background: 'var(--lc-rule)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: 99, background: 'var(--lc-bg)' }}/>
              </span>
            </div>

            {/* Trust ribbon */}
            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[['Envío gratis','desde S/ 199'],['Cambio gratis','15 días en Lima'],['Empaque','tipo regalo']].map(([t, d]) => (
                <div key={t} style={{ paddingTop: 14, borderTop: '1px solid var(--lc-rule)' }}>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink)' }}>{t}</div>
                  <div style={{ fontSize: 11, color: 'var(--lc-ink-mute)', marginTop: 4 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Long description — editorial */}
      <section style={{ padding: '96px 64px', background: 'var(--lc-bg-warm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 96 }}>
          <div>
            <LCEyebrow>Sobre esta pieza</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 300, marginTop: 18 }}>
              Hecho para la <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>salida<br/>del hospital.</em>
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 16, color: 'var(--lc-ink-soft)', lineHeight: 1.85, fontWeight: 300 }}>{p.desc}</p>
            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--lc-rule)' }}>
              {[
                ['Material','100% Algodón Pima'],
                ['Origen','Piura · cosechado a mano'],
                ['Bordado','Hecho a mano · ~3 h'],
                ['Cierre','Broches niquelados sin níquel'],
                ['Lavado','Tibio · delicado · sin suavizantes'],
                ['Empaque','Caja FSC · lazo de algodón crudo'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--lc-bg-warm)', padding: '20px 0' }}>
                  <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>{k}</div>
                  <div style={{ fontSize: 14.5, color: 'var(--lc-ink)', marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle gallery */}
      <section style={{ padding: '96px 64px', background: 'var(--lc-bg)' }}>
        <LCEyebrow>En la vida real</LCEyebrow>
        <h2 className="lc-display" style={{ fontSize: 48, lineHeight: 1, fontWeight: 300, marginTop: 14 }}>
          Cómo se ve <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>puesto.</em>
        </h2>
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16, height: 480 }}>
          <div className="lc-life tone-pink">bebé en brazos de la madre · luz natural</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="lc-life tone-cream" style={{ flex: 1 }}>detalle del bordado floral</div>
            <div className="lc-life tone-cream" style={{ flex: 1 }}>caja desempacada</div>
          </div>
          <div className="lc-life tone-pink">bebé en la cuna · ajuar puesto</div>
        </div>
      </section>

      {/* You may also love */}
      <section style={{ padding: '96px 64px', background: 'var(--lc-bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <LCEyebrow>De la misma familia</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 48, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>
            También te <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>enamorarán.</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { id:'LC-015', name:'Princesita de Ballet', tagline:'Pequeña estrella', price:79, colors:['Durazno'], gender:'Niña' },
            { id:'LC-005', name:'Blonditas de Amor', tagline:'Elegancia tierna', price:59, colors:['Rosa'], gender:'Niña' },
            { id:'LC-011', name:'Mi Lacito Bonito', tagline:'Detalles que enamoran', price:59, colors:['Crema'], gender:'Niña' },
            { id:'LC-013', name:'Osita Ballerina', tagline:'Giros suaves', price:65, colors:['Verde menta'], gender:'Niña' },
          ].map(p => <LCProductCard key={p.id} product={p}/>)}
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CART (desktop) — gift experience
// ════════════════════════════════════════════════════════════════
function Cart_Desktop() {
  const items = [
    { id:'LC-010', name:'Mi Duraznito', tagline:'Dulce como su nombre', color:'Durazno', size:'0–3m', qty:1, price: 79 },
    { id:'LC-101', name:'Body Esencial Premium', tagline:'La segunda piel', color:'Blanco', size:'RN', qty:3, price: 29, offer: '3 × 15% dto' },
  ];
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = 29 * 0.15;
  const total = subtotal - discount;

  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Empaque tipo regalo en cada pedido — siempre · Carta manuscrita gratis</LCAnnouncement>
      <LCNav cartCount={4}/>

      <section style={{ padding: '64px 64px 24px' }}>
        <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>Bolsa</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 16 }}>
          <h1 className="lc-display" style={{ fontSize: 72, lineHeight: 0.92, fontWeight: 300, letterSpacing: '-0.02em' }}>
            Tu <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>bolsa.</em>
          </h1>
          <div className="lc-display-i" style={{ fontSize: 17, color: 'var(--lc-ink-soft)' }}>4 piezas — listas para envolver</div>
        </div>
      </section>

      {/* Checkout progress */}
      <section style={{ padding: '0 64px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 16 }}>
          {[
            ['01','Bolsa','active'],
            ['02','Envío','next'],
            ['03','Pago','next'],
            ['04','Confirmación','next'],
          ].map(([n, t, s], i) => (
            <React.Fragment key={n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 99, border: s === 'active' ? '1px solid var(--lc-ink)' : '1px solid var(--lc-rule)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--lc-font-mono)', fontSize: 10, letterSpacing: '0.1em', color: s === 'active' ? 'var(--lc-ink)' : 'var(--lc-ink-mute)' }}>{n}</span>
                <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: s === 'active' ? 'var(--lc-ink)' : 'var(--lc-ink-mute)' }}>{t}</span>
              </div>
              {i < 3 && <span style={{ flex: 1, height: 1, background: 'var(--lc-rule)', margin: '0 24px' }}/>}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section style={{ padding: '24px 64px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'start' }}>
          {/* Items column */}
          <div>
            {/* Items */}
            <div style={{ borderTop: '1px solid var(--lc-rule)' }}>
              {items.map(it => (
                <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 32, padding: '32px 0', borderBottom: '1px solid var(--lc-rule)', alignItems: 'start' }}>
                  <div className="lc-plate" style={{ aspectRatio: '1/1' }}>
                    <img src={`../assets/products/${it.id}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </div>
                  <div>
                    <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>{it.id}</div>
                    <div className="lc-display" style={{ fontSize: 24, fontWeight: 400, marginTop: 6 }}>{it.name}</div>
                    <div className="lc-display-i" style={{ fontSize: 14, color: 'var(--lc-ink-soft)', marginTop: 2 }}>{it.tagline}</div>
                    <div style={{ marginTop: 18, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--lc-ink-soft)' }}>
                      <span>Color · <span style={{ color: 'var(--lc-ink)' }}>{it.color}</span></span>
                      <span>Talla · <span style={{ color: 'var(--lc-ink)' }}>{it.size}</span></span>
                      {it.offer && <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)', textTransform: 'uppercase' }}>{it.offer}</span>}
                    </div>
                    <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--lc-rule)' }}>
                        <span style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--lc-ink-mute)' }}>−</span>
                        <span style={{ padding: '8px 4px', fontFamily: 'var(--lc-font-mono)', fontSize: 13 }}>{it.qty}</span>
                        <span style={{ padding: '8px 12px', cursor: 'pointer' }}>+</span>
                      </div>
                      <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)', cursor:'pointer' }}>Guardar para después</span>
                      <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', cursor:'pointer' }}>Eliminar</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="lc-display" style={{ fontSize: 22, fontWeight: 300 }}>S/ {(it.price * it.qty).toFixed(2)}</div>
                    {it.qty > 1 && <div style={{ fontSize: 11, color: 'var(--lc-ink-mute)', marginTop: 4 }}>S/ {it.price} c/u</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Gift experience */}
            <div style={{ marginTop: 48, padding: 32, background: 'var(--lc-bg-warm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <LCEyebrow>Experiencia regalo</LCEyebrow>
                  <div className="lc-display" style={{ fontSize: 28, fontWeight: 300, marginTop: 8 }}>
                    Añade un toque <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>especial.</em>
                  </div>
                </div>
                <span style={{ width: 44, height: 24, borderRadius: 99, background: 'var(--lc-ink)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 2, left: 22, width: 20, height: 20, borderRadius: 99, background: 'var(--lc-bg)' }}/>
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28 }}>
                {[
                  ['Caja Lion Cub','Gratis','Caja FSC con lazo de algodón crudo','active'],
                  ['Caja madera','+ S/ 39','Madera reciclada, grabada a fuego','off'],
                  ['Carta manuscrita','Gratis','Te escribimos lo que nos dictes','active'],
                ].map(([t, p, d, s]) => (
                  <div key={t} style={{ padding: 20, background: 'var(--lc-bg)', border: s === 'active' ? '1px solid var(--lc-ink)' : '1px solid var(--lc-rule)' }}>
                    <div className="lc-display-i" style={{ fontSize: 17, color: 'var(--lc-ink)' }}>{t}</div>
                    <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: s === 'active' ? 'var(--lc-gold-deep)' : 'var(--lc-ink-mute)', marginTop: 4 }}>{p}</div>
                    <div style={{ fontSize: 12, color: 'var(--lc-ink-soft)', marginTop: 10, lineHeight: 1.6 }}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)', marginBottom: 10 }}>Mensaje en la carta</div>
                <textarea defaultValue="Bienvenida al mundo, pequeña Sofía. Que tu vida sea tan suave como este algodón. Con todo nuestro amor, los tíos." style={{ width: '100%', minHeight: 96, padding: 16, border: '1px solid var(--lc-rule)', background: 'var(--lc-bg)', fontFamily: 'var(--lc-font-display)', fontSize: 17, fontStyle: 'italic', color: 'var(--lc-ink)', resize: 'none' }}/>
                <div className="lc-mono" style={{ marginTop: 8, fontSize: 10, color: 'var(--lc-ink-mute)', textAlign: 'right' }}>136 / 240 caracteres</div>
              </div>
            </div>

            {/* Add a little something */}
            <div style={{ marginTop: 48 }}>
              <LCEyebrow>Añade algo pequeño</LCEyebrow>
              <div className="lc-display" style={{ fontSize: 28, fontWeight: 300, marginTop: 8 }}>
                Para completar el <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>set.</em>
              </div>
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {[
                  { id:'LC-301', name:'Manta Celestial', price:49 },
                  { id:'LC-202', name:'Pack Safari Tierno', price:19 },
                  { id:'LC-014', name:'Ovejita de mis Sueños', price:59 },
                ].map(p => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', padding: 12, border: '1px solid var(--lc-rule)' }}>
                    <div className="lc-plate" style={{ aspectRatio: '1/1' }}>
                      <img src={`../assets/products/${p.id}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--lc-ink)' }}>{p.name}</div>
                      <div className="lc-mono" style={{ fontSize: 10, color: 'var(--lc-ink-mute)', marginTop: 4 }}>S/ {p.price}</div>
                    </div>
                    <span style={{ width: 28, height: 28, borderRadius: 99, border: '1px solid var(--lc-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--lc-font-mono)', cursor: 'pointer' }}>+</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: 'var(--lc-bg-warm)', padding: 32 }}>
              <LCEyebrow>Resumen</LCEyebrow>
              <div className="lc-display" style={{ fontSize: 36, fontWeight: 300, marginTop: 8 }}>S/ {total.toFixed(2)}</div>
              <div className="lc-display-i" style={{ fontSize: 13, color: 'var(--lc-ink-soft)' }}>4 piezas + envío</div>

              <div style={{ margin: '28px 0', height: 1, background: 'var(--lc-rule)' }}/>

              {[
                ['Subtotal', `S/ ${subtotal.toFixed(2)}`, 'soft'],
                ['Oferta 3 × 15%', `− S/ ${discount.toFixed(2)}`, 'gold'],
                ['Envío exprés Lima', 'Gratis', 'soft'],
                ['Empaque regalo', 'Gratis', 'soft'],
              ].map(([k, v, kind]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--lc-ink-soft)' }}>{k}</span>
                  <span style={{ color: kind === 'gold' ? 'var(--lc-gold-deep)' : 'var(--lc-ink)', fontFamily: kind === 'gold' ? 'var(--lc-font-mono)' : 'inherit', fontSize: 13 }}>{v}</span>
                </div>
              ))}

              <div style={{ margin: '20px 0', height: 1, background: 'var(--lc-rule)' }}/>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--lc-ink)' }}>Total</span>
                <span className="lc-display" style={{ fontSize: 30, fontWeight: 300 }}>S/ {total.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: 24 }}>
                <LCButton variant="primary" style={{ width: '100%', padding: '18px 28px' }}>Continuar al checkout →</LCButton>
              </div>
              <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', textAlign: 'center', marginTop: 14 }}>YAPE · PLIN · TRANSFERENCIA · CONTRA ENTREGA · CULQI</div>

              <div style={{ margin: '24px 0', height: 1, background: 'var(--lc-rule)' }}/>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="lc-display-i" style={{ fontSize: 15, color: 'var(--lc-ink)' }}>¿Prefieres WhatsApp?</div>
                  <div style={{ fontSize: 11.5, color: 'var(--lc-ink-soft)', marginTop: 3 }}>Te ayudamos a cerrar el pedido</div>
                </div>
                <LCWhatsApp>Escribir</LCWhatsApp>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 24, background: 'var(--lc-bg)', border: '1px solid var(--lc-rule)' }}>
              <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-gold-deep)' }}>Promesas</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: 'var(--lc-ink-soft)' }}>
                <li>· Empaque tipo regalo siempre</li>
                <li>· Cambio gratis hasta 15 días</li>
                <li>· Envío a USA · 7–10 días</li>
                <li>· Pago seguro · Culqi 3-D Secure</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOBILE versions — compact
// ════════════════════════════════════════════════════════════════
function Collection_Mobile() {
  const products = (window.LC_DEMO_PRODUCTS || []).slice(0, 8);
  return (
    <div className="lc-page" style={{ width: 390 }}>
      <LCAnnouncement>Envío gratis Lima desde S/ 199</LCAnnouncement>
      <LCNavMobile cartCount={2}/>

      <section style={{ padding: '32px 20px 0' }}>
        <LCEyebrow>SS · 26</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 44, lineHeight: 0.92, fontWeight: 300, marginTop: 14 }}>
          Veinticinco piezas,<br/>un solo <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>hilo.</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 14, lineHeight: 1.7 }}>
          La colección completa, hilada en algodón Pima 100%.
        </p>
      </section>

      <section style={{ padding: '24px 20px 0', position: 'sticky', top: 0, background: 'var(--lc-bg)', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, borderBottom: '1px solid var(--lc-rule)' }}>
          <Pill active>Todo · 25</Pill>
          <Pill>Conjuntos</Pill>
          <Pill>Bodies</Pill>
          <Pill>Baberos</Pill>
          <Pill>Mantas</Pill>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontFamily: 'var(--lc-font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          <span>Filtrar +</span>
          <span>Más amadas ▾</span>
        </div>
      </section>

      <section style={{ padding: '24px 20px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, rowGap: 32 }}>
          {products.map(p => <LCProductCard key={p.id} product={p}/>)}
        </div>
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <LCButton variant="outline">Ver más piezas</LCButton>
        </div>
      </section>

      <div style={{ background: '#1A1410', color: '#FDFBF6', padding: '24px 20px', fontSize: 10, fontFamily: 'var(--lc-font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', color: 'rgba(253,251,246,.6)' }}>
        © 2026 Lion Cub
      </div>
    </div>
  );
}

function ProductDetail_Mobile() {
  const p = { id:'LC-010', name:'Mi Duraznito', tagline:'Dulce como su nombre', price:79, sizes:['RN','0-3m','3-6m'] };
  return (
    <div className="lc-page" style={{ width: 390 }}>
      <LCNavMobile cartCount={2}/>
      <div className="lc-plate" style={{ aspectRatio: '1/1', background: 'var(--lc-pink-soft)' }}>
        <img src="../assets/products/LC-010.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
      </div>
      <div style={{ padding: '8px 20px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[0,1,2,3].map(i => (
          <div key={i} className="lc-plate" style={{ width: 56, height: 56, flexShrink: 0, border: i===0?'1px solid var(--lc-ink)':'1px solid var(--lc-rule)' }}>
            {i === 0 && <img src="../assets/products/LC-010.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
          </div>
        ))}
      </div>

      <section style={{ padding: '24px 20px 0' }}>
        <LCEyebrow>Niña · 5 piezas</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 40, lineHeight: 1, fontWeight: 300, marginTop: 12 }}>{p.name}</h1>
        <div className="lc-display-i" style={{ fontSize: 15, color: 'var(--lc-ink-soft)', marginTop: 6 }}>{p.tagline}</div>
        <div className="lc-display" style={{ fontSize: 30, fontWeight: 300, marginTop: 20 }}>
          <span className="lc-mono" style={{ fontSize: 12, color: 'var(--lc-ink-mute)', marginRight: 4 }}>S/</span>{p.price}.00
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)', marginBottom: 10 }}>Color · Durazno</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[['#EDC8B0',true],['#F0E3CB',false],['#EDD3CC',false]].map(([h, a], i) => (
              <span key={i} style={{ width: 32, height: 32, borderRadius: 99, background: h, boxShadow: a ? '0 0 0 1px var(--lc-ink), 0 0 0 4px var(--lc-bg)' : 'none' }}/>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Talla · 0–3m</span>
            <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-gold-deep)' }}>Guía →</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {p.sizes.map((s, i) => (
              <span key={s} style={{ flex:1, textAlign:'center', padding: '14px 0', fontFamily: 'var(--lc-font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', border: '1px solid ' + (i === 1 ? 'var(--lc-ink)' : 'var(--lc-rule)'), background: i === 1 ? 'var(--lc-ink)' : 'transparent', color: i === 1 ? 'var(--lc-bg)' : 'var(--lc-ink-soft)' }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--lc-bg-warm)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="lc-display-i" style={{ fontSize: 18, color: 'var(--lc-gold-deep)' }}>✎</span>
          <div style={{ flex: 1 }}>
            <div className="lc-display-i" style={{ fontSize: 14 }}>¿Es para regalar?</div>
            <div style={{ fontSize: 11, color: 'var(--lc-ink-soft)' }}>Empaque + carta gratis</div>
          </div>
          <span style={{ width: 36, height: 20, borderRadius: 99, background: 'var(--lc-rule)', position: 'relative' }}>
            <span style={{ position:'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: 99, background: 'var(--lc-bg)' }}/>
          </span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 24, lineHeight: 1.75 }}>
          Cinco piezas en algodón Pima color durazno: chaqueta, vestido con bordado floral hecho a mano, bloomer con volantes, lazo y zapatitos. Para los días que se recuerdan en fotografías.
        </p>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--lc-rule)' }}>
          {[['Material','100% Pima'],['Origen','Piura'],['Bordado','A mano'],['Empaque','Caja FSC']].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--lc-bg)', padding: '16px 12px' }}>
              <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>{k}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 100 }}/>

      {/* Sticky bottom bar */}
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--lc-bg)', borderTop: '1px solid var(--lc-rule)', padding: '14px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center' }}>
        <div>
          <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>Total</div>
          <div className="lc-display" style={{ fontSize: 20, fontWeight: 400 }}>S/ 79.00</div>
        </div>
        <LCButton variant="primary" style={{ width: '100%' }}>Agregar a bolsa</LCButton>
        <LCWhatsApp style={{ padding: '14px 14px' }}>WA</LCWhatsApp>
      </div>
    </div>
  );
}

function Cart_Mobile() {
  return (
    <div className="lc-page" style={{ width: 390 }}>
      <LCNavMobile cartCount={4}/>

      <section style={{ padding: '24px 20px 0' }}>
        <LCEyebrow>Bolsa</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 40, lineHeight: 1, fontWeight: 300, marginTop: 10 }}>
          Tu <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>bolsa.</em>
        </h1>
        <div className="lc-display-i" style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 4 }}>4 piezas — listas para envolver</div>
      </section>

      {/* Progress */}
      <section style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {['01','02','03','04'].map((n, i) => (
            <React.Fragment key={n}>
              <span style={{ width: 24, height: 24, borderRadius: 99, border: '1px solid ' + (i === 0 ? 'var(--lc-ink)' : 'var(--lc-rule)'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--lc-font-mono)', fontSize: 9, color: i === 0 ? 'var(--lc-ink)' : 'var(--lc-ink-mute)' }}>{n}</span>
              {i < 3 && <span style={{ flex: 1, height: 1, background: 'var(--lc-rule)' }}/>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 8, fontFamily: 'var(--lc-font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>Paso 1 · Tu bolsa</div>
      </section>

      <section style={{ padding: '24px 20px 0' }}>
        {[
          { id:'LC-010', name:'Mi Duraznito', size:'0–3m', color:'Durazno', qty:1, price:79 },
          { id:'LC-101', name:'Body Esencial', size:'RN', color:'Blanco', qty:3, price:29, offer:true },
        ].map(it => (
          <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 14, padding: '20px 0', borderTop: '1px solid var(--lc-rule)' }}>
            <div className="lc-plate" style={{ aspectRatio: '1/1' }}>
              <img src={`../assets/products/${it.id}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            </div>
            <div>
              <div className="lc-display" style={{ fontSize: 16 }}>{it.name}</div>
              <div style={{ fontSize: 11, color: 'var(--lc-ink-soft)', marginTop: 4 }}>Color {it.color} · Talla {it.size}</div>
              {it.offer && <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)', marginTop: 6 }}>3 × 15% DTO</div>}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--lc-rule)' }}>
                  <span style={{ padding: '4px 10px', cursor: 'pointer' }}>−</span>
                  <span style={{ padding: '4px 4px', fontFamily: 'var(--lc-font-mono)', fontSize: 12 }}>{it.qty}</span>
                  <span style={{ padding: '4px 10px', cursor: 'pointer' }}>+</span>
                </div>
                <div className="lc-display" style={{ fontSize: 16 }}>S/ {(it.price * it.qty).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Gift */}
      <section style={{ padding: '24px 20px 0' }}>
        <div style={{ background: 'var(--lc-bg-warm)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <LCEyebrow style={{ fontSize: 9 }}>Experiencia regalo</LCEyebrow>
              <div className="lc-display-i" style={{ fontSize: 17, marginTop: 4 }}>Empaque + carta</div>
            </div>
            <span style={{ width: 36, height: 20, borderRadius: 99, background: 'var(--lc-ink)', position: 'relative' }}>
              <span style={{ position:'absolute', top: 2, left: 18, width: 16, height: 16, borderRadius: 99, background: 'var(--lc-bg)' }}/>
            </span>
          </div>
          <textarea defaultValue="Bienvenida al mundo, Sofía. Que tu vida sea tan suave como este algodón." style={{ width: '100%', minHeight: 72, padding: 12, border: '1px solid var(--lc-rule)', background: 'var(--lc-bg)', fontFamily: 'var(--lc-font-display)', fontSize: 14, fontStyle: 'italic', color: 'var(--lc-ink)', resize: 'none', marginTop: 12 }}/>
        </div>
      </section>

      {/* Summary */}
      <section style={{ padding: '24px 20px' }}>
        <div style={{ background: 'var(--lc-bg-warm)', padding: 20 }}>
          {[
            ['Subtotal','S/ 166.00'],
            ['Oferta 3 × 15%','− S/ 4.35'],
            ['Envío Lima','Gratis'],
            ['Empaque regalo','Gratis'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--lc-ink-soft)' }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--lc-rule)', margin: '12px 0' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13 }}>Total</span>
            <span className="lc-display" style={{ fontSize: 28 }}>S/ 161.65</span>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <LCButton variant="primary" style={{ width: '100%' }}>Continuar al checkout →</LCButton>
        </div>
        <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', textAlign: 'center', marginTop: 12 }}>YAPE · PLIN · TRANSFERENCIA · CONTRA ENTREGA</div>

        <div style={{ marginTop: 16 }}>
          <LCWhatsApp style={{ width: '100%' }}>O cierra el pedido por WhatsApp</LCWhatsApp>
        </div>
      </section>
    </div>
  );
}

window.Collection_Desktop = Collection_Desktop;
window.ProductDetail_Desktop = ProductDetail_Desktop;
window.Cart_Desktop = Cart_Desktop;
window.Collection_Mobile = Collection_Mobile;
window.ProductDetail_Mobile = ProductDetail_Mobile;
window.Cart_Mobile = Cart_Mobile;
