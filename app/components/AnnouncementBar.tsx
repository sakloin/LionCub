"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLang } from "../context/LanguageContext";

const STORAGE_KEY = "lc_announcement_dismissed";

export default function AnnouncementBar() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ok */ }
  }

  return (
    <div className="relative bg-bg-warm text-ink-soft text-center lc-mono uppercase text-[10px] tracking-[0.22em] py-2 px-10">
      {t(
        "Envíos a Perú · USA · Carta del recién nacido en cada pedido",
        "Ships to Peru · USA · A newborn letter with every order"
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("Cerrar anuncio", "Dismiss")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}
