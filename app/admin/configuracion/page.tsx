export const dynamic = "force-dynamic";

import { supabase } from "../../lib/supabase";
import ConfigClient, { type ConfigBundle } from "./ConfigClient";

async function load(): Promise<ConfigBundle> {
  const [catRes, sizeRes, colorRes, productRes, variantRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("product_sizes").select("id, name, sort_order, active").order("sort_order"),
    supabase.from("product_colors").select("id, name, hex_code, active").order("name"),
    supabase.from("products").select("id, category"),
    supabase.from("product_variants").select("size_id, color_id"),
  ]);

  if (catRes.error)     console.error("[admin/configuracion] categories load failed:", catRes.error.message);
  if (sizeRes.error)    console.error("[admin/configuracion] sizes load failed:",      sizeRes.error.message);
  if (colorRes.error)   console.error("[admin/configuracion] colors load failed:",     colorRes.error.message);
  if (productRes.error) console.error("[admin/configuracion] products load failed:",   productRes.error.message);
  if (variantRes.error) console.error("[admin/configuracion] variants load failed:",   variantRes.error.message);

  // Reference counts so we know which rows are safe to delete.
  const catRefs   = new Map<string, number>();
  const sizeRefs  = new Map<string, number>();
  const colorRefs = new Map<string, number>();
  for (const p of (productRes.data ?? []) as { category: string }[]) {
    catRefs.set(p.category, (catRefs.get(p.category) ?? 0) + 1);
  }
  for (const v of (variantRes.data ?? []) as { size_id: string; color_id: string }[]) {
    sizeRefs.set(v.size_id, (sizeRefs.get(v.size_id) ?? 0) + 1);
    colorRefs.set(v.color_id, (colorRefs.get(v.color_id) ?? 0) + 1);
  }

  return {
    categories: (catRes.data ?? []) as ConfigBundle["categories"],
    sizes:      (sizeRes.data ?? []) as ConfigBundle["sizes"],
    colors:     (colorRes.data ?? []) as ConfigBundle["colors"],
    refs: {
      categories: Object.fromEntries(catRefs),
      sizes:      Object.fromEntries(sizeRefs),
      colors:     Object.fromEntries(colorRefs),
    },
  };
}

export default async function ConfiguracionPage() {
  const bundle = await load();
  return <ConfigClient initial={bundle} />;
}
