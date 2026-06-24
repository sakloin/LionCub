"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { formatSoles } from "../../lib/money";
import Link from "next/link";

interface MyOrder {
  id: string;
  created_at: string;
  customer_name: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  order_status: string;
  payment_status: string;
  shipping_method: string;
  shalom_agency: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  payment_method: string;
}

const STATUS_LABEL: Record<string, string> = {
  nuevo:      "Recibido",
  procesando: "Preparando",
  enviado:    "Enviado",
  entregado:  "Entregado",
  cancelado:  "Cancelado",
};

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

export default function MisPedidos() {
  const [orders, setOrders]   = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail]     = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // Wait briefly so Supabase can process a magic-link token from the URL hash
      await new Promise(r => setTimeout(r, 300));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      setEmail(session.user.email);

      try {
        const res = await fetch("/api/my-orders", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setOrders(json.orders ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Error al cargar pedidos");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <p className="text-[#9B6B45]">Cargando tus pedidos...</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center gap-4 px-4">
        <p style={{ fontSize: 32, color: "#D4A520", fontStyle: "italic", fontWeight: 700, fontFamily: "Georgia,serif" }}>Lion Cub</p>
        <p className="text-[#3D2010] font-bold text-lg text-center">Acceso requerido</p>
        <p className="text-[#9B6B45] text-sm text-center max-w-xs">
          Usa el enlace del correo de confirmación para ver tus pedidos, o escríbenos por WhatsApp.
        </p>
        <a
          href="https://wa.me/51920201943"
          className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-2xl text-sm"
        >
          Escribir por WhatsApp
        </a>
        <Link href="/" className="text-[#D4A520] text-sm font-semibold underline">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p style={{ fontSize: 32, color: "#D4A520", fontStyle: "italic", fontWeight: 700, fontFamily: "Georgia,serif" }}>Lion Cub</p>
          <h1 className="text-xl font-extrabold text-[#3D2010] mt-1">Mis pedidos</h1>
          <p className="text-[#9B6B45] text-xs mt-1">{email}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-[#9B6B45] border border-[#F5EDD8]">
            <p className="font-bold text-[#3D2010] mb-2">No hay pedidos aún</p>
            <p className="text-sm mb-4">Cuando hagas un pedido aparecerá acá.</p>
            <Link href="/" className="text-[#D4A520] font-bold text-sm underline">Ver tienda →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-[#F5EDD8] p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-[#3D2010] text-sm">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[#9B6B45] text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <p className="font-extrabold text-[#D4A520] text-lg">{formatSoles(Number(order.total))}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-bold ${STATUS_COLORS[order.order_status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABEL[order.order_status] ?? order.order_status}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-bold ${PAY_COLORS[order.payment_status] ?? "bg-gray-100 text-gray-700"}`}>
                    Pago: {order.payment_status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F5EDD8] text-xs text-[#9B6B45]">
                  {order.shipping_method === "shalom"
                    ? `📦 Shalom — ${order.shalom_agency ?? "agencia por confirmar"}`
                    : `🛵 Domicilio: ${order.district ?? ""}, ${order.city ?? "Lima"}`}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a href="https://wa.me/51920201943" className="text-[#9B6B45] text-xs underline">
            ¿Consultas? Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
