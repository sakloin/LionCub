"use client";

import { useLang } from "../context/LanguageContext";

export default function TrustBar() {
  const { t } = useLang();

  const promises: [string, string][] = [
    [
      t("Hipoalergénico", "Hypoallergenic"),
      t(
        "Libre de químicos agresivos. Para pieles que apenas están conociendo el mundo.",
        "Free of harsh chemicals. For skin that's only just meeting the world."
      ),
    ],
    [
      t("Transpirable", "Breathable"),
      t(
        "Regula la temperatura naturalmente: fresco en verano, abrigo en invierno.",
        "Naturally regulates temperature: cool in summer, warm in winter."
      ),
    ],
    [
      t("Resistente", "Resilient"),
      t(
        "La hebra larga aguanta el uso diario y el lavado constante. La suavidad permanece.",
        "The long staple withstands daily wear and constant washing. The softness remains."
      ),
    ],
  ];

  return (
    <section className="bg-bg-warm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="grid sm:grid-cols-3 gap-10 sm:gap-12">
          {promises.map(([title, desc], i) => (
            <div key={title} className="pt-5 border-t border-rule">
              <span className="lc-mono text-[10px] tracking-[0.24em] text-gold-deep">
                0{i + 1}
              </span>
              <div className="lc-display text-2xl text-ink mt-3" style={{ fontWeight: 400 }}>
                {title}
              </div>
              <p className="text-[13.5px] leading-relaxed font-light text-ink-soft mt-2.5">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
