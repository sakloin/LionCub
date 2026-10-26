"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import {
  LayoutDashboard, Package, ShoppingBag, Boxes, BarChart3, Bell, FileText, Tag, Settings,
  LogOut, Menu, X, Megaphone, ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ADMIN_TOASTER, btn, cx, focusRing, useFocusTrap } from "./ui";

interface NavItem { href: string; label: string; icon: LucideIcon; badgeKey?: "pedidosNuevos" }
interface NavGroup { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  { title: "Hoy", items: [
    { href: "/admin",          label: "Inicio",          icon: LayoutDashboard },
    { href: "/admin/pedidos",  label: "Pedidos",         icon: ShoppingBag, badgeKey: "pedidosNuevos" },
    { href: "/admin/espera",   label: "Lista de espera", icon: Bell },
  ]},
  { title: "Tienda", items: [
    { href: "/admin/productos", label: "Productos",    icon: Package },
    { href: "/admin/ofertas",   label: "Ofertas",      icon: Tag },
    { href: "/admin/catalogo",  label: "Catálogo PDF", icon: FileText },
  ]},
  { title: "Inventario y números", items: [
    { href: "/admin/compras",  label: "Compras y stock", icon: Boxes },
    { href: "/admin/reportes", label: "Reportes",        icon: BarChart3 },
  ]},
  { title: "Marca", items: [
    { href: "/admin/contenido", label: "Contenido", icon: Megaphone },
  ]},
  { title: "Sistema", items: [
    { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  ]},
];

const MOBILE_TABS: NavItem[] = [
  { href: "/admin",           label: "Inicio",    icon: LayoutDashboard },
  { href: "/admin/pedidos",   label: "Pedidos",   icon: ShoppingBag, badgeKey: "pedidosNuevos" },
  { href: "/admin/productos", label: "Productos", icon: Package },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo-solid.png"
      alt="Lion Cub Baby Clothing"
      width={size}
      height={size}
      className="rounded-xl bg-bg-card"
      priority
    />
  );
}

interface AdminShellProps {
  children: React.ReactNode;
  // Email del admin verificado por el servidor; no se comprueba de nuevo aquí.
  email: string;
}

