import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { toCents, fromCents } from "../../lib/money";

// Defined coupons — extend here when new promotions are needed.
const COUPONS: Record<string, { discountPct: number; firstPurchaseOnly: boolean }> = {
  LION10: { discountPct: 10, firstPurchaseOnly: true },
};

export async function POST(req: NextRequest) {
  const { code, subtotal, customer_phone, customer_email } = await req.json() as {
    code?: string;
    subtotal?: number;
    customer_phone?: string;
    customer_email?: string;
  };

  const normalized = (code ?? "").trim().toUpperCase();
  const coupon = COUPONS[normalized];
  if (!coupon) {
    return NextResponse.json({ error: "Código de descuento inválido." }, { status: 400 });
  }

  if (typeof subtotal !== "number" || subtotal <= 0) {
    return NextResponse.json({ error: "Subtotal inválido." }, { status: 400 });
  }

  if (coupon.firstPurchaseOnly) {
    if (!customer_phone) {
      return NextResponse.json({ error: "Ingresa tu teléfono antes de aplicar el cupón." }, { status: 400 });
    }

    // Check for any existing non-failed, non-cancelled order by phone or email
    const orParts: string[] = [`customer_phone.eq.${customer_phone}`];
    const trimmedEmail = (customer_email ?? "").trim();
    if (trimmedEmail) orParts.push(`customer_email.eq.${trimmedEmail}`);

    const { data: existing, error: dbErr } = await supabaseAdmin
      .from("orders")
      .select("id")
      .or(orParts.join(","))
      .not("order_status", "eq", "cancelado")
      .not("payment_status", "eq", "fallido")
      .limit(1);

    if (dbErr) {
      console.error("[apply-coupon] db error:", dbErr.message);
      return NextResponse.json({ error: "No se pudo validar el cupón. Intenta de nuevo." }, { status: 500 });
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Este cupón es solo para el primer pedido." }, { status: 409 });
    }
  }

  const subtotalCents  = toCents(subtotal);
  const discountCents  = Math.round(subtotalCents * coupon.discountPct / 100);
  const discountAmount = fromCents(discountCents);

  return NextResponse.json({
    code:            normalized,
    discountPct:     coupon.discountPct,
    discountAmount,
  });
}
