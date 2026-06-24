/**
 * Meta WhatsApp Business Catalog sync endpoint.
 *
 * GET  — returns active products formatted as Meta Catalog items (for inspection).
 * POST — pushes all active products to the Meta Catalog via the Graph API.
 *
 * Required env vars:
 *   META_CATALOG_ID      — numeric catalog ID from Meta Business Manager
 *   WHATSAPP_TOKEN       — permanent system-user token with catalog_management permission
 *   CATALOG_SYNC_SECRET  — shared secret so n8n can call this without a user session
 *   NEXT_PUBLIC_SITE_URL — https://lioncub.pe (used as product link)
 *
 * Called by n8n on schedule; can also be triggered manually via POST.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { bestOfferFor, applyOfferCents } from "@/app/lib/offers";
import type { Offer } from "@/app/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-sync-secret, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const META_CATALOG_ID    = process.env.META_CATALOG_ID ?? "";
const META_ACCESS_TOKEN  = process.env.WHATSAPP_TOKEN ?? "";
const CATALOG_SYNC_SECRET = process.env.CATALOG_SYNC_SECRET ?? "";
const PUBLIC_SITE        = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lioncub.pe";
const GRAPH_URL          = "https://graph.facebook.com/v20.0";
const BATCH_SIZE         = 100; // Meta allows up to 1000; 100 is safe

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new";
  price: number;   // integer, in smallest currency unit (céntimos de Sol)
  currency: "PEN";
  link: string;
  image_link: string;
  brand: "Lion Cub";
  google_product_category: string;
}

async function buildCatalogItems(): Promise<CatalogItem[]> {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select(`
      id, name, category, price, description, image_url,
      product_variants(id, stock, price_override, active)
    `)
    .eq("active", true)
    .order("category");

  if (error || !products) return [];

  const { data: offersRaw } = await supabaseAdmin.from("offers").select("*").eq("active", true);
  const offers = (offersRaw ?? []) as Offer[];

  const items: CatalogItem[] = [];

  for (const p of products as any[]) {
    const activeVariants = (p.product_variants ?? []).filter(
      (v: any) => v.active && (v.stock ?? 0) > 0
    );

    const totalStock = activeVariants.reduce((s: number, v: any) => s + (v.stock ?? 0), 0);

    // Use the lowest priced active variant (already with offer applied) as the catalog price
    let priceCents = Math.round(p.price * 100);
    if (activeVariants.length > 0) {
      const offer = bestOfferFor({ id: p.id, category: p.category }, offers);
      const baseCents = activeVariants.reduce((min: number, v: any) => {
        const c = Math.round((v.price_override ?? p.price) * 100);
        return c < min ? c : min;
      }, Infinity);
      priceCents = applyOfferCents(baseCents, offer);
    }

    const rawImg = p.image_url ?? "";
    const imageLink = rawImg.startsWith("http")
      ? rawImg
      : rawImg.startsWith("/")
        ? `${PUBLIC_SITE}${rawImg}`
        : `${PUBLIC_SITE}/og-image.jpg`;

    items.push({
      id: p.id,
      name: p.name,
      description: p.description?.trim() || `Ropa de bebé 100% Algodón Pima — ${p.category}`,
      availability: totalStock > 0 ? "in stock" : "out of stock",
      condition: "new",
      price: priceCents,
      currency: "PEN",
      link: `${PUBLIC_SITE}/productos/${p.id}`,
      image_link: imageLink,
      brand: "Lion Cub",
      google_product_category: "Apparel & Accessories > Clothing > Baby & Toddler Clothing",
    });
  }

  return items;
}

export async function GET() {
  const items = await buildCatalogItems();
  return NextResponse.json({ count: items.length, items }, { headers: CORS });
}

export async function POST(req: NextRequest) {
  // Auth: shared secret from n8n, or admin Bearer token
  const authHeader = req.headers.get("authorization") ?? "";
  const syncSecret = req.headers.get("x-sync-secret") ?? "";

  const isValidSecret = CATALOG_SYNC_SECRET && syncSecret === CATALOG_SYNC_SECRET;
  const isAdminBearer  = authHeader.startsWith("Bearer ") && !!META_ACCESS_TOKEN;

  if (!isValidSecret && !isAdminBearer) {
    // If neither secret matches, validate as admin user
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length).trim();
      const { data: userData, error: authErr } = await supabaseAdmin.auth.getUser(token);
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      if (authErr || !adminEmails.includes((userData?.user?.email ?? "").toLowerCase())) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: CORS });
      }
    } else {
      return NextResponse.json({ error: "Falta autenticación" }, { status: 401, headers: CORS });
    }
  }

  if (!META_CATALOG_ID) {
    return NextResponse.json({ error: "META_CATALOG_ID no configurado" }, { status: 500, headers: CORS });
  }
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: "WHATSAPP_TOKEN no configurado" }, { status: 500, headers: CORS });
  }

  const items = await buildCatalogItems();
  if (items.length === 0) {
    return NextResponse.json({ synced: 0, message: "Sin productos activos" }, { headers: CORS });
  }

  let totalSynced = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const requests = batch.map(item => ({
      method: "UPDATE",
      retailer_id: item.id,
      data: item,
    }));

    try {
      const res = await fetch(`${GRAPH_URL}/${META_CATALOG_ID}/items_batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests }),
      });

      if (!res.ok) {
        const errText = await res.text();
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${errText}`);
      } else {
        totalSynced += batch.length;
      }
    } catch (e: any) {
      errors.push(e?.message ?? "Error desconocido");
    }
  }

  return NextResponse.json({
    synced: totalSynced,
    total: items.length,
    ...(errors.length > 0 ? { errors } : {}),
  }, { headers: CORS });
}
