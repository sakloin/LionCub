"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LanguageContext";
import { LionMark } from "../LogoMark";
import { formatSoles } from "../../lib/money";
import { metodosDePagoVisibles } from "../../lib/payment-info";
import { CULQI_ENABLED } from "../../lib/feature-flags";
import { useDialog } from "../../lib/useDialog";

/** Tope de stock en la bolsa: el stock que tenía la variante al elegirla. */
function atMax(item: { quantity: number; variant: { stock_at_pick: number } }): boolean {
  return item.variant.stock_at_pick > 0 && item.quantity >= item.variant.stock_at_pick;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, count, total, remove, updateQty } = useCart();
  const { t } = useLang();
  const paymentMethods = metodosDePagoVisibles(CULQI_ENABLED).map((m) => t(m.es, m.en)).join(" · ");
  const panelRef = useRef<HTMLElement>(null);
  useDialog(panelRef, open, onClose);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden
        />
      )}
      {/* Cerrada: inert (sin foco ni lector de pantalla). Abierta: diálogo modal. */}
      <aside
        ref={panelRef}
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-bg z-50 flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: open ? "var(--lc-shadow-3)" : "none" }}
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label={t("Bolsa", "Bag")}
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-rule">
          <div className="flex items-center justify-between">
            <span className="lc-mono uppercase text-[12px] tracking-[0.18em] text-ink-soft">
              {t("Bolsa", "Bag")}
            </span>
            <button
              onClick={onClose}
              aria-label={t("Cerrar", "Close")}
              className="w-11 h-11 -mr-3 inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
            >
              <X size={20} />
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
              <Link href="/#coleccion" onClick={onClose} className="lc-btn lc-btn-outline mt-2">
                {t("Ver la colección", "Browse the collection")}
              </Link>
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
                    <h3 className="lc-display text-lg text-ink leading-tight truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-ink-soft mt-0.5">
                      {[item.variant.color_name, item.variant.size_name].filter(Boolean).join(" · ")}
                    </p>

                    <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                      {/* Quantity stepper — text glyphs, no icons */}
                      <div className="flex items-center border border-rule">
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity - 1)}
                          aria-label={t("Quitar una unidad", "Remove one")}
                          className="w-11 h-11 inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
                        >
                          −
                        </button>
                        <span className="lc-mono text-[14px] text-ink w-7 text-center" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity + 1)}
                          disabled={atMax(item)}
                          aria-label={atMax(item) ? t("Máximo disponible", "Maximum available") : t("Agregar una unidad", "Add one")}
                          title={atMax(item) ? t("No hay más unidades disponibles", "No more units available") : undefined}
                          className="w-11 h-11 inline-flex items-center justify-center text-ink hover:text-gold-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {(() => {
                        const unit = item.variant.unit_price_at_pick ?? item.product.price;
                        const base = item.variant.base_unit_price_at_pick ?? item.product.price;
                        const discounted = unit < base;
                        return (
                          <div className="flex items-baseline gap-2 whitespace-nowrap">
                            {discounted && (
                              <span className="lc-mono text-[12px] text-ink-soft line-through">
                                {formatSoles(base * item.quantity)}
                              </span>
                            )}
                            <span className="lc-display text-base text-ink">
                              {formatSoles(unit * item.quantity)}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <button
                      onClick={() => remove(item.variant.id)}
                      className="self-start mt-1 min-h-11 lc-mono uppercase text-[12px] tracking-[0.16em] text-ink-soft hover:text-ink underline underline-offset-4 transition-colors"
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
              <span className="lc-mono uppercase text-[12px] tracking-[0.18em] text-ink-soft">
                {t("Subtotal", "Subtotal")}
              </span>
              <span className="lc-display text-2xl text-ink">{formatSoles(total)}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="lc-btn lc-btn-primary w-full">
              {t("Continuar al checkout", "Continue to checkout")} →
            </Link>
            <p className="lc-mono uppercase text-[12px] tracking-[0.14em] text-ink-soft text-center leading-relaxed">
              {paymentMethods}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
