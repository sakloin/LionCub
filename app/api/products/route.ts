import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import type { Product } from "../../lib/types";

const SIZE_ORDER: Record<string, number> = {
  "RN": 1, "0-3m": 2, "3-6m": 3, "6-9m": 4, "9-12m": 5, "Único": 6, "80 × 80 cm": 7,
};

export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, sku, name, tagline, description, category, price, cost,
      has_offer, image_url, active, gender, created_at,
      product_variants(stock, product_sizes(name, sort_order), product_colors(name))
    `)
    .eq("active", true)
    .order("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const products: Product[] = (data ?? []).map((p: any) => {
    const variants: any[] = p.product_variants ?? [];
    const withStock = variants.filter(v => (v.stock ?? 0) > 0);

    const sizes = [...new Set(
      withStock.map((v: any) => v.product_sizes?.name).filter(Boolean) as string[]
    )].sort((a, b) => (SIZE_ORDER[a] ?? 99) - (SIZE_ORDER[b] ?? 99));

    const colors = [...new Set(
      withStock.map((v: any) => v.product_colors?.name).filter(Boolean) as string[]
    )];

    return {
      id: p.id,
      sku: p.sku ?? p.id,
      name: p.name,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      category: p.category as Product["category"],
      price: Number(p.price),
      cost: Number(p.cost ?? 0),
      stock: variants.reduce((s: number, v: any) => s + (v.stock ?? 0), 0),
      sizes,
      colors,
      gender: p.gender ?? "Unisex",
      material: "100% Algodón Pima",
      has_offer: p.has_offer ?? false,
      image_url: p.image_url ?? `/products/${p.id}.jpeg`,
      active: p.active,
      created_at: p.created_at ?? "",
    };
  });

  return NextResponse.json(products);
}
