"use client";

import { useLang } from "../context/LanguageContext";
import { Leaf, Heart, Package, Sparkles } from "lucide-react";

export default function TrustBar() {
  const { t } = useLang();

  const items = [
    {
      icon: <Leaf size={22} />,
      title: t("100% Algodón Pima", "100% Pima Cotton"),
      desc: t("El más fino de los Andes peruanos", "The finest from the Peruvian Andes"),
    },
    {
      icon: <Heart size={22} />,
      title: t("Hipoalergénico", "Hypoallergenic"),
      desc: t("Ideal para pieles sensibles", "Ideal for sensitive skin"),
    },
    {
      icon: <Sparkles size={22} />,
      title: t("Calidad Premium", "Premium Quality"),
      desc: t("Suave, resistente y duradero", "Soft, durable & long-lasting"),
    },
    {
      icon: <Package size={22} />,
      title: t("Envío a Perú y USA", "Ships to Peru & USA"),
      desc: t("Llega donde tu bebé está", "Delivered wherever your baby is"),
    },
  ];

  return (
    <section className="bg-[#F5EDD8] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 bg-[#D4A520]/15 text-[#D4A520] rounded-2xl flex items-center justify-center">
                {item.icon}
              </div>
              <p className="font-bold text-[#3D2010] text-sm leading-tight">{item.title}</p>
              <p className="text-[#9B6B45] text-xs leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
