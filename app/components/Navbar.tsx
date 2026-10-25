"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./cart/CartDrawer";
import LogoMark from "./LogoMark";

export default function Navbar() {
  const { lang, toggleLang, t } = useLang();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const links = [
    { href: "/#coleccion", label: t("Colección", "Collection") },
    { href: "/#por-que-pima", label: t("¿Por qué Pima?", "Why Pima?") },
    { href: "/#nuestra-historia", label: t("Nuestra Historia", "Our Story") },
    { href: "/#contacto", label: t("Contacto", "Contact") },
  ];

  const linkClass =
    "lc-mono uppercase text-[12px] tracking-[0.18em] text-ink hover:text-gold-deep transition-colors inline-flex items-center min-h-11";

  return (
    <>
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-rule-soft">

        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: desktop links / mobile hamburger */}
          <div className="flex items-center">
            <ul className="hidden md:flex items-center gap-7">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              className="md:hidden w-11 h-11 -ml-3 inline-flex items-center justify-center text-ink"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? t("Cerrar menú", "Close menu") : t("Abrir menú", "Open menu")}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Center: logo */}
          <Link href="/" className="justify-self-center inline-flex items-center min-h-11" aria-label="Lion Cub — inicio">
            <LogoMark size={26} color="var(--color-ink)" />
          </Link>

          {/* Right: language + cart */}
          <div className="flex items-center justify-end gap-1 sm:gap-3">
            <button
              onClick={toggleLang}
              className="lc-mono uppercase text-[12px] tracking-[0.14em] text-ink hover:text-gold-deep transition-colors min-h-11 px-2"
              aria-label="Cambiar idioma / Switch language"
            >
              {lang === "es" ? "ES · EN" : "EN · ES"}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 lc-mono uppercase text-[12px] tracking-[0.18em] text-ink hover:text-gold-deep transition-colors min-h-11 min-w-11 px-2 -mr-2 justify-center"
              aria-label={`${t("Bolsa", "Bag")}: ${count} ${count === 1 ? t("pieza", "item") : t("piezas", "items")}`}
            >
              <span className="hidden sm:inline">{t("Bolsa", "Bag")}</span>
              <ShoppingBag size={20} className="sm:hidden" aria-hidden />
              <span aria-hidden className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-gold text-ink text-[11px]">
                {count}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="menu-movil" className="md:hidden bg-bg border-t border-rule-soft px-6 py-3 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="lc-mono uppercase text-[12px] tracking-[0.18em] text-ink hover:text-gold-deep transition-colors inline-flex items-center min-h-11"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
