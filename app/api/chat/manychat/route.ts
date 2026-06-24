import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { processMessage } from "../../../lib/chatbot";
import type { MessageParam } from "@anthropic-ai/sdk/resources";

export const maxDuration = 55;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ response: "Error al procesar el mensaje." });
  }

  const phone: string = body.phone ?? body.subscriber_phone ?? "";
  const text: string = body.message ?? body.last_input_text ?? "";

  if (!phone || !text.trim()) {
    return NextResponse.json({ response: "Datos incompletos." });
  }

  // Load session
  const { data: session } = await supabaseAdmin
    .from("chat_sessions")
    .select("messages, updated_at")
    .eq("phone", phone)
    .single();

  let history: MessageParam[] = [];
  if (session) {
    const ageMs = Date.now() - new Date(session.updated_at as string).getTime();
    if (ageMs < 24 * 60 * 60 * 1000) {
      history = (session.messages as MessageParam[]) ?? [];
    }
  }

  let reply: string;
  let updatedHistory: MessageParam[];

  try {
    const result = await processMessage(history, text);
    reply = result.response;
    updatedHistory = result.updatedHistory;
  } catch (err) {
    console.error("[chat/manychat] error:", err);
    return NextResponse.json({
      response: "Lo siento, tuve un problema técnico. Por favor intenta de nuevo 🙏",
    });
  }

  await supabaseAdmin.from("chat_sessions").upsert(
    {
      phone,
      messages: updatedHistory,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "phone" }
  );

  return NextResponse.json({ response: reply });
}
