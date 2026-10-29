import Script from "next/script";
import { LION_CUB_BODY } from "./data/lion-cub-body";

// ISR: revalida cada 60 s (precio/stock frescos)
export const revalidate = 60;

export default function Home() {
  return (
    <>
      {/* Estilos del diseño Lion Cub — sobreescriben el body flex de Tailwind */}
      <link rel="stylesheet" href="/lc-styles.css" />
      <style>{`
        /* Neutralizar layout de Tailwind en el body para esta página */
        body {
          display: block !important;
          min-height: auto !important;
          flex-direction: unset !important;
          background: #faf7f6 !important;
        }
      `}</style>

      {/* HTML completo del diseño aprobado */}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: LION_CUB_BODY }} />

      {/* JS del diseño: carrusel, carrito local, búsqueda, modales */}
      <Script src="/lc-app.js" strategy="afterInteractive" />
    </>
  );
}
