import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const _sUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const SITE_URL  = (_sUrl && !_sUrl.includes("vercel.app")) ? _sUrl : "https://lioncub.pe";
const SITE_NAME = "Lion Cub Baby Clothing";
const OG_IMAGE  = `${SITE_URL}/logo-solid.png`;

const DESCRIPTION_ES =
  "Ropa de bebé en 100% algodón pima peruano. Suave, hipoalergénica y respirable — conjuntos, bodies, baberos y mantas hechos para el primer abrazo y los días que siguen. Envíos a todo Perú.";
const DESCRIPTION_EN =
  "Baby clothing made with 100% Peruvian Pima cotton. Soft, hypoallergenic and breathable — sets, bodies, bibs and blankets for the first cuddle and the days that follow. Ships across Peru.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Algodón Pima Peruano`,
    template: `%s · ${SITE_NAME}`,
  },
  description: `${DESCRIPTION_ES} ${DESCRIPTION_EN}`,
  keywords: [
    "ropa de bebé",
    "ropa bebé Perú",
    "algodón pima",
    "algodón pima peruano",
    "conjuntos para bebé",
    "bodies bebé",
    "baberos bebé",
    "mantas bebé",
    "ajuar recién nacido",
    "ropa hipoalergénica bebé",
    "Lion Cub",
    "baby clothing Peru",
    "pima cotton baby",
    "newborn clothing",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: "Lion Cub", url: SITE_URL }],
  creator: "Lion Cub",
  publisher: "Lion Cub",
  category: "shopping",
  formatDetection: { email: false, telephone: false, address: false },
  alternates: {
    canonical: "/",
    languages: { "es-PE": "/", "en-US": "/" },
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Algodón Pima Peruano`,
    description: DESCRIPTION_ES,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Lion Cub — Baby Clothing en algodón pima peruano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Algodón Pima Peruano`,
    description: DESCRIPTION_ES,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-solid.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FDF8F0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// Org-level structured data so Google understands the brand entity.
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: SITE_NAME,
  alternateName: "Lion Cub",
  description: DESCRIPTION_ES,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-solid.png`,
  image: OG_IMAGE,
  telephone: "+51-920-201-943",
  email: "hola@lioncub.pe",
  address: {
    "@type": "PostalAddress",
    addressCountry: "PE",
    addressRegion: "Lima",
  },
  areaServed: { "@type": "Country", name: "Peru" },
  sameAs: [
    "https://www.instagram.com/lioncubbabyclothing/",
    "https://www.facebook.com/profile.php?id=61577494893684",
    "https://wa.me/51920201943",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col antialiased bg-bg text-ink">
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
          />
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
