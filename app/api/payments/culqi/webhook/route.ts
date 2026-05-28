import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Validate signature when secret is configured
  const webhookSecret = process.env.CULQI_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get("v-signature") ?? "";
    const expected = createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // Only handle successful charge events
  if (event.type === "charge.paid") {
    const data = event.data as Record<string, unknown>;
    const metadata = (data?.metadata ?? {}) as Record<string, string>;
    const orderId = metadata.order_id;
    const chargeId = data?.id as string | undefined;

    if (orderId) {
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "pagado",
          payment_provider: "culqi",
          payment_reference: chargeId ?? null,
          payment_paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }
  }

  // Always respond 200 so Culqi stops retrying
  return NextResponse.json({ received: true });
}
