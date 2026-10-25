import type { Metadata } from "next";
import Link from "next/link";
import { DATOS_LEGALES, PLAZO_RESPUESTA_DIAS_HABILES } from "../lib/legal";

export const metadata: Metadata = {
  title: "Términos de Servicio — Lion Cub Baby Clothing",
  description: "Términos y condiciones de uso de Lion Cub Baby Clothing.",
};

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 bg-bg text-ink">
      <Link href="/" className="lc-mono uppercase text-[12px] tracking-[0.18em] text-ink-soft hover:text-ink transition-colors inline-flex items-center min-h-11 mb-6">
        ← Volver a la tienda
      </Link>
      <h1 className="lc-display text-4xl text-ink mb-2">Términos de Servicio</h1>
      <p className="text-sm text-ink-soft mb-10">Última actualización: octubre 2026</p>

      <section className="space-y-8 text-ink-soft text-base leading-relaxed">
        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">1. Aceptación</h2>
          <p>Al acceder y usar el sitio web <strong>lioncub.pe</strong> y realizar compras, aceptas los presentes términos de servicio. Si no estás de acuerdo, te pedimos no utilizar nuestros servicios.</p>
        </div>

        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">2. Productos y precios</h2>
          <p>Los precios están expresados en soles peruanos (PEN) e incluyen IGV. Lion Cub se reserva el derecho de modificar precios sin previo aviso. Las órdenes confirmadas mantienen el precio al momento de la compra.</p>
        </div>

        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">3. Envíos y entregas</h2>
          <p>Los pedidos se procesan en días hábiles. Los tiempos de entrega varían según la ubicación. Lion Cub no se responsabiliza por demoras causadas por terceros (courier, aduanas, fuerza mayor).</p>
        </div>

        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">4. Devoluciones y cambios</h2>
          <p>Aceptamos devoluciones dentro de los 7 días calendario de recibido el producto, siempre que esté en su estado original, sin uso y con etiquetas. Los gastos de envío de devolución son cubiertos por el cliente.</p>
        </div>

        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">5. Propiedad intelectual</h2>
          <p>Todo el contenido del sitio (imágenes, textos, logotipos, diseños) es propiedad de Lion Cub Baby Clothing. Queda prohibida su reproducción sin autorización escrita.</p>
        </div>

        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">6. Uso de redes sociales</h2>
          <p>Lion Cub utiliza herramientas de automatización para publicar contenido en Instagram, Facebook y TikTok. El contenido publicado es de carácter comercial e informativo sobre nuestros productos.</p>
        </div>

        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">7. Libro de Reclamaciones</h2>
          <p>Conforme al Código de Protección y Defensa del Consumidor (Ley 29571), ponemos a tu disposición nuestro <Link href="/libro-reclamaciones" className="underline">Libro de Reclamaciones virtual</Link>. Respondemos en un plazo máximo de {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles.</p>
        </div>

        <div>
          <h2 className="lc-display text-2xl text-ink mb-2">8. Identificación y contacto</h2>
          <p>
            {DATOS_LEGALES.razonSocial ?? DATOS_LEGALES.nombreComercial}
            {DATOS_LEGALES.ruc && <>, RUC {DATOS_LEGALES.ruc}</>}
            {DATOS_LEGALES.domicilio && <>, con domicilio en {DATOS_LEGALES.domicilio}</>}.
            {" "}Para consultas sobre estos términos escríbenos a <a href={`mailto:${DATOS_LEGALES.correo}`} className="underline">{DATOS_LEGALES.correo}</a> o por WhatsApp al <a href={DATOS_LEGALES.whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline">{DATOS_LEGALES.whatsapp}</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
