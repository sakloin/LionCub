"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { LionMark } from "./LogoMark";
import { supabase } from "../lib/supabase";
import type { Product } from "../lib/types";
import data from "../data/productos.json";

const { categories, products } = data;

type Prod = (typeof products)[0];

// Editorial, desaturated swatch palette (ported from design-handoff tokens).
const COLOR_HEX: Record<string, string> = {
  Blanco: "#FAF7EF",
  Beige: "#E9DDC4",
  Celeste: "#C9D9E4",
  Rosa: "#F2C9C2",
  "Palo Rosa": "#EDD3CC",
  Azul: "#A8B8CB",
  Crema: "#F0E3CB",
  Durazno: "#EDC8B0",
  "Verde menta": "#C8D6BD",
  Floral: "linear-gradient(45deg, #F2C9C2, #C8D6BD)",
};
const swatchBg = (c: string) => COLOR_HEX[c] ?? "#CFC3AE";

// Map a JSON product onto the Cart's Product shape (cart reads id/name/price/image).
function toCartProduct(p: Prod) {
  return {
    ...p,
    cost: 0,
    stock: 99,
    has_offer: p.hasOffer,
    image_url: `/${p.image}`,
    active: true,
    created_at: "",
  } as unknown as Product;
}

// ── Selection mini-sheet ──────────────────────────────────────────────────
// Clean cards open this sheet to pick size + color before adding to the bag.

