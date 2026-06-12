export const dynamic = "force-dynamic";

import { supabase } from "../../lib/supabase";
import data from "../../data/productos.json";
import CatalogoClient, { type CatalogProduct } from "./CatalogoClient";

async function getCatalog(): Promise<CatalogProduct[]> {
  const { data: rows, error } = await supabase
    .from("products")
    .select(`
      id, name, tagline, description, category, price, cost, has_offer, image_url, active,
      variants:product_variants(
        id, stock, active,
        size:product_sizes(id, name, sort_order),
        color:product_colors(id, name, hex_code)
      ),
      images:product_images(id, url, is_primary, is_hover, sort_order)
    `)
    .eq("active", true)
    .order("category")
    .order("name");

  if (error) {
    console.error("[admin/catalogo] load failed:", error.message);
    return [];
  }

  return (rows ?? []) as unknown as CatalogProduct[];
}

export default async function CatalogoPage() {
  const products = await getCatalog();
  const { brand } = data as { brand: { whatsapp: string; whatsappUrl: string; website: string; email: string } };
  return <CatalogoClient products={products} brand={brand} />;
}
