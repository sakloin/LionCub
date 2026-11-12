// Política de seguridad de contenido (CSP) de Lion Cub, en modo SOLO REPORTAR.
// Fase 1 de «Cabeceras de seguridad»: mide qué bloquearía, sin romper nada.
// Orígenes reales que usa el NAVEGADOR (ver PR): Culqi (checkout.js, iframe y
// token) y Supabase (lecturas/escrituras desde el cliente). Las fuentes son
// next/font (autoalojadas) y /lc-fonts, así que no hay Google Fonts.
// Lo que solo llama el servidor (Meta, TikTok, OpenAI, Resend) NO va aquí.

export const RUTA_REPORTE_CSP = "/api/csp-report";

export function armarDirectivasCsp(esDesarrollo: boolean): string[] {
  return [
    "default-src 'self'",
    // 'unsafe-inline' por los scripts en línea de Next y el JSON-LD; 'unsafe-eval' solo en dev.
    `script-src 'self' 'unsafe-inline' 'report-sample' https://js.culqi.com${esDesarrollo ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.culqi.com https://js.culqi.com https://checkout.culqi.com",
    "frame-src https://checkout.culqi.com https://js.culqi.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `report-uri ${RUTA_REPORTE_CSP}`,
    "report-to csp",
  ];
}

export function armarCspReportOnly(esDesarrollo: boolean): string {
  return armarDirectivasCsp(esDesarrollo).join("; ");
}
