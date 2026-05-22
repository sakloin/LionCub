// Lion Cub — Canvas orchestration. Every artboard surfaced in design_canvas.

function App() {
  return (
    <div className="lc-root">
      <DesignCanvas
        title="Rediseño Lion Cub · v1"
        subtitle="Sistema editorial · pantallas web · handoff para Claude Code"
      >
        {/* ─── Handoff & system ─── */}
        <DCSection id="handoff" title="Para Claude Code · empieza aquí">
          <DCArtboard id="handoff-notes" label="Notas de handoff" width={1280} height={2100}>
            <HandoffNotes/>
          </DCArtboard>
          <DCArtboard id="system" label="Sistema de diseño" width={1280} height={2200}>
            <DesignSystem/>
          </DCArtboard>
        </DCSection>

        {/* ─── Home variations ─── */}
        <DCSection id="home" title="Home · dos direcciones">
          <DCArtboard id="home-a-desktop" label="V1 · Editorial Letter · Desktop" width={1440} height={5200}>
            <HomeA_Desktop/>
          </DCArtboard>
          <DCArtboard id="home-a-mobile" label="V1 · Mobile" width={390} height={4200}>
            <HomeA_Mobile/>
          </DCArtboard>
          <DCArtboard id="home-b-desktop" label="V2 · Quiet Luxury · Desktop" width={1440} height={5800}>
            <HomeB_Desktop/>
          </DCArtboard>
          <DCArtboard id="home-b-mobile" label="V2 · Mobile" width={390} height={4400}>
            <HomeB_Mobile/>
          </DCArtboard>
        </DCSection>

        {/* ─── Shop ─── */}
        <DCSection id="shop" title="Tienda · catálogo, ficha, carrito">
          <DCArtboard id="collection-desktop" label="Colección · Desktop" width={1440} height={2400}>
            <Collection_Desktop/>
          </DCArtboard>
          <DCArtboard id="collection-mobile" label="Colección · Mobile" width={390} height={2400}>
            <Collection_Mobile/>
          </DCArtboard>
          <DCArtboard id="product-desktop" label="Ficha de producto · Desktop" width={1440} height={3200}>
            <ProductDetail_Desktop/>
          </DCArtboard>
          <DCArtboard id="product-mobile" label="Ficha de producto · Mobile" width={390} height={2400}>
            <ProductDetail_Mobile/>
          </DCArtboard>
          <DCArtboard id="waitlist" label="Stock 0 · Lista de espera" width={1280} height={1100}>
            <Waitlist_State/>
          </DCArtboard>
          <DCArtboard id="cart-desktop" label="Carrito · Desktop" width={1440} height={2400}>
            <Cart_Desktop/>
          </DCArtboard>
          <DCArtboard id="cart-mobile" label="Carrito · Mobile" width={390} height={2200}>
            <Cart_Mobile/>
          </DCArtboard>
        </DCSection>

        {/* ─── Checkout flow ─── */}
        <DCSection id="checkout" title="Checkout · 3 pasos + confirmación">
          <DCArtboard id="checkout-1" label="Paso 1 · Tus datos" width={1440} height={1800}>
            <CheckoutStep1_Desktop/>
          </DCArtboard>
          <DCArtboard id="checkout-2" label="Paso 2 · Envío + fecha + franja" width={1440} height={2400}>
            <CheckoutStep2_Desktop/>
          </DCArtboard>
          <DCArtboard id="checkout-3" label="Paso 3 · Pago + comprobante" width={1440} height={2400}>
            <CheckoutStep3_Desktop/>
          </DCArtboard>
          <DCArtboard id="confirmation" label="Confirmación + WhatsApp" width={1440} height={1800}>
            <Confirmation_Desktop/>
          </DCArtboard>
        </DCSection>

        {/* ─── Editorial pages ─── */}
        <DCSection id="editorial" title="Páginas editoriales">
          <DCArtboard id="pima" label="Historia del Pima" width={1280} height={3200}>
            <PimaStory/>
          </DCArtboard>
          <DCArtboard id="gift" label="Para regalar · gift boxes" width={1280} height={2800}>
            <GiftBox/>
          </DCArtboard>
          <DCArtboard id="size" label="Tallas + cuidados" width={1280} height={2400}>
            <SizeGuide/>
          </DCArtboard>
          <DCArtboard id="faq" label="FAQ papás primerizos" width={1280} height={2400}>
            <FAQ/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
