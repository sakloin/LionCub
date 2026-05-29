import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "payment-proofs";
const EXPIRY_SECONDS = 60 * 60; // 1 hour

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Accept either a bare path inside the bucket (e.g. "proofs/1234.jpg") or
 *  the full publicUrl stored in orders.payment_proof_url. Returns the bucket
 *  path, or null if the input doesn't look like a payment-proofs object. */
function normalizePath(raw: string): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 500) return null;
  const marker = `/${BUCKET}/`;
  const idx = raw.indexOf(marker);
  const path = idx >= 0 ? raw.slice(idx + marker.length) : raw;
  // Defensive: must look like our convention and not escape with "..".
  if (!/^[A-Za-z0-9_./-]+$/.test(path) || path.includes("..")) return null;
  return path;
}

export async function POST(req: NextRequest) {
  // 1) Verify the request comes from an authenticated admin.
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 401 });
  }
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  if (!isAdminEmail(userData.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // 2) Validate input.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const paths = (body as { paths?: unknown })?.paths;
  if (!Array.isArray(paths) || paths.length === 0 || paths.length > 100) {
    return NextResponse.json({ error: "paths debe ser un array de 1..100" }, { status: 400 });
  }

  // 3) Normalize and de-duplicate.
  const originalByNormalized = new Map<string, string>();
  for (const raw of paths) {
    if (typeof raw !== "string") continue;
    const norm = normalizePath(raw);
    if (norm) originalByNormalized.set(norm, raw);
  }
  if (originalByNormalized.size === 0) {
    return NextResponse.json({ signedUrls: {} });
  }

  // 4) Sign via the service-role client.
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrls([...originalByNormalized.keys()], EXPIRY_SECONDS);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 5) Build a { originalInput -> signedUrl } map so the caller can match the
  //    response back to the rows it sent in.
  const signedUrls: Record<string, string> = {};
  for (const entry of data ?? []) {
    if (!entry.signedUrl || !entry.path) continue;
    const original = originalByNormalized.get(entry.path);
    if (original) signedUrls[original] = entry.signedUrl;
  }
  return NextResponse.json({ signedUrls });
}
