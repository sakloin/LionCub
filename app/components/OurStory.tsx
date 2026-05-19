"use client";

import { useLang } from "../context/LanguageContext";
import { Heart } from "lucide-react";

export default function OurStory() {
  const { t } = useLang();

  return (
    <section id="nuestra-historia" className="bg-[#FDF8F0] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Visual side */}
          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-[#F5E9B8] via-[#FDE8DC] to-[#D4EAC8] rounded-3xl flex items-center justify-center shadow-xl shadow-[#D4A520]/10">
              <div className="text-center p-10">
                <div className="text-8xl mb-6 animate-float inline-block">🦁</div>
                <p className="font-brand text-4xl text-[#6B3D1E] mb-2">Lion Cub</p>
                <p className="text-[#9B6B45] text-sm">Baby Clothing</p>
                <div className="mt-6 flex justify-center gap-4">
                  <span className="text-3xl">🇵🇪</span>
                  <span className="text-3xl">🇺🇸</span>
                </div>
              </div>
            </div>

            {/* Floating stat */}
            <div className="absolute -bottom-5 -right-2 sm:-right-8 bg-[#D4A520] text-white rounded-2xl shadow-lg px-5 py-4 text-center">
              <p className="text-3xl font-extrabold">200+</p>
              <p className="text-xs font-semibold opacity-90">
                {t("familias felices", "happy families")}
              </p>
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[#D4A520] font-bold text-sm uppercase tracking-widest mb-2">
                {t("Quiénes somos", "Who we are")}
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D2010] leading-tight mb-5">
                {t("Nuestra Historia", "Our Story")}
              </h2>
            </div>

            <p className="text-[#6B3D1E] text-lg leading-relaxed">
              {t(
                "Lion Cub nació del amor por los bebés y el orgullo por lo peruano. Somos una familia que descubrió en el algodón pima la mejor forma de cuidar a los más pequeños.",
                "Lion Cub was born from a love of babies and pride in all things Peruvian. We're a family that discovered in Pima cotton the best way to care for the littlest ones."
              )}
            </p>

            <p className="text-[#9B6B45] leading-relaxed">
              {t(
                "Desde Lima, llevamos la suavidad del algodón pima peruano a familias en todo el Perú — y cada vez más, a familias peruanas en Estados Unidos que quieren que sus bebés y nietos disfruten de la mejor calidad.",
                "From Lima, we bring the softness of Peruvian Pima cotton to families across Peru — and increasingly, to Peruvian families in the United States who want their babies and grandchildren to enjoy the finest quality."
              )}
            </p>

            <p className="text-[#9B6B45] leading-relaxed">
              {t(
                "Cada prenda es elegida con cuidado, porque sabemos que se la pondrás a alguien muy especial.",
                "Every garment is carefully chosen, because we know you'll be putting it on someone very special."
              )}
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { emoji: "👐", label: t("Hecho a mano", "Handmade") },
                { emoji: "🌿", label: t("100% Natural", "100% Natural") },
                { emoji: "🏔️", label: t("Origen peruano", "Peruvian origin") },
                { emoji: "💛", label: t("Con amor", "Made with love") },
              ].map((v, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#F5EDD8] rounded-xl px-4 py-3">
                  <span className="text-xl">{v.emoji}</span>
                  <span className="text-sm font-bold text-[#3D2010]">{v.label}</span>
                </div>
              ))}
            </div>

            <a
              href="#contacto"
              className="inline-flex items-center gap-2 text-[#D4A520] font-bold hover:text-[#A07D10] transition-colors mt-2"
            >
              <Heart size={16} fill="currentColor" />
              {t("Conoce más sobre nosotros", "Learn more about us")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
