"use client";

import { useLang } from "../context/LanguageContext";
import { Star } from "lucide-react";

const testimonials = [
  {
    nameEs: "María, mamá de Sofía (4 meses)",
    nameEn: "María, mom of Sofía (4 months)",
    textEs: "Nunca pensé que pudiera haber tanta diferencia en una tela. El body de algodón pima es increíblemente suave. Sofía nunca se ha irritado con ninguna prenda de Lion Cub.",
    textEn: "I never thought there could be such a difference in fabric. The Pima cotton bodysuit is incredibly soft. Sofía has never had any irritation from Lion Cub garments.",
    location: "Lima, Perú",
    emoji: "👩‍👧",
    stars: 5,
  },
  {
    nameEs: "Abuela Rosa, para su nieto Lucas",
    nameEn: "Grandma Rosa, for her grandson Lucas",
    textEs: "Mis hijos están en Miami y yo les mandé el pijama de Lion Cub. Llegó perfecto y dicen que Lucas duerme mucho mejor desde que lo usa. ¡Orgullo peruano!",
    textEn: "My children are in Miami and I sent them Lion Cub's pajama set. It arrived perfectly and they say Lucas sleeps so much better since wearing it. Peruvian pride!",
    location: "Lima → Miami",
    emoji: "👵",
    stars: 5,
  },
  {
    nameEs: "Carlos y Paola, papás de Mateo",
    nameEn: "Carlos & Paola, parents of Mateo",
    textEs: "Buscábamos algo especial para el recién nacido y encontramos Lion Cub. La manta swaddle es una maravilla. Simple, sin cosas raras, solo calidad pura.",
    textEn: "We were looking for something special for our newborn and found Lion Cub. The swaddle blanket is wonderful. Simple, nothing fancy, just pure quality.",
    location: "Miraflores, Lima",
    emoji: "👨‍👩‍👦",
    stars: 5,
  },
];

export default function Testimonials() {
  const { lang, t } = useLang();

  return (
    <section className="bg-[#F5EDD8] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#D4A520] font-bold text-sm uppercase tracking-widest mb-2">
            {t("Lo que dicen las familias", "What families say")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D2010] mb-4">
            {t("Testimonios", "Testimonials")}
          </h2>
          <p className="text-[#9B6B45] max-w-md mx-auto">
            {t(
              "La opinión de las familias es lo más valioso que tenemos.",
              "Family opinions are the most valuable thing we have."
            )}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t_item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow border border-[#F5EDD8] flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t_item.stars)].map((_, j) => (
                  <Star key={j} size={14} fill="#D4A520" className="text-[#D4A520]" />
                ))}
              </div>

              {/* Text */}
              <p className="text-[#6B3D1E] text-sm leading-relaxed flex-1 italic">
                "{lang === "es" ? t_item.textEs : t_item.textEn}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#F5EDD8]">
                <span className="text-2xl">{t_item.emoji}</span>
                <div>
                  <p className="font-bold text-[#3D2010] text-sm">
                    {lang === "es" ? t_item.nameEs : t_item.nameEn}
                  </p>
                  <p className="text-[#9B6B45] text-xs">{t_item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
