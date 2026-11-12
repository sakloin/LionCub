// Normaliza los reportes de CSP (formatos `application/csp-report` y
// `application/reports+json`) a un registro mínimo y sin datos personales:
// sin query ni fragmento, sin cabeceras, IP ni user-agent.

export const TOPE_CUERPO_BYTES = 16 * 1024;
export const MAX_REPORTES = 20;
export const MAX_SAMPLE = 40;

export type ReporteCsp = {
  directiva: string;
  bloqueado: string;
  documento: string;
  disposition: string;
  sample: string;
};

function texto(v: unknown): string {
  return typeof v === "string" ? v : "";
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_LARGO = /^[A-Za-z0-9_-]{24,}$/;

/** Cambia los segmentos con forma de UUID o token largo por `:token` (p. ej. /mi-pedido/<uuid>). */
export function enmascararRuta(ruta: string): string {
  return ruta.split("/").map((seg) => (UUID.test(seg) || TOKEN_LARGO.test(seg) ? ":token" : seg)).join("/");
}

/**
 * Deja solo origen + ruta enmascarada. `inline`, `eval` y similares pasan tal cual;
 * los valores con esquema pero sin `://` (data:, blob:…) guardan solo el esquema.
 */
export function limpiarUri(valor: unknown): string {
  const s = texto(valor).trim();
  if (!s) return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    const esquema = /^([a-z][a-z0-9+.-]*):/i.exec(s);
    if (esquema) return (esquema[1].toLowerCase() + ":").slice(0, 20);
    return enmascararRuta(s.split(/[?#]/)[0]).slice(0, 200);
  }
  try {
    const u = new URL(s);
    return (u.origin === "null" ? u.protocol : u.origin + enmascararRuta(u.pathname)).slice(0, 200);
  } catch {
    return enmascararRuta(s.split(/[?#]/)[0]).slice(0, 200);
  }
}

function desdeCuerpo(o: Record<string, unknown>): ReporteCsp {
  // `csp-report` usa guiones; `reports+json` usa camelCase.
  return {
    directiva: texto(o["effectiveDirective"] ?? o["effective-directive"] ?? o["violatedDirective"] ?? o["violated-directive"]).slice(0, 60),
    bloqueado: limpiarUri(o["blockedURL"] ?? o["blocked-uri"] ?? o["blockedUri"]),
    documento: limpiarUri(o["documentURL"] ?? o["document-uri"] ?? o["documentUri"]),
    disposition: texto(o["disposition"]).slice(0, 20),
    sample: texto(o["sample"] ?? o["script-sample"]).slice(0, MAX_SAMPLE),
  };
}

function esObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Devuelve hasta MAX_REPORTES reportes normalizados; `[]` si el JSON es inválido. */
export function normalizarReportes(crudo: string): ReporteCsp[] {
  let datos: unknown;
  try {
    datos = JSON.parse(crudo);
  } catch {
    return [];
  }
  const lista = Array.isArray(datos) ? datos : [datos];
  const salida: ReporteCsp[] = [];
  for (const item of lista) {
    if (salida.length >= MAX_REPORTES) break;
    if (!esObjeto(item)) continue;
    if (esObjeto(item["csp-report"])) salida.push(desdeCuerpo(item["csp-report"]));
    else if (esObjeto(item["body"])) salida.push(desdeCuerpo(item["body"]));
    else if (item["effectiveDirective"] || item["effective-directive"] || item["violated-directive"]) salida.push(desdeCuerpo(item));
  }
  return salida;
}
