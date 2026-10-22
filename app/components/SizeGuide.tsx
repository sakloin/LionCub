"use client";

import { X } from "lucide-react";
import { useRef } from "react";
import { useDialog } from "../lib/useDialog";
import { useLang } from "../context/LanguageContext";

interface SizeRow {
  label: string;
  ageEs: string;
  ageEn: string;
  weightEs: string;
  weightEn: string;
  heightEs: string;
  heightEn: string;
}

const SIZES: SizeRow[] = [
  { label: "RN / NB", ageEs: "Recién nacido", ageEn: "Newborn",         weightEs: "< 4 kg",     weightEn: "< 9 lb",     heightEs: "≤ 50 cm", heightEn: "≤ 20 in" },
  { label: "0–3 M",   ageEs: "0–3 meses",     ageEn: "0–3 months",     weightEs: "4–6 kg",     weightEn: "9–13 lb",    heightEs: "51–61 cm", heightEn: "20–24 in" },
  { label: "3–6 M",   ageEs: "3–6 meses",     ageEn: "3–6 months",     weightEs: "6–8 kg",     weightEn: "13–18 lb",   heightEs: "62–68 cm", heightEn: "24–27 in" },
  { label: "6–9 M",   ageEs: "6–9 meses",     ageEn: "6–9 months",     weightEs: "8–9.5 kg",   weightEn: "18–21 lb",   heightEs: "69–74 cm", heightEn: "27–29 in" },
  { label: "9–12 M",  ageEs: "9–12 meses",    ageEn: "9–12 months",    weightEs: "9.5–11 kg",  weightEn: "21–24 lb",   heightEs: "75–80 cm", heightEn: "29–31 in" },
  { label: "12–18 M", ageEs: "12–18 meses",   ageEn: "12–18 months",   weightEs: "11–13 kg",   weightEn: "24–29 lb",   heightEs: "81–86 cm", heightEn: "32–34 in" },
  { label: "18–24 M", ageEs: "18–24 meses",   ageEn: "18–24 months",   weightEs: "13–15 kg",   weightEn: "29–33 lb",   heightEs: "87–92 cm", heightEn: "34–36 in" },
  { label: "2T / 2A", ageEs: "2 años",        ageEn: "2 years",        weightEs: "15–17 kg",   weightEn: "33–37 lb",   heightEs: "93–98 cm", heightEn: "37–39 in" },
];

export default function SizeGuide({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLang();

  const dialogRef = useRef<HTMLDivElement>(null);
  useDialog(dialogRef, true, onClose);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/50"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guia-tallas-titulo"
        tabIndex={-1}
        className="bg-bg w-full sm:max-w-lg max-h-[90svh] overflow-y-auto rounded-t-2xl sm:rounded-sm shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-rule sticky top-0 bg-bg z-10">
          <div>
            <p className="lc-eyebrow mb-1">{t("Referencia", "Reference")}</p>
            <h2 id="guia-tallas-titulo" className="lc-display text-2xl text-ink">{t("Guía de tallas", "Size guide")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Cerrar", "Close")}
            className="w-11 h-11 -mr-3 -mt-1 inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Note */}
        <p className="px-5 sm:px-6 pt-5 text-[13px] leading-relaxed font-light text-ink-soft">
          {t(
            "El algodón Pima mantiene su forma lavado tras lavado. Nuestras prendas están cortadas con un pequeño margen de holgura para mayor comodidad y durabilidad. Si tu bebé está en el límite, recomendamos subir una talla.",
            "Pima cotton holds its shape wash after wash. Our garments are cut with a little extra room for comfort and lasting fit. If your baby is on the edge, we recommend sizing up."
          )}
        </p>

        {/* Table */}
        <div className="overflow-x-auto px-5 sm:px-6 pb-6 mt-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rule">
                <th className="lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute-text pb-3 pr-4 font-normal whitespace-nowrap">
                  {t("Talla", "Size")}
                </th>
                <th className="lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute-text pb-3 pr-4 font-normal whitespace-nowrap">
                  {t("Edad aprox.", "Age approx.")}
                </th>
                <th className="lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute-text pb-3 pr-4 font-normal whitespace-nowrap">
                  {t("Peso", "Weight")}
                </th>
                <th className="lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute-text pb-3 font-normal whitespace-nowrap">
                  {t("Talla / Altura", "Height")}
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((row, i) => (
                <tr key={row.label} className={`border-b border-rule ${i % 2 === 0 ? "" : "bg-bg-warm"}`}>
                  <td className="py-3 pr-4">
                    <span className="lc-display text-[15px] text-ink">{row.label}</span>
                  </td>
                  <td className="py-3 pr-4 text-[13px] text-ink-soft font-light whitespace-nowrap">
                    {lang === "es" ? row.ageEs : row.ageEn}
                  </td>
                  <td className="py-3 pr-4 text-[13px] text-ink-soft font-light whitespace-nowrap">
                    {lang === "es" ? row.weightEs : row.weightEn}
                  </td>
                  <td className="py-3 text-[13px] text-ink-soft font-light whitespace-nowrap">
                    {lang === "es" ? row.heightEs : row.heightEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="px-5 sm:px-6 pb-6">
          <p className="lc-mono uppercase text-[9px] tracking-[0.18em] text-ink-mute-text">
            {t(
              "¿Dudas? Escríbenos al +51 920 201 943",
              "Questions? Message us at +51 920 201 943"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
