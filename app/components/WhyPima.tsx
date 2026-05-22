"use client";

import Image from "next/image";
import { useLang } from "../context/LanguageContext";

export default function WhyPima() {
  const { lang, t } = useLang();

  const benefits = [
    {
      titleEs: "3× más suave",
      titleEn: "3× softer",
      descEs:
        "Las fibras extra-largas del Pima lo hacen notablemente más suave que el algodón convencional. Tu bebé lo sentirá.",
      descEn:
        "Pima's extra-long fibers make it noticeably softer than conventional cotton. Your baby will feel it.",
    },
    {
      titleEs: "Respira y absorbe",
      titleEn: "Breathes & absorbs",
      descEs:
        "Regula la temperatura del bebé de forma natural, fresco en el calor y abrigado en el frío.",
      descEn:
        "Naturally regulates baby's temperature, cool in the heat and warm in the cold.",
    },
    {
      titleEs: "Resistente y duradero",
      titleEn: "Durable & lasting",
      descEs:
        "No se desgasta con los lavados. La calidad se mantiene prenda tras prenda, lavado tras lavado.",
      descEn:
        "Doesn't wear out with washing. Quality holds garment after garment, wash after wash.",
    },
    {
      titleEs: "Hipoalergénico",
      titleEn: "Hypoallergenic",
      descEs:
        "Sin irritantes ni químicos agresivos. Perfecto para la piel más delicada y sensible.",
      descEn:
        "Free from irritants and harsh chemicals. Perfect for the most delicate, sensitive skin.",
    },
    {
      titleEs: "Origen certificado",
      titleEn: "Certified origin",
      descEs:
        "Cultivado en los valles costeros del Perú, donde el Pima crece con condiciones únicas en el mundo.",
      descEn:
        "Grown in Peru's coastal valleys, where Pima flourishes under conditions found nowhere else.",
    },
    {
      titleEs: "Más sostenible",
      titleEn: "More sustainable",
      descEs:
        "Producción artesanal con menor impacto ambiental. Bueno para tu bebé y para el planeta.",
      descEn:
        "Artisan production with a smaller footprint. Good for your baby and the planet.",
    },
  ];

  return (
    <section id="por-que-pima" className="bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
        {/* Material chapter */}
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="lc-eyebrow">{t("Capítulo 01 · El material", "Chapter 01 · The material")}</p>
            <h2 className="lc-display mt-6 text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.02em] text-ink">
              {t("La fibra más", "The softest")}
              <br />
              {t("suave del ", "fiber in the ")}
              <em className="lc-display-i text-gold-deep">{t("mundo.", "world.")}</em>
            </h2>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed font-light text-ink-soft">
              {t(
                "El algodón Pima crece bajo el sol constante de la costa norte del Perú. Su hebra extra-larga le da un brillo natural, una resistencia silenciosa y un tacto que se mantiene lavado tras lavado.",
                "Pima cotton grows under the constant sun of Peru's northern coast. Its extra-long staple gives it a natural sheen, a quiet strength, and a feel that endures wash after wash."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="lc-plate aspect-[3/4] bg-bg-warm relative">
              <Image
                src="/products/LC-002.jpeg"
                alt={t("Algodón Pima en detalle", "Pima cotton detail")}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="lc-plate aspect-[4/3] bg-bg-warm relative">
                <Image
                  src="/products/LC-003.jpeg"
                  alt={t("Prenda de algodón Pima", "Pima cotton garment")}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="bg-bg-warm p-7 flex-1">
                <p className="lc-eyebrow mb-3">{t("Hebra", "Staple")}</p>
                <div className="lc-display text-4xl text-ink leading-none">3×</div>
                <div className="text-[13px] text-ink-soft mt-1.5 leading-snug">
                  {t("más larga que el algodón convencional", "longer than conventional cotton")}
                </div>
                <div className="lc-rule my-5" />
                <p className="lc-eyebrow mb-3">{t("Origen", "Origin")}</p>
                <div className="text-[13px] text-ink-soft">
                  {t("Piura, Lambayeque · cosecha a mano", "Piura, Lambayeque · hand-harvested")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits — editorial numbered list */}
        <div className="mt-20 lg:mt-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {benefits.map((b, i) => (
            <div key={i} className="pt-5 border-t border-rule">
              <span className="lc-mono text-[10px] tracking-[0.24em] text-gold-deep">
                0{i + 1}
              </span>
              <div className="lc-display text-xl text-ink mt-3" style={{ fontWeight: 400 }}>
                {lang === "es" ? b.titleEs : b.titleEn}
              </div>
              <p className="text-[13px] leading-relaxed font-light text-ink-soft mt-2">
                {lang === "es" ? b.descEs : b.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Peru highlight band — inverted */}
        <div className="mt-20 lg:mt-24 bg-bg-ink text-bg px-8 sm:px-12 py-14 text-center">
          <p className="lc-eyebrow" style={{ color: "var(--color-gold)" }}>
            {t("Orgullo peruano", "Peruvian pride")}
          </p>
          <h3 className="lc-display mx-auto mt-5 max-w-3xl text-3xl sm:text-4xl leading-tight tracking-[-0.01em]">
            {t("Perú produce el ", "Peru produces ")}
            <em className="lc-display-i text-gold">{t("80%", "80%")}</em>
            {t(" del algodón Pima a nivel mundial.", " of the world's Pima cotton.")}
          </h3>
          <p className="mx-auto mt-6 max-w-xl text-[14px] leading-relaxed font-light text-bg/70">
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
