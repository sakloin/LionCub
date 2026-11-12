import { TOPE_CUERPO_BYTES, normalizarReportes } from "../../lib/csp-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS_ACEPTADOS = ["application/csp-report", "application/reports+json", "application/json"];

const sinCuerpo = (status: number) => new Response(null, { status });

/** Lee el cuerpo con tope; devuelve null si lo pasa (y cancela el stream). */
async function leerConTope(req: Request): Promise<string | null> {
  if (!req.body) return "";
  const lector = req.body.getReader();
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > TOPE_CUERPO_BYTES) {
      await lector.cancel().catch(() => undefined);
      return null;
    }
    trozos.push(value);
  }
  return Buffer.concat(trozos).toString("utf8");
}

// Buzón público de solo escritura: los reportes de la CSP en modo «solo reportar»
// llegan aquí y salen como una línea por reporte en los logs. Sin auth, sin
// cookies, sin IP ni user-agent.
export async function POST(req: Request) {
  const tipo = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TIPOS_ACEPTADOS.includes(tipo)) return sinCuerpo(415);

  const declarado = Number(req.headers.get("content-length") ?? 0);
  if (declarado > TOPE_CUERPO_BYTES) return sinCuerpo(413);

  let cuerpo: string | null;
  try {
    cuerpo = await leerConTope(req);
  } catch {
    return sinCuerpo(400); // sin registrar la traza
  }
  if (cuerpo === null) return sinCuerpo(413);

  for (const reporte of normalizarReportes(cuerpo)) {
    console.warn("[csp-report]", JSON.stringify(reporte));
  }
  return sinCuerpo(204);
}
