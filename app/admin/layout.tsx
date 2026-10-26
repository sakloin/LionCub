import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { cookies } from "next/headers";
import "../globals.css";
import { supabaseAdmin } from "../lib/supabase-admin";
import AdminShell from "./components/AdminShell";
import AdminLoginPage from "./components/AdminLoginPage";

const nunito = Nunito({ subsets: ["latin"], weight: ["400","600","700","800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Admin — Lion Cub",
  robots: { index: false, follow: false },
};

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

async function verifyAdminCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("lc_admin")?.value;
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;
    const email = data.user.email?.toLowerCase() ?? "";
    if (!ADMIN_EMAILS.includes(email)) return null;
    return data.user.email ?? null;
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminEmail = await verifyAdminCookie();

  return (
    <html lang="es" className={nunito.variable}>
      <body className="bg-bg text-ink min-h-screen">
        {adminEmail ? (
          // Sesión válida: renderiza el shell y los hijos (páginas con datos).
          <AdminShell email={adminEmail}>{children}</AdminShell>
        ) : (
          // Sin sesión válida: muestra solo el formulario de login.
          // Los hijos NO se renderizan → ningún Server Component hijo ejecuta
          // queries de datos → el payload RSC no contiene información sensible.
          <AdminLoginPage />
        )}
      </body>
    </html>
  );
}
