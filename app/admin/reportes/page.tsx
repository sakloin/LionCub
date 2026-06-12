export const dynamic = "force-dynamic";

import { supabase } from "../../lib/supabase";
import ReportesClient from "./ReportesClient";

async function getData() {
  try {
    const [ordersRes, itemsRes, purchasesRes, productsRes, colorsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("order_items").select("*"),
      supabase.from("purchases").select("*").order("purchased_at", { ascending: false }),
      // Fase 6: pull products + variant stock so we can compute category
      // from the source of truth (not from product id ranges) and report
      // stock turnover per variant.
      supabase
        .from("products")
        .select("id, name, category, price, cost, variants:product_variants(id, size_id, color_id, stock, cost, price_override, active, size:product_sizes(name, sort_order), color:product_colors(name, hex_code))"),
      supabase.from("product_colors").select("name, hex_code"),
    ]);
    return {
      orders:    ordersRes.data    ?? [],
      items:     itemsRes.data     ?? [],
      purchases: purchasesRes.data ?? [],
      products:  productsRes.data  ?? [],
      colors:    colorsRes.data    ?? [],
    };
  } catch {
    return { orders: [], items: [], purchases: [], products: [], colors: [] };
  }
}

export default async function ReportesAdmin() {
  const data = await getData();
  return <ReportesClient data={data as any} />;
}
