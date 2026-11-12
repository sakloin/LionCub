import { NextRequest, NextResponse } from "next/server";
import { TOPE_CUERPO_BYTES, normalizarReportes } from "../../lib/csp-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS_ACEPTADOS = ["application/csp-report", "application/reports+json", "application/json"];

// Buzón público de solo escritura: los reportes de la CSP en modo «solo reportar»
// llegan aquí y salen como una línea por reporte en los logs. Sin auth, sin
// cookies, sin IP ni user-agent.
export async function POST(req: NextRequest) {
  const tipo = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TIPOS_ACEPTADOS.includes(tipo)) return new NextResponse(null, { status: 415 });

  const declarado = Number(req.headers.get("content-length") ?? 0);
  if (declarado > TOPE_CUERPO_BYTES) return new NextResponse(null, { status: 413 });

  const cuerpo = await req.text();
  if (Buffer.byteLength(cuerpo, "utf8") > TOPE_CUERPO_BYTES) return new NextResponse(null, { status: 413 });

  for (const reporte of normalizarReportes(cuerpo)) {
    console.warn("[csp-report]", JSON.stringify(reporte));
  }
  return new NextResponse(null, { status: 204 });
}
