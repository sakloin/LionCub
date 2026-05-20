"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, DollarSign } from "lucide-react";
import { formatSoles } from "../../lib/money";

interface Stats {
  totalRevenue: number; totalCOGS: number; grossProfit: number; totalPurchases: number;
  orderCount: number; paidCount: number; pendingCount: number;
  salesByDay: { day: string; total: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; category: string }[];
  productCount: number;
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8] flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[#9B6B45] text-xs font-semibold">{label}</p>
        <p className="text-2xl font-extrabold text-[#3D2010] mt-0.5">{value}</p>
        {sub && <p className="text-[#C4956A] text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardClient({ stats }: { stats: Stats }) {
  const margin = stats.totalRevenue > 0 ? ((stats.grossProfit / stats.totalRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3D2010]">Dashboard</h1>
        <p className="text-[#9B6B45] text-sm">Resumen del mes actual</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ingresos del mes" value={formatSoles(stats.totalRevenue)} sub={`${stats.paidCount} pedidos pagados`} icon={DollarSign} color="bg-[#F5E9B8] text-[#A07D10]" />
        <StatCard label="Utilidad bruta" value={formatSoles(stats.grossProfit)} sub={`Margen ${margin}%`} icon={TrendingUp} color="bg-[#D4EAC8] text-[#4A7A3A]" />
        <StatCard label="Pedidos totales" value={String(stats.orderCount)} sub={`${stats.pendingCount} pendientes`} icon={ShoppingCart} color="bg-[#FDE8DC] text-[#C45A2A]" />
        <StatCard label="Productos activos" value={String(stats.productCount)} sub="en catálogo" icon={Package} color="bg-[#E8E8F8] text-[#5A5AB0]" />
      </div>

      {/* Chart + Top products */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010] mb-4">Ventas últimos 14 días (S/)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.salesByDay} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EDD8" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9B6B45" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9B6B45" }} />
              <Tooltip formatter={(v: any) => [formatSoles(Number(v)), "Ventas"]} />
              <Bar dataKey="total" fill="#D4A520" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010] mb-4">Productos más vendidos</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-[#9B6B45] text-sm">Sin ventas aún este mes</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F5E9B8] text-[#A07D10] text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                    <span className="text-sm text-[#3D2010] font-semibold leading-tight line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-[#D4A520]">{formatSoles(p.revenue)}</p>
                    <p className="text-xs text-[#9B6B45]">{p.qty} uds.</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {stats.lowStock.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="font-bold text-[#3D2010]">Stock bajo (≤3 unidades)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.lowStock.map(p => (
              <div key={p.id} className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="font-bold text-orange-700 text-sm">{p.stock}</p>
                <p className="text-xs text-orange-600 mt-0.5 leading-tight">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial summary */}
      <div className="bg-[#3D2010] text-white rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">Ingresos</p>
          <p className="text-xl font-extrabold text-[#D4A520]">{formatSoles(stats.totalRevenue)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">Costo mercadería</p>
          <p className="text-xl font-extrabold text-white">{formatSoles(stats.totalCOGS)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">Compras realizadas</p>
          <p className="text-xl font-extrabold text-white">{formatSoles(stats.totalPurchases)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">Utilidad bruta</p>
          <p className={`text-xl font-extrabold ${stats.grossProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatSoles(stats.grossProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}
