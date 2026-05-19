"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Package, CreditCard, CheckCircle } from "lucide-react";

type Step = "datos" | "envio" | "pago" | "confirmar";

const SHALOM_AGENCIES = ["Lima Centro","San Juan de Lurigancho","Los Olivos","San Martín de Porres","Villa El Salvador","Ate Vitarte","Callao","Miraflores","San Isidro","Trujillo","Arequipa","Chiclayo","Piura","Cusco","Iquitos"];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { t } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<Step>("datos");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "",
    address: "", district: "", city: "Lima",
    shipping_method: "domicilio" as "domicilio" | "shalom",
    shalom_agency: "",
    payment_method: "transferencia" as "izipay" | "transferencia" | "contraentrega",
    notes: "",
  });

  const shippingCost = form.shipping_method === "domicilio" ? 10 : 15;
  const grandTotal = total + shippingCost;

  function field(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submitOrder() {
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, shipping_cost: shippingCost, subtotal: total, total: grandTotal, items }),
    });
    const data = await res.json();
    if (data.id) {
      setOrderId(data.id);
      setStep("confirmar");
      clear();
    }
    setSubmitting(false);
  }

  if (items.length === 0 && step !== "confirmar") {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#9B6B45] mb-4">{t("Tu carrito está vacío", "Your cart is empty")}</p>
          <a href="/#coleccion" className="bg-[#D4A520] text-white font-bold px-6 py-3 rounded-full hover:bg-[#A07D10] transition-colors">
            {t("Ver colección", "Shop collection")}
          </a>
        </div>
      </div>
    );
  }

  if (step === "confirmar") {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col gap-5">
          <CheckCircle size={64} className="text-green-500 mx-auto" />
          <h1 className="text-2xl font-extrabold text-[#3D2010]">¡Pedido recibido! 🦁</h1>
          <p className="text-[#9B6B45]">Te contactaremos pronto al número <strong>{form.customer_phone}</strong> para confirmar tu pedido.</p>
          {orderId && <p className="text-xs text-[#C4956A] bg-[#F5EDD8] rounded-xl py-2 px-3">Nro. pedido: {orderId.slice(0,8).toUpperCase()}</p>}
          <a href="/" className="bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors">
            {t("Volver a la tienda", "Back to store")}
          </a>
        </div>
      </div>
    );
  }

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "datos", label: "Datos", icon: <CheckCircle size={16} /> },
    { id: "envio", label: "Envío", icon: <MapPin size={16} /> },
    { id: "pago", label: "Pago", icon: <CreditCard size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] pt-8 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-[#D4A520] font-semibold text-sm hover:text-[#A07D10] mb-6 inline-block">← {t("Volver a la tienda","Back to store")}</a>
        <h1 className="text-3xl font-extrabold text-[#3D2010] mb-8">{t("Finalizar compra","Checkout")}</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step === s.id ? "bg-[#D4A520] text-white" : steps.indexOf(steps.find(x=>x.id===step)!) > i ? "bg-[#8BAF7A] text-white" : "bg-white text-[#9B6B45] border border-[#F5EDD8]"}`}>
                {s.icon} {s.label}
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-[#F5EDD8]" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-[#F5EDD8] p-6 flex flex-col gap-5">
              {step === "datos" && (
                <>
                  <h2 className="font-bold text-[#3D2010] text-lg">Tus datos</h2>
                  {[
                    { key: "customer_name", label: "Nombre completo *", type: "text", required: true },
                    { key: "customer_phone", label: "WhatsApp / Celular *", type: "tel", required: true },
                    { key: "customer_email", label: "Correo electrónico", type: "email", required: false },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{f.label}</label>
                      <input type={f.type} value={form[f.key as keyof typeof form] as string} onChange={e => field(f.key as keyof typeof form, e.target.value)}
                        className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
                    </div>
                  ))}
                  <button onClick={() => setStep("envio")} disabled={!form.customer_name || !form.customer_phone}
                    className="w-full bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-50">
                    {t("Continuar","Continue")} →
                  </button>
                </>
              )}

              {step === "envio" && (
                <>
                  <h2 className="font-bold text-[#3D2010] text-lg">Método de envío</h2>
                  <div className="grid gap-3">
                    {[
                      { value: "domicilio", label: "🛵 Entrega a domicilio", desc: "Lima Metropolitana · S/ 10", icon: MapPin },
                      { value: "shalom", label: "📦 Agencia Shalom", desc: "A nivel nacional · S/ 15", icon: Package },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => field("shipping_method", opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${form.shipping_method === opt.value ? "border-[#D4A520] bg-[#FDF8F0]" : "border-[#F5EDD8] hover:border-[#D4A520]/50"}`}>
                        <p className="font-bold text-[#3D2010]">{opt.label}</p>
                        <p className="text-[#9B6B45] text-sm">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {form.shipping_method === "domicilio" && (
                    <div className="flex flex-col gap-3">
                      {[
                        { key: "address", label: "Dirección *" },
                        { key: "district", label: "Distrito *" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{f.label}</label>
                          <input value={form[f.key as keyof typeof form] as string} onChange={e => field(f.key as keyof typeof form, e.target.value)}
                            className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {form.shipping_method === "shalom" && (
                    <div>
                      <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Agencia Shalom *</label>
                      <select value={form.shalom_agency} onChange={e => field("shalom_agency", e.target.value)}
                        className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]">
                        <option value="">Seleccionar agencia...</option>
                        {SHALOM_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep("datos")} className="flex-1 py-3 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm">← Atrás</button>
                    <button onClick={() => setStep("pago")}
                      disabled={form.shipping_method === "domicilio" ? !form.address || !form.district : !form.shalom_agency}
                      className="flex-1 bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-50">
                      Continuar →
                    </button>
                  </div>
                </>
              )}

              {step === "pago" && (
                <>
                  <h2 className="font-bold text-[#3D2010] text-lg">Método de pago</h2>
                  <div className="grid gap-3">
                    {[
                      { value: "transferencia", label: "🏦 Transferencia bancaria", desc: "Te enviamos los datos por WhatsApp" },
                      { value: "contraentrega", label: "💵 Pago contra entrega", desc: "Solo Lima Metropolitana (domicilio)" },
                      { value: "izipay", label: "💳 Tarjeta / Izipay", desc: "Próximamente disponible", disabled: true },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => !opt.disabled && field("payment_method", opt.value)}
                        disabled={opt.disabled}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${form.payment_method === opt.value ? "border-[#D4A520] bg-[#FDF8F0]" : "border-[#F5EDD8] hover:border-[#D4A520]/50"} ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                        <p className="font-bold text-[#3D2010]">{opt.label}</p>
                        <p className="text-[#9B6B45] text-sm">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Notas adicionales</label>
                    <textarea rows={2} value={form.notes} onChange={e => field("notes", e.target.value)} placeholder="Instrucciones de entrega, talla especial, etc."
                      className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep("envio")} className="flex-1 py-3 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm">← Atrás</button>
                    <button onClick={submitOrder} disabled={submitting}
                      className="flex-1 bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-60">
                      {submitting ? "Enviando..." : "✓ Confirmar pedido"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#F5EDD8] p-5 h-fit">
            <h2 className="font-bold text-[#3D2010] mb-4">Tu pedido</h2>
            <div className="flex flex-col gap-3 mb-4">
              {items.map(item => (
                <div key={`${item.product.id}|${item.selectedSize}|${item.selectedColor}`} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0 bg-[#F5EDD8]">
                    <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3D2010] line-clamp-1">{item.product.name}</p>
                    <p className="text-[#9B6B45] text-xs">{item.selectedSize} · {item.selectedColor} · x{item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#D4A520] text-sm">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F5EDD8] pt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between"><span className="text-[#9B6B45]">Subtotal</span><span>S/ {total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#9B6B45]">Envío</span><span>S/ {shippingCost.toFixed(2)}</span></div>
              <div className="flex justify-between font-extrabold text-[#3D2010] text-base mt-1">
                <span>Total</span><span className="text-[#D4A520]">S/ {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
