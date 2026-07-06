import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { processMessage, isBotPaused } from "../../../lib/chatbot";
import { transcribeAudio } from "../../../lib/transcribe";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

export const maxDuration = 55;

async function loadHistory(phone: string): Promise<MessageParam[]> {
  try {
    const { data: session, error } = await supabaseAdmin
      .from("chat_sessions")
      .select("messages, updated_at")
      .eq("phone", phone)
      .single();
    if (error || !session) return [];
    const ageMs = Date.now() - new Date(session.updated_at as string).getTime();
    if (ageMs >= 24 * 60 * 60 * 1000) return [];
    return (session.messages as MessageParam[]) ?? [];
  } catch {
    return [];
  }
}

async function saveHistory(phone: string, messages: MessageParam[]) {
  try {
    await supabaseAdmin.from("chat_sessions").upsert(
      { phone, messages, updated_at: new Date().toISOString() },
      { onConflict: "phone" }
    );
  } catch {
    // Table may not exist yet — bot still works, just no memory
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ response: "Error al procesar el mensaje." });
  }

  const phone: string = body.phone ?? body.subscriber_phone ?? "";
  let text: string = body.message ?? body.last_input_text ?? "";
  const name: string = body.name ?? "";
  // Nota de voz reenviada por ManyChat: en el flow, mapear la URL del attachment
  // de audio a un campo "audio_url" del body que envía a este webhook.
  const audioUrl: string = body.audio_url ?? "";

  if (!phone || (!text.trim() && !audioUrl.startsWith("http"))) {
    return NextResponse.json({ response: "Datos incompletos." });
  }

  // Intervención humana: si un agente escribió en este chat, el bot queda en
  // silencio hasta que lo reactiven con la palabra clave @LionCub.pe
  if (await isBotPaused(phone)) {
    return NextResponse.json({ response: "" });
  }

  if (!text.trim() && audioUrl.startsWith("http")) {
    try {
      const audioRes = await fetch(audioUrl);
      if (!audioRes.ok) throw new Error(`audio download ${audioRes.status}`);
      const mime = audioRes.headers.get("content-type") ?? "audio/ogg";
      text = await transcribeAudio(new Uint8Array(await audioRes.arrayBuffer()), mime);
    } catch (err) {
      console.error("[chat/manychat] error transcribiendo audio:", err);
      text = "";
    }
    if (!text.trim()) {
      return NextResponse.json({ response: "Ay, no pude escuchar bien tu audio. ¿Me lo escribes porfa?" });
    }
  }

  const history = await loadHistory(phone);

  // Don't respond to same message twice in a row — feels more human, avoids spam loops
  const lastUserMsg = [...history].reverse().find(m => m.role === "user");
  const lastUserText = typeof lastUserMsg?.content === "string" ? lastUserMsg.content : "";
  if (lastUserText.trim() && lastUserText.trim().toLowerCase() === text.trim().toLowerCase()) {
    return NextResponse.json({ response: "", image_url: "" });
  }

  let reply: string;
  let images: string[] = [];
  let updatedHistory: MessageParam[];

  try {
    const result = await processMessage(history, text, name || undefined);
    reply = result.response;
    images = result.images ?? [];
    updatedHistory = result.updatedHistory;
  } catch (err) {
    console.error("[chat/manychat] error:", err);
    const busyReply = "andamos a full en este momento, dame unos minutitos y te respondo";
    await saveHistory(phone, [
      ...history,
      { role: "user" as const, content: text },
      { role: "assistant" as const, content: busyReply },
    ].slice(-30));
    return NextResponse.json({ response: busyReply });
  }

  await saveHistory(phone, updatedHistory);

  // Return image_url (first image) and image_url_2/3 for ManyChat custom field mapping
  const imageFields: Record<string, string> = {};
  images.slice(0, 3).forEach((url, i) => {
    imageFields[i === 0 ? "image_url" : `image_url_${i + 1}`] = url;
  });

  return NextResponse.json({ response: reply, ...imageFields });
}
