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
const _siteEnv = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const PUBLIC_SITE = (_siteEnv && !_siteEnv.includes("vercel.app")) ? _siteEnv : "https://lioncub.pe";
const GRAPH_URL          = "https://graph.facebook.com/v20.0";
const BATCH_SIZE         = 100; // Meta allows up to 1000; 100 is safe

// Known catalog IDs from the Leon Real Estate Commerce Manager portfolio.
// Tried in order when the configured catalog rejects with a permission error.
const CATALOG_FALLBACKS = ["904062502719225"];

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

/** Try each catalog ID until one accepts a single-item test write. Returns the working ID or null. */
async function discoverAccessibleCatalog(testRequests: object[]): Promise<string | null> {
  // Step 1: get businesses the token can see
  const bizRes = await fetch(
    `${GRAPH_URL}/me/businesses?fields=id,name&access_token=${META_ACCESS_TOKEN}`
  );
  if (!bizRes.ok) return null;
  const bizData = await bizRes.json();
  const businesses: { id: string; name: string }[] = bizData.data ?? [];

  for (const biz of businesses) {
    // Step 2: list catalogs owned by this business
    const catRes = await fetch(
      `${GRAPH_URL}/${biz.id}/owned_product_catalogs?fields=id,name&access_token=${META_ACCESS_TOKEN}`
    );
    if (!catRes.ok) continue;
    const catData = await catRes.json();
    const catalogs: { id: string; name: string }[] = catData.data ?? [];

    for (const cat of catalogs) {
      // Step 3: test write permission with first item only
      const probe = await fetch(`${GRAPH_URL}/${cat.id}/items_batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_type: "PRODUCT_ITEM", requests: testRequests.slice(0, 1) }),
      });
      if (probe.ok) return cat.id;
    }
  }
  return null;
}

async function syncToCatalog(
  catalogId: string,
  items: CatalogItem[]
): Promise<{ synced: number; errors: string[] }> {
  let totalSynced = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const requests = batch.map(({ id, ...itemData }) => ({
      method: "UPDATE",
      retailer_id: id,
      data: itemData,
    }));

    try {
      const res = await fetch(`${GRAPH_URL}/${catalogId}/items_batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_type: "PRODUCT_ITEM", requests }),
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
  return { synced: totalSynced, errors };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // ?action=discover — list catalogs accessible to our token (for diagnostics)
  if (searchParams.get("action") === "discover") {
    if (!META_ACCESS_TOKEN) {
      return NextResponse.json({ error: "WHATSAPP_TOKEN no configurado" }, { status: 500, headers: CORS });
    }
    const bizRes = await fetch(
      `${GRAPH_URL}/me/businesses?fields=id,name&access_token=${META_ACCESS_TOKEN}`
    );
    if (!bizRes.ok) {
      const t = await bizRes.text();
      return NextResponse.json({ error: t }, { status: 502, headers: CORS });
    }
    const bizData = await bizRes.json();
    const businesses: { id: string; name: string }[] = bizData.data ?? [];

    const result: { business: string; businessId: string; catalogs: { id: string; name: string }[] }[] = [];
    for (const biz of businesses) {
      const catRes = await fetch(
        `${GRAPH_URL}/${biz.id}/owned_product_catalogs?fields=id,name&access_token=${META_ACCESS_TOKEN}`
      );
      const catData = catRes.ok ? await catRes.json() : { data: [] };
      result.push({ business: biz.name, businessId: biz.id, catalogs: catData.data ?? [] });
    }
    return NextResponse.json({ configuredCatalogId: META_CATALOG_ID, businesses: result }, { headers: CORS });
  }

  // ?format=feed — Meta-compatible TSV product feed (no API key needed; Meta pulls this URL)
  if (searchParams.get("format") === "feed") {
    const items = await buildCatalogItems();
    const cols = ["id","title","description","availability","condition","price","link","image_link","brand","google_product_category"];
    const rows = items.map(item => [
      item.id,
      item.name,
      item.description.replace(/\t|\n|\r/g, " "),
      item.availability,
      item.condition,
      // Meta feed price format: "19.00 PEN"
      `${(item.price / 100).toFixed(2)} ${item.currency}`,
      item.link,
      item.image_link,
      item.brand,
      item.google_product_category,
    ].map(v => String(v ?? "")).join("\t"));
    const tsv = [cols.join("\t"), ...rows].join("\n");
    return new Response(tsv, {
      headers: {
        ...CORS,
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

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

  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ error: "WHATSAPP_TOKEN no configurado" }, { status: 500, headers: CORS });
  }

  const items = await buildCatalogItems();
  if (items.length === 0) {
    return NextResponse.json({ synced: 0, message: "Sin productos activos" }, { headers: CORS });
  }

  // Build test requests once (reused for discovery probe)
  const allRequests = items.map(({ id, ...itemData }) => ({
    method: "UPDATE",
    retailer_id: id,
    data: itemData,
  }));

  let catalogId = META_CATALOG_ID;

  // If no catalog configured, or primary fails, auto-discover
  if (!catalogId) {
    const discovered = await discoverAccessibleCatalog(allRequests);
    if (!discovered) {
      return NextResponse.json(
        { error: "META_CATALOG_ID no configurado y no se encontró catálogo accesible automáticamente" },
        { status: 500, headers: CORS }
      );
    }
    catalogId = discovered;
  }

  let { synced, errors } = await syncToCatalog(catalogId, items);

  const isPermissionError = (errs: string[]) =>
    errs.length > 0 && errs.every(e =>
      e.includes("does not exist") || e.includes("missing permissions") ||
      e.includes("#100") || e.includes("error_subcode\":33")
    );

  let usedFallback: string | null = null;

  // 1. Try known fallback catalog IDs before the slow generic discovery
  if (isPermissionError(errors)) {
    for (const fallbackId of CATALOG_FALLBACKS) {
      if (fallbackId === catalogId) continue;
      const result = await syncToCatalog(fallbackId, items);
      if (result.synced > 0 || result.errors.length === 0) {
        synced = result.synced;
        errors = result.errors;
        usedFallback = fallbackId;
        catalogId = fallbackId;
        break;
      }
    }
  }

  // 2. Generic business/catalog discovery if fallbacks also failed
  if (isPermissionError(errors)) {
    const discovered = await discoverAccessibleCatalog(allRequests);
    if (discovered && discovered !== catalogId) {
      const retry = await syncToCatalog(discovered, items);
      synced = retry.synced;
      errors = retry.errors;
      usedFallback = discovered;
      catalogId = discovered;
    }
  }

  return NextResponse.json({
    synced,
    total: items.length,
    catalogUsed: catalogId,
    ...(usedFallback && usedFallback !== META_CATALOG_ID
      ? { note: `Catálogo activo encontrado automáticamente. Actualiza META_CATALOG_ID a: ${usedFallback}` }
      : {}),
    ...(errors.length > 0 ? { errors } : {}),
  }, { headers: CORS });
}
