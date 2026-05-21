// Lion Cub — Checkout flow (3 pasos), Confirmación, Waitlist, Handoff notes.
// Refleja el flujo Next.js existente. Solo presentación visual.

// ════════════════════════════════════════════════════════════════
// Stepper reusable
// ════════════════════════════════════════════════════════════════
function CheckoutStepper({ active = 1 }) {
  const steps = [['01','Tus datos'],['02','Envío'],['03','Pago']];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '20px 0' }}>
      {steps.map(([n, t], i) => (
        <React.Fragment key={n}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 99,
              border: '1px solid ' + (i + 1 <= active ? 'var(--lc-ink)' : 'var(--lc-rule)'),
              background: i + 1 < active ? 'var(--lc-ink)' : 'transparent',
              color: i + 1 < active ? 'var(--lc-bg)' : (i + 1 === active ? 'var(--lc-ink)' : 'var(--lc-ink-mute)'),
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--lc-font-mono)', fontSize: 11, letterSpacing: '0.1em',
            }}>{i + 1 < active ? '✓' : n}</span>
            <span className="lc-mono" style={{
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: i + 1 === active ? 'var(--lc-ink)' : 'var(--lc-ink-mute)',
            }}>{t}</span>
          </div>
          {i < 2 && <span style={{ flex: 1, height: 1, background: 'var(--lc-rule)', margin: '0 24px' }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CHECKOUT — STEP 1 · Datos
// ════════════════════════════════════════════════════════════════
function CheckoutStep1_Desktop() {
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Tu pedido se guarda al avanzar — puedes volver atrás cuando quieras</LCAnnouncement>
      <LCNav cartCount={4}/>

      <section style={{ padding: '40px 64px 0' }}>
        <h1 className="lc-display" style={{ fontSize: 56, fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
          Checkout <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>· Tus datos.</em>
        </h1>
        <CheckoutStepper active={1}/>
      </section>

      <section style={{ padding: '24px 64px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <FormSection title="Quién recibe" italicWord="el pedido">
              <FormRow>
                <Field label="Nombres" value="José Heber" />
                <Field label="Apellidos" value="Chambi Quispe" />
              </FormRow>
              <FormRow>
                <Field label="Correo electrónico" value="jose.chambi@ejemplo.com" hint="Te enviaremos la confirmación aquí"/>
                <Field label="WhatsApp" value="+51 920 201 943" hint="Para coordinar la entrega"/>
              </FormRow>
              <FormRow cols={2}>
                <Field label="Documento" value="DNI"/>
                <Field label="Número de documento" value="44567812"/>
              </FormRow>
            </FormSection>

            <FormSection title="¿Es para regalar?" italicWord="(opcional)">
              <div style={{ padding: 20, background: 'var(--lc-bg-warm)', display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 16, alignItems: 'center' }}>
                <span className="lc-display-i" style={{ fontSize: 24, color: 'var(--lc-gold-deep)' }}>✎</span>
                <div>
                  <div className="lc-display-i" style={{ fontSize: 17 }}>Empaque tipo regalo + carta manuscrita</div>
                  <div style={{ fontSize: 12, color: 'var(--lc-ink-soft)', marginTop: 3 }}>Gratis · escribimos tu mensaje a mano</div>
                </div>
                <span style={{ width: 44, height: 24, borderRadius: 99, background: 'var(--lc-ink)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 2, left: 22, width: 20, height: 20, borderRadius: 99, background: 'var(--lc-bg)' }}/>
                </span>
              </div>
              <div style={{ marginTop: 14 }}>
                <Field label="Mensaje (hasta 240 caracteres)" value="Bienvenida al mundo, pequeña Sofía. Que tu vida sea tan suave como este algodón. Con todo nuestro amor, los tíos." multiline/>
              </div>
            </FormSection>

            <FormSection title="¿Eres cliente nuevo?" italicWord="(opcional)">
              <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginBottom: 16 }}>Crea una cuenta si quieres guardar tus direcciones y ver tu historial. Puedes saltar este paso.</p>
              <FormRow>
                <Field label="Contraseña" value="••••••••" type="password"/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
                  <span style={{ width: 18, height: 18, border: '1px solid var(--lc-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--lc-ink-soft)' }}>Quiero recibir la carta mensual de Lion Cub</span>
                </div>
              </FormRow>
            </FormSection>

            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <LCButton variant="ghost">← Volver a la bolsa</LCButton>
              <LCButton variant="primary">Continuar a envío →</LCButton>
            </div>
          </div>

          <CheckoutSummary step={1}/>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CHECKOUT — STEP 2 · Envío
// ════════════════════════════════════════════════════════════════
function CheckoutStep2_Desktop() {
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Domicilio en Lima 24–48 h · Agencia Shalom a todo el Perú</LCAnnouncement>
      <LCNav cartCount={4}/>

      <section style={{ padding: '40px 64px 0' }}>
        <h1 className="lc-display" style={{ fontSize: 56, fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
          Checkout <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>· Envío.</em>
        </h1>
        <CheckoutStepper active={2}/>
      </section>

      <section style={{ padding: '24px 64px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <FormSection title="Método de envío" italicWord="">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { id: 'lima', t: 'Domicilio en Lima', p: 'S/ 10.00', d: '24 – 48 h hábiles · entrega con fecha y franja horaria', active: true },
                  { id: 'shalom', t: 'Agencia Shalom · Perú', p: 'S/ 15.00', d: '3 – 5 días a tu agencia más cercana en provincia', active: false },
                ].map(o => (
                  <label key={o.id} style={{ display: 'block', padding: 24, border: '1px solid ' + (o.active ? 'var(--lc-ink)' : 'var(--lc-rule)'), background: o.active ? 'var(--lc-bg-warm)' : 'var(--lc-bg)', cursor: 'pointer', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 18, right: 18, width: 16, height: 16, borderRadius: 99, border: '1px solid var(--lc-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {o.active && <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--lc-ink)' }}/>}
                    </span>
                    <div className="lc-display" style={{ fontSize: 22, fontWeight: 400 }}>{o.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--lc-ink-soft)', marginTop: 6, lineHeight: 1.6 }}>{o.d}</div>
                    <div className="lc-mono" style={{ marginTop: 14, fontSize: 11, letterSpacing: '0.2em', color: 'var(--lc-gold-deep)' }}>{o.p}</div>
                  </label>
                ))}
              </div>
            </FormSection>

            {/* Address */}
            <FormSection title="Dirección de entrega" italicWord="">
              <FormRow>
                <Field label="Departamento" value="Lima"/>
                <Field label="Provincia" value="Lima"/>
                <Field label="Distrito" value="Miraflores"/>
              </FormRow>
              <FormRow>
                <Field label="Av./Calle y número" value="Av. Pardo 123, Dpto. 502"/>
              </FormRow>
              <FormRow>
                <Field label="Referencia (opcional)" value="Edificio Acuario, frente al parque Kennedy"/>
              </FormRow>
            </FormSection>

            {/* Date + time slot */}
            <FormSection title="Fecha y franja horaria" italicWord="(domicilio Lima)">
              <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginBottom: 18, lineHeight: 1.6 }}>
                Coordinamos la entrega con día y franja horaria. <span className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)' }}>NO ENTREGAMOS SÁBADOS · VIERNES SOLO HASTA 5 PM</span>
              </p>

              {/* Mini calendar */}
              <div style={{ background: 'var(--lc-bg-warm)', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span className="lc-mono" style={{ fontSize: 14, color: 'var(--lc-ink-mute)' }}>←</span>
                  <div className="lc-display-i" style={{ fontSize: 22, color: 'var(--lc-ink)' }}>Mayo 2026</div>
                  <span className="lc-mono" style={{ fontSize: 14, color: 'var(--lc-ink-mute)' }}>→</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, fontFamily: 'var(--lc-font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', textAlign: 'center', marginBottom: 8 }}>
                  {['L','M','M','J','V','S','D'].map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {Array.from({length: 35}, (_, i) => {
                    const day = i - 4; // start offset for May (Friday)
                    const isPast = day < 20 || day > 31 && day < 32;
                    const isSat = (i % 7) === 5;
                    const isToday = day === 20;
                    const isSelected = day === 22;
                    const isFridayLate = day === 29;
                    const valid = day >= 21 && day <= 31 && !isSat;

                    let bg = 'transparent', color = 'var(--lc-ink-mute)', border = 'none';
                    if (day < 1 || day > 31) return <span key={i}/>;
                    if (isToday) { color = 'var(--lc-ink)'; border = '1px solid var(--lc-rule)'; }
                    if (isSat || isPast) { color = 'var(--lc-ink-mute)'; bg = 'transparent'; }
                    if (valid && !isSelected) { color = 'var(--lc-ink)'; }
                    if (isSelected) { bg = 'var(--lc-ink)'; color = 'var(--lc-bg)'; }
                    if (isSat) { color = 'rgba(155,141,126,.4)'; }

                    return (
                      <span key={i} style={{
                        padding: '10px 0', textAlign: 'center',
                        fontFamily: 'var(--lc-font-mono)', fontSize: 12,
                        background: bg, color, border,
                        cursor: valid ? 'pointer' : 'not-allowed',
                        textDecoration: isSat ? 'line-through' : 'none',
                        opacity: isPast ? 0.3 : 1,
                      }}>{day < 1 || day > 31 ? '' : day}</span>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)', marginBottom: 12 }}>Franja horaria · Viernes 22 de mayo</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    ['9 – 12 h','Mañana', false],
                    ['12 – 15 h','Mediodía', true],
                    ['15 – 17 h','Tarde', false],
                    ['17 – 20 h','Noche', false, 'disabled'],
                  ].map(([h, l, a, dis]) => (
                    <span key={h} style={{
                      padding: '14px 8px', textAlign: 'center',
                      border: '1px solid ' + (a ? 'var(--lc-ink)' : 'var(--lc-rule)'),
                      background: a ? 'var(--lc-ink)' : 'var(--lc-bg)',
                      color: dis ? 'var(--lc-ink-mute)' : (a ? 'var(--lc-bg)' : 'var(--lc-ink)'),
                      opacity: dis ? 0.4 : 1,
                      cursor: dis ? 'not-allowed' : 'pointer',
                    }}>
                      <div className="lc-mono" style={{ fontSize: 11, letterSpacing: '0.16em' }}>{h}</div>
                      <div style={{ fontSize: 10, marginTop: 4, fontFamily: 'var(--lc-font-display)', fontStyle: 'italic' }}>{l}</div>
                      {dis && <div style={{ fontSize: 8, marginTop: 3, fontFamily: 'var(--lc-font-mono)', letterSpacing: '0.18em' }}>(viernes)</div>}
                    </span>
                  ))}
                </div>
              </div>
            </FormSection>

            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <LCButton variant="ghost">← Tus datos</LCButton>
              <LCButton variant="primary">Continuar a pago →</LCButton>
            </div>
          </div>

          <CheckoutSummary step={2}/>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CHECKOUT — STEP 3 · Pago
// ════════════════════════════════════════════════════════════════
function CheckoutStep3_Desktop() {
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Tu información se procesa de forma segura — nunca guardamos datos de tarjeta</LCAnnouncement>
      <LCNav cartCount={4}/>

      <section style={{ padding: '40px 64px 0' }}>
        <h1 className="lc-display" style={{ fontSize: 56, fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
          Checkout <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>· Pago.</em>
        </h1>
        <CheckoutStepper active={3}/>
      </section>

      <section style={{ padding: '24px 64px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <FormSection title="¿Cómo quieres pagar?" italicWord="">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id:'yape', t:'Yape', d:'Escanea el QR o envía al número', p:'Instantáneo · adjunta comprobante', active: true },
                  { id:'plin', t:'Plin', d:'Escanea el QR o envía al número', p:'Instantáneo · adjunta comprobante', active: false },
                  { id:'transfer', t:'Transferencia bancaria', d:'BCP, BBVA, Interbank, Scotiabank · CCI disponible', p:'24 h · adjunta voucher', active: false },
                  { id:'cod', t:'Contra entrega', d:'Pagas al recibir · solo dentro de Lima', p:'Sin comprobante necesario', active: false },
                  { id:'culqi', t:'Tarjeta Visa / Mastercard · Culqi', d:'Pago con tarjeta 3-D Secure', p:'Próximamente — coordinando llaves', active: false, disabled: true },
                ].map(o => (
                  <label key={o.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 16, padding: 20, border: '1px solid ' + (o.active ? 'var(--lc-ink)' : 'var(--lc-rule)'), background: o.active ? 'var(--lc-bg-warm)' : 'var(--lc-bg)', alignItems: 'center', opacity: o.disabled ? 0.5 : 1, cursor: o.disabled ? 'not-allowed' : 'pointer' }}>
                    <span style={{ width: 16, height: 16, borderRadius: 99, border: '1px solid var(--lc-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {o.active && <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--lc-ink)' }}/>}
                    </span>
                    <div>
                      <div className="lc-display" style={{ fontSize: 19, fontWeight: 400 }}>{o.t}</div>
                      <div style={{ fontSize: 12, color: 'var(--lc-ink-soft)', marginTop: 2 }}>{o.d}</div>
                    </div>
                    <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: o.disabled ? 'var(--lc-ink-mute)' : 'var(--lc-gold-deep)' }}>{o.p}</div>
                  </label>
                ))}
              </div>
            </FormSection>

            {/* Yape detail */}
            <FormSection title="Paga con" italicWord="Yape">
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
                {/* QR placeholder */}
                <div style={{ background: '#FFF', border: '1px solid var(--lc-rule)', padding: 20, aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, var(--lc-ink) 0 4px, transparent 4px 8px), repeating-linear-gradient(135deg, var(--lc-ink) 0 4px, transparent 4px 8px)', opacity: 0.85 }}/>
                  <span className="lc-mono" style={{ position: 'absolute', bottom: -22, left: 0, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>QR Yape · Lion Cub</span>
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>Número</div>
                  <div className="lc-display" style={{ fontSize: 32, fontWeight: 300, marginTop: 6 }}>920 201 943</div>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 18 }}>Titular</div>
                  <div className="lc-display-i" style={{ fontSize: 17, marginTop: 4 }}>José Heber Chambi Q.</div>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 18 }}>Monto a pagar</div>
                  <div className="lc-display" style={{ fontSize: 32, fontWeight: 300, marginTop: 4 }}>S/ 171.65</div>
                </div>
              </div>
            </FormSection>

            {/* Upload comprobante */}
            <FormSection title="Comprobante" italicWord="de pago">
              <div style={{ border: '1px dashed var(--lc-ink)', padding: 32, background: 'var(--lc-bg-warm)', textAlign: 'center' }}>
                <span className="lc-display-i" style={{ fontSize: 36, color: 'var(--lc-gold-deep)' }}>↑</span>
                <div className="lc-display" style={{ fontSize: 22, fontWeight: 400, marginTop: 8 }}>Arrastra tu comprobante aquí</div>
                <div style={{ fontSize: 12, color: 'var(--lc-ink-soft)', marginTop: 8 }}>JPG · PNG · PDF · hasta 8 MB</div>
                <div style={{ marginTop: 18 }}>
                  <LCButton variant="outline">Seleccionar archivo</LCButton>
                </div>
                {/* uploaded preview */}
                <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'var(--lc-bg)', border: '1px solid var(--lc-rule)' }}>
                  <span style={{ width: 32, height: 32, background: 'var(--lc-gold-pale)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--lc-font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--lc-gold-deep)' }}>JPG</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13 }}>yape-comprobante.jpg</div>
                    <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--lc-ink-mute)' }}>1.2 MB · ✓ subido</div>
                  </div>
                  <span style={{ color: 'var(--lc-ink-mute)', cursor: 'pointer', marginLeft: 16 }}>✕</span>
                </div>
              </div>
            </FormSection>

            <div style={{ marginTop: 24, padding: 20, background: 'var(--lc-bg)', border: '1px solid var(--lc-rule)' }}>
              <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)' }}>Revisaremos tu comprobante</div>
              <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 8, lineHeight: 1.7 }}>
                Confirmamos el pago en máximo 2 horas hábiles. Te avisamos por WhatsApp en cuanto tu pedido pase a producción.
              </p>
            </div>

            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <LCButton variant="ghost">← Envío</LCButton>
              <LCButton variant="primary">Confirmar pedido →</LCButton>
            </div>
          </div>

          <CheckoutSummary step={3}/>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CONFIRMATION
