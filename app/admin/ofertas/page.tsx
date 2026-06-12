export const dynamic = "force-dynamic";

import { supabase } from "../../lib/supabase";
import OfertasClient, { type OfertaProduct } from "./OfertasClient";
import type { Offer } from "../../lib/types";

async function load(): Promise<{ offers: Offer[]; products: OfertaProduct[] }> {
  const [oRes, pRes] = await Promise.all([
    supabase.from("offers").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, category, price, active").order("name"),
  ]);
  if (oRes.error) console.error("[admin/ofertas] offers load failed:", oRes.error.message);
  if (pRes.error) console.error("[admin/ofertas] products load failed:", pRes.error.message);
  return {
    offers: (oRes.data ?? []) as Offer[],
    products: (pRes.data ?? []) as OfertaProduct[],
  };
}

export default async function OfertasPage() {
  const { offers, products } = await load();
  return <OfertasClient initialOffers={offers} products={products} />;
}
