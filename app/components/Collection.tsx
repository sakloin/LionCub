"use client";

import { useLang } from "../context/LanguageContext";
import { ArrowRight } from "lucide-react";

const products = [
  {
    id: 1,
    nameEs: "Body Manga Larga",
    nameEn: "Long Sleeve Bodysuit",
    descEs: "Suave al tacto, perfecto para el día a día",
    descEn: "Soft to the touch, perfect for everyday wear",
    sizes: ["0-3m", "3-6m", "6-12m"],
    color: "from-[#F5E9B8] to-[#FDE8DC]",
    emoji: "👶",
    tag: { es: "Favorito", en: "Bestseller" },
  },
  {
    id: 2,
    nameEs: "Pelele con Pies",
    nameEn: "Footed Romper",
    descEs: "Abrigo completo para las noches tranquilas",
    descEn: "Full coverage for peaceful nights",
    sizes: ["0-3m", "3-6m", "6-12m", "12-18m"],
    color: "from-[#D4EAC8] to-[#F5E9B8]",
    emoji: "🌙",
    tag: null,
  },
  {
    id: 3,
    nameEs: "Set Pantalón + Camiseta",
    nameEn: "Pants + Tee Set",
    descEs: "Conjunto ideal para salir y jugar",
    descEn: "The ideal set for outings and play",
    sizes: ["3-6m", "6-12m", "12-18m", "18-24m"],
    color: "from-[#FDE8DC] to-[#F5E9B8]",
    emoji: "✨",
    tag: { es: "Nuevo", en: "New" },
  },
  {
    id: 4,
    nameEs: "Pijama Dos Piezas",
    nameEn: "Two-Piece Pajama Set",
    descEs: "Dulces sueños con el algodón más suave",
    descEn: "Sweet dreams with the softest cotton",
    sizes: ["6-12m", "12-18m", "18-24m"],
    color: "from-[#F5E9B8] to-[#D4EAC8]",
    emoji: "💤",
    tag: null,
  },
  {
    id: 5,
    nameEs: "Manta Swaddle",
    nameEn: "Swaddle Blanket",
    descEs: "Envoltura perfecta para los primeros días",
    descEn: "Perfect wrap for the earliest days",
    sizes: ["RN", "0-3m"],
    color: "from-[#FDE8DC] to-[#D4EAC8]",
    emoji: "🤍",
    tag: { es: "Recién Nacido", en: "Newborn" },
  },
  {
    id: 6,
    nameEs: "Gorro + Manoplas",
    nameEn: "Hat + Mittens Set",
    descEs: "Accesorios suaves para proteger al bebé",
    descEn: "Soft accessories to keep baby cozy",
    sizes: ["RN", "0-3m", "3-6m"],
    color: "from-[#F5E9B8] to-[#FDE8DC]",
    emoji: "🧡",
    tag: null,
  },
];

export default function Collection() {
  const { lang, t } = useLang();

  return (
    <section id="coleccion" className="bg-[#FDF8F0] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#D4A520] font-bold text-sm uppercase tracking-widest mb-2">
            {t("Lo que tenemos para ti", "What we have for you")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D2010] mb-4">
            {t("Nuestra Colección", "Our Collection")}
          </h2>
          <p className="text-[#9B6B45] max-w-lg mx-auto">
            {t(
              "Cada prenda está confeccionada a mano con algodón pima 100% peruano. Sin mezclas, sin compromisos.",
              "Every garment is hand-crafted with 100% Peruvian Pima cotton. No blends, no compromises."
            )}
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#F5EDD8]"
            >
              {/* Image area */}
              <div className={`relative aspect-square bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  {product.emoji}
                </span>
                {product.tag && (
                  <span className="absolute top-4 left-4 bg-[#D4A520] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {lang === "es" ? product.tag.es : product.tag.en}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-bold text-[#3D2010] text-lg mb-1">
                  {lang === "es" ? product.nameEs : product.nameEn}
                </h3>
                <p className="text-[#9B6B45] text-sm mb-3">
                  {lang === "es" ? product.descEs : product.descEn}
                </p>

                {/* Sizes */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="text-xs bg-[#F5EDD8] text-[#6B3D1E] font-semibold px-2.5 py-1 rounded-full"
                    >
                      {size}
                    </span>
                  ))}
                </div>

                <button className="w-full py-2.5 border-2 border-[#D4A520] text-[#D4A520] font-bold rounded-xl hover:bg-[#D4A520] hover:text-white transition-all text-sm flex items-center justify-center gap-2 group/btn">
                  {t("Consultar disponibilidad", "Check availability")}
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-[#9B6B45] mb-4">
            {t("¿Buscas algo especial para tu bebé?", "Looking for something special for your baby?")}
          </p>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 text-[#D4A520] font-bold hover:text-[#A07D10] transition-colors"
          >
            {t("Escríbenos por WhatsApp", "Message us on WhatsApp")}
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
