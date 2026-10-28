"use client";

import { useLang } from "../context/LanguageContext";
import { useReveal } from "../lib/useReveal";

export default function TrustBar() {
  const { t } = useLang();
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-bg-warm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        {/* Composición asimétrica: promesa featured (izq) + dos secundarias (der) */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

          {/* Promesa principal — escala editorial */}
          <div data-reveal style={{ "--lc-reveal-i": 0 } as React.CSSProperties}
            className="pb-10 lg:pb-0 border-b lg:border-b-0 lg:border-r border-rule lg:pr-16">
            <span className="lc-mono text-[11px] tracking-[0.25em] text-gold-text">
              {t("01", "01")}
            </span>
            <h3
              className="lc-display text-ink mt-4 mb-6 whitespace-pre-line"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 400, lineHeight: 1.12 }}
            >
              {t("Delicado\ncon su piel", "Gentle\non their skin")}
            </h3>
            <p className="text-[14px] leading-relaxed font-light text-ink-soft max-w-[42ch]">
              {t(
                "Fibra natural de hebra larga, suave al tacto. Para pieles que apenas están conociendo el mundo.",
                "A natural long-staple fiber, soft to the touch. For skin that's only just meeting the world."
              )}
            </p>
          </div>

          {/* Promesas secundarias apiladas */}
          <div className="flex flex-col gap-8">
            {([
              [
                t("02", "02"),
                t("Transpirable", "Breathable"),
                t(
                  "Regula la temperatura naturalmente: fresco en verano, abrigo en invierno.",
                  "Naturally regulates temperature: cool in summer, warm in winter."
                ),
              ],
              [
                t("03", "03"),
                t("Resistente", "Resilient"),
                t(
                  "La hebra larga aguanta el uso diario y el lavado constante. La suavidad permanece.",
                  "The long staple withstands daily wear and constant washing. The softness remains."
                ),
              ],
            ] as [string, string, string][]).map(([num, title, desc], i) => (
              <div key={String(title)} data-reveal
                style={{ "--lc-reveal-i": i + 1 } as React.CSSProperties}
                className="pt-7 border-t border-rule">
                <span className="lc-mono text-[11px] tracking-[0.25em] text-gold-text">
                  {num}
                </span>
                <div className="lc-display text-xl text-ink mt-3 mb-3" style={{ fontWeight: 400 }}>
                  {title}
                </div>
                <p className="text-[13px] leading-relaxed font-light text-ink-soft">
                  {desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
