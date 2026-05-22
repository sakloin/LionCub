"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Upload, FileText, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { LionMark } from "../components/LogoMark";
import { PAYMENT_INFO, PROOF_REQUIRED, type PaymentMethod } from "../lib/payment-info";
import { CULQI_ENABLED } from "../lib/feature-flags";
import { toCents, fromCents, formatSoles } from "../lib/money";

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
    <div className="bg-bg-warm border border-rule p-4 flex flex-col sm:flex-row gap-4 items-start">
      <div className="w-28 h-28 overflow-hidden bg-bg border border-rule shrink-0 flex items-center justify-center">
        {!imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={info.qrImage} alt={`QR ${label}`} className="w-full h-full object-contain" onError={() => setImgErr(true)} />
        ) : (
          <p className="text-[10px] text-center text-ink-mute px-2">QR pendiente<br/>(actualizar en payment-info.ts)</p>
        )}
      </div>
      <div className="text-sm flex flex-col gap-1.5">
        <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute">{label}</p>
        <p className="text-ink-soft">Número · <strong className="text-ink font-semibold">{info.phone}</strong></p>
        <p className="text-ink-soft">Titular · <strong className="text-ink font-semibold">{info.holder}</strong></p>
        <p className="text-ink-mute text-xs mt-1">Escanea el QR o yapea al número. Después sube tu comprobante.</p>
      </div>
    </div>
  );
}

