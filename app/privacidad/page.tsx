import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Lion Cub Baby Clothing",
  description: "Cómo recopilamos, usamos y protegemos tu información personal.",
};

export default function PrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gray-500 mb-10">Última actualización: julio 2026</p>

      <section className="space-y-8 text-gray-700 leading-relaxed">
        <div>
          <h2 className="text-xl font-medium mb-2">1. Responsable del tratamiento</h2>
          <p>Lion Cub Baby Clothing, con domicilio en San Borja, Lima, Perú. Contacto: <a href="mailto:lioncubpimacotton@gmail.com" className="underline">lioncubpimacotton@gmail.com</a>.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">2. Datos que recopilamos</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Nombre y apellidos</li>
            <li>Dirección de correo electrónico</li>
            <li>Dirección de envío</li>
            <li>Número de teléfono</li>
            <li>Datos de navegación (cookies, dirección IP)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">3. Finalidad del tratamiento</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Procesar y gestionar tus pedidos</li>
            <li>Enviar confirmaciones y actualizaciones de estado</li>
            <li>Mejorar la experiencia de navegación</li>
            <li>Enviar comunicaciones comerciales (solo con tu consentimiento)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">4. Redes sociales y automatización</h2>
          <p>Lion Cub utiliza integraciones con Meta (Instagram y Facebook) y TikTok para publicar contenido de productos de forma automatizada. Esta integración solo accede a la cuenta oficial de la marca y no recopila datos de usuarios de dichas plataformas.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">5. Base legal</h2>
          <p>El tratamiento de tus datos se basa en la ejecución del contrato de compraventa y, cuando corresponda, en tu consentimiento expreso.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">6. Conservación de datos</h2>
          <p>Conservamos tus datos mientras sea necesario para la relación comercial y durante los plazos legales exigidos por la normativa peruana.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">7. Tus derechos</h2>
          <p>Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales. Para ejercerlos escríbenos a <a href="mailto:lioncubpimacotton@gmail.com" className="underline">lioncubpimacotton@gmail.com</a>.</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">8. Cookies</h2>
          <p>Utilizamos cookies técnicas necesarias para el funcionamiento del sitio y cookies analíticas para mejorar la experiencia. Puedes gestionar las cookies desde la configuración de tu navegador.</p>
        </div>
      </section>
    </main>
  );
}
