"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCart, Tag, Check, Bell, X } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { formatSoles } from "../lib/money";
import data from "../data/productos.json";

const { brand, categories, products } = data;

const colorHex: Record<string, string> = {
  Blanco: "#FFFFFF",
  Beige: "#D4B896",
  Celeste: "#87CEEB",
  Rosa: "#FFB6C1",
  "Palo Rosa": "#FFD1DC",
  Azul: "#4A90D9",
  "Verde menta": "#A8D8A8",
  Crema: "#FFF5DC",
  Durazno: "#FFCBA4",
  Floral: "#F7C5CC",
  Blanco_border: "#E0E0E0",
  Crema_border: "#DDD5C0",
  Floral_border: "#E8B4BB",
};

// ── Waitlist modal ──────────────────────────────────────────────────────────

interface WaitlistModalProps {
  product: (typeof products)[0];
  onClose: () => void;
}

function WaitlistModal({ product, onClose }: WaitlistModalProps) {
  const [name,       setName]       = useState("");
  const [contact,    setContact]    = useState("");
  const [size,       setSize]       = useState(product.sizes[0] ?? "");
  const [color,      setColor]      = useState(product.colors[0] ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) { setFormError("Ingresa tu nombre"); return; }
    if (!contact.trim()) { setFormError("Ingresa tu correo o teléfono"); return; }
    const isEmail = contact.includes("@");
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      setFormError("Correo no válido"); return;
    }
    if (!isEmail && contact.replace(/\D/g, "").length < 9) {
      setFormError("El teléfono debe tener al menos 9 dígitos"); return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        product_id:    product.id,
        customer_name: name.trim(),
        email:         isEmail ? contact.trim() : null,
        phone:         !isEmail ? contact.trim() : null,
        size:          size  || null,
        color:         color || null,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (e: any) {
      setFormError(e?.message ?? "Error al guardar. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
        {success ? (
          <div className="text-center py-4 flex flex-col gap-4">
            <p className="text-5xl">🦁</p>
            <p className="font-extrabold text-[#3D2010] text-xl">¡Listo!</p>
            <p className="text-[#9B6B45] text-sm">Te avisaremos apenas tengamos stock 🦁</p>
            <button onClick={onClose}
              className="w-full bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-[#3D2010] text-lg">Avísame cuando llegue</h3>
                <p className="text-[#9B6B45] text-xs mt-0.5">{product.name}</p>
              </div>
              <button type="button" onClick={onClose} className="text-[#9B6B45] hover:text-[#3D2010] transition-colors mt-0.5">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Nombre *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Correo o teléfono *</label>
              <input
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="correo@ejemplo.com ó 987654321"
                className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>

            {product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Talla de interés</label>
                <select value={size} onChange={e => setSize(e.target.value)}
                  className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]">
                  <option value="">Sin preferencia</option>
                  {product.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Color de interés</label>
                <select value={color} onChange={e => setColor(e.target.value)}
                  className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]">
                  <option value="">Sin preferencia</option>
                  {product.colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {formError && <p className="text-xs text-red-500">{formError}</p>}

            <button type="submit" disabled={submitting}
              className="w-full bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-60">
              {submitting ? "Enviando..." : "Avisarme cuando haya stock"}
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
  stock,
  onWaitlist,
}: {
  product: (typeof products)[0];
  stock: number | undefined;
  onWaitlist: () => void;
}) {
  const { t } = useLang();
  const { add } = useCart();
  const [imgError,       setImgError]       = useState(false);
  const [selectedSize,   setSelectedSize]   = useState(product.sizes[0] ?? "");
  const [selectedColor,  setSelectedColor]  = useState(product.colors[0] ?? "");
  const [added,          setAdded]          = useState(false);

  const outOfStock = stock === 0;

  function handleAdd() {
    add(
      { ...product, cost: 0, stock: 99, has_offer: product.hasOffer, image_url: `/${product.image}`, active: true, created_at: "" } as any,
      selectedSize, selectedColor
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#F5EDD8] flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-[#FDF8F0] overflow-hidden">
        {!imgError ? (
          <Image
            src={`/products/${product.id}.jpeg`}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🦁</div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-full tracking-wide">
              Agotado
            </span>
          </div>
        )}

        {/* Offer badge */}
        {product.hasOffer && !outOfStock && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#D4A520] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            <Tag size={10} />
            3 × 15% dto
          </div>
        )}

        {/* Gender badge */}
        {product.gender !== "Unisex" && (
          <div className="absolute top-3 right-3 bg-white/90 text-[#6B3D1E] text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {product.gender}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-[#3D2010] text-base leading-tight">{product.name}</h3>
            <p className="text-[#C4956A] text-xs mt-0.5 italic">{product.tagline}</p>
          </div>
          <span className="font-extrabold text-[#D4A520] text-lg whitespace-nowrap">
            {formatSoles(product.price)}
          </span>
        </div>

        {/* Description */}
        <p className="text-[#9B6B45] text-sm leading-relaxed line-clamp-3">{product.desc}</p>

        {/* Sizes */}
        <div>
          <p className="text-[#6B3D1E] text-xs font-bold mb-1.5">{t("Talla", "Size")}</p>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                disabled={outOfStock}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${selectedSize === size ? "bg-[#D4A520] text-white" : "bg-[#F5EDD8] text-[#6B3D1E] hover:bg-[#F0E0C0]"} ${outOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <p className="text-[#6B3D1E] text-xs font-bold mb-1.5">{t("Colores", "Colors")}</p>
          <div className="flex flex-wrap gap-2 items-center">
            {product.colors.map((color) => (
              <div key={color} className="flex items-center gap-1">
                <span
                  className="w-5 h-5 rounded-full border border-[#E0E0E0] flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: colorHex[color] ?? "#ccc" }}
                  title={color}
                />
                <span className="text-[10px] text-[#9B6B45]">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {outOfStock ? (
          <div className="mt-auto pt-1 flex flex-col gap-2">
            <div className="w-full flex items-center justify-center py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-bold">
              Agotado
            </div>
            <button
              onClick={onWaitlist}
              className="w-full flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl bg-[#F5EDD8] text-[#6B3D1E] hover:bg-[#F0E0C0] transition-all text-sm"
            >
              <Bell size={15} /> {t("Avísame cuando llegue", "Notify me")}
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className={`mt-auto pt-1 w-full flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl transition-all text-sm ${added ? "bg-green-500 text-white" : "bg-[#D4A520] text-white hover:bg-[#A07D10]"}`}
          >
            {added ? <><Check size={15} /> {t("¡Agregado!", "Added!")}</> : <><ShoppingCart size={15} /> {t("Agregar al carrito", "Add to cart")}</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Collection ──────────────────────────────────────────────────────────────

export default function Collection() {
  const { t } = useLang();
  const [activeCategory,  setActiveCategory]  = useState("all");
  const [stockMap,        setStockMap]        = useState<Record<string, number>>({});
  const [waitlistProduct, setWaitlistProduct] = useState<(typeof products)[0] | null>(null);

  useEffect(() => {
    supabase.from("products").select("id,stock").then(({ data }) => {
      if (!data) return;
      const map: Record<string, number> = {};
      data.forEach((p: any) => { if (typeof p.stock === "number") map[p.id] = p.stock; });
      setStockMap(map);
    });
  }, []);

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const grouped = categories
    .map((cat) => ({
      ...cat,
      items: filtered.filter((p) => p.category === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <section id="coleccion" className="bg-[#FDF8F0] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#D4A520] font-bold text-sm uppercase tracking-widest mb-2">
            {t("Lo que tenemos para ti", "What we have for you")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D2010] mb-3">
            {t("Nuestra Colección", "Our Collection")}
          </h2>
          <p className="text-[#9B6B45] max-w-lg mx-auto">
            {t(
              "Cada prenda, 100% Algodón Pima peruano. Sin mezclas, sin compromisos.",
              "Every garment, 100% Peruvian Pima cotton. No blends, no compromises."
            )}
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === "all"
                ? "bg-[#D4A520] text-white shadow-md"
                : "bg-[#F5EDD8] text-[#6B3D1E] hover:bg-[#F0E0C0]"
            }`}
          >
            {t("Todo", "All")} ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#D4A520] text-white shadow-md"
                    : "bg-[#F5EDD8] text-[#6B3D1E] hover:bg-[#F0E0C0]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Products grouped by category */}
        {grouped.map((group) => (
          <div key={group.id} className="mb-16 last:mb-0">
            <div className="flex items-end gap-4 mb-6 pb-3 border-b border-[#F5EDD8]">
              <div>
                <h3 className="text-2xl font-extrabold text-[#3D2010]">{group.name}</h3>
                <p className="text-[#9B6B45] text-sm">{group.desc}</p>
              </div>
              {group.id !== "conjuntos" && (
                <div className="ml-auto flex items-center gap-1.5 bg-[#F5E9B8] text-[#A07D10] text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  <Tag size={11} />
                  {t("Oferta 3 × 15% dto", "Offer 3 × 15% off")}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stock={stockMap[product.id]}
                  onWaitlist={() => setWaitlistProduct(product)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Waitlist modal — rendered at collection level to escape card overflow:hidden */}
      {waitlistProduct && (
        <WaitlistModal
          product={waitlistProduct}
          onClose={() => setWaitlistProduct(null)}
        />
      )}
    </section>
  );
}
