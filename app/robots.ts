import type { MetadataRoute } from "next";

const _s = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SITE_URL = (_s && !_s.includes("vercel.app")) ? _s : "https://lioncub.pe";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin panel and API routes have no public value — keep crawlers
        // out so they don't ding us for noindex pages.
        disallow: ["/admin", "/admin/", "/api/", "/checkout"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
