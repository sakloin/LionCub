import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const COOKIE = "lc_admin";
const ONE_HOUR = 60 * 60;

function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

// POST /api/admin/session — verifica el JWT de Supabase y guarda en cookie HttpOnly.
// El cliente llama a esto justo después de signInWithPassword o de un token refresh.
export async function POST(req: NextRequest) {
  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  if (!isAdminEmail(data.user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_HOUR,
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/session — borra la cookie de sesión admin.
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
  return NextResponse.json({ ok: true });
}
