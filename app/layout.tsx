import type { Metadata } from "next";
import { Nunito, Dancing_Script } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="es" className={`${nunito.variable} ${dancingScript.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
