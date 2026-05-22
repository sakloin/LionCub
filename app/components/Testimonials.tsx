"use client";

import { useState } from "react";
import { useLang } from "../context/LanguageContext";

const testimonials = [
  {
    textEs:
      "Llegó en una caja preciosa. Cuando vestí a Sofía con el body por primera vez, sentí que la tela ya la conocía. No se ha irritado nunca.",
    textEn:
      "It arrived in a beautiful box. When I dressed Sofía in the bodysuit for the first time, it felt as if the fabric already knew her. She's never had any irritation.",
    nameEs: "María · mamá de Sofía",
    nameEn: "María · mom of Sofía",
    metaEs: "Lima · 4 meses",
    metaEn: "Lima · 4 months",
  },
  {
    textEs:
      "Mis hijos están en Miami y les mandé el pijama de Lion Cub. Llegó perfecto y dicen que Lucas duerme mucho mejor desde que lo usa.",
    textEn:
      "My children are in Miami and I sent them Lion Cub's pajama set. It arrived perfectly and they say Lucas sleeps so much better since wearing it.",
    nameEs: "Rosa · abuela de Lucas",
    nameEn: "Rosa · grandmother of Lucas",
    metaEs: "Lima → Miami",
    metaEn: "Lima → Miami",
  },
  {
    textEs:
      "Buscábamos algo especial para el recién nacido y encontramos Lion Cub. La manta es una maravilla. Simple, sin cosas raras, solo calidad pura.",
    textEn:
      "We were looking for something special for our newborn and found Lion Cub. The blanket is wonderful. Simple, nothing fancy, just pure quality.",
    nameEs: "Carlos y Paola · papás de Mateo",
    nameEn: "Carlos & Paola · parents of Mateo",
    metaEs: "Miraflores, Lima",
    metaEn: "Miraflores, Lima",
  },
];

export default function Testimonials() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const tm = testimonials[active];

  return (
    <section className="bg-bg-warm">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 lg:py-28 text-center">
        <span
          className="lc-display-i text-gold-deep inline-block"
          style={{ fontSize: 80, lineHeight: 0.5 }}
          aria-hidden
        >
          &ldquo;
        </span>
        <p className="lc-display mt-4 text-2xl sm:text-3xl lg:text-[2.25rem] leading-snug tracking-[-0.01em] text-ink">
          {lang === "es" ? tm.textEs : tm.textEn}
        </p>
        <div className="mt-8 flex flex-col items-center gap-1.5">
          <div className="lc-mono uppercase text-[11px] tracking-[0.24em] text-ink-soft">
            {lang === "es" ? tm.nameEs : tm.nameEn}
          </div>
          <div className="lc-mono uppercase text-[9px] tracking-[0.24em] text-ink-mute">
            {lang === "es" ? tm.metaEs : tm.metaEn}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center gap-2.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Testimonio ${i + 1}`}
              className="py-3 flex items-center"
            >
              <span
                className="block h-px transition-all"
                style={{
                  width: i === active ? 24 : 6,
                  background: i === active ? "var(--color-ink)" : "var(--color-rule)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
