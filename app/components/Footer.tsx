"use client";

import { useLang } from "../context/LanguageContext";
import { MessageCircle, Share2, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const { lang, t } = useLang();

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
            {t(
              "Ropa de bebé en 100% algodón pima peruano. Suave, natural y llena de amor. Para los bebés de Perú y del mundo.",
              "Baby clothing in 100% Peruvian Pima cotton. Soft, natural, and full of love. For babies in Peru and around the world."
            )}
          </p>

          {/* Social links */}
          <div className="flex gap-3 mt-2">
            <a
              href="https://www.facebook.com/profile.php?id=61577494893684"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4A520] transition-colors"
              aria-label="Facebook"
            >
              <span className="text-sm font-bold">f</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D4A520] transition-colors"
              aria-label="Instagram"
            >
              <Share2 size={16} />
            </a>
            <a
              href="https://wa.me/51999999999"
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
                <a href="https://wa.me/51999999999" className="hover:text-white transition-colors">
                  +51 999 999 999
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={15} className="text-[#D4A520] flex-shrink-0 mt-0.5" />
              <span>
                {t("Correo", "Email")}
                <br />
                <a href="mailto:hola@lioncubbaby.com" className="hover:text-white transition-colors">
                  hola@lioncubbaby.com
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
            href="https://wa.me/51999999999"
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
          <p>
            {t("Hecho con", "Made with")} ❤️ {t("en Lima, Perú", "in Lima, Peru")}
          </p>
        </div>
      </div>
    </footer>
  );
}
