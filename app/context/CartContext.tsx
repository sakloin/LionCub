"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product, ProductVariant } from "../lib/types";

interface VariantPick {
  variant: ProductVariant;
  /** Optional override for size/color names if the variant object doesn't
   *  carry the joined size/color records. Defaults to variant.size?.name etc. */
  sizeName?: string;
  colorName?: string;
  /** Post-discount unit price the user picked at. Defaults to
   *  variant.price_override ?? product.price (no discount). */
  unitPrice?: number;
  /** Pre-discount unit price (variant.price_override ?? product.price).
   *  Stored so the cart can show a strikethrough. */
  basePrice?: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  /** Add a specific variant of a product to the cart. The cart keys items by
   *  variant_id so two different size/colour combos of the same product
   *  count as separate cart rows. */
  add: (product: Product, pick: VariantPick) => void;
  /** Remove a cart line by variant_id. The (productId,size,color) signature
   *  is retained as a thin wrapper for older call sites — the CartDrawer
   *  already passes variant.id via item.variant.id. */
  remove: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartCtx>({
  items: [], count: 0, total: 0,
  add: () => {}, remove: () => {}, updateQty: () => {}, clear: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lioncub_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Drop legacy entries (pre-variants) — they don't have a variant
        // object and can't be added to an order under the new schema.
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((i: unknown) => {
            return !!i && typeof i === "object" && "variant" in i && !!(i as { variant?: unknown }).variant;
          }) as CartItem[]);
        }
      }
    } catch {
      /* corrupt localStorage — start empty */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lioncub_cart", JSON.stringify(items));
  }, [items]);

  function add(product: Product, pick: VariantPick) {
    const v = pick.variant;
    const sizeName  = pick.sizeName  ?? v.size?.name  ?? "";
    const colorName = pick.colorName ?? v.color?.name ?? "";
    const basePrice = pick.basePrice ?? v.price_override ?? product.price;
    const unitPrice = pick.unitPrice ?? basePrice;
    setItems(prev => {
      const exists = prev.find(i => i.variant.id === v.id);
      if (exists) {
        return prev.map(i => i.variant.id === v.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          product,
          variant: {
            id: v.id,
            size_name: sizeName,
            color_name: colorName,
            stock_at_pick: v.stock,
            unit_price_at_pick: unitPrice,
            base_unit_price_at_pick: basePrice,
          },
          quantity: 1,
          selectedSize: sizeName,
          selectedColor: colorName,
        },
      ];
    });
  }

  function remove(variantId: string) {
    setItems(prev => prev.filter(i => i.variant.id !== variantId));
  }

  function updateQty(variantId: string, qty: number) {
    if (qty <= 0) { remove(variantId); return; }
    setItems(prev => prev.map(i => i.variant.id === variantId ? { ...i, quantity: qty } : i));
  }

  function clear() { setItems([]); }

  const count = items.reduce((s, i) => s + i.quantity, 0);
  // Price = post-discount snapshot when present (offers system), else
  // variant override, else product base. The server still reprices on order
  // submit — this is just for the cart display.
  const total = items.reduce((acc, i) => {
    const v = i.product.variants?.find(x => x.id === i.variant.id);
    const unit = i.variant.unit_price_at_pick ?? v?.price_override ?? i.product.price;
    return acc + Math.round(unit * 100) * i.quantity;
  }, 0) / 100;

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
