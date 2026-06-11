"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LanguageContext";
import { LionMark } from "../LogoMark";
import { formatSoles } from "../../lib/money";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS = "YAPE · PLIN · TRANSFERENCIA · CONTRA ENTREGA · IZIPAY";

export default function CartDrawer({ open, onClose }: Props) {
  const { items, count, total, remove, updateQty } = useCart();
  const { t } = useLang();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-bg z-50 flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "var(--lc-shadow-3)" }}
        role="dialog"
        aria-label={t("Bolsa", "Bag")}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-rule">
          <div className="flex items-center justify-between">
            <span className="lc-mono uppercase text-[10px] tracking-[0.24em] text-ink-mute">
              {t("Bolsa", "Bag")}
            </span>
            <button
              onClick={onClose}
              aria-label={t("Cerrar", "Close")}
              className="text-ink-mute hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <h2 className="lc-display text-3xl text-ink leading-none mt-3">
            {t("Tu", "Your")} <em className="lc-display-i text-gold-deep">{t("bolsa.", "bag.")}</em>
          </h2>
          <p className="lc-display-i text-sm text-ink-soft mt-1">
            {count === 1
              ? t("1 pieza — lista para envolver", "1 piece — ready to wrap")
              : t(`${count} piezas — listas para envolver`, `${count} pieces — ready to wrap`)}
          </p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <LionMark size={56} color="var(--color-ink-mute)" />
              <p className="lc-display text-2xl text-ink">
                {t("Tu bolsa está vacía", "Your bag is empty")}
              </p>
              <p className="text-sm text-ink-soft max-w-[16rem]">
                {t(
                  "Cada pieza, hilada en algodón Pima. Encuentra la tuya.",
                  "Every piece, spun in Pima cotton. Find yours."
                )}
              </p>
              <a href="#coleccion" onClick={onClose} className="lc-btn lc-btn-outline mt-2">
                {t("Ver la colección", "Browse the collection")}
              </a>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.variant.id}
                  className="flex gap-4 py-5 border-b border-rule"
                >
                  <div className="lc-plate w-20 h-24 shrink-0 rounded-sm">
                    <Image
                      src={item.product.image_url || `/products/${item.product.id}.jpeg`}
                      alt={item.product.name}
                      width={80}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute">
                      {item.product.id}
                    </p>
                    <h3 className="lc-display text-lg text-ink leading-tight truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {[item.variant.color_name, item.variant.size_name].filter(Boolean).join(" · ")}
                    </p>

                    <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                      {/* Quantity stepper — text glyphs, no icons */}
                      <div className="flex items-center border border-rule">
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity - 1)}
                          aria-label={t("Quitar una unidad", "Remove one")}
                          className="px-3 py-1.5 text-ink-mute hover:text-ink transition-colors"
                        >
                          −
                        </button>
                        <span className="lc-mono text-[13px] text-ink w-7 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity + 1)}
                          aria-label={t("Agregar una unidad", "Add one")}
                          className="px-3 py-1.5 text-ink hover:text-gold-deep transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <span className="lc-display text-base text-ink whitespace-nowrap">
                        {formatSoles(item.product.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => remove(item.variant.id)}
                      className="self-start mt-2 lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute hover:text-ink transition-colors"
                    >
                      {t("Eliminar", "Remove")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-rule px-5 sm:px-6 py-5 flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <span className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft">
                {t("Subtotal", "Subtotal")}
              </span>
              <span className="lc-display text-2xl text-ink">{formatSoles(total)}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="lc-btn lc-btn-primary w-full">
              {t("Continuar al checkout", "Continue to checkout")} →
            </Link>
            <p className="lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute text-center">
              {PAYMENT_METHODS}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
