"use client";

import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#coleccion", label: t("Colección", "Collection") },
    { href: "#por-que-pima", label: t("¿Por qué Pima?", "Why Pima?") },
    { href: "#nuestra-historia", label: t("Nuestra Historia", "Our Story") },
    { href: "#contacto", label: t("Contacto", "Contact") },
  ];

  const linkClass =
    "lc-mono uppercase text-[10px] tracking-[0.24em] text-ink hover:text-gold-deep transition-colors";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg/95 backdrop-blur-sm border-b border-rule-soft"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: desktop links / mobile hamburger */}
          <div className="flex items-center">
            <ul className="hidden md:flex items-center gap-7">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <button
              className="md:hidden p-2 -ml-2 text-ink"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Center: logo */}
          <a href="#" className="justify-self-center" aria-label="Lion Cub — inicio">
            <LogoMark size={26} color="var(--color-ink)" />
          </a>

          {/* Right: language + cart */}
          <div className="flex items-center justify-end gap-4 sm:gap-5">
            <button
              onClick={toggleLang}
              className="lc-mono uppercase text-[10px] tracking-[0.24em] text-ink hover:text-gold-deep transition-colors"
              aria-label="Cambiar idioma / Switch language"
            >
              {lang === "es" ? "ES · EN" : "EN · ES"}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 lc-mono uppercase text-[10px] tracking-[0.24em] text-ink hover:text-gold-deep transition-colors"
              aria-label={t("Bolsa", "Bag")}
            >
              <span className="hidden sm:inline">{t("Bolsa", "Bag")}</span>
              <ShoppingBag size={18} className="sm:hidden" />
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-gold text-[#1A1410] text-[9px]">
                {count}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-bg border-t border-rule-soft px-6 py-5 flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="lc-mono uppercase text-[11px] tracking-[0.24em] text-ink hover:text-gold-deep transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
