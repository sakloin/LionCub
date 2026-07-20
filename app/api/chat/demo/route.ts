import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "../../../lib/chatbot";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

// Endpoint de DEMO para probar el agente desde una página web, sin WhatsApp ni
// persistencia: el historial lo mantiene el navegador y se envía en cada turno.
// No escribe en chat_sessions ni depende de Meta — solo Claude + productos.
export const maxDuration = 55;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const history: MessageParam[] = Array.isArray(body.history) ? body.history : [];
  const message: string = (body.message ?? "").toString();
  const name: string = typeof body.name === "string" ? body.name : "";

  if (!message.trim()) {
    return NextResponse.json({ error: "mensaje vacío" }, { status: 400 });
  }

  try {
    const result = await processMessage(history.slice(-20), message, name || undefined);
    return NextResponse.json({
      response: result.response,
      images: result.images ?? [],
      silent: result.silent,
      history: result.updatedHistory,
    });
  } catch (err) {
    console.error("[chat/demo] error:", err);
    return NextResponse.json({ error: "Error procesando el mensaje" }, { status: 500 });
  }
}
