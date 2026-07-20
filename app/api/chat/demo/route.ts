import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "../../../lib/chatbot";
import { transcribeAudio } from "../../../lib/transcribe";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

// Endpoint de DEMO para probar el agente desde una página web, sin WhatsApp ni
// persistencia: el historial lo mantiene el navegador y se envía en cada turno.
// Acepta texto (JSON) o una nota de voz (multipart) que transcribe con Whisper.
export const maxDuration = 55;

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  let history: MessageParam[] = [];
  let message = "";
  let name = "";
  let transcript = "";

  try {
    if (contentType.includes("multipart/form-data")) {
      // Nota de voz: viene el audio + el historial serializado
      const form = await req.formData();
      const audio = form.get("audio");
      const rawHistory = form.get("history");
      name = (form.get("name") as string) ?? "";
      if (rawHistory) {
        try { history = JSON.parse(rawHistory as string); } catch { history = []; }
      }
      if (audio && audio instanceof Blob) {
        const bytes = new Uint8Array(await audio.arrayBuffer());
        const mime = audio.type || "audio/webm";
        try {
          message = await transcribeAudio(bytes, mime);
          transcript = message;
        } catch (err) {
          console.error("[chat/demo] error transcribiendo:", err);
          return NextResponse.json({ error: "No pude transcribir el audio" }, { status: 200 });
        }
      }
    } else {
      const body = await req.json();
      history = Array.isArray(body.history) ? body.history : [];
      message = (body.message ?? "").toString();
      name = typeof body.name === "string" ? body.name : "";
    }
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (!message.trim()) {
    return NextResponse.json({ error: "mensaje vacío", transcript }, { status: 200 });
  }

  try {
    const result = await processMessage(history.slice(-20), message, name || undefined);
    return NextResponse.json({
      response: result.response,
      messages: result.messages ?? [],
      images: result.images ?? [],
      silent: result.silent,
      history: result.updatedHistory,
      transcript, // texto reconocido del audio, para mostrarlo como el mensaje del usuario
    });
  } catch (err) {
    console.error("[chat/demo] error:", err);
    return NextResponse.json({ error: "Error procesando el mensaje" }, { status: 500 });
  }
}