function SelectionSheet({ product, onClose }: { product: Prod; onClose: () => void }) {
  const { t } = useLang();
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleAdd() {
    add(toCartProduct(product), size, color);
    setAdded(true);
    setTimeout(onClose, 1100);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="bg-bg w-full sm:max-w-md rounded-t-2xl sm:rounded-sm shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-5 sm:p-6 border-b border-rule">
          <div className="lc-plate w-16 h-20 shrink-0 rounded-sm">
            <Image
              src={`/products/${product.id}.jpeg`}
              alt={product.name}
              width={64}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            {product.gender !== "Unisex" && (
              <p className="lc-mono uppercase text-[9px] tracking-[0.24em] text-ink-mute">
                {product.gender}
              </p>
            )}
            <h3 className="lc-display text-xl text-ink leading-tight mt-0.5">{product.name}</h3>
            <p className="lc-display-i text-sm text-ink-soft">{product.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Cerrar", "Close")}
            className="text-ink-mute hover:text-ink transition-colors -mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {added ? (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <LionMark size={48} color="var(--color-gold-deep)" />
            <p className="lc-display text-2xl text-ink">{t("En tu bolsa", "In your bag")}</p>
            <p className="text-sm text-ink-soft">
              {t("Lo agregamos con cuidado.", "Added with care.")}
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 flex flex-col gap-6">
            {/* Color */}
            {product.colors.length > 0 && (
              <div>
                <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-3">
                  {t("Color", "Color")} ·{" "}
                  <span className="text-ink">{color || t("Elige", "Pick")}</span>
                </p>
                <div className="flex flex-wrap gap-3.5">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={c}
                      title={c}
                      className="rounded-full"
                      style={{
                        boxShadow:
                          color === c
                            ? "0 0 0 1px var(--color-ink), 0 0 0 4px var(--color-bg)"
                            : "none",
                      }}
                    >
                      <span className="lc-sw lc-sw-lg" style={{ background: swatchBg(c) }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
              <div>
                <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-3">
                  {t("Talla", "Size")} ·{" "}
                  <span className="text-ink">{size || t("Elige", "Pick")}</span>
                </p>
                <div className="flex gap-2.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`flex-1 text-center py-3 lc-mono uppercase text-[11px] tracking-[0.16em] border transition-colors ${
                        size === s
                          ? "border-ink bg-ink text-bg"
                          : "border-rule text-ink-soft hover:border-ink"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-baseline justify-between pt-1">
              <span className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute">
                {product.material}
              </span>
              <span className="lc-display text-2xl text-ink">
                <span className="lc-mono text-xs text-ink-mute mr-1">S/</span>
                {product.price}
              </span>
            </div>

            <button type="button" onClick={handleAdd} className="lc-btn lc-btn-primary w-full">
              {t("Agregar a la bolsa", "Add to bag")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Waitlist modal ──────────────────────────────────────────────────────────

function WaitlistModal({ product, onClose }: { product: Prod; onClose: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError(t("Ingresa tu nombre", "Enter your name"));
      return;
    }
    if (!contact.trim()) {
      setFormError(t("Ingresa tu correo o teléfono", "Enter your email or phone"));
      return;
    }
    const isEmail = contact.includes("@");
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      setFormError(t("Correo no válido", "Invalid email"));
      return;
    }
    if (!isEmail && contact.replace(/\D/g, "").length < 9) {
      setFormError(
        t("El teléfono debe tener al menos 9 dígitos", "Phone needs at least 9 digits")
      );
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        product_id: product.id,
        customer_name: name.trim(),
        email: isEmail ? contact.trim() : null,
        phone: !isEmail ? contact.trim() : null,
        size: size || null,
        color: color || null,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : t("Error al guardar. Intenta de nuevo.", "Couldn't save. Try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="bg-bg w-full sm:max-w-md rounded-t-2xl sm:rounded-sm shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="px-6 py-12 flex flex-col items-center text-center gap-4">
            <LionMark size={52} color="var(--color-gold-deep)" />
            <p className="lc-display text-3xl text-ink">{t("Listo", "Done")}</p>
            <p className="text-sm text-ink-soft max-w-xs">
              {t(
                "Te escribiremos apenas esta pieza vuelva a estar disponible.",
                "We'll write to you the moment this piece is back in stock."
              )}
            </p>
            <button onClick={onClose} className="lc-btn lc-btn-primary w-full mt-2">
              {t("Cerrar", "Close")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="lc-eyebrow mb-1.5">{t("Lista de espera", "Waitlist")}</p>
                <h3 className="lc-display text-2xl text-ink leading-tight">
                  {t("Avísame cuando llegue", "Notify me when it's back")}
                </h3>
                <p className="lc-display-i text-sm text-ink-soft mt-0.5">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("Cerrar", "Close")}
                className="text-ink-mute hover:text-ink transition-colors mt-1"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">
                {t("Nombre", "Name")} *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Tu nombre", "Your name")}
                className="lc-input"
              />
            </div>

            <div>
              <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">
                {t("Correo o teléfono", "Email or phone")} *
              </label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="correo@ejemplo.com · 987654321"
                className="lc-input"
              />
            </div>

            {product.sizes.length > 0 && (
              <div>
                <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">
                  {t("Talla de interés", "Size of interest")}
                </label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="lc-input">
                  <option value="">{t("Sin preferencia", "No preference")}</option>
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {product.colors.length > 0 && (
              <div>
                <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">
                  {t("Color de interés", "Color of interest")}
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="lc-input"
                >
                  <option value="">{t("Sin preferencia", "No preference")}</option>
                  {product.colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formError && <p className="text-xs text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="lc-btn lc-btn-primary w-full disabled:opacity-60"
            >
              {submitting
                ? t("Enviando…", "Sending…")
                : t("Avísame cuando haya stock", "Notify me when in stock")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Product card (clean) ──────────────────────────────────────────────────────

function ProductCard({
  product,
  stock,
  onSelect,
  onWaitlist,
}: {
  product: Prod;
  stock: number | undefined;
  onSelect: () => void;
  onWaitlist: () => void;
}) {
  const { t } = useLang();
  const [imgError, setImgError] = useState(false);
  const outOfStock = stock === 0;

  return (
    <button type="button" onClick={outOfStock ? onWaitlist : onSelect} className="group text-left flex flex-col">
      {/* Image plate */}
      <div className="relative lc-plate aspect-[4/5] rounded-sm bg-pink-soft">
        {!imgError ? (
          <Image
            src={`/products/${product.id}.jpeg`}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              outOfStock ? "opacity-70" : ""
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-mute">
            <LionMark size={56} />
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/30">
            <span className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink bg-bg px-3 py-1.5">
              {t("Agotado", "Sold out")}
            </span>
          </div>
        )}

        {product.hasOffer && !outOfStock && (
          <span className="absolute top-3 left-3 lc-mono uppercase text-[9px] tracking-[0.2em] text-gold-deep bg-bg/90 px-2.5 py-1">
            3 × 15%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-4 flex flex-col">
        {product.gender !== "Unisex" && (
          <p className="lc-mono uppercase text-[9px] tracking-[0.24em] text-ink-mute mb-1">
            {product.gender}
          </p>
        )}
        <h3 className="lc-display text-lg text-ink leading-tight">{product.name}</h3>
        <p className="lc-display-i text-[13px] text-ink-soft mt-0.5">{product.tagline}</p>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c} className="lc-sw" style={{ background: swatchBg(c) }} title={c} />
            ))}
          </div>
          <span className="lc-display text-base text-ink">
            <span className="lc-mono text-[10px] text-ink-mute mr-1">S/</span>
            {product.price}
          </span>
        </div>

        <span
          className={`mt-3 lc-mono uppercase text-[10px] tracking-[0.2em] ${
            outOfStock ? "text-ink-mute" : "text-gold-deep"
          }`}
        >
          {outOfStock ? `${t("Avísame", "Notify me")} →` : `${t("Elegir talla", "Choose size")} →`}
        </span>
      </div>
    </button>
  );
}

// ── Collection ──────────────────────────────────────────────────────────────

export default function Collection() {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState("all");
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [selectProduct, setSelectProduct] = useState<Prod | null>(null);
  const [waitlistProduct, setWaitlistProduct] = useState<Prod | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,stock")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, number> = {};
        (data as { id: string; stock: number | null }[]).forEach((p) => {
          if (typeof p.stock === "number") map[p.id] = p.stock;
        });
        setStockMap(map);
      });
  }, []);

  const filtered =
    activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

  const grouped = categories
    .map((cat) => ({ ...cat, items: filtered.filter((p) => p.category === cat.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <section id="coleccion" className="bg-bg py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="lc-eyebrow mb-4">{t("La colección completa", "The complete collection")}</p>
          <h2 className="lc-display text-4xl sm:text-5xl leading-[1] tracking-[-0.02em] text-ink">
            {t("Nuestra", "Our")}{" "}
            <em className="lc-display-i text-gold-deep">{t("colección.", "collection.")}</em>
          </h2>
          <p className="mt-5 text-base leading-relaxed font-light text-ink-soft">
            {t(
              "Cada pieza, 100% algodón Pima peruano. Sin mezclas, sin compromisos.",
              "Every piece, 100% Peruvian Pima cotton. No blends, no compromises."
            )}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-14">
          <button
            onClick={() => setActiveCategory("all")}
            className={`lc-pill transition-colors ${
              activeCategory === "all" ? "border-ink bg-ink text-bg" : "hover:border-ink hover:text-ink"
            }`}
          >
            {t("Todo", "All")} · {products.length}
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`lc-pill transition-colors ${
                  activeCategory === cat.id
                    ? "border-ink bg-ink text-bg"
                    : "hover:border-ink hover:text-ink"
                }`}
              >
                {cat.name} · {count}
              </button>
            );
          })}
        </div>

        {/* Groups */}
        {grouped.map((group) => {
          const hasOffer = group.id !== "conjuntos";
          return (
            <div key={group.id} className="mb-16 last:mb-0">
              <div className="flex items-end gap-4 mb-8 pb-4 border-b border-rule">
                <div>
                  <h3 className="lc-display text-2xl sm:text-3xl text-ink leading-tight">
                    {group.name}
                  </h3>
                  <p className="text-sm text-ink-soft mt-1 font-light">{group.desc}</p>
                </div>
                {hasOffer && (
                  <span className="ml-auto shrink-0 lc-pill lc-pill-gold whitespace-nowrap">
                    {t("Oferta 3 × 15%", "Offer 3 × 15%")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                {group.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    stock={stockMap[product.id]}
                    onSelect={() => setSelectProduct(product)}
                    onWaitlist={() => setWaitlistProduct(product)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectProduct && (
        <SelectionSheet product={selectProduct} onClose={() => setSelectProduct(null)} />
      )}
      {waitlistProduct && (
        <WaitlistModal product={waitlistProduct} onClose={() => setWaitlistProduct(null)} />
      )}
    </section>
  );
}
