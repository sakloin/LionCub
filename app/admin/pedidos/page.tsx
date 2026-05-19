"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Order } from "../../lib/types";

const STATUS_COLORS: Record<string, string> = {
  nuevo: "bg-blue-100 text-blue-700",
  procesando: "bg-yellow-100 text-yellow-700",
  enviado: "bg-purple-100 text-purple-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};
const PAY_COLORS: Record<string, string> = {
  pendiente: "bg-orange-100 text-orange-700",
  pagado: "bg-green-100 text-green-700",
  fallido: "bg-red-100 text-red-700",
};

export default function PedidosAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("todos");

  async function load() {
    setError(null);
    try {
      const { data, error: sbError } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (sbError) throw new Error(sbError.message);
      setOrders(data ?? []);
    } catch (e: any) {
      console.error("[admin/pedidos] load failed:", e);
      setError(e?.message ?? "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8]">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-[#3D2010]">{order.customer_name}</p>
                  <p className="text-[#9B6B45] text-xs">{order.customer_phone} · {new Date(order.created_at).toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}</p>
                </div>
                <p className="font-extrabold text-[#D4A520] text-lg">S/ {Number(order.total).toFixed(2)}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                <span className="bg-[#F5EDD8] text-[#6B3D1E] px-2 py-1 rounded-full font-semibold">
                  {order.shipping_method === "shalom" ? `📦 Shalom: ${order.shalom_agency}` : `🛵 Domicilio: ${order.district}`}
                </span>
                <span className="bg-[#F5EDD8] text-[#6B3D1E] px-2 py-1 rounded-full font-semibold">
                  💳 {order.payment_method}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
