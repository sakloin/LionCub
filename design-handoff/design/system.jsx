// Lion Cub — Design System reference card (first artboard in the canvas).

function DesignSystem() {
  return (
    <div className="lc-page" style={{ width: 1280, padding: '64px 72px', background: 'var(--lc-bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderBottom: '1px solid var(--lc-rule)', paddingBottom: 32, marginBottom: 48 }}>
        <div>
          <LCEyebrow>Notas para el equipo</LCEyebrow>
          <h1 className="lc-display" style={{ fontSize: 72, fontWeight: 300, lineHeight: 1, margin: '14px 0 0', letterSpacing: '-0.02em' }}>
            Sistema de <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>diseño.</em>
          </h1>
        </div>
        <div style={{ maxWidth: 320, color: 'var(--lc-ink-soft)', fontSize: 13, lineHeight: 1.7 }}>
          Inspirado en Bonpoint, Marie-Chantal y Petit Bateau. Lujo discreto, espacio para respirar, calma editorial. Pensado para ser implementado por Claude Code sobre la estructura Next.js existente.
        </div>
      </div>

      {/* Colors */}
      <Section title="Color" italicWord="cálido">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            ['Crema base', '--lc-bg', '#FDFBF6'],
            ['Crema cálido', '--lc-bg-warm', '#F5ECDC'],
            ['Tinta', '--lc-ink', '#1A1410'],
            ['Tinta suave', '--lc-ink-soft', '#5B4F42'],
          ].map(([name, token, hex]) => (
            <Swatch key={token} name={name} token={token} hex={hex} dark={hex === '#1A1410' || hex === '#5B4F42'}/>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 16 }}>
          {[
            ['Oro champagne', '--lc-gold', '#C9A961'],
            ['Oro profundo', '--lc-gold-deep', '#A47C3B'],
            ['Hairline', '--lc-rule', '#E8DFCB'],
            ['Mute', '--lc-ink-mute', '#9B8D7E'],
          ].map(([name, token, hex]) => (
            <Swatch key={token} name={name} token={token} hex={hex} dark={hex === '#5B4F42' || hex === '#A47C3B'}/>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <LCEyebrow style={{ color: 'var(--lc-ink-mute)', marginBottom: 12 }}>Acentos pastel · desaturados</LCEyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {[
              ['Polvo rosa', '#F0D9D2'],
              ['Cielo', '#D9E2EA'],
              ['Hoja', '#DDE6D6'],
              ['Lavanda', '#E2DCE5'],
              ['Durazno', '#EDC8B0'],
            ].map(([n, h]) => (
              <div key={n}>
                <div style={{ background: h, height: 56, borderRadius: 2 }}/>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--lc-ink-soft)' }}>{n}</div>
                <div className="lc-mono" style={{ fontSize: 9, color: 'var(--lc-ink-mute)', letterSpacing: '0.1em' }}>{h}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title="Tipografía" italicWord="editorial">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <LCEyebrow style={{ marginBottom: 18 }}>Display · Cormorant Garamond · light italic</LCEyebrow>
            <div className="lc-display-i" style={{ fontSize: 88, lineHeight: 0.95, fontWeight: 300 }}>Suave como su piel</div>
            <div className="lc-display" style={{ fontSize: 48, lineHeight: 1, fontWeight: 300, marginTop: 16 }}>Aa Bb Gg Mm</div>
            <div style={{ fontSize: 11, color: 'var(--lc-ink-mute)', marginTop: 12, lineHeight: 1.6 }}>
              Solo para títulos, hero, números de capítulo. Tracking negativo. Mezclar romano + cursiva en la misma frase para énfasis.
            </div>
          </div>
          <div>
            <LCEyebrow style={{ marginBottom: 18 }}>UI · Inter · light/regular</LCEyebrow>
            <div style={{ fontSize: 17, color: 'var(--lc-ink-soft)', lineHeight: 1.7, fontWeight: 300, maxWidth: 380 }}>
              Cada prenda nace en la costa norte del Perú, donde el algodón Pima crece bajo el sol y el rocío. Hebra larga, brillo natural, tacto sedoso.
            </div>
            <div style={{ marginTop: 24 }}>
              <LCEyebrow style={{ marginBottom: 18 }}>Mono · JetBrains Mono</LCEyebrow>
              <div className="lc-mono" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lc-ink-soft)' }}>SKU · LC-001 · TALLA RN · ENVÍO 24H</div>
              <div style={{ fontSize: 11, color: 'var(--lc-ink-mute)', marginTop: 12, lineHeight: 1.6 }}>
                Etiquetas, eyebrows, SKU, números. Siempre uppercase, tracking generoso.
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Componentes" italicWord="esenciales">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div>
            <LCEyebrow style={{ marginBottom: 18 }}>Botones</LCEyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <LCButton variant="primary">Agregar a la bolsa</LCButton>
              <LCButton variant="outline">Ver detalles</LCButton>
              <LCButton variant="ghost">Seguir leyendo</LCButton>
              <LCWhatsApp>Escribir por WhatsApp</LCWhatsApp>
            </div>
          </div>
          <div>
            <LCEyebrow style={{ marginBottom: 18 }}>Etiquetas</LCEyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span className="lc-pill">Recién nacido</span>
              <span className="lc-pill">0–3 m</span>
              <span className="lc-pill lc-pill-gold">3 × 15 % dto</span>
              <span className="lc-pill lc-pill-ink">Pima 100 %</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48 }}>
          <LCEyebrow style={{ marginBottom: 18 }}>Tarjeta de producto</LCEyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 32 }}>
            <LCProductCard product={{ id: 'LC-001', name: 'Tiernos Conejitos', tagline: 'El primer abrazo suave', price: 79, colors: ['Blanco'], gender: 'Unisex' }}/>
            <LCProductCard product={{ id: 'LC-010', name: 'Mi Duraznito', tagline: 'Dulce como su nombre', price: 79, colors: ['Durazno'], gender: 'Niña' }}/>
            <LCProductCard product={{ id: 'LC-016', name: 'Nube Celeste Premium', tagline: 'La suavidad hecha ajuar', price: 79, colors: ['Celeste'], gender: 'Unisex' }}/>
          </div>
        </div>
      </Section>

      {/* Voice */}
      <Section title="Voz" italicWord="susurrada">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div>
            <LCEyebrow style={{ marginBottom: 18, color: '#7CA08A' }}>Sí</LCEyebrow>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Íntima, en segunda persona — “para su piel”, “su primer abrazo”.','Específica: nombrar la fibra, el origen, el gesto.','Confianza serena, nunca clínica seca.','Mezclar lo poético con lo concreto.'].map(t => (
                <li key={t} style={{ fontSize: 14, color: 'var(--lc-ink-soft)', lineHeight: 1.65, paddingLeft: 20, position: 'relative' }}>
                  <span style={{ position:'absolute', left: 0, top: 10, width: 10, height: 1, background: 'var(--lc-gold-deep)' }}/>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <LCEyebrow style={{ marginBottom: 18, color: '#B58A8A' }}>No</LCEyebrow>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Emojis decorativos en el copy principal.','Frases de marketing tipo “los mejores precios”.','Mayúsculas en titulares (todo en sentence case).','Promesas vagas — todo aterrizado a una sensación o un material.'].map(t => (
                <li key={t} style={{ fontSize: 14, color: 'var(--lc-ink-soft)', lineHeight: 1.65, paddingLeft: 20, position: 'relative' }}>
                  <span style={{ position:'absolute', left: 0, top: 10, width: 10, height: 1, background: '#B58A8A' }}/>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Layout principles */}
      <Section title="Principios de layout" italicWord="aire">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            ['01','Mucho aire','Padding generoso. El producto siempre tiene espacio para respirar. Mínimo 80 px entre secciones en desktop.'],
            ['02','Cuadrícula asimétrica','Editorial, no comercial. Composiciones tipo revista: texto pequeño junto a fotos grandes, una columna desbalanceada.'],
            ['03','Hairlines, no cajas','Líneas finas color hairline en lugar de bordes con sombras. Las tarjetas casi nunca tienen marco.'],
            ['04','Mono como contrapunto','La cursiva del display se equilibra con etiquetas monoespaciadas — el contraste hace que el lujo se sienta moderno.'],
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="lc-display-i" style={{ fontSize: 28, color: 'var(--lc-gold-deep)' }}>{n}.</div>
              <div className="lc-display" style={{ fontSize: 20, marginTop: 12, fontWeight: 400 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--lc-ink-soft)', marginTop: 10, lineHeight: 1.7 }}>{d}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, italicWord, children }) {
  return (
    <div style={{ marginBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, paddingBottom: 16, borderBottom: '1px solid var(--lc-rule)' }}>
        <h3 className="lc-display" style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em' }}>
          {title} {italicWord && <em className="lc-display-i" style={{ color: 'var(--lc-gold-deep)' }}>{italicWord}.</em>}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Swatch({ name, token, hex, dark }) {
  return (
    <div>
      <div style={{ background: hex, height: 90, borderRadius: 2, border: hex === '#FDFBF6' ? '1px solid var(--lc-rule)' : 'none' }}/>
      <div style={{ marginTop: 10, fontSize: 13, color: 'var(--lc-ink)' }}>{name}</div>
      <div className="lc-mono" style={{ fontSize: 10, color: 'var(--lc-ink-mute)', letterSpacing: '0.12em', marginTop: 2 }}>{hex} · {token}</div>
    </div>
  );
}

window.DesignSystem = DesignSystem;
