"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Order } from "../../lib/types";
import { ChevronDown, ChevronUp, Package2 } from "lucide-react";

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

export default function PedidosAdmin() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filter,       setFilter]       = useState("todos");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [orderItems,   setOrderItems]   = useState<Record<string, OrderItemDetail[]>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  // product image map: product_id → image_url
  const [productImgs,  setProductImgs]  = useState<Record<string, string>>({});

  async function load() {
    setError(null);
    try {
      const [ordersRes, prodsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,image_url"),
      ]);
      if (ordersRes.error) throw new Error(ordersRes.error.message);
      setOrders(ordersRes.data ?? []);
      if (prodsRes.data) {
        const map: Record<string, string> = {};
        prodsRes.data.forEach((p: any) => { if (p.image_url) map[p.id] = p.image_url; });
        setProductImgs(map);
      }
    } catch (e: any) {
      console.error("[admin/pedidos] load failed:", e);
      setError(e?.message ?? "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (orderItems[orderId]) return; // already cached
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
    await supabase.from("orders").update({ [field]: value }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
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
      <div>
        <h1 className="text-2xl font-extrabold text-[#3D2010]">Pedidos</h1>
        <p className="text-[#9B6B45] text-sm">{orders.length} pedidos totales</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["todos","nuevo","procesando","enviado","entregado","cancelado"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${filter === s ? "bg-[#D4A520] text-white" : "bg-white text-[#6B3D1E] border border-[#F5EDD8] hover:border-[#D4A520]"}`}
          >
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
            const isExpanded = expandedId === order.id;
            const items = orderItems[order.id];
            const isLoadingItems = loadingItems.has(order.id);

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-[#F5EDD8] overflow-hidden">
                {/* Clickable header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full text-left p-5 hover:bg-[#FDF8F0] transition-colors"
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
                    <p className="font-extrabold text-[#D4A520] text-lg">S/ {Number(order.total).toFixed(2)}</p>
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

                {/* Status controls */}
                <div className="px-5 pb-4 flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9B6B45]">Pago:</span>
                    <select
                      value={order.payment_status}
                      onChange={e => updateStatus(order.id, "payment_status", e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full border-0 ${PAY_COLORS[order.payment_status]} cursor-pointer`}
                    >
                      {["pendiente","pagado","fallido"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
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
                              {/* Thumbnail */}
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5EDD8] flex-shrink-0">
                                {imgUrl ? (
                                  <img src={imgUrl} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#C4956A] text-[10px] font-bold">
                                    {item.product_sku}
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#3D2010] text-sm leading-tight line-clamp-1">{item.product_name}</p>
                                <p className="text-[#9B6B45] text-xs">
                                  {item.product_sku}
                                  {item.selected_size  ? ` · ${item.selected_size}`  : ""}
                                  {item.selected_color ? ` · ${item.selected_color}` : ""}
                                </p>
                                <p className="text-[#9B6B45] text-xs">S/ {Number(item.unit_price).toFixed(2)} c/u</p>
                              </div>

                              {/* Qty + subtotal */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-[#3D2010] bg-[#F5EDD8] rounded-full px-2 py-0.5 mb-1">x{item.quantity}</p>
                                <p className="font-bold text-[#D4A520] text-sm">S/ {Number(item.subtotal).toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}

                        {/* Totals row */}
                        <div className="flex justify-end gap-4 pt-2 text-xs text-[#9B6B45] border-t border-[#F5EDD8]">
                          <span>Subtotal: <strong className="text-[#3D2010]">S/ {Number(order.subtotal).toFixed(2)}</strong></span>
                          <span>Envío: <strong className="text-[#3D2010]">S/ {Number(order.shipping_cost).toFixed(2)}</strong></span>
                          <span>Total: <strong className="text-[#D4A520]">S/ {Number(order.total).toFixed(2)}</strong></span>
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
