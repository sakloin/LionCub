import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { validarReclamo, codigoHoja, esTablaInexistente, type ReclamoEntrada } from "../../lib/reclamos";
import { firmarCarga, verificarCarga, hashIp, ipDeEncabezados, LIMITE_POR_HORA } from "../../lib/reclamos-servidor";
import { sendReclamoRegistrado } from "../../lib/email";
import { DATOS_LEGALES, PLAZO_RESPUESTA_DIAS_HABILES } from "../../lib/legal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLA = "libro_reclamaciones";

// Mensaje para cuando el Libro virtual no puede guardar (tabla pendiente de la
// ADR 0002, o base caída). Siempre da un canal alterno.
// (Se arma con join: la concatenación de plantillas con constantes importadas
// salía mutilada en el build de producción con Turbopack.)
const CANAL_ALTERNO = [
  "Por ahora no pudimos registrar tu hoja en línea.",
  "Escríbenos a", DATOS_LEGALES.correo,
  "o por WhatsApp al", DATOS_LEGALES.whatsapp,
  "con estos mismos datos y la registramos con su número correlativo.",
  "El plazo de respuesta (" + String(PLAZO_RESPUESTA_DIAS_HABILES) + " días hábiles) corre igual.",
].join(" ");

const LIMITE_SUPERADO = [
  "Ya recibimos varias hojas desde esta conexión o este correo en la última hora.",
  "Si necesitas agregar algo, escríbenos a", DATOS_LEGALES.correo,
  "o por WhatsApp al", DATOS_LEGALES.whatsapp + ".",
].join(" ");

function canalAlterno() {
  return NextResponse.json({ error: CANAL_ALTERNO, canal_alterno: true }, { status: 503 });
}

/** El formulario pide aquí su token de carga (firmado, con la hora del servidor). */
export async function GET() {
  return NextResponse.json({ token: firmarCarga() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  let body: Partial<ReclamoEntrada> & { sitio_web?: string; token_carga?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Campo trampa para bots: una persona nunca lo llena.
  if (body.sitio_web) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Tiempo mínimo entre la carga del formulario y el envío (antispam).
  const estadoToken = verificarCarga(body.token_carga);
  if (estadoToken === "muy_rapido") {
    return NextResponse.json({ error: "Espera unos segundos y vuelve a enviar." }, { status: 429 });
  }
  if (estadoToken !== "ok") {
    return NextResponse.json(
      { error: "El formulario caducó. Recarga la página e intenta de nuevo.", recargar: true },
      { status: 400 },
    );
  }

  const v = validarReclamo(body);
  if (!v.ok) {
    return NextResponse.json({ error: "Revisa los campos marcados.", errores: v.errores }, { status: 422 });
  }

  const ipHash = hashIp(ipDeEncabezados(req.headers));
  const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  type HojaCreada = { numero: number; anio: number; created_at: string };
  let data: HojaCreada | null = null;
  try {
    // Límite por IP y por correo, contado en la propia tabla (servidor).
    const [porIp, porCorreo] = await Promise.all([
      supabaseAdmin.from(TABLA).select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash).gte("created_at", haceUnaHora),
      supabaseAdmin.from(TABLA).select("id", { count: "exact", head: true })
        .eq("consumidor_email", v.fila.consumidor_email).gte("created_at", haceUnaHora),
    ]);
    const errConteo = porIp.error ?? porCorreo.error;
    if (errConteo) {
      console.error(
        esTablaInexistente(errConteo)
          ? "[reclamos] la tabla libro_reclamaciones no existe (ADR 0002 pendiente)"
          : `[reclamos] error al contar envíos: ${errConteo.code}`,
      );
      return canalAlterno();
    }
    if ((porIp.count ?? 0) >= LIMITE_POR_HORA || (porCorreo.count ?? 0) >= LIMITE_POR_HORA) {
      return NextResponse.json({ error: LIMITE_SUPERADO, canal_alterno: true }, { status: 429 });
    }

    const res = await supabaseAdmin
      .from(TABLA)
      .insert({ ...v.fila, ip_hash: ipHash })
      .select("numero, anio, created_at")
      .single();
    if (res.error) {
      console.error(
        esTablaInexistente(res.error)
          ? "[reclamos] la tabla libro_reclamaciones no existe (ADR 0002 pendiente)"
          : `[reclamos] error al insertar: ${res.error.code}`,
      );
      return canalAlterno();
    }
    data = res.data as HojaCreada;
  } catch (err) {
    console.error("[reclamos] sin conexión con la base:", err instanceof Error ? err.message : err);
    return canalAlterno();
  }

  if (!data) return canalAlterno();

  const codigo = codigoHoja(data.numero, data.anio);

  // Copia de la hoja al correo del consumidor (y aviso al admin). Si el correo
  // falla, la hoja ya quedó registrada: se informa en `copia_enviada`.
  let copiaEnviada = false;
  try {
    ({ copiaEnviada } = await sendReclamoRegistrado({
      ...v.fila,
      codigo,
      fecha: data.created_at,
      plazo_dias_habiles: PLAZO_RESPUESTA_DIAS_HABILES,
      proveedor: [
        DATOS_LEGALES.razonSocial ?? DATOS_LEGALES.nombreComercial,
        DATOS_LEGALES.ruc ? `RUC ${DATOS_LEGALES.ruc}` : null,
      ].filter(Boolean).join(" · "),
    }));
  } catch (err) {
    console.error("[reclamos] no se pudo enviar la copia:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json(
    { codigo, fecha: data.created_at, copia_enviada: copiaEnviada },
    { status: 201 },
  );
}
