"use client";

import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LanguageContext";
import Image from "next/image";
import Link from "next/link";

interface Props { open: boolean; onClose: () => void; }

export default function CartDrawer({ open, onClose }: Props) {
  const { items, count, total, remove, updateQty } = useCart();
  const { t } = useLang();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5EDD8]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[#D4A520]" />
            <h2 className="font-bold text-[#3D2010]">{t("Carrito", "Cart")} ({count})</h2>
          </div>
          <button onClick={onClose} className="text-[#9B6B45] hover:text-[#3D2010]"><X size={20} /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
              <ShoppingCart size={40} className="text-[#F5EDD8]" />
              <p className="text-[#9B6B45]">{t("Tu carrito está vacío", "Your cart is empty")}</p>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.product.id}|${item.selectedSize}|${item.selectedColor}`} className="flex gap-3 bg-[#FDF8F0] rounded-2xl p-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 bg-[#F5EDD8]">
                  <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#3D2010] text-sm leading-tight line-clamp-1">{item.product.name}</p>
                  <p className="text-[#9B6B45] text-xs">{item.selectedSize} · {item.selectedColor}</p>
                  <p className="font-extrabold text-[#D4A520] text-sm mt-1">S/ {item.product.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)} className="w-6 h-6 rounded-full bg-[#F5EDD8] flex items-center justify-center text-[#6B3D1E] hover:bg-[#D4A520] hover:text-white transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-[#3D2010] w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)} className="w-6 h-6 rounded-full bg-[#F5EDD8] flex items-center justify-center text-[#6B3D1E] hover:bg-[#D4A520] hover:text-white transition-colors">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => remove(item.product.id, item.selectedSize, item.selectedColor)} className="ml-auto text-[#9B6B45] hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#F5EDD8] px-5 py-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[#9B6B45] font-semibold">{t("Subtotal", "Subtotal")}</span>
              <span className="font-extrabold text-[#3D2010] text-lg">S/ {total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full bg-[#D4A520] text-white font-bold py-3.5 rounded-xl text-center hover:bg-[#A07D10] transition-colors"
            >
              {t("Proceder al pago", "Proceed to checkout")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