function BankPanel() {
  const b = PAYMENT_INFO.bank;
  return (
    <div className="bg-bg-warm border border-rule p-4 text-sm flex flex-col gap-2">
      <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute mb-1">Datos bancarios</p>
      {[
        ["Banco",   b.name],
        ["Cuenta",  b.account],
        ["CCI",     b.cci],
        ["Titular", b.holder],
        ["RUC",     b.ruc],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <span className="text-ink-soft">{k}</span>
          <span className="font-semibold text-ink text-right">{v}</span>
        </div>
      ))}
      <p className="text-ink-mute text-xs mt-1">Realiza la transferencia y sube tu comprobante.</p>
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
  const [submitError, setSubmitError] = useState<string | null>(null);

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
  const shippingCents   = isShalom ? 1500 : 1000;
  const grandTotalCents = toCents(total) + shippingCents;
  const shippingCost    = fromCents(shippingCents);
  const grandTotal      = fromCents(grandTotalCents);
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
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Error al subir el comprobante. Intenta de nuevo.");
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    const culqiKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    if (!culqiKey || !W.Culqi) {
      setCulqiError("Culqi no está disponible. Recarga la página e intenta de nuevo.");
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    W.Culqi.publicKey = culqiKey;
    W.Culqi.settings({
      title: "Lion Cub Baby Clothing",
      currency: "PEN",
      description: `Pedido #${createdOrderId.slice(0, 8).toUpperCase()}`,
      amount: toCents(grandTotal),
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
        amount: toCents(grandTotal),
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
    setSubmitError(null);
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        setSubmitError(data.error ?? "No pudimos registrar tu pedido. Intenta de nuevo o escríbenos por WhatsApp.");
        return;
      }
      if (form.payment_method === "culqi") {
        await handleCulqiFlow(data.id);
      } else {
        setOrderId(data.id);
        setStep("confirmar");
        clear();
      }
    } catch {
      setSubmitError("No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (items.length === 0 && step !== "confirmar") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-5">
          <LionMark size={56} color="var(--color-ink-mute)" />
          <p className="lc-display text-2xl text-ink">{t("Tu carrito está vacío", "Your cart is empty")}</p>
          <Link href="/#coleccion" className="lc-btn lc-btn-primary">
            {t("Ver colección", "Shop collection")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Confirm screen ─────────────────────────────────────────────────────────
  if (step === "confirmar") {
    const waLines = [
      `Hola, acabo de hacer un pedido en Lion Cub`,
      `Nro. pedido: ${orderId ? orderId.slice(0, 8).toUpperCase() : "-"}`,
      `Cliente: ${form.customer_name}`,
      `Teléfono: ${form.customer_phone}`,
      !isShalom && form.delivery_date ? `Fecha de entrega: ${fmtDeliveryDate(form.delivery_date)}` : null,
      !isShalom && form.delivery_time_slot ? `Franja horaria: ${form.delivery_time_slot}` : null,
      isShalom ? `Agencia Shalom: ${form.shalom_agency}` : null,
      `Pago: ${form.payment_method}`,
      `Total: ${formatSoles(grandTotal)}`,
    ].filter(Boolean).join("\n");

    const nextSteps: [string, string][] = [
      [
        t("Confirmación", "Confirmation"),
        t(
          `Te escribimos por WhatsApp al ${form.customer_phone} para coordinar los detalles.`,
          `We'll message you on WhatsApp at ${form.customer_phone} to sort out the details.`
        ),
      ],
      [
        t("En el taller", "In the workshop"),
        t(
          "Empacamos cada pieza a mano, en algodón Pima, lista para regalar.",
          "We pack each piece by hand, in Pima cotton, ready to gift."
        ),
      ],
      [
        t("Entrega", "Delivery"),
        isShalom
          ? t(
              `Coordinamos el envío a tu agencia Shalom · ${form.shalom_agency}.`,
              `We'll arrange shipping to your Shalom agency · ${form.shalom_agency}.`
            )
          : form.delivery_date
          ? t(
              `Llega el ${fmtDeliveryDate(form.delivery_date)}${form.delivery_time_slot ? ` · ${form.delivery_time_slot}` : ""}.`,
              `Arrives ${fmtDeliveryDate(form.delivery_date)}${form.delivery_time_slot ? ` · ${form.delivery_time_slot}` : ""}.`
            )
          : t("Coordinamos la entrega contigo.", "We'll coordinate delivery with you."),
      ],
    ];

    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-5">
          <LionMark size={64} color="var(--color-gold-deep)" />
          <p className="lc-eyebrow">{t("Pedido recibido", "Order received")}</p>
          <h1 className="lc-display text-4xl text-ink leading-none">
            {t("Gracias por tu", "Thank you for your")}{" "}
            <em className="lc-display-i text-gold-deep">{t("pedido.", "order.")}</em>
          </h1>
          <p className="text-ink-soft">
            {t("Te contactaremos pronto al número", "We'll contact you soon at")}{" "}
            <strong className="text-ink font-semibold">{form.customer_phone}</strong>{" "}
            {t("para confirmar tu pedido.", "to confirm your order.")}
          </p>
          {orderId && (
            <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute border border-rule px-4 py-2">
              {t("Nro. pedido", "Order no.")} · {orderId.slice(0, 8).toUpperCase()}
            </p>
          )}
          {!isShalom && form.delivery_date && (
            <div className="w-full bg-bg-warm p-4 text-sm">
              <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-mute mb-1.5">
                {t("Entrega programada", "Scheduled delivery")}
              </p>
              <p className="lc-display-i text-lg text-ink capitalize">{fmtDeliveryDate(form.delivery_date)}</p>
              {form.delivery_time_slot && <p className="text-ink-soft mt-0.5">{form.delivery_time_slot}</p>}
            </div>
          )}

          <div className="w-full text-left border-t border-rule pt-6">
            <p className="lc-eyebrow mb-5">{t("Próximos pasos", "Next steps")}</p>
            <ol className="flex flex-col gap-5">
              {nextSteps.map(([title, desc], i) => (
                <li key={title} className="flex gap-4">
                  <span className="lc-mono text-[11px] tracking-[0.1em] text-gold-deep pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="lc-display text-lg text-ink leading-tight">{title}</p>
                    <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <a
            href={`https://wa.me/51920201943?text=${encodeURIComponent(waLines)}`}
            target="_blank" rel="noopener noreferrer"
            className="lc-btn lc-btn-whatsapp w-full"
          >
            <MessageCircle size={14} /> {t("Confirmar por WhatsApp", "Confirm on WhatsApp")}
          </a>
          <Link href="/" className="lc-btn lc-btn-outline w-full">
            {t("Volver a la tienda", "Back to store")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Step wizard ────────────────────────────────────────────────────────────
  const steps: { id: Step; label: string }[] = [
    { id: "datos", label: t("Datos", "Details") },
    { id: "envio", label: t("Envío", "Shipping") },
    { id: "pago",  label: t("Pago", "Payment") },
  ];
  const currentIndex = steps.findIndex(s => s.id === step);

  const shippingOptions = [
    { value: "domicilio", label: t("Entrega a domicilio", "Home delivery"), desc: `${t("Lima Metropolitana", "Metro Lima")} · ${formatSoles(fromCents(1000))}` },
    { value: "shalom",    label: t("Agencia Shalom", "Shalom agency"),      desc: `${t("A nivel nacional", "Nationwide")} · ${formatSoles(fromCents(1500))}` },
  ];

  const paymentOptions: { value: PaymentMethod; label: string; desc: string; disabled?: boolean }[] = [
    { value: "yape",          label: "Yape",                       desc: t("QR instantáneo", "Instant QR") },
    { value: "plin",          label: "Plin",                       desc: t("QR instantáneo", "Instant QR") },
    { value: "transferencia", label: t("Transferencia bancaria", "Bank transfer"), desc: "BCP · BBVA · Interbank" },
    { value: "contraentrega", label: t("Contra entrega", "Cash on delivery"),      desc: t("Solo Lima Metropolitana (domicilio)", "Metro Lima only (home delivery)") },
    ...(CULQI_ENABLED
      ? [{ value: "culqi" as PaymentMethod, label: t("Tarjeta de crédito/débito", "Credit/debit card"), desc: t("Visa, Mastercard · Powered by Culqi", "Visa, Mastercard · Powered by Culqi") }]
      : [{ value: "izipay" as PaymentMethod, label: t("Tarjeta", "Card"), desc: t("Próximamente disponible", "Coming soon"), disabled: true }]),
  ];

  const inputCls = "lc-input";
  const cardCls = (active: boolean, disabled = false) =>
    `w-full text-left p-4 border transition-colors ${
      active ? "border-ink bg-bg-warm" : "border-rule hover:border-ink"
    } ${disabled ? "opacity-40 cursor-not-allowed hover:border-rule" : ""}`;

  return (
    <div className="min-h-screen bg-bg pt-8 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft hover:text-ink transition-colors mb-8 inline-block">
          ← {t("Volver a la tienda", "Back to store")}
        </Link>
        <h1 className="lc-display text-4xl sm:text-5xl text-ink leading-none mb-10">
          {t("Finalizar", "Check")} <em className="lc-display-i text-gold-deep">{t("compra.", "out.")}</em>
        </h1>

        {/* Step indicator */}
        <div className="flex items-center mb-12">
          {steps.map((s, i) => {
            const state = step === s.id ? "active" : currentIndex > i ? "done" : "next";
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full border lc-mono text-[10px] tracking-[0.1em] ${
                      state === "active"
                        ? "border-ink bg-ink text-bg"
                        : state === "done"
                        ? "border-gold-deep text-gold-deep"
                        : "border-rule text-ink-mute"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`lc-mono uppercase text-[10px] tracking-[0.22em] ${
                      state === "next" ? "text-ink-mute" : "text-ink"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && <span className="flex-1 h-px bg-rule mx-4" />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-6">

              {/* ── DATOS ── */}
              {step === "datos" && (
                <>
                  <h2 className="lc-display text-2xl text-ink">{t("Tus datos", "Your details")}</h2>
                  {[
                    { key: "customer_name",  label: t("Nombre completo *", "Full name *"),    type: "text"  },
                    { key: "customer_phone", label: t("WhatsApp / Celular *", "WhatsApp / Phone *"), type: "tel" },
                    { key: "customer_email", label: t("Correo electrónico", "Email"),   type: "email" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">{f.label}</label>
                      <input type={f.type} value={form[f.key as keyof typeof form] as string}
                        onChange={e => field(f.key as keyof typeof form, e.target.value)}
                        className={inputCls} />
                    </div>
                  ))}
                  <button onClick={() => setStep("envio")} disabled={!form.customer_name || !form.customer_phone}
                    className="lc-btn lc-btn-primary w-full disabled:opacity-50">
                    {t("Continuar", "Continue")} →
                  </button>
                </>
              )}

              {/* ── ENVÍO ── */}
              {step === "envio" && (
                <>
                  <h2 className="lc-display text-2xl text-ink">{t("Método de envío", "Shipping method")}</h2>
                  <div className="grid gap-3">
                    {shippingOptions.map(opt => (
                      <button key={opt.value} onClick={() => field("shipping_method", opt.value)}
                        className={cardCls(form.shipping_method === opt.value)}>
                        <p className="lc-display text-lg text-ink">{opt.label}</p>
                        <p className="text-ink-soft text-sm mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  {form.shipping_method === "domicilio" && (
                    <div className="flex flex-col gap-5">
                      {[
                        { key: "address",  label: t("Dirección *", "Address *") },
                        { key: "district", label: t("Distrito *", "District *")  },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">{f.label}</label>
                          <input value={form[f.key as keyof typeof form] as string}
                            onChange={e => field(f.key as keyof typeof form, e.target.value)}
                            className={inputCls} />
                        </div>
                      ))}
                      <div>
                        <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">
                          {t("Fecha de entrega *", "Delivery date *")}
                        </label>
                        <input type="date" value={form.delivery_date}
                          min={getMinDate()} max={getMaxDate()}
                          onChange={e => handleDateChange(e.target.value)}
                          className={inputCls} />
                        {dateError && <p className="text-xs text-red-600 mt-1">{dateError}</p>}
                        <p className="text-[11px] text-ink-mute mt-1.5">{t("De lunes a domingo (excepto sábados)", "Monday to Sunday (except Saturdays)")}</p>
                      </div>
                      {form.delivery_date && !dateError && (
                        <div>
                          <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-2">
                            {t("Franja horaria *", "Time slot *")}
                          </label>
                          <div className="grid gap-2">
                            {availableSlots.map(slot => (
                              <button key={slot} type="button" onClick={() => field("delivery_time_slot", slot)}
                                className={`px-4 py-3 border text-left lc-mono text-[12px] tracking-[0.08em] transition-colors ${
                                  form.delivery_time_slot === slot ? "border-ink bg-bg-warm text-ink" : "border-rule text-ink-soft hover:border-ink"
                                }`}>
                                {slot}
                              </button>
                            ))}
                          </div>
                          {isFriday(form.delivery_date) && <p className="text-[11px] text-ink-mute mt-1.5">{t("Los viernes solo hay entrega hasta las 16:00 h", "Fridays deliver only until 4:00 pm")}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {form.shipping_method === "shalom" && (
                    <div>
                      <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">{t("Agencia Shalom *", "Shalom agency *")}</label>
                      <select value={form.shalom_agency} onChange={e => field("shalom_agency", e.target.value)}
                        className={inputCls}>
                        <option value="">{t("Seleccionar agencia...", "Select agency...")}</option>
                        {SHALOM_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep("datos")} className="lc-btn lc-btn-outline flex-1">← {t("Atrás", "Back")}</button>
                    <button onClick={() => setStep("pago")} disabled={!domicilioContinueOk}
                      className="lc-btn lc-btn-primary flex-1 disabled:opacity-50">
                      {t("Continuar", "Continue")} →
                    </button>
                  </div>
                </>
              )}

              {/* ── PAGO ── */}
              {step === "pago" && (
                <>
                  <h2 className="lc-display text-2xl text-ink">{t("Método de pago", "Payment method")}</h2>

                  <div className="grid gap-3">
                    {paymentOptions.map(opt => (
                      <button key={opt.value}
                        onClick={() => { if (!opt.disabled) { field("payment_method", opt.value); resetProof(); } }}
                        disabled={opt.disabled}
                        className={cardCls(form.payment_method === opt.value, opt.disabled)}>
                        <p className="lc-display text-lg text-ink">{opt.label}</p>
                        <p className="text-ink-soft text-sm mt-0.5">{opt.desc}</p>
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
                      <label className="flex items-center gap-1.5 lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft">
                        <Upload size={13} /> {t("Comprobante de pago *", "Payment proof *")}
                      </label>

                      {!proofUrl ? (
                        <label className={`flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 cursor-pointer transition-colors ${proofUploading ? "border-ink bg-bg-warm" : "border-rule hover:border-ink hover:bg-bg-warm"}`}>
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleProofFile} className="hidden" disabled={proofUploading} />
                          {proofUploading ? (
                            <>
                              <RefreshCw size={20} className="text-ink animate-spin" />
                              <p className="text-xs text-ink-soft">{t("Subiendo", "Uploading")} {proofFile?.name}…</p>
                            </>
                          ) : (
                            <>
                              <Upload size={20} className="text-ink-mute" />
                              <p className="text-xs font-semibold text-ink">{t("Haz clic para seleccionar", "Click to select")}</p>
                              <p className="text-[11px] text-ink-mute">JPG, PNG o PDF · máx. 5 MB</p>
                            </>
                          )}
                        </label>
                      ) : (
                        <div className="flex items-center gap-3 border border-rule bg-bg-warm p-3">
                          {proofUrl.toLowerCase().endsWith(".pdf") ? (
                            <a href={proofUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-gold-deep">
                              <FileText size={28} /> {proofFile?.name ?? "comprobante.pdf"}
                            </a>
                          ) : (
                            <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={proofUrl} alt="Comprobante" className="w-14 h-14 object-cover border border-rule" />
                            </a>
                          )}
                          <div className="flex-1">
                            <p className="lc-mono uppercase text-[10px] tracking-[0.22em] text-gold-deep">{t("Comprobante subido", "Proof uploaded")}</p>
                            {proofFile && <p className="text-[11px] text-ink-soft truncate max-w-[160px]">{proofFile.name}</p>}
                          </div>
                          <button onClick={resetProof}
                            className="lc-mono uppercase text-[9px] tracking-[0.22em] text-ink-mute hover:text-ink shrink-0">
                            {t("Cambiar", "Change")}
                          </button>
                        </div>
                      )}

                      {proofError && <p className="text-xs text-red-600">{proofError}</p>}
                    </div>
                  )}

                  {/* Submit / Culqi error */}
                  {(culqiError || submitError) && (
                    <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-700">
                      {culqiError ?? submitError}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft mb-1">{t("Notas adicionales", "Additional notes")}</label>
                    <textarea rows={2} value={form.notes} onChange={e => field("notes", e.target.value)}
                      placeholder={t("Instrucciones de entrega, talla especial, etc.", "Delivery instructions, special size, etc.")}
                      className="w-full bg-transparent border border-rule px-4 py-3 text-sm text-ink focus:outline-none focus:border-ink transition-colors" />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep("envio")} className="lc-btn lc-btn-outline flex-1">
                      ← {t("Atrás", "Back")}
                    </button>
                    <button onClick={submitOrder} disabled={confirmDisabled}
                      className="lc-btn lc-btn-primary flex-1 disabled:opacity-60">
                      {submitting ? t("Enviando…", "Sending…") : requiresProof && !proofUrl ? t("Sube el comprobante primero", "Upload proof first") : t("Confirmar pedido", "Place order")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order summary */}
          <aside className="bg-bg-warm p-5 sm:p-6 h-fit lg:sticky lg:top-6">
            <p className="lc-eyebrow mb-4">{t("Tu pedido", "Your order")}</p>
            <ul className="flex flex-col">
              {items.map(item => (
                <li key={`${item.product.id}|${item.selectedSize}|${item.selectedColor}`} className="flex gap-3 py-3 border-b border-rule first:pt-0">
                  <div className="lc-plate w-14 h-14 shrink-0 rounded-sm">
                    <Image src={`/products/${item.product.id}.jpeg`} alt={item.product.name} width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="lc-display text-base text-ink leading-tight truncate">{item.product.name}</p>
                    <p className="text-ink-soft text-xs mt-0.5">{[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")} · x{item.quantity}</p>
                  </div>
                  <p className="lc-display text-sm text-ink whitespace-nowrap">{formatSoles(fromCents(Math.round(item.product.price * 100) * item.quantity))}</p>
                </li>
              ))}
            </ul>
            <div className="pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">{t("Subtotal", "Subtotal")}</span><span className="text-ink">{formatSoles(total)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">{t("Envío", "Shipping")}</span><span className="text-ink">{formatSoles(shippingCost)}</span></div>
              <div className="flex items-baseline justify-between pt-3 mt-1 border-t border-rule">
                <span className="lc-mono uppercase text-[10px] tracking-[0.22em] text-ink-soft">Total</span>
                <span className="lc-display text-2xl text-ink">{formatSoles(grandTotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
