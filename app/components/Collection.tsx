"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { LionMark } from "./LogoMark";
import { supabase } from "../lib/supabase";
import type { Product, ProductVariant, Offer } from "../lib/types";
import { bestOfferFor, effectivePrice } from "../lib/offers";
import { formatSoles } from "../lib/money";

// ── Categories ────────────────────────────────────────────────────────────
// Editorial labels for the category strip. The product.category column is the
// canonical id used both in /admin and in the public filter. Unknown
// categories fall back to a "Otros" group at the end. Offer badges are
// driven by /admin/ofertas (Fase 4), so there is no hard-coded offer flag
// here anymore.

interface CategoryDef {
  id: string;
  name: string;
  desc: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "conjuntos",
    name: "Conjuntos & Ajuares",
    desc: "Sets completos hechos para el primer abrazo y los días que siguen.",
  },
  { id: "bodies",  name: "Bodies",  desc: "La prenda base del guardarropa — suave, versátil, esencial." },
  { id: "baberos", name: "Baberos", desc: "Los detalles tiernos que cuidan cada comida." },
  { id: "mantas",  name: "Mantas",  desc: "Abrigos ligeros que envuelven con dulzura." },
  { id: "pantalones", name: "Pantalones", desc: "Comodidad y estilo para los primeros días de exploración." },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function swatchBg(hex: string | null | undefined): string {
  return hex ?? "#CFC3AE";
}

/** Sum of active variant stocks. A product with zero stock across the board is
 *  treated as sold-out and routes the card click to the waitlist. */
function totalStock(p: Product): number {
  return (p.variants ?? []).filter(v => v.active).reduce((s, v) => s + v.stock, 0);
}

/** Distinct colour list for a product (one swatch per colour regardless of
 *  size), sorted by appearance. */
function distinctColors(p: Product): { id: string; name: string; hex: string | null }[] {
  const seen = new Map<string, { id: string; name: string; hex: string | null }>();
  for (const v of p.variants ?? []) {
    if (!v.active || !v.color) continue;
    if (!seen.has(v.color_id)) {
      seen.set(v.color_id, { id: v.color_id, name: v.color.name, hex: v.color.hex_code });
    }
  }
  return [...seen.values()];
}

// ── Selection mini-sheet ──────────────────────────────────────────────────
// Kukuli-style flow: pick a size first → only the colours available for that
// size are enabled → confirm the (size,colour) variant and add to bag.

