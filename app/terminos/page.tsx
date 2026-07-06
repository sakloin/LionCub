import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio — Lion Cub Baby Clothing",
  description: "Términos y condiciones de uso de Lion Cub Baby Clothing.",
};

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold mb-2">Términos de Servicio</h1>
      <p className="text-sm text-gray-500 mb-10">Última actualización: julio 2026</p>

      <section className="space-y-8 text-gray-700 leading-relaxed">
        <div>
          <h2 className="text-xl font-medium mb-2">1. Aceptación</h2>
          <p>Al acceder y usar el sitio web <strong>lioncub.pe</strong> y realizar compras, aceptas los presentes términos de servicio. Si no estás de acuerdo, te pedimos no utilizar nuestros servicios.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">2. Productos y precios</h2>
          <p>Los precios están expresados en soles peruanos (PEN) e incluyen IGV. Lion Cub se reserva el derecho de modificar precios sin previo aviso. Las órdenes confirmadas mantienen el precio al momento de la compra.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">3. Envíos y entregas</h2>
          <p>Los pedidos se procesan en días hábiles. Los tiempos de entrega varían según la ubicación. Lion Cub no se responsabiliza por demoras causadas por terceros (courier, aduanas, fuerza mayor).</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">4. Devoluciones y cambios</h2>
          <p>Aceptamos devoluciones dentro de los 7 días calendario de recibido el producto, siempre que esté en su estado original, sin uso y con etiquetas. Los gastos de envío de devolución son cubiertos por el cliente.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">5. Propiedad intelectual</h2>
          <p>Todo el contenido del sitio (imágenes, textos, logotipos, diseños) es propiedad de Lion Cub Baby Clothing. Queda prohibida su reproducción sin autorización escrita.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">6. Uso de redes sociales</h2>
          <p>Lion Cub utiliza herramientas de automatización para publicar contenido en Instagram, Facebook y TikTok. El contenido publicado es de carácter comercial e informativo sobre nuestros productos.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">7. Contacto</h2>
          <p>Para consultas sobre estos términos escríbenos a <a href="mailto:lioncubpimacotton@gmail.com" className="underline">lioncubpimacotton@gmail.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
