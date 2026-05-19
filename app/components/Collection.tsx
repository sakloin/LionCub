"use client";

import Image from "next/image";
import { useState } from "react";
import { MessageCircle, Tag } from "lucide-react";
import { useLang } from "../context/LanguageContext";
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

function whatsappUrl(product: (typeof products)[0]) {
  const msg = encodeURIComponent(
    `Hola Lion Cub! 🦁 Me interesa *${product.name}* (Ref: ${product.id}). ¿Está disponible?`
  );
  return `https://wa.me/${brand.whatsapp}?text=${msg}`;
}

function ProductCard({ product }: { product: (typeof products)[0] }) {
  const { t } = useLang();
  const [imgError, setImgError] = useState(false);

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

        {/* Offer badge */}
        {product.hasOffer && (
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
            S/ {product.price}
          </span>
        </div>

        {/* Description */}
        <p className="text-[#9B6B45] text-sm leading-relaxed line-clamp-3">{product.desc}</p>

        {/* Sizes */}
        <div>
          <p className="text-[#6B3D1E] text-xs font-bold mb-1.5">{t("Tallas", "Sizes")}</p>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="text-xs bg-[#F5EDD8] text-[#6B3D1E] font-semibold px-2.5 py-1 rounded-full"
              >
                {size}
              </span>
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
        <a
          href={whatsappUrl(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-1 w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1eb85a] transition-colors text-sm"
        >
          <MessageCircle size={15} />
          {t("Pedir por WhatsApp", "Order via WhatsApp")}
        </a>
      </div>
    </div>
  );
}

export default function Collection() {
  const { t } = useLang();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Group by category in order
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
            {/* Category header */}
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

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
