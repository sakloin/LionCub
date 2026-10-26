// ─── Host canónico del sitio ─────────────────────────────────────────────────
// lioncub.pe redirige con 308 a www.lioncub.pe, así que el canónico es www.
// Si NEXT_PUBLIC_SITE_URL trae el dominio sin www (o un *.vercel.app), se
// normaliza a https://www.lioncub.pe para que canonical, sitemap, robots,
// JSON-LD y el feed de Meta apunten a una URL que no redirige.
const DEFAULT_SITE = "https://www.lioncub.pe";

function normalizar(raw: string | undefined): string {
  const v = (raw ?? "").trim().replace(/\/+$/, "");
  if (!v || v.includes("vercel.app")) return DEFAULT_SITE;
  return v.replace(/^https?:\/\/lioncub\.pe$/i, DEFAULT_SITE);
}

export const SITE_URL = normalizar(process.env.NEXT_PUBLIC_SITE_URL);
