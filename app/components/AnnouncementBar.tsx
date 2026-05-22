"use client";

import { useLang } from "../context/LanguageContext";

export default function AnnouncementBar() {
  const { t } = useLang();
  return (
    <div className="bg-bg-warm text-ink-soft text-center lc-mono uppercase text-[10px] tracking-[0.22em] py-2 px-5">
      {t(
        "Envíos a Perú · USA · Carta del recién nacido en cada pedido",
        "Ships to Peru · USA · A newborn letter with every order"
      )}
    </div>
  );
}
