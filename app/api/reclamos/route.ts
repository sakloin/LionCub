import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { validarReclamo, codigoHoja, esTablaInexistente, type ReclamoEntrada } from "../../lib/reclamos";
import { sendReclamoRegistrado } from "../../lib/email";
import { DATOS_LEGALES, PLAZO_RESPUESTA_DIAS_HABILES } from "../../lib/legal";

export const runtime = "nodejs";

// Mensaje para cuando el Libro virtual aún no puede guardar (tabla pendiente
// de la ADR 0002, o base caída). Siempre da un canal alterno.
// (Se arma con join: la concatenación de plantillas con constantes importadas
// salía mutilada en el build de producción con Turbopack.)
const CANAL_ALTERNO = [
  "Por ahora no pudimos registrar tu hoja en línea.",
  "Escríbenos a", DATOS_LEGALES.correo,
  "o por WhatsApp al", DATOS_LEGALES.whatsapp,
  "con estos mismos datos y la registramos con su número correlativo.",
  "El plazo de respuesta (" + String(PLAZO_RESPUESTA_DIAS_HABILES) + " días hábiles) corre igual.",
].join(" ");

export async function POST(req: NextRequest) {
  let body: Partial<ReclamoEntrada> & { sitio_web?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Campo trampa para bots: una persona nunca lo llena.
  if (body.sitio_web) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const v = validarReclamo(body);
  if (!v.ok) {
    return NextResponse.json({ error: "Revisa los campos marcados.", errores: v.errores }, { status: 422 });
  }

  type HojaCreada = { numero: number; anio: number; created_at: string };
  let data: HojaCreada | null = null;
  try {
    const res = await supabaseAdmin
      .from("libro_reclamaciones")
      .insert(v.fila)
      .select("numero, anio, created_at")
      .single();
    if (res.error) {
      if (esTablaInexistente(res.error)) {
        console.error("[reclamos] la tabla libro_reclamaciones no existe (ADR 0002 pendiente)");
      } else {
        console.error("[reclamos] error al insertar:", res.error.code, res.error.message);
      }
      return NextResponse.json({ error: CANAL_ALTERNO, canal_alterno: true }, { status: 503 });
    }
    data = res.data as HojaCreada;
  } catch (err) {
    console.error("[reclamos] sin conexión con la base:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: CANAL_ALTERNO, canal_alterno: true }, { status: 503 });
  }

  if (!data) {
    return NextResponse.json({ error: CANAL_ALTERNO, canal_alterno: true }, { status: 503 });
  }

  const codigo = codigoHoja(data.numero, data.anio);

  // Copia de la hoja al correo del consumidor (y aviso al admin). Si el correo
  // falla, la hoja ya quedó registrada: no se trata como error.
  try {
    await sendReclamoRegistrado({
      ...v.fila,
      codigo,
      fecha: data.created_at,
      plazo_dias_habiles: PLAZO_RESPUESTA_DIAS_HABILES,
      proveedor: [
        DATOS_LEGALES.razonSocial ?? DATOS_LEGALES.nombreComercial,
        DATOS_LEGALES.ruc ? `RUC ${DATOS_LEGALES.ruc}` : null,
      ].filter(Boolean).join(" · "),
    });
  } catch (err) {
    console.error("[reclamos] no se pudo enviar la copia:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ codigo, fecha: data.created_at }, { status: 201 });
}
