import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Signature verification is mandatory — refuse to process if the secret is
  // not configured server-side. Previously this branch was a soft `if`, which
  // meant a missing CULQI_WEBHOOK_SECRET would silently accept unsigned events
  // and let anyone mark orders as paid.
  const webhookSecret = process.env.CULQI_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook no configurado en el servidor" },
      { status: 503 }
    );
  }

  const signature = req.headers.get("v-signature") ?? "";
  const expected = createHmac("sha256", webhookSecret).update(body).digest("hex");

  // Constant-time comparison; reject on length mismatch or any decode failure.
  let signatureOk = false;
  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    signatureOk = sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
  } catch {
    signatureOk = false;
  }
  if (!signatureOk) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
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
