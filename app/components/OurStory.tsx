"use client";

import Image from "next/image";
import { useLang } from "../context/LanguageContext";

export default function OurStory() {
  const { t } = useLang();

  const values: [string, string][] = [
    [t("Hecho a mano", "Handmade"), t("en Lima", "in Lima")],
    [t("100% Natural", "100% Natural"), t("algodón Pima", "Pima cotton")],
    [t("Origen peruano", "Peruvian origin"), t("costa norte", "northern coast")],
    [t("Con amor", "With love"), t("en cada pieza", "in every piece")],
  ];

  return (
    <section id="nuestra-historia" className="bg-bg-warm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual */}
          <div className="relative">
            <div className="lc-plate aspect-[4/5] bg-pink-soft relative">
              <Image
                src="/products/LC-014.jpeg"
                alt={t("Prenda Lion Cub en algodón Pima", "Lion Cub garment in Pima cotton")}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div
              className="absolute -bottom-6 -right-2 sm:-right-6 bg-bg px-6 py-5 text-center"
              style={{ boxShadow: "var(--lc-shadow-2)" }}
            >
              <div className="lc-display text-3xl text-ink">200+</div>
              <div className="lc-mono uppercase text-[9px] tracking-[0.2em] text-ink-mute mt-1">
                {t("familias acompañadas", "families served")}
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="lc-eyebrow">{t("Capítulo 02 · Quiénes somos", "Chapter 02 · Who we are")}</p>
            <h2 className="lc-display mt-6 text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.02em] text-ink">
              {t("Una historia ", "A story ")}
              <em className="lc-display-i text-gold-deep">{t("familiar.", "of family.")}</em>
            </h2>

            <div className="mt-7 flex flex-col gap-5 max-w-md">
              <p className="text-[15px] leading-relaxed font-light text-ink-soft">
                {t(
                  "Lion Cub nació del amor por los bebés y el orgullo por lo peruano. Somos una familia que descubrió en el algodón Pima la mejor forma de cuidar a los más pequeños.",
                  "Lion Cub was born from a love of babies and pride in all things Peruvian. We're a family that discovered in Pima cotton the best way to care for the littlest ones."
                )}
              </p>
              <p className="text-[15px] leading-relaxed font-light text-ink-soft">
                {t(
                  "Desde Lima llevamos la suavidad del Pima a familias en todo el Perú — y cada vez más, a familias peruanas en Estados Unidos que quieren la mejor calidad para sus bebés y nietos.",
                  "From Lima we bring the softness of Pima to families across Peru — and increasingly, to Peruvian families in the United States who want the finest quality for their babies and grandchildren."
                )}
              </p>
              <p className="text-[15px] leading-relaxed font-light text-ink-soft">
                {t(
                  "Cada prenda es elegida con cuidado, porque sabemos que se la pondrás a alguien muy especial.",
                  "Every garment is chosen with care, because we know you'll be putting it on someone very special."
                )}
              </p>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-x-10 gap-y-6">
              {values.map(([label, sub]) => (
                <div key={label} className="pt-4 border-t border-rule">
                  <div className="lc-display-i text-lg text-ink">{label}</div>
                  <div className="lc-mono uppercase text-[9px] tracking-[0.2em] text-ink-mute mt-1">
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
