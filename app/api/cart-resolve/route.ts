/**
 * POST /api/cart-resolve
 *
 * Traduce ítems del carrito del diseño autónomo (lion-cub-body + lc-app.js)
 * al formato CartItem que usa el checkout real.
 *
 * Body: [{name: string, size: string, qty: number}]
 * Response: {items: CartItem[]}
 *
 * Busca en Supabase por nombre de producto y talla. Si no hay stock disponible
 * para esa talla, toma el primer variant activo con stock (fallback).
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

interface CartResolveInput {
  name: string;
  size: string;
  qty: number;
}

// Mapeo tallas del diseño → nombre en Supabase (en orden de preferencia)
const SIZE_MAP: Record<string, string[]> = {
  "0–3 meses": ["0-3m", "RN"],
  "4–6 meses": ["3-6m"],
  "7–9 meses": ["6-9m"],
  "1–2 años":  ["9-12m", "Único"],
};

export async function POST(req: NextRequest) {
  const body: CartResolveInput[] = await req.json();

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const names = [...new Set(body.map((i) => i.name))];

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id, sku, name, price, image_url, tagline, description, category,
      gender, has_offer, active, created_at,
      product_variants(
        id, stock, price_override, active,
        size:product_sizes(name, sort_order),
        color:product_colors(name)
      )
    `)
    .eq("active", true)
    .in("name", names);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const productMap = new Map(
    (products ?? []).map((p: any) => [p.name as string, p])
  );

  const items: any[] = [];

  for (const item of body) {
    const p = productMap.get(item.name);
    if (!p) continue;

    const sizeCandidates = SIZE_MAP[item.size] ?? [];
    const variants: any[] = p.product_variants ?? [];

    let variant: any = null;

    // Intentar con cada nombre de talla candidato
    for (const sizeName of sizeCandidates) {
      variant = variants.find(
        (v: any) => v.active && (v.stock ?? 0) > 0 && v.size?.name === sizeName
      );
      if (variant) break;
    }

    // Fallback: primer variant activo con stock (cualquier talla)
    if (!variant) {
      variant = variants.find((v: any) => v.active && (v.stock ?? 0) > 0);
    }
    if (!variant) continue;

    const sizeName  = variant.size?.name  ?? item.size;
    const colorName = variant.color?.name ?? "";
    const unitPrice = Number(variant.price_override ?? p.price);

    items.push({
      product: {
        id:          p.id,
        sku:         p.sku ?? p.id,
        name:        p.name,
        tagline:     p.tagline     ?? "",
        description: p.description ?? "",
        category:    p.category,
        price:       Number(p.price),
        cost:        0,
        gender:      p.gender      ?? "Unisex",
        material:    "100% Algodón Pima",
        has_offer:   p.has_offer   ?? false,
        image_url:   p.image_url   ?? "",
        active:      p.active,
        created_at:  p.created_at  ?? "",
      },
      variant: {
        id:               variant.id,
        size_name:        sizeName,
        color_name:       colorName,
        stock_at_pick:    variant.stock ?? 0,
        unit_price_at_pick: unitPrice,
      },
      quantity:      item.qty,
      selectedSize:  sizeName,
      selectedColor: colorName,
    });
  }

  return NextResponse.json({ items });
}
