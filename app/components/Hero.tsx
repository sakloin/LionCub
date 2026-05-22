"use client";

import Image from "next/image";
import { useLang } from "../context/LanguageContext";

export default function Hero() {
  const { lang, t } = useLang();

  const stats: [string, string][] = [
    ["200+", t("familias acompañadas", "families served")],
    ["100%", t("algodón Pima", "Pima cotton")],
    ["Lima", t("hecho a mano", "handmade")],
  ];

  return (
    <section className="bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center animate-fade-in-up">
          {/* Text */}
          <div>
            <p className="lc-eyebrow">
              {t("Carta del primer abrazo · SS · 2026", "First-embrace letter · SS · 2026")}
            </p>
            <h1 className="lc-display mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.03em] text-ink">
              {lang === "es" ? (
                <>
                  Suave como su{" "}
                  <em className="lc-display-i text-gold-deep">piel,</em>
                  <br />
                  puro como su{" "}
                  <em className="lc-display-i text-gold-deep">llegada.</em>
                </>
              ) : (
                <>
                  Soft as their{" "}
                  <em className="lc-display-i text-gold-deep">skin,</em>
                  <br />
                  pure as their{" "}
                  <em className="lc-display-i text-gold-deep">arrival.</em>
                </>
              )}
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed font-light text-ink-soft">
              {t(
                "Hilamos cada prenda en algodón Pima peruano — la fibra más suave del mundo. Hipoalergénica, transpirable y delicada, pensada para los primeros días, las primeras noches y los abrazos que vienen.",
                "We spin every garment in Peruvian Pima cotton — the softest fiber in the world. Hypoallergenic, breathable and delicate, made for the first days, the first nights, and the embraces to come."
              )}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#coleccion" className="lc-btn lc-btn-primary">
                {t("Descubrir la colección", "Discover the collection")}
              </a>
              <a href="#por-que-pima" className="lc-btn lc-btn-ghost">
                {t("Por qué Pima", "Why Pima")}
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 sm:gap-9">
              {stats.map(([n, l]) => (
                <div key={l}>
                  <div className="lc-display text-3xl text-ink">{n}</div>
                  <div className="lc-mono uppercase text-[10px] tracking-[0.2em] text-ink-mute mt-1">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image stack */}
          <div className="relative">
            {/* Mobile: single plate */}
            <div className="lg:hidden lc-plate aspect-[4/5] bg-pink-soft">
              <Image
                src="/products/LC-010.jpeg"
                alt={t("Ajuar de algodón Pima", "Pima cotton layette")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Desktop: layered editorial composition */}
            <div className="hidden lg:block relative h-[640px]">
              <div className="absolute inset-[40px_0_0_60px] bg-pink-soft" />
              <div className="absolute inset-[40px_0_0_60px] lc-plate">
                <Image
                  src="/products/LC-001.jpeg"
                  alt={t("Conjunto de algodón Pima", "Pima cotton set")}
                  fill
                  sizes="50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div
                className="absolute top-0 left-0 w-[220px] h-[280px] overflow-hidden lc-plate"
                style={{ boxShadow: "var(--lc-shadow-2)" }}
              >
                <Image
                  src="/products/LC-010.jpeg"
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
              <div
                className="absolute bottom-0 right-6 w-[200px] p-5 bg-bg"
                style={{ boxShadow: "var(--lc-shadow-2)" }}
              >
                <p className="lc-eyebrow mb-2.5">{t("Edición SS 26", "SS 26 edition")}</p>
                <div className="lc-display-i text-2xl leading-tight text-ink">
                  Tiernos
                  <br />
                  Conejitos
                </div>
                <div className="text-[11px] text-ink-mute mt-2">
                  {t("Set 5 piezas · desde S/ 79", "5-piece set · from S/ 79")}
                </div>
                <div className="lc-rule my-3" />
                <a
                  href="#coleccion"
                  className="lc-mono uppercase text-[10px] tracking-[0.2em] text-gold-deep"
                >
                  {t("Ver pieza", "View piece")} →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hairline with scroll cue */}
        <div className="mt-16 flex items-center gap-4">
          <span className="lc-mono uppercase text-[10px] tracking-[0.24em] text-ink-mute">
            {t("Continuar", "Continue")}
          </span>
          <span className="flex-1 lc-rule" />
          <span className="lc-mono uppercase text-[10px] tracking-[0.24em] text-ink-mute">
            {t("01 · Material", "01 · Material")}
          </span>
        </div>
      </div>
    </section>
  );
}
