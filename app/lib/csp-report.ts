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

/** Deja solo origen + ruta. `inline`, `eval`, `data`, etc. pasan tal cual. */
export function limpiarUri(valor: unknown): string {
  const s = texto(valor).trim();
  if (!s) return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    // Palabras clave de CSP (inline, eval, data, blob…) o rutas: sin query ni fragmento.
    return s.split(/[?#]/)[0].slice(0, 200);
  }
  try {
    const u = new URL(s);
    return (u.origin === "null" ? u.protocol : u.origin + u.pathname).slice(0, 200);
  } catch {
    return s.split(/[?#]/)[0].slice(0, 200);
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
