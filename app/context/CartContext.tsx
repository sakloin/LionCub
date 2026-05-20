"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "../lib/types";

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product, size: string, color: string) => void;
  remove: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartCtx>({ items:[], count:0, total:0, add:()=>{}, remove:()=>{}, updateQty:()=>{}, clear:()=>{} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try { const saved = localStorage.getItem("lioncub_cart"); if (saved) setItems(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("lioncub_cart", JSON.stringify(items));
  }, [items]);

  const key = (id: string, size: string, color: string) => `${id}|${size}|${color}`;

  function add(product: Product, size: string, color: string) {
    setItems(prev => {
      const k = key(product.id, size, color);
      const exists = prev.find(i => key(i.product.id, i.selectedSize, i.selectedColor) === k);
      if (exists) return prev.map(i => key(i.product.id, i.selectedSize, i.selectedColor) === k ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  }

  function remove(productId: string, size: string, color: string) {
    setItems(prev => prev.filter(i => key(i.product.id, i.selectedSize, i.selectedColor) !== key(productId, size, color)));
  }

  function updateQty(productId: string, size: string, color: string, qty: number) {
    if (qty <= 0) { remove(productId, size, color); return; }
    setItems(prev => prev.map(i => key(i.product.id, i.selectedSize, i.selectedColor) === key(productId, size, color) ? { ...i, quantity: qty } : i));
  }

  function clear() { setItems([]); }

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + Math.round(i.product.price * 100) * i.quantity, 0) / 100;

  return <CartContext.Provider value={{ items, count, total, add, remove, updateQty, clear }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