function SelectionSheet({ product, offer, onClose }: { product: Product; offer: Offer | null; onClose: () => void }) {
  const { t } = useLang();
  const { add } = useCart();

  // Only consider active variants with positive stock for selection.
  const buyable = (product.variants ?? []).filter(v => v.active && v.stock > 0);

  // Unique sizes (sorted by sort_order) and unique colours, both restricted to
  // variants the customer can actually purchase.
  const sizes = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sort_order: number }>();
    for (const v of buyable) {
      if (!v.size) continue;
      if (!map.has(v.size_id)) map.set(v.size_id, { id: v.size_id, name: v.size.name, sort_order: v.size.sort_order });
    }
    return [...map.values()].sort((a, b) => a.sort_order - b.sort_order);
  }, [buyable]);

  const [sizeId, setSizeId] = useState<string>(sizes[0]?.id ?? "");

  const colorsForSize = useMemo(() => {
    if (!sizeId) return [];
    const map = new Map<string, { id: string; name: string; hex: string | null; variantId: string; stock: number }>();
    for (const v of buyable) {
      if (v.size_id !== sizeId || !v.color) continue;
      if (!map.has(v.color_id)) {
        map.set(v.color_id, {
          id: v.color_id,
          name: v.color.name,
          hex: v.color.hex_code,
          variantId: v.id,
          stock: v.stock,
        });
      }
    }
    return [...map.values()];
  }, [sizeId, buyable]);

  const [colorId, setColorId] = useState<string>("");
  // Reset the colour pick whenever the size changes, defaulting to the first
  // available one so the user can confirm fast.
  useEffect(() => {
    setColorId(colorsForSize[0]?.id ?? "");
  }, [colorsForSize]);

  const selectedVariant = buyable.find(v => v.size_id === sizeId && v.color_id === colorId) ?? null;
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleAdd() {
    if (!selectedVariant) return;
    add(product, {
      variant: selectedVariant,
      basePrice,
      unitPrice: displayPrice,
    });
    setAdded(true);
    setTimeout(onClose, 1100);
  }

  const basePrice = selectedVariant?.price_override ?? product.price;
  const displayPrice = effectivePrice(basePrice, offer);

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
              src={product.image_url || `/products/${product.id}.jpeg`}
              alt={product.name}
              width={64}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            {product.gender && product.gender !== "Unisex" && (
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
            {/* Size — pick first */}
            {sizes.length > 0 && (
              <div>
                <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-3">
                  {t("Talla", "Size")} ·{" "}
                  <span className="text-ink">
                    {sizes.find(s => s.id === sizeId)?.name ?? t("Elige", "Pick")}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSizeId(s.id)}
                      className={`min-w-[3rem] text-center py-3 px-4 lc-mono uppercase text-[11px] tracking-[0.16em] border transition-colors ${
                        sizeId === s.id
                          ? "border-ink bg-ink text-bg"
                          : "border-rule text-ink-soft hover:border-ink"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color — only those available for the chosen size */}
            {colorsForSize.length > 0 && (
              <div>
                <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-3">
                  {t("Color", "Color")} ·{" "}
                  <span className="text-ink">
                    {colorsForSize.find(c => c.id === colorId)?.name ?? t("Elige", "Pick")}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3.5">
                  {colorsForSize.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorId(c.id)}
                      aria-label={c.name}
                      title={c.name}
                      className="rounded-full"
                      style={{
                        boxShadow:
                          colorId === c.id
                            ? "0 0 0 1px var(--color-ink), 0 0 0 4px var(--color-bg)"
                            : "none",
                      }}
                    >
                      <span className="lc-sw lc-sw-lg" style={{ background: swatchBg(c.hex) }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock readout for the picked variant */}
            {selectedVariant && (
              <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute">
                {selectedVariant.stock === 1
                  ? t("1 unidad disponible", "1 unit available")
                  : `${selectedVariant.stock} ${t("unidades disponibles", "units available")}`}
              </p>
            )}

            <div className="flex items-baseline justify-between pt-1">
              <span className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute">
                {product.material}
              </span>
              <div className="flex items-baseline gap-2">
                {offer && (
                  <span className="lc-mono text-xs text-ink-mute line-through">
                    {formatSoles(basePrice)}
                  </span>
                )}
                <span className="lc-display text-2xl text-ink">
                  <span className="lc-mono text-xs text-ink-mute mr-1">S/</span>
                  {displayPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedVariant}
              className="lc-btn lc-btn-primary w-full disabled:opacity-50"
            >
              {selectedVariant ? t("Agregar a la bolsa", "Add to bag") : t("Elige una variante", "Pick a variant")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Waitlist modal ──────────────────────────────────────────────────────────

function WaitlistModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Distinct sizes/colours available across the product's variants (even out
  // of stock — the customer is signalling intent, not buying right now).
  const sizes  = [...new Set((product.variants ?? []).map(v => v.size?.name).filter(Boolean) as string[])];
  const colors = [...new Set((product.variants ?? []).map(v => v.color?.name).filter(Boolean) as string[])];

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
      setFormError(t("El teléfono debe tener al menos 9 dígitos", "Phone needs at least 9 digits"));
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        product_id: product.id,
        customer_name: name.trim(),
        email: isEmail ? contact.trim() : null,
        phone: !isEmail ? contact.trim() : null,
        size:  size  || null,
        color: color || null,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      const detail =
        err && typeof err === "object"
          ? (err as { message?: string }).message ?? JSON.stringify(err)
          : String(err);
      setFormError(detail || t("Error al guardar. Intenta de nuevo.", "Couldn't save. Try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40" onClick={onClose}>
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

            {sizes.length > 0 && (
              <div>
                <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">
                  {t("Talla de interés", "Size of interest")}
                </label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="lc-input">
                  <option value="">{t("Sin preferencia", "No preference")}</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">
                  {t("Color de interés", "Color of interest")}
                </label>
                <select value={color} onChange={(e) => setColor(e.target.value)} className="lc-input">
                  <option value="">{t("Sin preferencia", "No preference")}</option>
                  {colors.map((c) => (
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

// ── Product card ────────────────────────────────────────────────────────────

function ProductCard({
  product,
  offer,
  onSelect,
  onWaitlist,
}: {
  product: Product;
  offer: Offer | null;
  onSelect: () => void;
  onWaitlist: () => void;
}) {
  const { t } = useLang();
  const [imgError, setImgError] = useState(false);
  const stock = totalStock(product);
  const outOfStock = stock === 0;
  const swatches = distinctColors(product).slice(0, 4);
  // Pick the primary / hover images from product_images. Fall back to the
  // legacy products.image_url field (Fase 1 / 2 products before a gallery
  // was uploaded) so cards never go blank during the migration.
  const imgs       = product.images ?? [];
  const primaryUrl = imgs.find(i => i.is_primary)?.url ?? product.image_url ?? null;
  const hoverUrl   = imgs.find(i => i.is_hover)?.url ?? null;

  return (
    <button type="button" onClick={outOfStock ? onWaitlist : onSelect} className="group text-left flex flex-col">
      {/* Image plate */}
      <div className="relative lc-plate aspect-[4/5] rounded-sm bg-pink-soft">
        {!imgError && primaryUrl ? (
          <>
            <Image
              src={primaryUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-[opacity,transform] duration-[600ms] ease-in-out ${
                hoverUrl ? "md:group-hover:opacity-0 md:group-hover:scale-[1.02]" : ""
              } ${outOfStock ? "opacity-70" : ""}`}
              onError={() => setImgError(true)}
            />
            {hoverUrl && (
              <Image
                src={hoverUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover opacity-0 transition-[opacity,transform] duration-[600ms] ease-in-out hidden md:block md:group-hover:opacity-100 md:group-hover:scale-[1.02] ${
                  outOfStock ? "md:group-hover:opacity-70" : ""
                }`}
              />
            )}
          </>
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

        {offer && !outOfStock && (
          <span className="absolute top-3 left-3 lc-mono uppercase text-[9px] tracking-[0.2em] text-gold-deep bg-bg/90 px-2.5 py-1">
            −{Math.round(offer.discount_percent)}%
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
            {swatches.map((c) => (
              <span key={c.id} className="lc-sw" style={{ background: swatchBg(c.hex) }} title={c.name} />
            ))}
          </div>
          <div className="flex items-baseline gap-1.5">
            {offer && (
              <span className="lc-mono text-[10px] text-ink-mute line-through">
                {product.price}
              </span>
            )}
            <span className="lc-display text-base text-ink">
              <span className="lc-mono text-[10px] text-ink-mute mr-1">S/</span>
              {effectivePrice(product.price, offer).toFixed(2)}
            </span>
          </div>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [waitlistProduct, setWaitlistProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // PostgREST join: pull the variants (and their joined size/color) in the
      // same round trip so the public store never re-queries per row.
      // Offers are fetched in parallel; RLS already filters out paused or
      // expired offers for anon users.
      const [productsRes, offersRes] = await Promise.all([
        supabase
          .from("products")
          .select(
            `
            id, sku, name, tagline, description, category, price, cost,
            gender, material, has_offer, image_url, active, created_at,
            variants:product_variants(
              id, product_id, size_id, color_id, sku_variant, stock,
              cost, price_override, active,
              size:product_sizes(id, name, sort_order, active),
              color:product_colors(id, name, hex_code, active)
            ),
            images:product_images(
              id, product_id, url, storage_path, sort_order,
              is_primary, is_hover, alt_text, image_type, color_id
            )
            `
          )
          .eq("active", true)
          .order("created_at", { ascending: true }),
        supabase.from("offers").select("*").eq("active", true),
      ]);
      if (cancelled) return;
      if (productsRes.error) {
        console.error("[Collection] products fetch failed:", productsRes.error.message);
        setProducts([]);
      } else {
        setProducts((productsRes.data ?? []) as unknown as Product[]);
      }
      if (offersRes.error) {
        console.error("[Collection] offers fetch failed:", offersRes.error.message);
        setOffers([]);
      } else {
        setOffers((offersRes.data ?? []) as Offer[]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Per-product offer lookup (most specific live offer wins). Memoised
  // because both ProductCard and the SelectionSheet need it.
  const offerFor = useMemo(() => {
    const map = new Map<string, ReturnType<typeof bestOfferFor>>();
    products.forEach(p => map.set(p.id, bestOfferFor({ id: p.id, category: p.category }, offers)));
    return (id: string) => map.get(id) ?? null;
  }, [products, offers]);

  // Group by category and only show categories that have products. Unknown
  // categories surface in an "Otros" bucket so a new category id from the
  // admin doesn't disappear from the storefront.
  const grouped = useMemo(() => {
    const filtered =
      activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);
    const known = CATEGORIES.map((c) => ({ ...c, items: filtered.filter((p) => p.category === c.id) }));
    const knownIds = new Set(CATEGORIES.map((c) => c.id));
    const others = filtered.filter((p) => !knownIds.has(p.category));
    if (others.length > 0) {
      known.push({ id: "_otros", name: "Otros", desc: "", items: others });
    }
    return known.filter((g) => g.items.length > 0);
  }, [products, activeCategory]);

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
        {products.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2.5 mb-14">
            <button
              onClick={() => setActiveCategory("all")}
              className={`lc-pill transition-colors ${
                activeCategory === "all" ? "border-ink bg-ink text-bg" : "hover:border-ink hover:text-ink"
              }`}
            >
              {t("Todo", "All")} · {products.length}
            </button>
            {CATEGORIES.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              if (count === 0) return null;
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
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute">
              {t("Cargando…", "Loading…")}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-5">
            <LionMark size={64} color="var(--color-ink-mute)" />
            <p className="lc-display text-2xl text-ink max-w-md">
              {t("Pronto llegan novedades.", "New pieces coming soon.")}
            </p>
            <p className="text-sm text-ink-soft max-w-md">
              {t(
                "Estamos preparando cada pieza con detalle. Vuelve pronto.",
                "We're preparing each piece carefully. Come back soon."
              )}
            </p>
          </div>
        )}

        {/* Groups */}
        {!loading && grouped.map((group) => (
          <div key={group.id} className="mb-16 last:mb-0">
            <div className="flex items-end gap-4 mb-8 pb-4 border-b border-rule">
              <div>
                <h3 className="lc-display text-2xl sm:text-3xl text-ink leading-tight">
                  {group.name}
                </h3>
                {group.desc && <p className="text-sm text-ink-soft mt-1 font-light">{group.desc}</p>}
              </div>
              {(() => {
                const live = offers.find(
                  o => o.scope_type === "category" && o.category === group.id,
                );
                if (!live) return null;
                return (
                  <span className="ml-auto shrink-0 lc-pill lc-pill-gold whitespace-nowrap">
                    {t(`Oferta −${Math.round(live.discount_percent)}%`, `Offer −${Math.round(live.discount_percent)}%`)}
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {group.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  offer={offerFor(product.id)}
                  onSelect={() => setSelectProduct(product)}
                  onWaitlist={() => setWaitlistProduct(product)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectProduct && (
        <SelectionSheet
          product={selectProduct}
          offer={offerFor(selectProduct.id)}
          onClose={() => setSelectProduct(null)}
        />
      )}
      {waitlistProduct && (
        <WaitlistModal product={waitlistProduct} onClose={() => setWaitlistProduct(null)} />
      )}
    </section>
  );
}
