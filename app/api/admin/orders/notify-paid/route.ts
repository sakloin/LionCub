import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { sendPaymentConfirmed, type EmailOrder, type EmailOrderItem } from "@/app/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Admin clicked "marcar pagado" on /admin/pedidos. The status update has
 * already gone through (Supabase RLS gates it client-side); this route
 * fires the customer + admin payment-confirmed emails server-side so the
 * Resend key never leaves the server. Best-effort: a Resend error does
 * not break the admin's flow.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 401 });
  }
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  if (!isAdminEmail(userData.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: { order_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  if (typeof body.order_id !== "string" || body.order_id.length === 0) {
    return NextResponse.json({ error: "order_id requerido" }, { status: 400 });
  }
  const orderId = body.order_id;

  const { data: order, error: oErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (oErr || !order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  if (order.payment_status !== "pagado") {
    // Defensive: only send the confirmation when the order is actually paid.
    return NextResponse.json({ error: "El pedido no está marcado como pagado" }, { status: 409 });
  }

  const { data: itemsRaw } = await supabaseAdmin
    .from("order_items")
    .select("product_name, selected_size, selected_color, quantity, unit_price, subtotal")
    .eq("order_id", orderId);

  try {
    await sendPaymentConfirmed(order as EmailOrder, (itemsRaw ?? []) as EmailOrderItem[]);
  } catch (err: any) {
    console.error("[/api/admin/orders/notify-paid] email threw:", err?.message ?? err);
    return NextResponse.json({ sent: false, warning: "Email no enviado" }, { status: 200 });
  }
  return NextResponse.json({ sent: true });
}
