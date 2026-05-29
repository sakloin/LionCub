"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Order } from "../../lib/types";
import { formatSoles } from "../../lib/money";
import { ChevronDown, ChevronUp, Package2, MessageCircle, FileText, Check, XCircle } from "lucide-react";

interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const STATUS_COLORS: Record<string, string> = {
  nuevo:      "bg-blue-100 text-blue-700",
  procesando: "bg-yellow-100 text-yellow-700",
  enviado:    "bg-purple-100 text-purple-700",
  entregado:  "bg-green-100 text-green-700",
  cancelado:  "bg-red-100 text-red-700",
};
const PAY_COLORS: Record<string, string> = {
  pendiente: "bg-orange-100 text-orange-700",
  pagado:    "bg-green-100 text-green-700",
  fallido:   "bg-red-100 text-red-700",
};

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" });
}

function fmtPhone(raw: string): string | null {
  const c = raw.replace(/[\s\-\(\)\+]/g, "");
  if (!c) return null;
  if (/^51\d{9}$/.test(c)) return c;
  if (/^\d{9}$/.test(c)) return `51${c}`;
  if (c.length >= 11) return c;
  return null;
}

function orderWaUrl(order: Order): { url: string; valid: boolean } {
  const phone = fmtPhone(order.customer_phone ?? "");
  if (!phone) return { url: "", valid: false };
  const msg = encodeURIComponent(
    `Hola ${order.customer_name}, te escribo de Lion Cub 🦁 por tu pedido #${order.id.slice(0, 8).toUpperCase()} de ${formatSoles(Number(order.total))}. ¿En qué te puedo ayudar?`
  );
  return { url: `https://wa.me/${phone}?text=${msg}`, valid: true };
}

