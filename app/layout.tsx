import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Lion Cub Baby Clothing | Algodón Pima Peruano",
  description:
    "Ropa de bebé en 100% algodón pima peruano. Suave, hipoalergénico y de calidad premium. Baby clothing made with 100% Peruvian Pima cotton. Ships to Peru & USA.",
  keywords: [
    "ropa de bebé",
    "algodón pima",
    "Peru",
    "baby clothing",
    "pima cotton",
    "hypoallergenic",
    "Lion Cub",
  ],
  openGraph: {
    title: "Lion Cub Baby Clothing",
    description: "100% Algodón Pima Peruano · Pima Cotton from Peru",
    type: "website",
  },
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
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
