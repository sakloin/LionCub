import { supabase } from "./supabase";
import type { Product, Offer } from "./types";

// Trae el catálogo en el SERVIDOR (SSR) para que los productos SIEMPRE estén
// en el HTML inicial. Tiene su propio try/catch: si Supabase falla, la página
// se renderiza igual (con catálogo vacío) en vez de romperse.
export async function getCatalog(): Promise<{ products: Product[]; offers: Offer[] }> {
  try {
    const [productsRes, offersRes] = await Promise.all([
      supabase
        .from("products")
        .select(
          `
          id, sku, name, tagline, description, category, price, cost,
          gender, material, has_offer, image_url, active, created_at,
          variants:product_variants(
            id, product_id, size_id, color_id, sku_variant, stock,
            cost, price_override, active,
            size:product_sizes(id, name, sort_order, active),
            color:product_colors(id, name, hex_code, active)
          ),
          images:product_images(
            id, product_id, url, storage_path, sort_order,
            is_primary, is_hover, alt_text, image_type, color_id
          )
          `
        )
        .eq("active", true)
        .order("created_at", { ascending: true }),
      supabase.from("offers").select("*").eq("active", true),
    ]);
    if (productsRes.error) console.error("[catalog] products:", productsRes.error.message);
    if (offersRes.error) console.error("[catalog] offers:", offersRes.error.message);
    return {
      products: productsRes.error ? [] : ((productsRes.data ?? []) as unknown as Product[]),
      offers: offersRes.error ? [] : ((offersRes.data ?? []) as Offer[]),
    };
  } catch (err) {
    console.error("[catalog] fetch del servidor falló:", err);
    return { products: [], offers: [] };
  }
}