export default function AdminShell({ children, email }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<{ pedidosNuevos: number }>({ pedidosNuevos: 0 });
  const sidebarRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Cuando Supabase refresca el token de forma automática, sincroniza la cookie
  // del servidor para que el layout siga aceptando la sesión más allá de la
  // primera hora.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "TOKEN_REFRESHED" && session?.access_token) {
        void fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: session.access_token }),
        });
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  // Contador de pedidos nuevos para el badge del menú.
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("order_status", "nuevo")
      .then(({ count }) => { if (!cancelled) setBadges({ pedidosNuevos: count ?? 0 }); });
    return () => { cancelled = true; };
  }, [pathname]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  useFocusTrap(sidebarRef, sidebarOpen, { onEscape: closeSidebar, initialFocus: firstLinkRef });

  async function logout() {
    await Promise.all([
      supabase.auth.signOut(),
      fetch("/api/admin/session", { method: "DELETE" }),
    ]);
    router.refresh();
  }

  const toaster = (
    <Toaster
      id={ADMIN_TOASTER}
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          background: "var(--color-bg-card)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-rule)",
          borderRadius: "14px",
          boxShadow: "var(--lc-shadow-2)",
        },
        actionButtonStyle: { background: "var(--color-ink)", color: "var(--color-bg)", minHeight: 44, minWidth: 44, padding: "0 16px", fontSize: 14 },
      }}
    />
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {toaster}
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] bg-ink text-bg px-4 py-2 rounded-xl">
        Saltar al contenido
      </a>

      <aside
        ref={sidebarRef}
        id="admin-sidebar"
        aria-label="Menú del panel"
        className={cx(
          "fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-bg-card border-r border-rule flex flex-col",
          "transition-[transform,visibility] duration-300 ease-[var(--lc-ease-soft)] motion-reduce:transition-none",
          sidebarOpen ? "translate-x-0 visible shadow-[var(--lc-shadow-3)]" : "-translate-x-full invisible",
          "md:translate-x-0 md:visible md:shadow-none",
        )}
      >
        <div className="px-5 h-16 flex items-center gap-3 border-b border-rule">
          <Logo size={36} />
          <div className="min-w-0">
            <p className="lc-display text-xl leading-none text-ink">Lion Cub</p>
            <p className="lc-eyebrow lc-eyebrow-ink mt-1">Panel</p>
          </div>
          <button onClick={closeSidebar} className={cx(btn.icon, "ml-auto md:hidden")} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5" aria-label="Secciones">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title}>
              <p className="lc-eyebrow lc-eyebrow-ink px-3 mb-1.5">{group.title}</p>
              <ul className="flex flex-col gap-0.5">
                {group.items.map(({ href, label, icon: Icon, badgeKey }, ii) => {
                  const active = isActive(pathname, href);
                  const badge = badgeKey ? badges[badgeKey] : 0;
                  return (
                    <li key={href}>
                      <Link
                        ref={gi === 0 && ii === 0 ? firstLinkRef : undefined}
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "relative flex items-center gap-3 min-h-11 px-3 rounded-xl text-[15px] transition-colors",
                          focusRing,
                          active ? "bg-bg-warm text-ink font-semibold" : "text-ink-soft hover:bg-bg-soft hover:text-ink",
                        )}
                      >
                        {active && <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gold" />}
                        <Icon size={18} aria-hidden className={active ? "text-gold-deep" : undefined} />
                        <span className="flex-1">{label}</span>
                        {badge > 0 && (
                          <span className="min-w-6 h-6 px-1.5 rounded-full bg-ink text-bg text-xs font-semibold flex items-center justify-center tabular-nums">
                            {badge}
                            <span className="sr-only"> nuevos</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-rule p-3 flex flex-col gap-1">
          {email && <p className="px-3 py-1 text-xs text-ink-soft truncate" title={email}>{email}</p>}
          <a href="/" target="_blank" rel="noopener noreferrer" className={cx(btn.ghost, "justify-start!")}>
            <ExternalLink size={16} aria-hidden /> Ver tienda
          </a>
          <button onClick={logout} className={cx(btn.ghost, "justify-start!")}>
            <LogOut size={16} aria-hidden /> Salir
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={closeSidebar} aria-hidden />}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 md:hidden h-14 px-2 flex items-center gap-2 border-b border-rule bg-bg supports-[backdrop-filter]:bg-bg/80 supports-[backdrop-filter]:backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className={btn.icon}
            aria-label="Abrir menú"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu size={22} />
          </button>
          <Logo size={28} />
          <p className="lc-display text-lg text-ink">Lion Cub</p>
        </header>

        <main id="admin-main" className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>

        <nav
          aria-label="Accesos rápidos"
          className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-bg-card border-t border-rule grid grid-cols-4 pb-[env(safe-area-inset-bottom)]"
        >
          {MOBILE_TABS.map(({ href, label, icon: Icon, badgeKey }) => {
            const active = isActive(pathname, href);
            const badge = badgeKey ? badges[badgeKey] : 0;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx("relative flex flex-col items-center justify-center gap-0.5 min-h-14 text-xs", focusRing,
                  active ? "text-ink font-semibold" : "text-ink-soft")}
              >
                {active && <span aria-hidden className="absolute top-0 inset-x-6 h-[3px] rounded-b-full bg-gold" />}
                <span className="relative">
                  <Icon size={21} aria-hidden />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-ink text-bg text-[11px] font-semibold flex items-center justify-center tabular-nums">
                      {badge}<span className="sr-only"> nuevos</span>
                    </span>
                  )}
                </span>
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className={cx("flex flex-col items-center justify-center gap-0.5 min-h-14 text-xs text-ink-soft", focusRing)}
            aria-controls="admin-sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu size={21} aria-hidden />
            Menú
          </button>
        </nav>
      </div>
    </div>
  );
}
