import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CULQI_ENABLED } from "@/app/lib/feature-flags";
import { fromCents } from "@/app/lib/money";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  if (!CULQI_ENABLED) {
    return NextResponse.json(
      { error: "Culqi no está habilitado todavía" },
      { status: 503 }
    );
  }

  const { token, orderId, amount, email } = await req.json();

  if (!token || !orderId || !amount || !email) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const secretKey = process.env.CULQI_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Culqi no configurado en el servidor" }, { status: 500 });
  }

  // Charge via Culqi API (amount must be in cents, integer)
  const culqiRes = await fetch("https://api.culqi.com/v2/charges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      amount: Number(amount), // integer cents sent by frontend via toCents()
      currency_code: "PEN",
      email,
      source_id: token,
      metadata: { order_id: orderId },
    }),
  });

  const culqiData = await culqiRes.json();

  if (!culqiRes.ok || culqiData.object === "error") {
    return NextResponse.json(
      { error: culqiData.user_message ?? "Error al procesar el pago" },
      { status: 400 }
    );
  }

  // Culqi returns amount in cents; convert for human-readable logging
  const chargedSoles = fromCents(culqiData.amount ?? Number(amount));
  console.log(`[culqi] charged ${chargedSoles} PEN for order ${orderId} — ref ${culqiData.id}`);

  // Mark order as paid
  const { error: dbError } = await supabase
    .from("orders")
    .update({
      payment_status: "pagado",
      payment_provider: "culqi",
      payment_reference: culqiData.id,
      payment_paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (dbError) {
    // Payment succeeded but DB update failed — log and still return success
    console.error("Culqi charge DB update failed:", dbError.message);
  }

  return NextResponse.json({ success: true, chargeId: culqiData.id });
}
