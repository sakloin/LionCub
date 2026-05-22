"use client";

import { useLang } from "../context/LanguageContext";
import { MessageCircle } from "lucide-react";
import LogoMark from "./LogoMark";
import data from "../data/productos.json";

const { brand } = data;

export default function Footer() {
  const { t } = useLang();

  const explore = [
    { href: "#coleccion", label: t("Colección", "Collection") },
    { href: "#por-que-pima", label: t("¿Por qué Pima?", "Why Pima?") },
    { href: "#nuestra-historia", label: t("Nuestra Historia", "Our Story") },
    { href: "#contacto", label: t("Contacto", "Contact") },
  ];

  const social = [
    { label: "IG", href: brand.instagram },
    { label: "FB", href: brand.facebook },
    { label: "WA", href: brand.whatsappUrl },
  ];

  const colTitle =
    "lc-mono uppercase text-[10px] tracking-[0.24em] text-bg mb-5";
  const colLink =
    "text-[13px] font-light text-bg/60 hover:text-bg transition-colors";

  return (
    <footer id="contacto" className="bg-bg-ink text-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Brand */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <LogoMark size={28} color="#FDFBF6" />
          <p className="text-[13px] leading-relaxed font-light text-bg/60 max-w-sm">
            {brand.story}
          </p>
          <div className="flex gap-3 mt-1">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="lc-mono w-8 h-8 rounded-full border border-bg/40 inline-flex items-center justify-center text-[9px] tracking-[0.1em] text-bg hover:border-gold hover:text-gold transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <div className={colTitle}>{t("Explorar", "Explore")}</div>
          <div className="flex flex-col gap-2.5">
            {explore.map((link) => (
              <a key={link.href} href={link.href} className={colLink}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className={colTitle}>{t("Contacto", "Contact")}</div>
          <div className="flex flex-col gap-3 text-[13px] font-light text-bg/60">
            <div>
              <div className="lc-mono uppercase text-[9px] tracking-[0.22em] text-bg/40">
                WhatsApp
              </div>
              <a
                href={brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bg transition-colors"
              >
                +{brand.whatsapp}
              </a>
            </div>
            <div>
              <div className="lc-mono uppercase text-[9px] tracking-[0.22em] text-bg/40">
                {t("Correo", "Email")}
              </div>
              <a href={`mailto:${brand.email}`} className="hover:text-bg transition-colors">
                {brand.email}
              </a>
            </div>
            <div>
              <div className="lc-mono uppercase text-[9px] tracking-[0.22em] text-bg/40">
                {t("Envíos a", "Ships to")}
              </div>
              <span>{t("Perú y USA", "Peru & USA")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div className="border-t border-bg/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="lc-display-i text-lg text-bg">
            {t(
              "¿Tienes preguntas? Estamos a un mensaje de distancia.",
              "Have questions? We're just a message away."
            )}
          </p>
          <a
            href={brand.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lc-btn lc-btn-whatsapp flex-shrink-0"
          >
            <MessageCircle size={14} />
            {t("Escribir por WhatsApp", "Message on WhatsApp")}
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-bg/10 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 lc-mono uppercase text-[9px] tracking-[0.22em] text-bg/40 text-center">
          <span>© 2026 Lion Cub Baby Clothing · Lima, Perú</span>
          <span>{t("Hecho a mano en el Perú", "Handmade in Peru")}</span>
        </div>
      </div>
    </footer>
  );
}
