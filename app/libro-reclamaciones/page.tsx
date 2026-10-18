import type { Metadata } from "next";
import Link from "next/link";
import { DATOS_LEGALES, PLAZO_RESPUESTA_DIAS_HABILES } from "../lib/legal";
import FormularioReclamo from "./FormularioReclamo";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones",
  description: "Libro de Reclamaciones virtual de Lion Cub Baby Clothing, conforme a la Ley 29571.",
  alternates: { canonical: "/libro-reclamaciones" },
};

export default function LibroReclamacionesPage() {
  const proveedor = [
    DATOS_LEGALES.razonSocial ?? DATOS_LEGALES.nombreComercial,
    DATOS_LEGALES.ruc ? `RUC ${DATOS_LEGALES.ruc}` : null,
    DATOS_LEGALES.domicilio,
  ].filter(Boolean);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 bg-bg text-ink">
      <Link
        href="/"
        className="lc-mono uppercase text-[12px] tracking-[0.18em] text-ink-soft hover:text-ink transition-colors inline-flex items-center min-h-11 mb-6 print:hidden"
      >
        ← Volver a la tienda
      </Link>

      <h1 className="lc-display text-4xl sm:text-5xl text-ink leading-none mb-4">
        Libro de <em className="lc-display-i text-gold-deep">Reclamaciones.</em>
      </h1>
      <p className="text-base text-ink-soft leading-relaxed mb-2">
        Conforme al Código de Protección y Defensa del Consumidor (Ley 29571), este establecimiento
        cuenta con un Libro de Reclamaciones virtual a tu disposición.
      </p>
      <p className="text-sm text-ink-soft leading-relaxed mb-8">
        Proveedor: {proveedor.join(" · ")}
      </p>

      <div className="print:hidden bg-bg-warm border border-rule p-5 mb-10 text-sm text-ink-soft leading-relaxed flex flex-col gap-2">
        <p>
          <strong className="text-ink font-semibold">Reclamo:</strong> disconformidad relacionada con los
          productos o servicios.{" "}
          <strong className="text-ink font-semibold">Queja:</strong> disconformidad no relacionada con los
          productos o servicios, o malestar respecto a la atención al público.
        </p>
        <p>
          Te enviaremos una copia de esta hoja a tu correo y responderemos en un plazo máximo de{" "}
          {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles.
        </p>
        <p>
          También puedes presentarlo por{" "}
          <a href={DATOS_LEGALES.whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline text-ink">
            WhatsApp {DATOS_LEGALES.whatsapp}
          </a>{" "}
          o a{" "}
          <a href={`mailto:${DATOS_LEGALES.correo}`} className="underline text-ink">
            {DATOS_LEGALES.correo}
          </a>
          .
        </p>
      </div>

      <FormularioReclamo />

      <p className="text-[12px] text-ink-soft leading-relaxed mt-10">
        La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es
        requisito previo para interponer una denuncia ante el INDECOPI. El proveedor debe dar respuesta
        al reclamo o queja en un plazo no mayor a {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles.
      </p>
    </main>
  );
}
