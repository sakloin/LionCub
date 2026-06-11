import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { CartItem } from "../../lib/types";
import { toCents, fromCents } from "../../lib/money";

// Server-side authoritative shipping costs (in cents). Mirrors the values the
// public checkout uses, but the server owns the truth — never trust the
// shipping_cost the client sends.
const SHIPPING_CENTS: Record<string, number> = {
  domicilio: 1000,
  shalom: 1500,
};

interface VariantRow {
  id: string;
  product_id: string;
  stock: number;
  cost: number | null;
  price_override: number | null;
  active: boolean;
}
interface ProductRow {
  id: string;
  name: string;
  price: number;
  cost: number | null;
  active: boolean;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Discard any money fields the client tries to send; they are recomputed
  // below from the products + product_variants tables. The cart's variant
  // object is also ignored beyond `variant.id`.
  const {
    items,
    subtotal: _ignoredSubtotal,
    total: _ignoredTotal,
    shipping_cost: _ignoredShipping,
    ...orderData
  } = body as {
    items?: CartItem[];
    subtotal?: unknown;
    total?: unknown;
    shipping_cost?: unknown;
    [k: string]: unknown;
  };
  void _ignoredSubtotal;
  void _ignoredTotal;
  void _ignoredShipping;

  // ─── Basic input validation ────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
  }
  if (!orderData.customer_name || !orderData.customer_phone) {
    return NextResponse.json({ error: "Faltan datos del cliente" }, { status: 400 });
  }
  const shippingMethod = orderData.shipping_method as string | undefined;
  if (!shippingMethod || !(shippingMethod in SHIPPING_CENTS)) {
    return NextResponse.json({ error: "Método de envío inválido" }, { status: 400 });
  }
  for (const item of items) {
    if (!item?.variant?.id || typeof item.variant.id !== "string") {
      return NextResponse.json({ error: "Item sin variante" }, { status: 400 });
    }
    if (!item?.product?.id || typeof item.product.id !== "string") {
      return NextResponse.json({ error: "Item con product id inválido" }, { status: 400 });
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return NextResponse.json(
        { error: `Cantidad inválida para ${item.product.id}` },
        { status: 400 }
      );
    }
  }

  // ─── Fetch authoritative variant + product data (single round-trip) ───
  const variantIds = Array.from(new Set(items.map((i) => i.variant.id)));
  const { data: variantsRaw, error: vErr } = await supabaseAdmin
    .from("product_variants")
    .select("id, product_id, stock, cost, price_override, active")
    .in("id", variantIds);
  if (vErr) {
    return NextResponse.json({ error: "Error al validar variantes" }, { status: 500 });
  }
  const variantMap = new Map<string, VariantRow>();
  for (const v of (variantsRaw ?? []) as VariantRow[]) variantMap.set(v.id, v);

  const productIds = Array.from(new Set((variantsRaw ?? []).map((v) => (v as VariantRow).product_id)));
  const { data: productsRaw, error: pErr } = await supabaseAdmin
    .from("products")
    .select("id, name, price, cost, active")
    .in("id", productIds);
  if (pErr) {
    return NextResponse.json({ error: "Error al validar productos" }, { status: 500 });
  }
  const productMap = new Map<string, ProductRow>();
  for (const p of (productsRaw ?? []) as ProductRow[]) productMap.set(p.id, p);

  // ─── Validate each item against the DB ───────────────────────────────
  for (const item of items) {
    const v = variantMap.get(item.variant.id);
    if (!v) {
      return NextResponse.json(
        { error: `Variante no encontrada para ${item.product.id}` },
        { status: 400 }
      );
    }
    if (!v.active) {
      return NextResponse.json({ error: "Variante no disponible" }, { status: 409 });
    }
    const p = productMap.get(v.product_id);
    if (!p || p.active === false) {
      return NextResponse.json({ error: "Producto no disponible" }, { status: 409 });
    }
    if (v.stock < item.quantity) {
      return NextResponse.json(
        { error: `Sin stock suficiente para ${p.name}` },
        { status: 409 }
      );
    }
  }

  // ─── Recompute prices, subtotal, shipping, total in cents ────────────
  let subtotalCents = 0;
  const orderItemRows = items.map((item) => {
    const v = variantMap.get(item.variant.id)!;
    const p = productMap.get(v.product_id)!;
    const unitPrice = v.price_override ?? p.price;
    const unitCost  = v.cost ?? p.cost ?? 0;
    const unitPriceCents = toCents(unitPrice);
    const itemSubtotalCents = unitPriceCents * item.quantity;
    subtotalCents += itemSubtotalCents;
    return {
      product_id:     p.id,
      variant_id:     v.id,
      product_name:   p.name,
      product_sku:    p.id,
      selected_size:  item.selectedSize ?? item.variant.size_name ?? null,
      selected_color: item.selectedColor ?? item.variant.color_name ?? null,
      quantity:       item.quantity,
      unit_price:     unitPrice,
      unit_cost:      unitCost,
      subtotal:       fromCents(itemSubtotalCents),
    };
  });

  const shippingCents = SHIPPING_CENTS[shippingMethod];
  const totalCents = subtotalCents + shippingCents;

  // ─── Atomically reserve stock for every variant ──────────────────────
  // The pre-validation above catches stock=0 at the boundary; this reservation
  // closes the race window where a concurrent order took the last unit between
  // our check and our write. The SQL function returns NULL if the update would
  // drop the variant's stock below 0.
  //
  // If a reservation fails partway through, we roll back the previous ones by
  // calling the same RPC with a positive qty_change.
  const reserved: { id: string; qty: number }[] = [];

  async function releaseReserved() {
    for (const r of reserved) {
      const { error: rbErr } = await supabaseAdmin.rpc("adjust_variant_stock", {
        p_variant_id: r.id,
        p_qty_change: r.qty,
      });
      if (rbErr) {
        console.error("[/api/orders] stock rollback failed:", r.id, rbErr.message);
      }
    }
  }

  for (const item of items) {
    const { data: newStock, error: rpcErr } = await supabaseAdmin.rpc(
      "adjust_variant_stock",
      { p_variant_id: item.variant.id, p_qty_change: -item.quantity }
    );
    if (rpcErr || newStock === null || newStock === undefined) {
      await releaseReserved();
      return NextResponse.json(
        { error: `Sin stock suficiente para ${item.product.id}` },
        { status: 409 }
      );
    }
    reserved.push({ id: item.variant.id, qty: item.quantity });
  }

  // ─── Insert the order; roll back stock if it fails ────────────────────
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      ...orderData,
      subtotal:      fromCents(subtotalCents),
      total:         fromCents(totalCents),
      shipping_cost: fromCents(shippingCents),
      payment_status: "pendiente",
      order_status:   "nuevo",
    })
    .select()
    .single();

  if (error || !order) {
    await releaseReserved();
    return NextResponse.json(
      { error: error?.message ?? "Error creating order" },
      { status: 500 }
    );
  }

  // ─── Insert order_items; on failure, delete order + roll back stock ───
  const itemsWithOrderId = orderItemRows.map((r) => ({ ...r, order_id: order.id }));
  const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(itemsWithOrderId);
  if (itemsErr) {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    await releaseReserved();
    return NextResponse.json(
      { error: itemsErr.message ?? "Error al crear los items del pedido" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: order.id });
}
