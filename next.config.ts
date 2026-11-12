import type { NextConfig } from "next";
import { armarCspReportOnly, RUTA_REPORTE_CSP } from "./app/lib/csp";

const esDesarrollo = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Cabeceras de seguridad, fase 1: dos aplicadas (inocuas) y la CSP solo en
  // modo «reportar». La fase 2 (aplicar la CSP) va con los reportes en la mano.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Reporting-Endpoints", value: `csp="${RUTA_REPORTE_CSP}"` },
          { key: "Content-Security-Policy-Report-Only", value: armarCspReportOnly(esDesarrollo) },
        ],
      },
    ];
  },
};

export default nextConfig;
