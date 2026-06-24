import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { sendWhatsApp } from "@/app/lib/whatsapp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  if (!token) return NextResponse.json({ error: "Falta token" }, { status: 401 });

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  if (!isAdminEmail(userData.user.email)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  let body: { order_id?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Payload inválido" }, { status: 400 }); }
  if (typeof body.order_id !== "string") return NextResponse.json({ error: "order_id requerido" }, { status: 400 });

  const { data: order, error: oErr } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, customer_phone, shipping_method, shalom_agency, order_status")
    .eq("id", body.order_id)
    .single();

  if (oErr || !order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const shortId = (order.id as string).slice(0, 8).toUpperCase();
  const isShalom = order.shipping_method === "shalom";
  const envioDetalle = isShalom
    ? `lo enviamos x Shalom${order.shalom_agency ? ` (agencia: ${order.shalom_agency})` : ""}`
    : "lo enviamos a tu domicilio hoy";

  const msg =
    `hola ${order.customer_name.split(" ")[0]} 👋 tu pedido *#${shortId}* ya fue enviado — ${envioDetalle}. ` +
    `cualquier consulta escríbenos acá mismo 🦁`;

  try {
    await sendWhatsApp(order.customer_phone as string, msg);

    await supabaseAdmin
      .from("orders")
      .update({ order_status: "enviado" })
      .eq("id", body.order_id);

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("[notify-shipped]", err?.message ?? err);
    return NextResponse.json({ sent: false, warning: "Error al enviar WhatsApp" }, { status: 200 });
  }
}
