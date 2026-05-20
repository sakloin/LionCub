"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import Image from "next/image";
import { MapPin, Package, CreditCard, CheckCircle, MessageCircle, Calendar, Clock, Upload, FileText, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { PAYMENT_INFO, PROOF_REQUIRED, type PaymentMethod } from "../lib/payment-info";
import { CULQI_ENABLED } from "../lib/feature-flags";

type Step = "datos" | "envio" | "pago" | "confirmar";

const SHALOM_AGENCIES = ["Lima Centro","San Juan de Lurigancho","Los Olivos","San Martín de Porres","Villa El Salvador","Ate Vitarte","Callao","Miraflores","San Isidro","Trujillo","Arequipa","Chiclayo","Piura","Cusco","Iquitos"];

const ALL_SLOTS  = ["10:00 - 13:00", "13:00 - 16:00", "16:00 - 19:00"];
const FRI_SLOTS  = ["10:00 - 13:00", "13:00 - 16:00"];

function getMinDate() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }
function getMaxDate() { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().slice(0, 10); }
function isSaturday(s: string) { return !!s && new Date(s + "T12:00:00").getDay() === 6; }
function isFriday(s: string)   { return !!s && new Date(s + "T12:00:00").getDay() === 5; }
function fmtDeliveryDate(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" });
}

const PROOF_MAX_BYTES = 5 * 1024 * 1024;
const PROOF_ALLOWED   = ["image/jpeg", "image/png", "application/pdf"];

// ── Payment info panels ──────────────────────────────────────────────────────

function QrPanel({ info, label }: { info: { qrImage: string; phone: string; holder: string }; label: string }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="bg-[#FDF8F0] border border-[#F5EDD8] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start">
      <div className="w-28 h-28 rounded-xl overflow-hidden bg-white border border-[#F5EDD8] flex-shrink-0 flex items-center justify-center">
        {!imgErr ? (
          <img src={info.qrImage} alt={`QR ${label}`} className="w-full h-full object-contain" onError={() => setImgErr(true)} />
        ) : (
          <p className="text-[10px] text-center text-[#9B6B45] px-2">QR pendiente<br/>(actualizar en payment-info.ts)</p>
        )}
      </div>
      <div className="text-sm flex flex-col gap-1">
        <p className="font-bold text-[#3D2010]">{label}</p>
        <p className="text-[#6B3D1E]">Número: <strong>{info.phone}</strong></p>
        <p className="text-[#6B3D1E]">Titular: <strong>{info.holder}</strong></p>
        <p className="text-[#9B6B45] text-xs mt-1">Escanea el QR o yapea al número. Después sube tu comprobante.</p>
      </div>
    </div>
  );
}

