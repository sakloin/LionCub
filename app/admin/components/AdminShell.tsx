"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, BarChart2, Bell, FileText, Tag, Settings, LogOut, Menu } from "lucide-react";
import { supabase } from "../../lib/supabase";

const NAV = [
  { href: "/admin",            label: "Dashboard",       icon: LayoutDashboard },
  { href: "/admin/productos",  label: "Productos",       icon: Package },
  { href: "/admin/ofertas",    label: "Ofertas",         icon: Tag },
  { href: "/admin/catalogo",   label: "Catálogo PDF",    icon: FileText },
  { href: "/admin/pedidos",    label: "Pedidos",         icon: ShoppingCart },
  { href: "/admin/compras",    label: "Compras & Stock", icon: TrendingUp },
  { href: "/admin/reportes",   label: "Reportes",        icon: BarChart2 },
  { href: "/admin/espera",     label: "Lista de espera", icon: Bell },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

// Comma-separated allowlist of admin emails. The authoritative gate is
// Supabase RLS (policies keyed on the auth.jwt() email); this client-side
// check is only for UX. Fails closed: if unset, nobody is treated as admin.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAllowed(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setAuthed(!!session && isAllowed(session.user?.email));
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuthed(!!session && isAllowed(session?.user?.email));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });
      if (signInError) {
        setError("Credenciales inválidas");
        return;
      }
      if (!isAllowed(data.user?.email)) {
        await supabase.auth.signOut();
        setError("Esta cuenta no tiene acceso al panel");
        return;
      }
      setAuthed(true);
      setPw("");
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setAuthed(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
        <p className="text-[#9B6B45] text-sm">Cargando…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
        <form onSubmit={login} className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm flex flex-col gap-5">
          <div className="text-center">
            <p className="font-brand text-3xl text-[#D4A520]" style={{ fontFamily: "cursive" }}>Lion Cub</p>
            <p className="text-[#9B6B45] text-sm mt-1">Panel de administración</p>
          </div>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            className="border border-[#F5EDD8] rounded-xl px-4 py-3 text-[#3D2010] focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
            autoFocus
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoComplete="current-password"
            className="border border-[#F5EDD8] rounded-xl px-4 py-3 text-[#3D2010] focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={submitting} className="bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-60">
            {submitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#3D2010] text-white flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-[#D4A520] text-2xl font-bold" style={{ fontFamily: "cursive" }}>Lion Cub</p>
          <p className="text-white/50 text-xs mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${pathname === href ? "bg-[#D4A520] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white text-sm rounded-xl hover:bg-white/10 transition-colors">
          <LogOut size={15} /> Salir
        </button>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#F5EDD8] px-4 py-3 flex items-center gap-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-[#6B3D1E]"><Menu size={22} /></button>
          <p className="font-bold text-[#3D2010]">Admin — Lion Cub</p>
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
