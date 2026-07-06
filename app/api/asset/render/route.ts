import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------- Auth (same pattern as all other admin routes) ----------
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

// ---------- Types ----------
type Formato = "carrusel" | "historia";
type Paleta = "dorado" | "blanco" | "natural";

interface RenderBody {
  producto_id?: unknown;
  texto?: unknown;
  subtexto?: unknown;
  formato?: unknown;
  paleta?: unknown;
}

// Lion Cub brand palette
const PALETAS: Record<Paleta, { bg: string; text: string; accent: string; textRgb: string }> = {
  dorado:  { bg: "#3D2010", text: "#D4A520", accent: "#D4A520", textRgb: "212,165,32" },
  blanco:  { bg: "#FFFFFF", text: "#3D2010", accent: "#D4A520", textRgb: "61,32,16" },
  natural: { bg: "#FDF8F0", text: "#6B3D1E", accent: "#9B6B45", textRgb: "107,61,30" },
};

const DIMENSIONES: Record<Formato, { w: number; h: number }> = {
  carrusel: { w: 1080, h: 1350 },
  historia: { w: 1080, h: 1920 },
};

const STORAGE_BUCKET = "contenido";

// ---------- SVG overlay builder ----------
function buildSvgOverlay(
  w: number,
  h: number,
  texto: string,
  subtexto: string,
  paleta: Paleta
): Buffer {
  const { accent, textRgb } = PALETAS[paleta];
  const logoSize = Math.round(w * 0.12);
  const textY = h * 0.72;
  const subY = textY + 90;
  const logoY = h - logoSize - 40;

  // Word-wrap texto at ~30 chars per line for 1080px width
  const words = texto.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 28) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  const lineH = 86;
  const textBlock = lines
    .map((l, i) => `<text x="80" y="${textY + i * lineH}" fill="${accent}" font-family="Georgia,serif" font-size="72" font-weight="bold" letter-spacing="-1">${escXml(l)}</text>`)
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="55%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <!-- gradient overlay -->
  <rect width="${w}" height="${h}" fill="url(#vignette)"/>
  <!-- main hook text -->
  ${textBlock}
  <!-- subtexto -->
  ${subtexto ? `<text x="80" y="${subY + (lines.length - 1) * lineH}" fill="rgba(${textRgb},0.85)" font-family="Arial,sans-serif" font-size="42">${escXml(subtexto)}</text>` : ""}
  <!-- brand badge -->
  <rect x="${w - logoSize - 36}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="${logoSize / 4}" fill="${accent}" opacity="0.92"/>
  <text x="${w - logoSize / 2 - 36}" y="${logoY + logoSize * 0.52}" text-anchor="middle" fill="#FFFFFF" font-family="Georgia,serif" font-size="${Math.round(logoSize * 0.28)}" font-weight="bold">Lion</text>
  <text x="${w - logoSize / 2 - 36}" y="${logoY + logoSize * 0.78}" text-anchor="middle" fill="#FFFFFF" font-family="Georgia,serif" font-size="${Math.round(logoSize * 0.25)}">Cub</text>
</svg>`;

  return Buffer.from(svg, "utf-8");
}

function escXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ---------- Route handler ----------
export async function POST(req: NextRequest) {
  // Auth — acepta JWT de usuario admin O service role key (llamadas servidor-a-servidor)
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 401 });
  }
  const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY && token === process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isServiceRole) {
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }
    if (!isAdminEmail(userData.user.email)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  // Parse body
  let body: RenderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const productoId = typeof body.producto_id === "string" ? body.producto_id : "";
  const texto = typeof body.texto === "string" ? body.texto.trim() : "";
  const subtexto = typeof body.subtexto === "string" ? body.subtexto.trim() : "";
  const formato: Formato = body.formato === "historia" ? "historia" : "carrusel";
  const paleta: Paleta = (["dorado", "blanco", "natural"] as Paleta[]).includes(body.paleta as Paleta)
    ? (body.paleta as Paleta)
    : "dorado";

  if (!texto) {
    return NextResponse.json({ error: "texto requerido" }, { status: 400 });
  }

  const { w, h } = DIMENSIONES[formato];

  // 1. Fetch product image if producto_id provided
  let inputBuffer: Buffer | null = null;
  if (productoId) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("image_url")
      .eq("id", productoId)
      .single();

    if (product?.image_url) {
      try {
        const imgRes = await fetch(product.image_url);
        if (imgRes.ok) {
          inputBuffer = Buffer.from(await imgRes.arrayBuffer());
        }
      } catch {
        // Continue without product image
      }
    }
  }

  // 2. Compose image with sharp
  const { bg } = PALETAS[paleta];
  const [r, g, b] = hexToRgb(bg);

  let pipeline: sharp.Sharp;
  if (inputBuffer) {
    // Resize & cover the product image, then tint with palette overlay
    pipeline = sharp(inputBuffer).resize(w, h, { fit: "cover", position: "center" });
  } else {
    // Solid background
    pipeline = sharp({ create: { width: w, height: h, channels: 3, background: { r, g, b } } });
  }

  const svgOverlay = buildSvgOverlay(w, h, texto, subtexto, paleta);

  const composed = await pipeline
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  // 3. Upload to Supabase Storage bucket 'contenido'
  const fileName = `${formato}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error: uploadErr } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, composed, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadErr) {
    console.error("[/api/asset/render] storage upload error:", uploadErr.message);
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl, formato, paleta });
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}