export default function PedidosAdmin() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filter,       setFilter]       = useState("todos");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [orderItems,   setOrderItems]   = useState<Record<string, OrderItemDetail[]>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [productImgs,  setProductImgs]  = useState<Record<string, string>>({});
  // Map of the publicUrl/path stored in orders.payment_proof_url → time-limited
  // signed URL fetched from /api/admin/proof-url. Built after orders load.
  const [proofUrls,    setProofUrls]    = useState<Record<string, string>>({});
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  }

  async function load() {
    setError(null);
    try {
      const [ordersRes, prodsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,image_url"),
      ]);
      if (ordersRes.error) throw new Error(ordersRes.error.message);
      const fetched = ordersRes.data ?? [];
      setOrders(fetched);
      if (prodsRes.data) {
        const map: Record<string, string> = {};
        prodsRes.data.forEach((p: any) => { if (p.image_url) map[p.id] = p.image_url; });
        setProductImgs(map);
      }
      // Fire-and-forget: request signed URLs for every order that has a proof.
      // payment-proofs is a private bucket; the publicUrl stored historically
      // no longer renders, so we always need a fresh signed URL.
      void fetchProofUrls(fetched);
    } catch (e: any) {
      console.error("[admin/pedidos] load failed:", e);
      setError(e?.message ?? "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProofUrls(orderList: Order[]) {
    const paths = Array.from(
      new Set(
        orderList
          .map((o) => o.payment_proof_url)
          .filter((p): p is string => typeof p === "string" && p.length > 0)
      )
    );
    if (paths.length === 0) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return; // No sesión — el RLS de admin debería haberlo evitado igual.
      const res = await fetch("/api/admin/proof-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paths }),
      });
      if (!res.ok) {
        console.error("[admin/pedidos] proof-url fetch failed:", res.status);
        return;
      }
      const json = await res.json();
      const signed = (json?.signedUrls ?? {}) as Record<string, string>;
      setProofUrls((prev) => ({ ...prev, ...signed }));
    } catch (e) {
      console.error("[admin/pedidos] proof-url fetch error:", e);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (orderItems[orderId]) return;
    setLoadingItems(prev => new Set(prev).add(orderId));
    try {
      const { data } = await supabase
        .from("order_items")
        .select("id,product_id,product_name,product_sku,selected_size,selected_color,quantity,unit_price,subtotal")
        .eq("order_id", orderId)
        .order("id");
      setOrderItems(prev => ({ ...prev, [orderId]: data ?? [] }));
    } catch (e) {
      console.error("[admin/pedidos] loadItems failed:", e);
    } finally {
      setLoadingItems(prev => { const s = new Set(prev); s.delete(orderId); return s; });
    }
  }

  async function updateStatus(id: string, field: "order_status" | "payment_status", value: string) {
    try {
      const { error: dbErr } = await supabase.from("orders").update({ [field]: value }).eq("id", id);
      if (dbErr) throw dbErr;
      setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
      setExpandedId(null);
      showToast("Pedido actualizado");
    } catch (e: any) {
      showToast(e?.message ?? "Error al actualizar", false);
    }
  }

  async function handleConfirmPayment(id: string) {
    try {
      const { error: dbErr } = await supabase.from("orders").update({ payment_status: "pagado" }).eq("id", id);
      if (dbErr) throw dbErr;
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: "pagado" } : o));
      setExpandedId(null);
      showToast("Pago confirmado ✓");
    } catch (e: any) {
      showToast(e?.message ?? "Error al confirmar pago", false);
    }
  }

  async function handleRejectPayment(order: Order) {
    try {
      const { error: dbErr } = await supabase.from("orders").update({ payment_status: "fallido" }).eq("id", order.id);
      if (dbErr) throw dbErr;
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: "fallido" } : o));
      setExpandedId(null);
      showToast("Comprobante marcado como inválido");
      const phone = fmtPhone(order.customer_phone ?? "");
      if (phone) {
        const msg = encodeURIComponent(
          `Hola ${order.customer_name}, no pudimos validar tu comprobante del pedido #${order.id.slice(0, 8).toUpperCase()}. ¿Podrías reenviarlo? 🦁`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      }
    } catch (e: any) {
      showToast(e?.message ?? "Error al rechazar pago", false);
    }
  }

  const filtered = filter === "todos" ? orders : orders.filter(o => o.order_status === filter);

  if (loading) return <p className="text-[#9B6B45]">Cargando...</p>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
      <p className="font-bold mb-1">Error al cargar pedidos</p>
      <p className="text-sm font-mono">{error}</p>
      <button onClick={load} className="mt-3 text-xs font-bold underline">Reintentar</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold pointer-events-none ${toast.ok ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-[#3D2010]">Pedidos</h1>
        <p className="text-[#9B6B45] text-sm">{orders.length} pedidos totales</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["todos","nuevo","procesando","enviado","entregado","cancelado"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${filter === s ? "bg-[#D4A520] text-white" : "bg-white text-[#6B3D1E] border border-[#F5EDD8] hover:border-[#D4A520]"}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-[#9B6B45] border border-[#F5EDD8]">
          No hay pedidos {filter !== "todos" ? `con estado "${filter}"` : "aún"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => {
            const isExpanded     = expandedId === order.id;
            const items          = orderItems[order.id];
            const isLoadingItems = loadingItems.has(order.id);
            const wa             = orderWaUrl(order);
            const proofUrl       = (order as any).payment_proof_url as string | null;
            const proofIsPdf     = !!proofUrl && proofUrl.toLowerCase().includes(".pdf");
            const proofSigned    = proofUrl ? proofUrls[proofUrl] : null;

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-[#F5EDD8] overflow-hidden">
                {/* Header row: expand area + WA button */}
                <div className="flex items-stretch">
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="flex-1 min-w-0 text-left p-5 hover:bg-[#FDF8F0] transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#3D2010]">{order.customer_name}</p>
                          {isExpanded ? <ChevronUp size={14} className="text-[#9B6B45]" /> : <ChevronDown size={14} className="text-[#9B6B45]" />}
                        </div>
                        <p className="text-[#9B6B45] text-xs">
                          {order.customer_phone} · {new Date(order.created_at).toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                        </p>
                      </div>
                      <p className="font-extrabold text-[#D4A520] text-lg">{formatSoles(Number(order.total))}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-[#F5EDD8] text-[#6B3D1E] px-2 py-1 rounded-full font-semibold">
                        {order.shipping_method === "shalom"
                          ? `📦 Shalom: ${order.shalom_agency}`
                          : `🛵 Domicilio: ${order.district}`}
                      </span>
                      {order.delivery_date && (
                        <span className="bg-[#F5EDD8] text-[#6B3D1E] px-2 py-1 rounded-full font-semibold">
                          📅 {fmtDate(order.delivery_date)}{order.delivery_time_slot ? ` · ${order.delivery_time_slot}` : ""}
                        </span>
                      )}
                      <span className="bg-[#F5EDD8] text-[#6B3D1E] px-2 py-1 rounded-full font-semibold">
                        💳 {order.payment_method}
                      </span>
                    </div>
                  </button>

                  {/* WhatsApp button */}
                  {wa.valid ? (
                    <a href={wa.url} target="_blank" rel="noopener noreferrer" title="WhatsApp al cliente"
                      className="flex items-center px-4 text-[#25D366] hover:bg-green-50 border-l border-[#F5EDD8] transition-colors flex-shrink-0"
                      onClick={e => e.stopPropagation()}>
                      <MessageCircle size={20} />
                    </a>
                  ) : (
                    <div title="Teléfono no disponible" className="flex items-center px-4 text-gray-300 border-l border-[#F5EDD8] flex-shrink-0">
                      <MessageCircle size={20} />
                    </div>
                  )}
                </div>

                {/* Status controls */}
                <div className="px-5 pb-4 flex flex-col gap-2.5">
                  {/* Payment row: select + proof thumbnail + quick action buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#9B6B45]">Pago:</span>
                    <select
                      value={order.payment_status}
                      onChange={e => updateStatus(order.id, "payment_status", e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full border-0 ${PAY_COLORS[order.payment_status] ?? "bg-gray-100 text-gray-700"} cursor-pointer`}
                    >
                      {["pendiente","pagado","fallido"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Proof thumbnail / PDF badge — opens via 1h signed URL */}
                    {proofUrl && (
                      proofIsPdf ? (
                        <a
                          href={proofSigned ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={!proofSigned}
                          className={`flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors ${proofSigned ? "" : "opacity-50 pointer-events-none"}`}
                          title={proofSigned ? "Ver comprobante PDF" : "Generando enlace…"}>
                          <FileText size={14} /> PDF
                        </a>
                      ) : (
                        <a
                          href={proofSigned ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={!proofSigned}
                          className={proofSigned ? "" : "opacity-50 pointer-events-none"}
                          title={proofSigned ? "Ver comprobante" : "Generando enlace…"}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proofSigned ?? ""}
                            alt="Comprobante"
                            className="w-8 h-8 rounded-lg object-cover border border-[#F5EDD8] hover:opacity-80 transition-opacity bg-[#F5EDD8]"
                          />
                        </a>
                      )
                    )}

                    {/* Quick action: Confirm payment */}
                    <button
                      onClick={() => handleConfirmPayment(order.id)}
                      disabled={order.payment_status === "pagado"}
                      className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Marcar pago como confirmado"
                    >
                      <Check size={12} /> Confirmar
                    </button>

                    {/* Quick action: Reject proof */}
                    <button
                      onClick={() => handleRejectPayment(order)}
                      disabled={order.payment_status === "fallido"}
                      className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Marcar comprobante como inválido y avisar al cliente por WhatsApp"
                    >
                      <XCircle size={12} /> Inválido
                    </button>
                  </div>

                  {/* Order status row */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9B6B45]">Estado:</span>
                    <select
                      value={order.order_status}
                      onChange={e => updateStatus(order.id, "order_status", e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full border-0 ${STATUS_COLORS[order.order_status]} cursor-pointer`}
                    >
                      {["nuevo","procesando","enviado","entregado","cancelado"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {order.notes && <p className="text-xs text-[#9B6B45] italic">"{order.notes}"</p>}
                </div>

                {/* Expanded: order items */}
                {isExpanded && (
                  <div className="border-t border-[#F5EDD8] px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package2 size={14} className="text-[#D4A520]" />
                      <p className="text-xs font-bold text-[#6B3D1E] uppercase tracking-wide">Productos del pedido</p>
                    </div>

                    {isLoadingItems ? (
                      <p className="text-xs text-[#9B6B45]">Cargando...</p>
                    ) : !items || items.length === 0 ? (
                      <p className="text-xs text-[#9B6B45]">Sin ítems registrados</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {items.map(item => {
                          const imgUrl = productImgs[item.product_id];
                          return (
                            <div key={item.id} className="flex items-center gap-3 bg-[#FDF8F0] rounded-xl p-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5EDD8] flex-shrink-0">
                                {imgUrl ? (
                                  <img src={imgUrl} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#C4956A] text-[10px] font-bold">{item.product_sku}</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#3D2010] text-sm leading-tight line-clamp-1">{item.product_name}</p>
                                <p className="text-[#9B6B45] text-xs">
                                  {item.product_sku}
                                  {item.selected_size  ? ` · ${item.selected_size}`  : ""}
                                  {item.selected_color ? ` · ${item.selected_color}` : ""}
                                </p>
                                <p className="text-[#9B6B45] text-xs">{formatSoles(Number(item.unit_price))} c/u</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-[#3D2010] bg-[#F5EDD8] rounded-full px-2 py-0.5 mb-1">x{item.quantity}</p>
                                <p className="font-bold text-[#D4A520] text-sm">{formatSoles(Number(item.subtotal))}</p>
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex justify-end gap-4 pt-2 text-xs text-[#9B6B45] border-t border-[#F5EDD8]">
                          <span>Subtotal: <strong className="text-[#3D2010]">{formatSoles(Number(order.subtotal))}</strong></span>
                          <span>Envío: <strong className="text-[#3D2010]">{formatSoles(Number(order.shipping_cost))}</strong></span>
                          <span>Total: <strong className="text-[#D4A520]">{formatSoles(Number(order.total))}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
