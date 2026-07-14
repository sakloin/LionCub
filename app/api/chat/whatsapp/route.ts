import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { processMessage, isBotPaused, setBotPaused, REACTIVATION_KEYWORD, claimDedup } from "../../../lib/chatbot";
import { sendWhatsApp, sendWhatsAppImage, fetchWhatsAppMedia } from "../../../lib/whatsapp";
import { transcribeAudio } from "../../../lib/transcribe";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

// Allow up to 55s for Claude + Supabase processing
export const maxDuration = 55;

// ── GET: Meta webhook verification ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// ── POST: Incoming messages ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const value = body?.entry?.[0]?.changes?.[0]?.value;

  // Echo de mensajes enviados por el dueño/agente desde la app de WhatsApp
  // (modo coexistencia): cualquier mensaje humano pausa el bot para ese cliente;
  // solo la palabra clave exacta @LionCub.pe lo reactiva
  const echo = value?.message_echoes?.[0];
  if (echo?.to) {
    const echoText: string = (echo.text?.body ?? "").trim();
    await setBotPaused(echo.to, echoText !== REACTIVATION_KEYWORD);
    return NextResponse.json({ ok: true });
  }

  // Extract message from Meta's payload structure
  const message = value?.messages?.[0];

  // Ignore status updates (delivered, read); only text and voice notes are processed
  if (!message) return NextResponse.json({ ok: true });

  const phone: string = message.from;       // e.g. "51920201943"
  const messageId: string = message.id;

  if (message.type === "text") {
    const text: string = message.text?.body ?? "";
    if (!text.trim()) return NextResponse.json({ ok: true });
    await processAndReply(phone, messageId, text, null);
  } else if (message.type === "audio" || message.type === "voice") {
    const audioId: string = message.audio?.id ?? message.voice?.id ?? "";
    if (!audioId) return NextResponse.json({ ok: true });
    await processAndReply(phone, messageId, "", audioId);
  }

  return NextResponse.json({ ok: true });
}

// ── Core processing ───────────────────────────────────────────────────────────
async function processAndReply(phone: string, messageId: string, text: string, audioId: string | null) {
  // Load existing session (resilient — bot works even if table doesn't exist)
  let session: any = null;
  try {
    const { data } = await supabaseAdmin
      .from("chat_sessions")
      .select("messages, last_message_id, updated_at")
      .eq("phone", phone)
      .single();
    session = data;
  } catch { /* table may not exist yet */ }

  // Deduplication: Meta can resend the same webhook on timeout
  if (session?.last_message_id === messageId) return;

  // Anti-duplicados atómico: Meta reenvía el webhook en reintentos, a veces casi
  // simultáneos mientras el primero aún procesa. claim_dedup (una sola sentencia
  // SQL) garantiza que un mismo mensaje se procese una única vez.
  if (!(await claimDedup(`wa:${messageId}`))) return;

  // Intervención humana: si un agente escribió en este chat, el bot queda en
  // silencio hasta que el agente lo reactive con la palabra clave
  if (await isBotPaused(phone)) return;

  // Nota de voz: descargar de Meta y transcribir con Whisper.
  // Va después de dedup/pausa para no transcribir en reintentos ni chats pausados.
  if (!text.trim() && audioId) {
    try {
      const media = await fetchWhatsAppMedia(audioId);
      text = await transcribeAudio(media.data, media.mimeType);
    } catch (err) {
      console.error("[chat/whatsapp] error transcribiendo audio:", err);
      text = "";
    }
    if (!text.trim()) {
      await sendWhatsApp(phone, "Ay, no pude escuchar bien tu audio. ¿Me lo escribes porfa?");
      return;
    }
  }

  // Reset history if session is older than 24h
  let history: MessageParam[] = [];
  if (session) {
    const ageMs = Date.now() - new Date(session.updated_at as string).getTime();
    if (ageMs < 24 * 60 * 60 * 1000) {
      history = (session.messages as MessageParam[]) ?? [];
    }
  }

  let reply: string;
  let silent = false;
  let images: string[] = [];
  let updatedHistory: MessageParam[];

  try {
    const result = await processMessage(history, text);
    reply = result.response;
    silent = result.silent;
    images = result.images ?? [];
    updatedHistory = result.updatedHistory;
  } catch (err) {
    console.error("[chat/whatsapp] error procesando mensaje:", err);
    reply = "Lo siento, tuve un problema técnico. Intenta de nuevo en un momentito porfa";
    updatedHistory = history;
  }

  // Persist session (resilient — bot still replies even if upsert fails)
  try {
    await supabaseAdmin.from("chat_sessions").upsert(
      {
        phone,
        messages: updatedHistory,
        last_message_id: messageId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone" }
    );
  } catch { /* table may not exist yet */ }

  // Regla de silencio: chats personales o sin intención comercial no reciben respuesta
  if (silent || !reply.trim()) return;

  await sendWhatsApp(phone, reply);

  for (const img of images.slice(0, 3)) {
    await sendWhatsAppImage(phone, img);
  }
}