function BankPanel() {
  const b = PAYMENT_INFO.bank;
  return (
    <div className="bg-[#FDF8F0] border border-[#F5EDD8] rounded-2xl p-4 text-sm flex flex-col gap-2">
      <p className="font-bold text-[#3D2010] mb-1">Datos bancarios</p>
      {[
        ["Banco",   b.name],
        ["Cuenta",  b.account],
        ["CCI",     b.cci],
        ["Titular", b.holder],
        ["RUC",     b.ruc],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <span className="text-[#9B6B45]">{k}</span>
          <span className="font-semibold text-[#3D2010] text-right">{v}</span>
        </div>
      ))}
      <p className="text-[#9B6B45] text-xs mt-1">Realiza la transferencia y sube tu comprobante.</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { t } = useLang();
  const [step, setStep]           = useState<Step>("datos");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId]     = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "",
    address: "", district: "", city: "Lima",
    shipping_method: "domicilio" as "domicilio" | "shalom",
    shalom_agency: "",
    delivery_date: "",
    delivery_time_slot: "",
    payment_method: "yape" as PaymentMethod,
    notes: "",
  });

  // Proof upload state
  const [proofFile,       setProofFile]       = useState<File | null>(null);
  const [proofUrl,        setProofUrl]        = useState("");
  const [proofUploading,  setProofUploading]  = useState(false);
  const [proofError,      setProofError]      = useState<string | null>(null);

  // Culqi state
  const [culqiError, setCulqiError] = useState<string | null>(null);

  // Load Culqi checkout.js when the flag is enabled
  useEffect(() => {
    if (!CULQI_ENABLED) return;
    if (document.getElementById("culqi-js")) return;
    const script = document.createElement("script");
    script.id  = "culqi-js";
    script.src = "https://js.culqi.com/checkout-js";
    document.body.appendChild(script);
  }, []);

  const isShalom        = form.shipping_method === "shalom";
  const shippingCost    = isShalom ? 15 : 10;
  const grandTotal      = total + shippingCost;
  const availableSlots  = isFriday(form.delivery_date) ? FRI_SLOTS : ALL_SLOTS;
  const requiresProof   = (PROOF_REQUIRED as string[]).includes(form.payment_method);
  const confirmDisabled = submitting || proofUploading || (requiresProof && !proofUrl);

  function field(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function resetProof() {
    setProofFile(null);
    setProofUrl("");
    setProofError(null);
    setProofUploading(false);
  }

  function handleDateChange(dateStr: string) {
    setDateError(null);
    if (dateStr && isSaturday(dateStr)) {
      setDateError("No realizamos entregas los sábados. Por favor elige otro día.");
      setForm(f => ({ ...f, delivery_date: "", delivery_time_slot: "" }));
      return;
    }
    const nextSlots = isFriday(dateStr) ? FRI_SLOTS : ALL_SLOTS;
    setForm(f => ({
      ...f,
      delivery_date: dateStr,
      delivery_time_slot: nextSlots.includes(f.delivery_time_slot) ? f.delivery_time_slot : "",
    }));
  }

  async function handleProofFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofError(null);
    if (!PROOF_ALLOWED.includes(file.type)) {
      setProofError("Solo se aceptan JPG, PNG o PDF"); return;
    }
    if (file.size > PROOF_MAX_BYTES) {
      setProofError("El archivo no puede superar 5 MB"); return;
    }
    setProofFile(file);
    setProofUploading(true);
    try {
      const ext  = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
      const path = `proofs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("payment-proofs").getPublicUrl(path);
      setProofUrl(publicUrl);
    } catch (err: any) {
      setProofError(err?.message ?? "Error al subir el comprobante. Intenta de nuevo.");
      setProofFile(null);
    } finally {
      setProofUploading(false);
    }
    e.target.value = "";
  }

  const domicilioContinueOk = form.shipping_method === "domicilio"
    ? !!(form.address && form.district && form.delivery_date && form.delivery_time_slot)
    : !!form.shalom_agency;

  async function handleCulqiFlow(createdOrderId: string) {
    const W = window as any;
    const culqiKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    if (!culqiKey || !W.Culqi) {
      setCulqiError("Culqi no está disponible. Recarga la página e intenta de nuevo.");
      return;
    }
    W.Culqi.publicKey = culqiKey;
    W.Culqi.settings({
      title: "Lion Cub Baby Clothing",
      currency: "PEN",
      description: `Pedido #${createdOrderId.slice(0, 8).toUpperCase()}`,
      amount: Math.round(grandTotal * 100),
    });

    const token = await new Promise<string | null>((resolve) => {
      W.culqi = () => {
        W.culqi = undefined;
        resolve(W.Culqi.token?.id ?? null);
      };
      W.Culqi.open();
    });

    if (!token) return; // user closed without paying

    const res = await fetch("/api/payments/culqi/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        orderId: createdOrderId,
        amount: Math.round(grandTotal * 100),
        email: form.customer_email || `${form.customer_phone}@lioncub.pe`,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setCulqiError(data.error ?? "Error al procesar el pago. Intenta de nuevo.");
      return;
    }
    setOrderId(createdOrderId);
    setStep("confirmar");
    clear();
  }

  async function submitOrder() {
    setSubmitting(true);
    setCulqiError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          payment_proof_url:  requiresProof ? (proofUrl || null) : null,
          delivery_date:      isShalom ? null : (form.delivery_date || null),
          delivery_time_slot: isShalom ? null : (form.delivery_time_slot || null),
          shipping_cost: shippingCost,
          subtotal: total,
          total: grandTotal,
          items,
        }),
      });
      const data = await res.json();
      if (data.id) {
        if (form.payment_method === "culqi") {
          await handleCulqiFlow(data.id);
        } else {
          setOrderId(data.id);
          setStep("confirmar");
          clear();
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
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

  // ── Confirm screen ─────────────────────────────────────────────────────────
  if (step === "confirmar") {
    const waLines = [
      `Hola, acabo de hacer un pedido en Lion Cub 🦁`,
      `Nro. pedido: ${orderId ? orderId.slice(0, 8).toUpperCase() : "-"}`,
      `Cliente: ${form.customer_name}`,
      `Teléfono: ${form.customer_phone}`,
      !isShalom && form.delivery_date ? `Fecha de entrega: ${fmtDeliveryDate(form.delivery_date)}` : null,
      !isShalom && form.delivery_time_slot ? `Franja horaria: ${form.delivery_time_slot}` : null,
      isShalom ? `Agencia Shalom: ${form.shalom_agency}` : null,
      `Pago: ${form.payment_method}`,
      `Total: S/ ${grandTotal.toFixed(2)}`,
    ].filter(Boolean).join("\n");

    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col gap-5">
          <CheckCircle size={64} className="text-green-500 mx-auto" />
          <h1 className="text-2xl font-extrabold text-[#3D2010]">¡Pedido recibido! 🦁</h1>
          <p className="text-[#9B6B45]">
            Te contactaremos pronto al número <strong>{form.customer_phone}</strong> para confirmar tu pedido.
          </p>
          {orderId && (
            <p className="text-xs text-[#C4956A] bg-[#F5EDD8] rounded-xl py-2 px-3">
              Nro. pedido: {orderId.slice(0, 8).toUpperCase()}
            </p>
          )}
          {!isShalom && form.delivery_date && (
            <div className="bg-[#FDF8F0] rounded-xl p-3 text-sm text-[#6B3D1E]">
              <p className="font-bold mb-0.5">📅 Entrega programada</p>
              <p>{fmtDeliveryDate(form.delivery_date)}</p>
              {form.delivery_time_slot && <p className="text-[#9B6B45]">⏰ {form.delivery_time_slot}</p>}
            </div>
          )}
          <a
            href={`https://wa.me/51920201943?text=${encodeURIComponent(waLines)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-[#1DA851] transition-colors"
          >
            <MessageCircle size={18} /> Confirmar por WhatsApp
          </a>
          <a href="/" className="bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors">
            {t("Volver a la tienda", "Back to store")}
          </a>
        </div>
      </div>
    );
  }

  // ── Step wizard ────────────────────────────────────────────────────────────
  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "datos", label: "Datos",  icon: <CheckCircle size={16} /> },
    { id: "envio", label: "Envío",  icon: <MapPin size={16} /> },
    { id: "pago",  label: "Pago",   icon: <CreditCard size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] pt-8 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-[#D4A520] font-semibold text-sm hover:text-[#A07D10] mb-6 inline-block">
          ← {t("Volver a la tienda", "Back to store")}
        </a>
        <h1 className="text-3xl font-extrabold text-[#3D2010] mb-8">{t("Finalizar compra", "Checkout")}</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step === s.id ? "bg-[#D4A520] text-white" : steps.indexOf(steps.find(x => x.id === step)!) > i ? "bg-[#8BAF7A] text-white" : "bg-white text-[#9B6B45] border border-[#F5EDD8]"}`}>
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

              {/* ── DATOS ── */}
              {step === "datos" && (
                <>
                  <h2 className="font-bold text-[#3D2010] text-lg">Tus datos</h2>
                  {[
                    { key: "customer_name",  label: "Nombre completo *",    type: "text",  required: true  },
                    { key: "customer_phone", label: "WhatsApp / Celular *", type: "tel",   required: true  },
                    { key: "customer_email", label: "Correo electrónico",   type: "email", required: false },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{f.label}</label>
                      <input type={f.type} value={form[f.key as keyof typeof form] as string}
                        onChange={e => field(f.key as keyof typeof form, e.target.value)}
                        className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
                    </div>
                  ))}
                  <button onClick={() => setStep("envio")} disabled={!form.customer_name || !form.customer_phone}
                    className="w-full bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-50">
                    {t("Continuar", "Continue")} →
                  </button>
                </>
              )}

              {/* ── ENVÍO ── */}
              {step === "envio" && (
                <>
                  <h2 className="font-bold text-[#3D2010] text-lg">Método de envío</h2>
                  <div className="grid gap-3">
                    {[
                      { value: "domicilio", label: "🛵 Entrega a domicilio", desc: "Lima Metropolitana · S/ 10" },
                      { value: "shalom",    label: "📦 Agencia Shalom",      desc: "A nivel nacional · S/ 15" },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => field("shipping_method", opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${form.shipping_method === opt.value ? "border-[#D4A520] bg-[#FDF8F0]" : "border-[#F5EDD8] hover:border-[#D4A520]/50"}`}>
                        <p className="font-bold text-[#3D2010]">{opt.label}</p>
                        <p className="text-[#9B6B45] text-sm">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {form.shipping_method === "domicilio" && (
                    <div className="flex flex-col gap-4">
                      {[
                        { key: "address",  label: "Dirección *" },
                        { key: "district", label: "Distrito *"  },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{f.label}</label>
                          <input value={form[f.key as keyof typeof form] as string}
                            onChange={e => field(f.key as keyof typeof form, e.target.value)}
                            className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
                        </div>
                      ))}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3D1E] mb-1">
                          <Calendar size={13} /> Fecha de entrega *
                        </label>
                        <input type="date" value={form.delivery_date}
                          min={getMinDate()} max={getMaxDate()}
                          onChange={e => handleDateChange(e.target.value)}
                          className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
                        {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
                        <p className="text-[10px] text-[#9B6B45] mt-1">De lunes a domingo (excepto sábados)</p>
                      </div>
                      {form.delivery_date && !dateError && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3D1E] mb-2">
                            <Clock size={13} /> Franja horaria *
                          </label>
                          <div className="grid gap-2">
                            {availableSlots.map(slot => (
                              <button key={slot} type="button" onClick={() => field("delivery_time_slot", slot)}
                                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-all ${form.delivery_time_slot === slot ? "border-[#D4A520] bg-[#FDF8F0] text-[#3D2010]" : "border-[#F5EDD8] text-[#6B3D1E] hover:border-[#D4A520]/50"}`}>
                                ⏰ {slot}
                              </button>
                            ))}
                          </div>
                          {isFriday(form.delivery_date) && <p className="text-[10px] text-[#9B6B45] mt-1">Los viernes solo hay entrega hasta las 16:00 h</p>}
                        </div>
                      )}
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
                    <button onClick={() => setStep("pago")} disabled={!domicilioContinueOk}
                      className="flex-1 bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-50">
                      Continuar →
                    </button>
                  </div>
                </>
              )}

              {/* ── PAGO ── */}
              {step === "pago" && (
                <>
                  <h2 className="font-bold text-[#3D2010] text-lg">Método de pago</h2>

                  <div className="grid gap-3">
                    {[
                      { value: "yape",         label: "💜 Yape",                       desc: "QR instantáneo" },
                      { value: "plin",         label: "🔵 Plin",                       desc: "QR instantáneo" },
                      { value: "transferencia",label: "🏦 Transferencia bancaria",      desc: "BCP · BBVA · Interbank" },
                      { value: "contraentrega",label: "💵 Contra entrega",              desc: "Solo Lima Metropolitana (domicilio)" },
                      ...(CULQI_ENABLED
                        ? [{ value: "culqi", label: "💳 Tarjeta de crédito/débito",   desc: "Visa, Mastercard · Powered by Culqi" }]
                        : [{ value: "izipay", label: "💳 Tarjeta",                    desc: "Próximamente disponible", disabled: true }]),
                    ].map(opt => (
                      <button key={opt.value}
                        onClick={() => { if (!opt.disabled) { field("payment_method", opt.value); resetProof(); } }}
                        disabled={opt.disabled}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${form.payment_method === opt.value ? "border-[#D4A520] bg-[#FDF8F0]" : "border-[#F5EDD8] hover:border-[#D4A520]/50"} ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                        <p className="font-bold text-[#3D2010]">{opt.label}</p>
                        <p className="text-[#9B6B45] text-sm">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Payment method details */}
                  {form.payment_method === "yape"         && <QrPanel info={PAYMENT_INFO.yape} label="Yape" />}
                  {form.payment_method === "plin"         && <QrPanel info={PAYMENT_INFO.plin} label="Plin" />}
                  {form.payment_method === "transferencia" && <BankPanel />}

                  {/* Proof uploader */}
                  {requiresProof && (
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3D1E]">
                        <Upload size={13} /> Comprobante de pago *
                      </label>

                      {!proofUrl ? (
                        <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer transition-colors ${proofUploading ? "border-[#D4A520] bg-[#FDF8F0]" : "border-[#F5EDD8] hover:border-[#D4A520] hover:bg-[#FDF8F0]"}`}>
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleProofFile} className="hidden" disabled={proofUploading} />
                          {proofUploading ? (
                            <>
                              <RefreshCw size={20} className="text-[#D4A520] animate-spin" />
                              <p className="text-xs text-[#9B6B45]">Subiendo {proofFile?.name}…</p>
                            </>
                          ) : (
                            <>
                              <Upload size={20} className="text-[#9B6B45]" />
                              <p className="text-xs font-semibold text-[#6B3D1E]">Haz clic para seleccionar</p>
                              <p className="text-[10px] text-[#9B6B45]">JPG, PNG o PDF · máx. 5 MB</p>
                            </>
                          )}
                        </label>
                      ) : (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                          {proofUrl.toLowerCase().endsWith(".pdf") ? (
                            <a href={proofUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline">
                              <FileText size={28} /> {proofFile?.name ?? "comprobante.pdf"}
                            </a>
                          ) : (
                            <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                              <img src={proofUrl} alt="Comprobante" className="w-14 h-14 rounded-lg object-cover border border-green-200" />
                            </a>
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-bold text-green-700">✓ Comprobante subido</p>
                            {proofFile && <p className="text-[10px] text-green-600 truncate max-w-[140px]">{proofFile.name}</p>}
                          </div>
                          <button onClick={resetProof}
                            className="text-xs text-[#9B6B45] hover:text-[#3D2010] underline flex-shrink-0">
                            Cambiar
                          </button>
                        </div>
                      )}

                      {proofError && <p className="text-xs text-red-500">{proofError}</p>}
                    </div>
                  )}

                  {/* Culqi error */}
                  {culqiError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                      {culqiError}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Notas adicionales</label>
                    <textarea rows={2} value={form.notes} onChange={e => field("notes", e.target.value)}
                      placeholder="Instrucciones de entrega, talla especial, etc."
                      className="w-full border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep("envio")}
                      className="flex-1 py-3 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm">
                      ← Atrás
                    </button>
                    <button onClick={submitOrder} disabled={confirmDisabled}
                      className="flex-1 bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-60">
                      {submitting ? "Enviando…" : requiresProof && !proofUrl ? "Sube el comprobante primero" : "✓ Confirmar pedido"}
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
