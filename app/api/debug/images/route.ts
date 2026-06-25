import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Diagnostic endpoint: returns product image URLs as seen by the chatbot.
// Protected by a simple secret so it's not publicly accessible.
// Usage: GET /api/debug/images?secret=CATALOG_SYNC_SECRET&ids=LC-027,LC-028
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") ?? "";
  const ids = searchParams.get("ids")?.split(",").map(s => s.trim()).filter(Boolean) ?? [];

  if (!process.env.CATALOG_SYNC_SECRET || secret !== process.env.CATALOG_SYNC_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let query = supabaseAdmin
    .from("products")
    .select("id, name, image_url, product_images(url, is_primary, sort_order)")
    .eq("active", true);

  if (ids.length > 0) {
    query = (query as any).in("id", ids);
  } else {
    query = (query as any).order("id");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((p: any) => {
    const gallery: any[] = p.product_images ?? [];
    const sorted = gallery.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const galleryPrimary = gallery.find((i: any) => i.is_primary)?.url ?? sorted[0]?.url ?? "";
    const rawImg = galleryPrimary || p.image_url || "";
    const isProductPage = /^(https?:\/\/[^/]*)?\/products\/[^/]+\/?$/.test(rawImg) && !/\.(jpe?g|png|webp|gif|avif)$/i.test(rawImg);
    const resolvedUrl = isProductPage
      ? ""
      : rawImg.startsWith("http")
        ? rawImg
        : rawImg.startsWith("/")
          ? `https://lioncub.pe${rawImg}`
          : "";

    return {
      id: p.id,
      name: p.name,
      products_image_url: p.image_url || "(vacío)",
      gallery_images: gallery.length,
      gallery_primary: gallery.find((i: any) => i.is_primary)?.url || "(ninguna)",
      resolved_url: resolvedUrl || "(sin imagen)",
      will_send_image: !!resolvedUrl,
    };
  });

  return NextResponse.json({ count: result.length, products: result });
}
