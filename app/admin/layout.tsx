import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";
import AdminShell from "./components/AdminShell";

const nunito = Nunito({ subsets: ["latin"], weight: ["400","600","700","800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Admin — Lion Cub",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={nunito.variable}>
      <body className="bg-[#F8F5F0] min-h-screen">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
