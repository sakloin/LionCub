"use client";

import { useLang } from "../context/LanguageContext";
import { Leaf, Star } from "lucide-react";

export default function Hero() {
  const { lang, t } = useLang();

  return (
    <section className="relative min-h-screen bg-[#FDF8F0] flex items-center overflow-hidden pt-16">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#F5E9B8]/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4EAC8]/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-[#FDE8DC]/50 rounded-full blur-2xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text */}
        <div className="flex flex-col gap-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-[#F5E9B8] text-[#A07D10] text-xs font-bold px-4 py-2 rounded-full w-fit">
            <Leaf size={12} />
            {t("100% Algodón Pima · Hecho en Perú", "100% Pima Cotton · Made in Peru")}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3D2010] leading-tight">
            {lang === "es" ? (
              <>
                Suave como{" "}
                <span className="font-brand text-[#D4A520]">su piel</span>,
                <br />
                puro como tu amor
              </>
            ) : (
              <>
                Soft as{" "}
                <span className="font-brand text-[#D4A520]">their skin</span>,
                <br />
                pure as your love
              </>
            )}
          </h1>

          <p className="text-[#9B6B45] text-lg leading-relaxed max-w-md">
            {t(
              "Prendas de bebé elaboradas con el algodón pima más fino del Perú. Suave, hipoalergénico y diseñado para los primeros momentos más especiales.",
              "Baby garments crafted from Peru's finest Pima cotton. Soft, hypoallergenic, and designed for the most precious early moments."
            )}
          </p>

          <div className="flex items-center gap-2 text-sm text-[#9B6B45]">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#D4A520" className="text-[#D4A520]" />
              ))}
            </div>
            <span className="font-semibold">
              {t("Más de 200 familias felices", "Trusted by 200+ happy families")}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#coleccion"
              className="px-8 py-3.5 bg-[#D4A520] text-white font-bold rounded-full hover:bg-[#A07D10] transition-all hover:shadow-lg hover:shadow-[#D4A520]/30 active:scale-95"
            >
              {t("Ver Colección", "Shop Collection")}
            </a>
            <a
              href="#por-que-pima"
              className="px-8 py-3.5 border-2 border-[#6B3D1E] text-[#6B3D1E] font-bold rounded-full hover:bg-[#6B3D1E] hover:text-white transition-all active:scale-95"
            >
              {t("¿Por qué Pima?", "Why Pima?")}
            </a>
          </div>
        </div>

        {/* Image area */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-sm mx-auto animate-float">
            <div className="aspect-[4/5] bg-gradient-to-br from-[#F5E9B8] to-[#FDE8DC] rounded-3xl overflow-hidden shadow-2xl shadow-[#D4A520]/20 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-8xl mb-4">🦁</div>
                <p className="font-brand text-3xl text-[#6B3D1E]">Lion Cub</p>
                <p className="text-[#9B6B45] text-sm mt-2">Baby Clothing</p>
              </div>
            </div>

            <div className="absolute -left-6 top-1/4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="text-xs font-bold text-[#3D2010]">Pima Cotton</p>
                <p className="text-xs text-[#9B6B45]">{t("Ultra suave", "Ultra soft")}</p>
              </div>
            </div>

            <div className="absolute -right-6 bottom-1/4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2">
              <span className="text-2xl">🇵🇪</span>
              <div>
                <p className="text-xs font-bold text-[#3D2010]">{t("Hecho en", "Made in")}</p>
                <p className="text-xs text-[#9B6B45]">Perú</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F5EDD8" />
        </svg>
      </div>
    </section>
  );
}
