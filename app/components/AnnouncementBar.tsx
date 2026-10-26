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
    <div className="relative bg-bg-warm text-ink-soft text-center lc-mono uppercase text-[12px] tracking-[0.18em] py-2 pl-4 pr-12">
      {t(
        "Envíos a todo el Perú · Carta del recién nacido en cada pedido",
        "Shipping across Peru · A newborn letter with every order"
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("Cerrar anuncio", "Dismiss")}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
