"use client";

import { useLang } from "../context/LanguageContext";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import data from "../data/productos.json";

const { brand } = data;

export default function Footer() {
  const { t } = useLang();

  return (
    <footer id="contacto" className="bg-[#3D2010] text-white">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <p className="font-brand text-4xl text-[#D4A520]">Lion Cub</p>
            <p className="text-white/60 text-xs uppercase tracking-widest mt-1">Baby Clothing</p>
          </div>
          <p className="text-white/70 leading-relaxed max-w-sm text-sm">
            {brand.story}
          </p>

          {/* Social links */}
          <div className="flex gap-3 mt-2">
            <a
              href={brand.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-colors font-bold text-sm"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E1306C] transition-colors"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href={brand.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#25D366] transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <p className="font-bold text-[#D4A520] text-sm uppercase tracking-wider">
            {t("Explorar", "Explore")}
          </p>
          <ul className="flex flex-col gap-2 text-sm text-white/70">
            {[
              { href: "#coleccion", label: t("Colección", "Collection") },
              { href: "#por-que-pima", label: t("¿Por qué Pima?", "Why Pima?") },
              { href: "#nuestra-historia", label: t("Nuestra Historia", "Our Story") },
              { href: "#contacto", label: t("Contacto", "Contact") },
            ].map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-[#D4A520] transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <p className="font-bold text-[#D4A520] text-sm uppercase tracking-wider">
            {t("Contacto", "Contact")}
          </p>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <MessageCircle size={15} className="text-[#25D366] flex-shrink-0 mt-0.5" />
              <span>
                WhatsApp
                <br />
                <a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +{brand.whatsapp}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={15} className="text-[#D4A520] flex-shrink-0 mt-0.5" />
              <span>
                {t("Correo", "Email")}
                <br />
                <a href={`mailto:${brand.email}`} className="hover:text-white transition-colors">
                  {brand.email}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={15} className="text-[#D4A520] flex-shrink-0 mt-0.5" />
              <span>
                {t("Envíos a", "Ships to")}
                <br />
                🇵🇪 Perú &amp; 🇺🇸 USA
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* WhatsApp CTA banner */}
      <div className="bg-[#25D366]/10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/80 text-sm">
            {t(
              "¿Tienes preguntas? ¡Estamos a un mensaje de distancia!",
              "Have questions? We're just a message away!"
            )}
          </p>
          <a
            href={brand.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[#1eb85a] transition-colors text-sm flex-shrink-0"
          >
            <MessageCircle size={16} />
            {t("Escribir por WhatsApp", "Message on WhatsApp")}
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© 2025 Lion Cub Baby Clothing. {t("Todos los derechos reservados.", "All rights reserved.")}</p>
          <p>{t("Hecho con", "Made with")} ❤️ {t("en Lima, Perú", "in Lima, Peru")}</p>
        </div>
      </div>
    </footer>
  );
}
