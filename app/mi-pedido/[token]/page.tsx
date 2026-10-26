export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Package, Send, Truck } from "lucide-react";

interface Props {
  params: Promise<{ token: string }>;
}

const STEPS = [
  { key: "recibido",   label: "Recibido",    icon: Clock },
  { key: "pagado",     label: "Pagado",      icon: CheckCircle2 },
  { key: "preparando", label: "Preparando",  icon: Package },
  { key: "enviado",    label: "Enviado",     icon: Send },
  { key: "entregado",  label: "Entregado",   icon: Truck },
] as const;

function getActiveStep(order: {
  order_status: string;
  payment_status: string;
}): number {
  if (order.order_status === "entregado") return 4;
  if (order.order_status === "enviado")   return 3;
  if (order.order_status === "procesando") return 2;
  if (order.payment_status === "pagado")  return 1;
  return 0;
}

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default async function MiPedidoPage({ params }: Props) {
  const { token } = await params;

  // token is the order UUID — validate format before querying
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(token)) notFound();

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id,customer_name,order_status,payment_status,payment_paid_at,created_at,shipping_method,delivery_date,notes")
    .eq("id", token)
    .single();

  if (!order) notFound();

  const activeStep = getActiveStep(order);
  const isCancelled = order.order_status === "cancelado";

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-rule bg-bg-card">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-gold-deep font-bold text-lg" style={{ fontFamily: "cursive" }}>
            Lion Cub
          </Link>
          <p className="text-ink-mute text-xs font-mono uppercase tracking-wider">Estado del pedido</p>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Order summary */}
        <div className="bg-bg-card rounded-2xl border border-rule p-5 shadow-sm">
          <p className="text-xs font-mono text-ink-mute uppercase tracking-widest mb-1">Pedido</p>
          <p className="font-bold text-ink text-lg">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-ink-soft text-sm mt-1">{order.customer_name}</p>
          <p className="text-ink-mute text-xs mt-0.5">{fmtDate(order.created_at)}</p>
        </div>

        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="font-bold text-red-700 text-lg">Pedido cancelado</p>
            <p className="text-red-600 text-sm mt-1">Este pedido fue cancelado. Escríbenos si tienes dudas.</p>
          </div>
        ) : (
          /* Timeline */
          <div className="bg-bg-card rounded-2xl border border-rule p-5 shadow-sm">
            <h2 className="font-bold text-ink mb-5">¿Dónde está tu pedido?</h2>
            <ol className="relative flex flex-col gap-0">
              {STEPS.map((step, idx) => {
                const done    = idx <= activeStep;
                const current = idx === activeStep;
                const Icon    = step.icon;
                return (
                  <li key={step.key} className="flex gap-4">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        done
                          ? current
                            ? "bg-gold text-white ring-2 ring-gold ring-offset-2"
                            : "bg-gold-pale text-gold-deep"
                          : "bg-bg-warm text-ink-mute"
                      }`}>
                        {done && !current
                          ? <CheckCircle2 size={18} />
                          : <Icon size={18} />
                        }
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[24px] mt-1 mb-1 ${done && idx < activeStep ? "bg-gold" : "bg-rule"}`} />
                      )}
                    </div>

                    {/* Label */}
                    <div className={`pb-5 flex flex-col justify-start pt-1.5 ${idx < STEPS.length - 1 ? "min-h-[56px]" : ""}`}>
                      <p className={`font-semibold text-sm leading-tight ${done ? current ? "text-gold-deep" : "text-ink" : "text-ink-mute"}`}>
                        {step.label}
                        {current && <span className="ml-2 inline-block bg-gold-pale text-gold-deep text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">Ahora</span>}
                      </p>
                      {/* Step-specific dates */}
                      {step.key === "recibido" && (
                        <p className="text-xs text-ink-mute mt-0.5">{fmtDate(order.created_at)}</p>
                      )}
                      {step.key === "pagado" && order.payment_paid_at && (
                        <p className="text-xs text-ink-mute mt-0.5">{fmtDate(order.payment_paid_at)}</p>
                      )}
                      {step.key === "entregado" && order.delivery_date && (
                        <p className="text-xs text-ink-mute mt-0.5">Estimado: {fmtDate(order.delivery_date)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Notes from store */}
        {order.notes && (
          <div className="bg-bg-soft rounded-2xl border border-rule-soft p-4 text-sm text-ink-soft">
            <p className="font-semibold text-ink text-xs uppercase tracking-wider mb-1 font-mono">Nota del equipo</p>
            <p>{order.notes}</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <p className="text-ink-mute text-xs mb-2">¿Tienes alguna duda sobre tu pedido?</p>
          <a
            href="https://wa.me/51920201943"
            target="_blank"
            rel="noopener noreferrer"
            className="lc-btn lc-btn-whatsapp inline-flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escribir por WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