// ════════════════════════════════════════════════════════════════
function Confirmation_Desktop() {
  return (
    <div className="lc-page" style={{ width: 1440 }}>
      <LCAnnouncement>Tu pedido está en camino — te escribiremos por WhatsApp para coordinar</LCAnnouncement>
      <LCNav cartCount={0}/>

      <section style={{ padding: '80px 64px', background: 'var(--lc-bg)', textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 99, border: '1px solid var(--lc-gold-deep)',
          color: 'var(--lc-gold-deep)', fontFamily: 'var(--lc-font-display)', fontStyle: 'italic',
          fontSize: 36, fontWeight: 300,
        }}>✓</span>
        <LCEyebrow style={{ marginTop: 28 }}>Pedido recibido</LCEyebrow>
        <h1 className="lc-display" style={{ fontSize: 88, lineHeight: 0.92, fontWeight: 300, marginTop: 18, letterSpacing: '-0.02em' }}>
          Gracias, José.<br/>Tu pedido <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>está en camino.</em>
        </h1>
        <div className="lc-mono" style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 28 }}>
          Pedido N.° LC-2026-0438 · 22 de mayo · 12 – 15 h
        </div>
      </section>

      <section style={{ padding: '0 64px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* WhatsApp CTA */}
          <div style={{ background: '#1A1410', color: '#FDFBF6', padding: 48 }}>
            <LCEyebrow style={{ color: 'var(--lc-gold)' }}>Siguiente paso</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 36, lineHeight: 1.05, fontWeight: 300, marginTop: 14 }}>
              Confírmalo por <em className="lc-display-i" style={{ color: 'var(--lc-gold)' }}>WhatsApp.</em>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(253,251,246,.7)', marginTop: 18, lineHeight: 1.75, fontWeight: 300 }}>
              Para acelerar el proceso, envíanos un mensaje con tu pedido. Ya lo escribimos por ti — solo dale enviar.
            </p>
            <div style={{ marginTop: 24, padding: 20, background: 'rgba(253,251,246,.06)', border: '1px solid rgba(253,251,246,.15)', fontSize: 13, color: 'rgba(253,251,246,.85)', lineHeight: 1.7, fontFamily: 'var(--lc-font-mono)' }}>
              "Hola Lion Cub, soy José Chambi.<br/>
              Pedido N.° LC-2026-0438<br/>
              Total: S/ 171.65<br/>
              Entrega: 22 mayo · 12 – 15 h<br/>
              Av. Pardo 123, Miraflores<br/>
              Adjunto comprobante de Yape ✓"
            </div>
            <div style={{ marginTop: 24 }}>
              <LCWhatsApp>Enviar el mensaje a Lion Cub</LCWhatsApp>
            </div>
          </div>

          {/* Order detail */}
          <div style={{ background: 'var(--lc-bg-warm)', padding: 48 }}>
            <LCEyebrow>Resumen</LCEyebrow>
            <h2 className="lc-display" style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 300, marginTop: 14 }}>Lo que llega.</h2>
            <div style={{ marginTop: 20 }}>
              {[
                { id:'LC-010', name:'Mi Duraznito', size:'0–3m', color:'Durazno', qty:1, price:79 },
                { id:'LC-101', name:'Body Esencial', size:'RN', color:'Blanco', qty:3, price:29 },
              ].map(it => (
                <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--lc-rule)', alignItems: 'center' }}>
                  <div className="lc-plate" style={{ aspectRatio: '1/1' }}>
                    <img src={`../assets/products/${it.id}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--lc-ink)' }}>{it.name}</div>
                    <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 3 }}>{it.qty} × {it.size} · {it.color}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--lc-font-display)', fontSize: 16 }}>S/ {(it.price * it.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18 }}>
              {[['Subtotal','S/ 166.00'],['Oferta 3 × 15%','− S/ 4.35'],['Envío Lima · 22 may','S/ 10.00'],['Empaque regalo','Gratis']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--lc-ink-soft)' }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--lc-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14 }}>Total pagado</span>
              <span className="lc-display" style={{ fontSize: 28 }}>S/ 171.65</span>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div style={{ marginTop: 64 }}>
          <LCEyebrow>Lo que sigue</LCEyebrow>
          <h2 className="lc-display" style={{ fontSize: 40, lineHeight: 1, fontWeight: 300, marginTop: 14 }}>
            Los próximos <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>tres pasos.</em>
          </h2>
          <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              ['01','Validamos tu pago','Revisamos el comprobante en máximo 2 horas hábiles. Te avisamos por WhatsApp.'],
              ['02','Preparamos tu caja','Empacamos a mano con papel kraft y lazo de algodón crudo. Carta manuscrita incluida.'],
              ['03','Te entregamos','Viernes 22 de mayo entre 12 y 15 h, en Av. Pardo 123, Miraflores. Te llamamos al llegar.'],
            ].map(([n,t,d]) => (
              <div key={n} style={{ paddingTop: 20, borderTop: '1px solid var(--lc-rule)' }}>
                <div className="lc-mono" style={{ fontSize: 11, letterSpacing: '0.22em', color: 'var(--lc-gold-deep)' }}>{n}</div>
                <div className="lc-display" style={{ fontSize: 22, fontWeight: 400, marginTop: 12 }}>{t}</div>
                <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 10, lineHeight: 1.7 }}>{d}</p>
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
// WAITLIST · Stock 0 — product detail variant
// ════════════════════════════════════════════════════════════════
function Waitlist_State() {
  return (
    <div className="lc-page" style={{ width: 1280 }}>
      <LCAnnouncement>Algunas piezas se agotan rápido — te avisamos en cuanto vuelvan</LCAnnouncement>
      <LCNav cartCount={0}/>

      <section style={{ padding: '40px 64px 96px' }}>
        <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginBottom: 24 }}>
          Inicio &nbsp;/&nbsp; Colección &nbsp;/&nbsp; <span style={{ color: 'var(--lc-ink)' }}>Princesita de Ballet</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          {/* image with sold-out treatment */}
          <div style={{ position: 'relative' }}>
            <div className="lc-plate" style={{ aspectRatio: '4/5', background: 'var(--lc-pink-soft)' }}>
              <img src="../assets/products/LC-015.jpeg" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter: 'grayscale(0.2) brightness(0.96)' }}/>
            </div>
            <div style={{ position: 'absolute', top: 24, left: 24, padding: '8px 16px', background: '#1A1410', color: '#FDFBF6', fontFamily: 'var(--lc-font-mono)', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
              Agotada · próximamente
            </div>
          </div>

          {/* form */}
          <div style={{ paddingLeft: 24 }}>
            <LCEyebrow>Niña · 5 piezas premium</LCEyebrow>
            <h1 className="lc-display" style={{ fontSize: 60, lineHeight: 0.95, fontWeight: 300, marginTop: 14 }}>Princesita de Ballet</h1>
            <div className="lc-display-i" style={{ fontSize: 17, color: 'var(--lc-ink-soft)', marginTop: 8 }}>Pequeña estrella del primer escenario</div>

            <div style={{ marginTop: 28, padding: 32, background: 'var(--lc-bg-warm)' }}>
              <LCEyebrow style={{ color: 'var(--lc-gold-deep)' }}>Lista de espera</LCEyebrow>
              <h2 className="lc-display" style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 300, marginTop: 14 }}>
                Te avisamos cuando <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>vuelva.</em>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 14, lineHeight: 1.7 }}>
                Es un ajuar pequeño y delicado — producimos pocas unidades cada mes. Déjanos tu nombre y te escribimos a WhatsApp en cuanto entren al taller.
              </p>

              <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
                <Field label="Tu nombre" value="Camila Sotomayor"/>
                <Field label="WhatsApp" value="+51 987 654 321"/>
                <Field label="Correo (opcional)" value=""/>
                <div>
                  <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)', marginBottom: 10 }}>Talla deseada</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['RN','0-3m','3-6m'].map((s,i) => (
                      <span key={s} style={{ padding: '10px 18px', border: '1px solid ' + (i === 1 ? 'var(--lc-ink)' : 'var(--lc-rule)'), background: i === 1 ? 'var(--lc-ink)' : 'transparent', color: i === 1 ? 'var(--lc-bg)' : 'var(--lc-ink)', fontFamily: 'var(--lc-font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <LCButton variant="primary" style={{ width: '100%' }}>Avísame cuando llegue</LCButton>
              </div>
              <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-mute)', marginTop: 14, textAlign: 'center' }}>
                Sin spam · solo el aviso cuando vuelva al taller
              </div>
            </div>

            <div style={{ marginTop: 28, padding: 20, background: 'var(--lc-bg)', border: '1px solid var(--lc-rule)' }}>
              <div className="lc-display-i" style={{ fontSize: 18 }}>Mientras tanto…</div>
              <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 8, lineHeight: 1.7 }}>
                Tenemos otras piezas con la misma sensación. Mira <span style={{ borderBottom: '1px solid var(--lc-gold-deep)', cursor: 'pointer' }}>Mi Duraznito</span> o <span style={{ borderBottom: '1px solid var(--lc-gold-deep)', cursor: 'pointer' }}>Conejita en Ballet</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LCFooter/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HELPER COMPONENTS — forms, summary
// ════════════════════════════════════════════════════════════════
function FormSection({ title, italicWord, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 className="lc-display" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.2, marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--lc-rule)' }}>
        {title} {italicWord && <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>{italicWord}.</em>}
      </h2>
      {children}
    </div>
  );
}

function FormRow({ children, cols }) {
  const n = cols || React.Children.count(children);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 24, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function Field({ label, value, hint, type, multiline }) {
  const Input = multiline ? 'textarea' : 'input';
  return (
    <div>
      <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)', marginBottom: 8 }}>{label}</div>
      <Input
        type={type || 'text'}
        defaultValue={value}
        readOnly
        rows={multiline ? 3 : undefined}
        style={{
          width: '100%',
          background: 'transparent',
          border: 0,
          borderBottom: '1px solid var(--lc-rule)',
          padding: '10px 0',
          fontFamily: multiline ? 'var(--lc-font-display)' : 'var(--lc-font-body)',
          fontSize: multiline ? 15 : 15,
          fontStyle: multiline ? 'italic' : 'normal',
          fontWeight: 300,
          color: 'var(--lc-ink)',
          resize: 'none',
        }}
      />
      {hint && <div style={{ fontSize: 11, color: 'var(--lc-ink-mute)', marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function CheckoutSummary({ step }) {
  return (
    <aside style={{ position: 'sticky', top: 24, background: 'var(--lc-bg-warm)', padding: 28 }}>
      <LCEyebrow>Resumen</LCEyebrow>
      <div className="lc-display" style={{ fontSize: 32, fontWeight: 300, marginTop: 8 }}>S/ {step >= 2 ? '171.65' : '161.65'}</div>
      <div className="lc-display-i" style={{ fontSize: 13, color: 'var(--lc-ink-soft)' }}>4 piezas · empaque regalo</div>

      <div style={{ margin: '24px 0', height: 1, background: 'var(--lc-rule)' }}/>

      {/* items mini list */}
      {[
        { id:'LC-010', n:'Mi Duraznito', q:1, p:'79.00' },
        { id:'LC-101', n:'Body Esencial', q:3, p:'87.00' },
      ].map(it => (
        <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 10, padding: '8px 0', alignItems: 'center' }}>
          <div className="lc-plate" style={{ aspectRatio: '1/1' }}>
            <img src={`../assets/products/${it.id}.jpeg`} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          </div>
          <div style={{ fontSize: 12 }}>
            <div style={{ color: 'var(--lc-ink)' }}>{it.n}</div>
            <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--lc-ink-mute)', marginTop: 2 }}>× {it.q}</div>
          </div>
          <div style={{ fontFamily: 'var(--lc-font-display)', fontSize: 13 }}>S/ {it.p}</div>
        </div>
      ))}

      <div style={{ margin: '20px 0', height: 1, background: 'var(--lc-rule)' }}/>

      {[
        ['Subtotal', 'S/ 166.00'],
        ['Oferta 3 × 15%', '− S/ 4.35'],
        step >= 2 && ['Envío Lima', 'S/ 10.00'],
        ['Empaque regalo', 'Gratis'],
      ].filter(Boolean).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: 'var(--lc-ink-soft)' }}>
          <span>{k}</span><span style={{ color: 'var(--lc-ink)' }}>{v}</span>
        </div>
      ))}

      <div style={{ margin: '16px 0 0', paddingTop: 14, borderTop: '1px solid var(--lc-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12 }}>Total</span>
        <span className="lc-display" style={{ fontSize: 26, fontWeight: 300 }}>S/ {step >= 2 ? '171.65' : '161.65'}</span>
      </div>

      <div style={{ margin: '24px 0', height: 1, background: 'var(--lc-rule)' }}/>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="lc-display-i" style={{ fontSize: 14, color: 'var(--lc-ink)' }}>¿Dudas?</div>
          <div style={{ fontSize: 11, color: 'var(--lc-ink-soft)', marginTop: 3 }}>Te respondemos en minutos</div>
        </div>
        <LCWhatsApp style={{ padding: '10px 16px', fontSize: 10 }}>Chat</LCWhatsApp>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════
// HANDOFF — notas para Claude Code mapeando diseño ↔ código
// ════════════════════════════════════════════════════════════════
function HandoffNotes() {
  return (
    <div className="lc-page" style={{ width: 1280, padding: '64px 72px', background: 'var(--lc-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderBottom: '1px solid var(--lc-rule)', paddingBottom: 32, marginBottom: 48 }}>
        <div>
          <LCEyebrow>Para Claude Code · rama redesign/public-v2</LCEyebrow>
          <h1 className="lc-display" style={{ fontSize: 72, fontWeight: 300, lineHeight: 1, margin: '14px 0 0', letterSpacing: '-0.02em' }}>
            Hoja de <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>handoff.</em>
          </h1>
        </div>
        <div style={{ maxWidth: 360, fontSize: 12.5, color: 'var(--lc-ink-soft)', lineHeight: 1.75 }}>
          Estos mockups SON la dirección visual. La lógica existente (carrito, money.ts, integraciones, admin) NO se toca. Solo se reemplaza la capa de presentación en los archivos listados abajo.
        </div>
      </div>

      {/* Rules */}
      <div style={{ background: '#1A1410', color: '#FDFBF6', padding: 32, marginBottom: 48 }}>
        <LCEyebrow style={{ color: 'var(--lc-gold)' }}>Reglas duras (recordatorio)</LCEyebrow>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, fontSize: 12.5 }}>
          {[
            'NO tocar /admin · NI su paleta · NI sus componentes',
            'NO tocar app/lib/money.ts · TODA visualización con formatSoles() o formatSolesFromCents()',
            'NO tocar app/lib/payment-info.ts · ni /api/*',
            'NO romper el flujo: catálogo → producto → carrito → checkout (3 pasos) → confirmación + WhatsApp',
            'MANTENER bilingüe ES/EN con el toggle existente',
            'MANTENER WhatsApp visible y pre-llenado en confirmación',
            'Trabajar en rama redesign/public-v2 con PRs pequeños',
            'Culqi sigue feature-flag NEXT_PUBLIC_CULQI_ENABLED · UI lista pero desactivada',
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
              <span className="lc-mono" style={{ fontSize: 10, color: 'var(--lc-gold)', letterSpacing: '0.18em' }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ color: 'rgba(253,251,246,.85)', lineHeight: 1.65 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapeo bloque → archivo */}
      <h2 className="lc-display" style={{ fontSize: 36, fontWeight: 300, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--lc-rule)' }}>
        Mapeo diseño <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>↔</em> archivos Next.js
      </h2>

      <div style={{ border: '1px solid var(--lc-rule)' }}>
        {[
          ['01','Sistema de diseño','app/globals.css · tailwind.config.ts · app/components/ui/*','Tokens, fuentes (Cormorant, Inter, JetBrains Mono), botones, badges, tarjetas. Reemplazar paleta Geist/dorado→marrón actual por la nueva paleta crema/oro champagne.','TOCAR'],
          ['02','Header / Nav','app/components/Header.tsx','Mantener toggle ES/EN, contador del carrito, links a colección/historia/regalar/cuidados.','TOCAR'],
          ['03','Footer','app/components/Footer.tsx','Reemplazar emojis por etiquetas tipográficas. Mantener links a WhatsApp/IG/FB y newsletter.','TOCAR'],
          ['04','Home / Hero','app/page.tsx · app/components/Hero.tsx · BrandStrip.tsx · etc.','Rediseñar el storytelling editorial: hero asimétrico, capítulo material, capítulo colección, destacado, regalar, FAQ teaser, newsletter.','TOCAR'],
          ['05','Catálogo / Colección','app/coleccion/page.tsx · ProductGrid.tsx · ProductCard.tsx','Grid 4 col desktop, 2 col mobile. Filtros como pills minimal. Romper grid con tiles editoriales tipo "nota del taller".','TOCAR'],
          ['06','Página de producto','app/producto/[slug]/page.tsx · ProductGallery.tsx · ProductInfo.tsx · SizeSelector.tsx · ColorSelector.tsx','Galería con thumbs lado, info en columna derecha. Toggle "es para regalar" gratis. Detalle editorial debajo con datos del Pima.','TOCAR'],
          ['07','Carrito (cajón + página)','app/carrito/page.tsx · CartDrawer.tsx · CartItem.tsx','Lista limpia de items + cuadro "experiencia regalo" + cross-sell. Resumen sticky a la derecha. Mantener lógica de oferta 3×15%.','TOCAR'],
          ['08','Checkout — paso 1 datos','app/checkout/datos/page.tsx','Formulario en una columna principal + resumen sticky. Toggle regalo. Stepper arriba.','TOCAR'],
          ['09','Checkout — paso 2 envío','app/checkout/envio/page.tsx','Radio cards (Lima/Shalom) + dirección + calendario con bloqueo sábados/viernes-tarde + franja horaria. Respetar reglas de rango (90 días, dom OK).','TOCAR'],
          ['10','Checkout — paso 3 pago','app/checkout/pago/page.tsx · payment-info.ts (NO TOCAR LÓGICA)','Lista de métodos: Yape (QR+nro+titular dinámicos), Plin, Transferencia, Contra entrega, Culqi (feature-flag). Subida de comprobante drag&drop.','TOCAR (solo UI)'],
          ['11','Confirmación','app/checkout/confirmacion/page.tsx','Tick dorado, número de pedido, resumen, CTA WhatsApp pre-llenado (mantener template existente). 3 pasos siguientes.','TOCAR'],
          ['12','Stock 0 / Waitlist','app/producto/[slug]/page.tsx (variante) · WaitlistForm.tsx','Variante de ficha cuando stock = 0. Form: nombre · WhatsApp · email · talla → guarda en waitlist (Supabase).','TOCAR'],
          ['13','Historia del Pima','app/historia/page.tsx (nueva o existente)','Long-form editorial de ~5 secciones: hero italic, comparación, proceso, CTA.','TOCAR / CREAR'],
          ['14','Para regalar','app/regalar/page.tsx (nueva)','3 cajas + personalización + "arma tu set". Las cajas pueden venderse como SKUs especiales o como flow guiado.','CREAR'],
          ['15','Tallas + cuidados','app/tallas/page.tsx (nueva)','Tabla de tallas + grid de cuidados. Quote de Marisol.','CREAR'],
          ['16','FAQ','app/faq/page.tsx (nueva)','4 secciones con accordion (details/summary nativos OK).','CREAR'],
          ['17','Admin · /admin/*','app/admin/**','NO TOCAR. Conservar paleta y componentes existentes.','VEDADO'],
          ['18','Lógica de carrito · money · API','app/lib/* · app/api/*','NO TOCAR. Solo consumir desde la nueva UI.','VEDADO'],
        ].map(([n, t, f, d, status]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '50px 200px 1.2fr 1.6fr 130px', gap: 20, padding: '18px 20px', borderBottom: '1px solid var(--lc-rule)', alignItems: 'start' }}>
            <div className="lc-mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--lc-gold-deep)' }}>{n}</div>
            <div>
              <div className="lc-display-i" style={{ fontSize: 17, lineHeight: 1.2 }}>{t}</div>
            </div>
            <div className="lc-mono" style={{ fontSize: 11, color: 'var(--lc-ink-soft)', lineHeight: 1.5 }}>{f}</div>
            <div style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', lineHeight: 1.6 }}>{d}</div>
            <span className="lc-mono" style={{
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
              padding: '4px 10px',
              background: status === 'VEDADO' ? '#F0D9D2' : (status === 'CREAR' ? 'var(--lc-gold-pale)' : 'var(--lc-bg-warm)'),
              color: status === 'VEDADO' ? '#8B5A4D' : (status === 'CREAR' ? 'var(--lc-gold-deep)' : 'var(--lc-ink)'),
              alignSelf: 'start',
              textAlign: 'center',
            }}>{status}</span>
          </div>
        ))}
      </div>

      {/* Specific notes */}
      <div style={{ marginTop: 56 }}>
        <h2 className="lc-display" style={{ fontSize: 36, fontWeight: 300, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--lc-rule)' }}>
          Notas <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>técnicas.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
          {[
            ['Tipografías', 'Importar desde Google Fonts en app/layout.tsx: Cormorant Garamond (300, 400, 500 + cursivas), Inter (300, 400, 500), JetBrains Mono (400, 500). Usar next/font con subsets latin.'],
            ['Iconos', 'Mantener lucide-react. Reemplazar emojis 🦁 🌿 🇵🇪 ✓ por hairline icons. Tamaño 14–18 px, stroke 1.5.'],
            ['Imágenes', 'next/image obligatorio. priority en hero. blur placeholder con base64 corto. Aspect ratios: cards 4:5 · plate 1:1 · hero 3:4.'],
            ['Animaciones', 'Solo transitions CSS y un poco de Framer Motion si ya está instalado. Hover en cards: translateY(-2px). Page transitions: opacity 200ms.'],
            ['Mobile-first', 'Breakpoints Tailwind: sm 640, md 768, lg 1024, xl 1280. Hero scale: 88px desktop → 52px mobile. Padding lateral: 64px → 20px.'],
            ['Accesibilidad', 'Contraste mínimo AA: tinta #1A1410 sobre crema #FDFBF6 = 16.4 ✓. Focus states con outline gold. aria-labels en iconos. alt text en imágenes Supabase.'],
            ['Performance', 'CSS variables en :root (no en tailwind config si conflicta). Evitar pseudo-3D, blur grandes. Lazy-load grids de productos. Preconnect a fonts.'],
            ['Stock 0', 'En ProductCard mostrar badge "Agotado" sutil (no rojo, no llamativo). En la ficha → variante con form de waitlist. Tabla Supabase: waitlist (product_id, customer_name, whatsapp, email, size, created_at).'],
            ['Mensaje WhatsApp', 'Mantener el template actual de confirmación que genera el backend. La UI solo lo muestra y abre wa.me. El mockup tiene un ejemplo del bloque pre-llenado.'],
            ['ES/EN', 'Toggle en nav superior. Strings centralizados en app/i18n/es.json y en.json. Cada mockup tiene su versión en español como referencia primaria — pedir traducción aparte.'],
          ].map(([t, d]) => (
            <div key={t}>
              <LCEyebrow style={{ color: 'var(--lc-gold-deep)' }}>{t}</LCEyebrow>
              <p style={{ fontSize: 13, color: 'var(--lc-ink-soft)', marginTop: 10, lineHeight: 1.7 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tokens dump */}
      <div style={{ marginTop: 56, padding: 32, background: '#1A1410', color: '#FDFBF6' }}>
        <LCEyebrow style={{ color: 'var(--lc-gold)' }}>Tokens · copia directa</LCEyebrow>
        <pre style={{ marginTop: 18, fontSize: 11, fontFamily: 'var(--lc-font-mono)', color: 'rgba(253,251,246,.8)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{`/* Lion Cub · paleta */
--lc-bg:        #FDFBF6   /* superficie crema base */
--lc-bg-warm:   #F5ECDC   /* secciones cálidas */
--lc-bg-ink:    #1A1410   /* invertido / footer */
--lc-ink:       #1A1410
--lc-ink-soft:  #5B4F42
--lc-ink-mute:  #9B8D7E
--lc-rule:      #E8DFCB
--lc-gold:      #C9A961   /* champagne */
--lc-gold-deep: #A47C3B   /* italics, énfasis */
--lc-gold-pale: #EFE0BB
/* acentos · pasteles desaturados */
--lc-pink:  #F0D9D2 · --lc-pink-soft:  #F7E8E3
--lc-blue:  #D9E2EA · --lc-blue-soft:  #ECF1F5
--lc-mint:  #DDE6D6 · --lc-mint-soft:  #EDF1E9
--lc-lav:   #E2DCE5

/* tipografía */
--lc-font-display: 'Cormorant Garamond', serif    (300 italic + roman)
--lc-font-body:    'Inter', system-ui              (300/400/500)
--lc-font-mono:    'JetBrains Mono', monospace     (400/500, etiquetas)`}</pre>
      </div>
    </div>
  );
}

window.CheckoutStep1_Desktop = CheckoutStep1_Desktop;
window.CheckoutStep2_Desktop = CheckoutStep2_Desktop;
window.CheckoutStep3_Desktop = CheckoutStep3_Desktop;
window.Confirmation_Desktop = Confirmation_Desktop;
window.Waitlist_State = Waitlist_State;
window.HandoffNotes = HandoffNotes;
