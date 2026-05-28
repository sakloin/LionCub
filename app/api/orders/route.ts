import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { CartItem } from "../../lib/types";
import { fromCents } from "../../lib/money";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { items, subtotal, total, shipping_cost, ...orderData } = body;

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({ ...orderData, subtotal, total, shipping_cost, payment_status: "pendiente", order_status: "nuevo" })
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json({ error: error?.message ?? "Error creating order" }, { status: 500 });
  }

  const orderItems = (items as CartItem[]).map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    product_sku: item.product.id,
    selected_size: item.selectedSize,
    selected_color: item.selectedColor,
    quantity: item.quantity,
    unit_price: item.product.price,
    unit_cost: item.product.cost ?? 0,
    subtotal: fromCents(Math.round(item.product.price * 100) * item.quantity),
  }));

  await supabaseAdmin.from("order_items").insert(orderItems);

  // Decrement stock
  for (const item of items as CartItem[]) {
    const { data: prod } = await supabaseAdmin.from("products").select("stock").eq("id", item.product.id).single();
    if (prod) await supabaseAdmin.from("products").update({ stock: Math.max(0, prod.stock - item.quantity) }).eq("id", item.product.id);
  }

  return NextResponse.json({ id: order.id });
}
