"use client";

import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Image from "next/image";

export default function Navbar() {
  const { lang, toggleLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FDF8F0]/95 backdrop-blur-sm shadow-sm border-b border-[#F5E9B8]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-10 h-10 relative">
            <Image
              src="/logo.png"
              alt="Lion Cub Baby Clothing"
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>
          <span className="font-brand text-2xl text-[#6B3D1E] group-hover:text-[#D4A520] transition-colors">
            Lion Cub
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[#6B3D1E] text-sm font-semibold hover:text-[#D4A520] transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#D4A520] text-[#D4A520] hover:bg-[#D4A520] hover:text-white transition-all"
            aria-label="Cambiar idioma / Switch language"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>

          {/* Cart placeholder */}
          <button
            className="relative p-2 text-[#6B3D1E] hover:text-[#D4A520] transition-colors"
            aria-label={t("Carrito", "Cart")}
          >
            <ShoppingBag size={20} />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[#6B3D1E]"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FDF8F0] border-t border-[#F5E9B8] px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[#6B3D1E] font-semibold hover:text-[#D4A520] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
