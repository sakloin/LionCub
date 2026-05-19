"use client";

import { useLang } from "../context/LanguageContext";

const benefits = [
  {
    emoji: "🤲",
    titleEs: "3× Más Suave",
    titleEn: "3× Softer",
    descEs: "Las fibras extra-largas del algodón pima lo hacen notablemente más suave que el algodón convencional. Tu bebé lo sentirá.",
    descEn: "Pima cotton's extra-long fibers make it noticeably softer than conventional cotton. Your baby will feel the difference.",
  },
  {
    emoji: "💧",
    titleEs: "Respira y Absorbe",
    titleEn: "Breathable & Absorbent",
    descEs: "Regula la temperatura del bebé de forma natural, manteniéndolo fresco en el calor y abrigado en el frío.",
    descEn: "Naturally regulates baby's temperature, keeping them cool in warmth and cozy in the cold.",
  },
  {
    emoji: "🌱",
    titleEs: "Resistente y Duradero",
    titleEn: "Durable & Long-lasting",
    descEs: "No se desgasta con los lavados. La calidad se mantiene prenda tras prenda, lavado tras lavado.",
    descEn: "Doesn't wear out with washing. Quality stays garment after garment, wash after wash.",
  },
  {
    emoji: "🫶",
    titleEs: "Hipoalergénico",
    titleEn: "Hypoallergenic",
    descEs: "Sin irritantes ni químicos agresivos. Perfecto para la piel más delicada y sensible.",
    descEn: "Free from irritants and harsh chemicals. Perfect for the most delicate and sensitive skin.",
  },
  {
    emoji: "🌍",
    titleEs: "Origen Certificado",
    titleEn: "Certified Origin",
    descEs: "Cultivado en los valles costeros de Perú, donde el algodón pima crece con condiciones únicas en el mundo.",
    descEn: "Grown in Peru's coastal valleys, where Pima cotton flourishes under unique world-class conditions.",
  },
  {
    emoji: "♻️",
    titleEs: "Más Sostenible",
    titleEn: "More Sustainable",
    descEs: "Producción artesanal con menor impacto ambiental. Bueno para tu bebé y para el planeta.",
    descEn: "Artisan production with a smaller environmental footprint. Good for your baby and the planet.",
  },
];

export default function WhyPima() {
  const { lang, t } = useLang();

  return (
    <section id="por-que-pima" className="bg-[#F5EDD8] py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4EAC8]/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#FDE8DC]/40 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#D4A520] font-bold text-sm uppercase tracking-widest mb-2">
            {t("El secreto de la suavidad", "The secret of softness")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D2010] mb-4">
            {t("¿Por qué Algodón Pima?", "Why Pima Cotton?")}
          </h2>
          <p className="text-[#9B6B45] max-w-xl mx-auto text-lg">
            {t(
              "El algodón pima peruano es considerado el oro blanco de los textiles. Y hay muy buenas razones para ello.",
              "Peruvian Pima cotton is considered the white gold of textiles. And there are very good reasons for that."
            )}
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 flex gap-4 items-start hover:bg-white transition-colors border border-white/50"
            >
              <span className="text-3xl flex-shrink-0">{b.emoji}</span>
              <div>
                <h3 className="font-bold text-[#3D2010] mb-1">
                  {lang === "es" ? b.titleEs : b.titleEn}
                </h3>
                <p className="text-[#9B6B45] text-sm leading-relaxed">
                  {lang === "es" ? b.descEs : b.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Peru highlight banner */}
        <div className="bg-gradient-to-r from-[#6B3D1E] to-[#A07D10] rounded-3xl p-8 sm:p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 text-9xl flex items-center justify-center pointer-events-none select-none">
            🌿
          </div>
          <p className="text-[#F5E9B8] text-sm font-bold uppercase tracking-widest mb-3">
            {t("Orgullo peruano", "Peruvian pride")}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">
            {t(
              "Perú produce el 80% del algodón pima a nivel mundial",
              "Peru produces 80% of the world's Pima cotton"
            )}
          </h3>
          <p className="text-white/80 max-w-lg mx-auto">
            {t(
              "Nuestras prendas nacen de una tradición textil centenaria. Cada fibra lleva consigo el trabajo y el orgullo de manos peruanas.",
              "Our garments are born from a centuries-old textile tradition. Every fiber carries the craftsmanship and pride of Peruvian hands."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
