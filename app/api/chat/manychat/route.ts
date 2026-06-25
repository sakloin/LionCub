import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { processMessage } from "../../../lib/chatbot";
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
  const text: string = body.message ?? body.last_input_text ?? "";
  const name: string = body.name ?? "";

  if (!phone || !text.trim()) {
    return NextResponse.json({ response: "Datos incompletos." });
  }

  const history = await loadHistory(phone);

  let reply: string;
  let updatedHistory: MessageParam[];

  try {
    const result = await processMessage(history, text, name || undefined);
    reply = result.response;
    updatedHistory = result.updatedHistory;
  } catch (err) {
    console.error("[chat/manychat] error:", err);
    return NextResponse.json({
      response: "Lo siento, tuve un problema técnico. Por favor intenta de nuevo 🙏",
    });
  }

  await saveHistory(phone, updatedHistory);
  return NextResponse.json({ response: reply });
}
