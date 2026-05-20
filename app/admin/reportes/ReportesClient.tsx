"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatSoles } from "../../lib/money";

const COLORS = ["#D4A520","#8BAF7A","#F5C4A8","#6B3D1E","#87CEEB","#FFD1DC"];

interface Props {
  data: { orders: any[]; items: any[]; purchases: any[] };
}

export default function ReportesClient({ data }: Props) {
  const { orders, items, purchases } = data;

  const months = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => set.add(o.created_at.slice(0,7)));
    if (!set.size) set.add(new Date().toISOString().slice(0,7));
    return Array.from(set).sort().reverse();
  }, [orders]);

  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const monthOrders = orders.filter(o => o.created_at.startsWith(selectedMonth));
  const monthPaid = monthOrders.filter(o => o.payment_status === "pagado");
  const monthRevenue = monthPaid.reduce((s, o) => s + Number(o.total), 0);
  const monthItems = items.filter(i => monthOrders.some(o => o.id === i.order_id));
  const monthCOGS = monthItems.reduce((s, i) => s + i.quantity * i.unit_cost, 0);
  const monthPurchases = purchases.filter(p => p.purchased_at?.startsWith(selectedMonth));
  const monthPurchaseCost = monthPurchases.reduce((s, p) => s + Number(p.total_cost), 0);
  const monthProfit = monthRevenue - monthCOGS;
  const margin = monthRevenue > 0 ? ((monthProfit / monthRevenue) * 100).toFixed(1) : "0";
  const shippingRevenue = monthPaid.reduce((s, o) => s + Number(o.shipping_cost), 0);

  // Category sales
  const catSales: Record<string, number> = {};
  monthItems.forEach(i => {
    const o = monthOrders.find(x => x.id === i.order_id);
    if (o?.payment_status === "pagado") {
      const cat = i.product_id?.slice(0,2) === "LC" ? (i.product_id <= "LC-099" ? "Conjuntos" : i.product_id <= "LC-199" ? "Bodies" : i.product_id <= "LC-299" ? "Baberos" : "Mantas") : "Otros";
      catSales[cat] = (catSales[cat] ?? 0) + i.subtotal;
    }
  });

  // Product ranking
  const prodSales: Record<string, { name:string; qty:number; revenue:number; profit:number }> = {};
  monthItems.forEach(i => {
    const o = monthOrders.find(x => x.id === i.order_id);
    if (o?.payment_status === "pagado") {
      if (!prodSales[i.product_id]) prodSales[i.product_id] = { name: i.product_name, qty:0, revenue:0, profit:0 };
      prodSales[i.product_id].qty += i.quantity;
      prodSales[i.product_id].revenue += i.subtotal;
      prodSales[i.product_id].profit += i.subtotal - i.quantity * i.unit_cost;
    }
  });
  const topProds = Object.values(prodSales).sort((a,b) => b.revenue - a.revenue);

  const pieData = Object.entries(catSales).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Reportes</h1>
          <p className="text-[#9B6B45] text-sm">Balance financiero por mes</p>
        </div>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm font-bold text-[#3D2010] focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
        >
          {months.map(m => (
            <option key={m} value={m}>
              {new Date(m+"-01").toLocaleDateString("es-PE", { month:"long", year:"numeric" })}
            </option>
          ))}
        </select>
      </div>

      {/* Financial balance */}
      <div className="bg-[#3D2010] text-white rounded-2xl p-6">
        <h2 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-5">Balance del mes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label:"Ingresos totales", value: formatSoles(monthRevenue),      color:"text-[#D4A520]" },
            { label:"Costo mercadería", value: formatSoles(monthCOGS),         color:"text-white" },
            { label:"Compras de stock", value: formatSoles(monthPurchaseCost), color:"text-white" },
            { label:"Utilidad bruta",   value: formatSoles(monthProfit),       color: monthProfit >= 0 ? "text-green-400" : "text-red-400" },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-white/50 text-xs mb-1">{item.label}</p>
              <p className={`text-xl font-extrabold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div><p className="text-white/50 text-xs">Pedidos totales</p><p className="font-bold">{monthOrders.length}</p></div>
          <div><p className="text-white/50 text-xs">Pedidos pagados</p><p className="font-bold text-green-400">{monthPaid.length}</p></div>
          <div><p className="text-white/50 text-xs">Margen bruto</p><p className="font-bold text-[#D4A520]">{margin}%</p></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010] mb-4">Ventas por categoría</h2>
          {pieData.length === 0 ? (
            <p className="text-[#9B6B45] text-sm">Sin ventas este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0)*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [formatSoles(Number(v)), ""]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010] mb-4">Rentabilidad por producto</h2>
          {topProds.length === 0 ? (
            <p className="text-[#9B6B45] text-sm">Sin ventas este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProds.slice(0,6)} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={(v: any) => [formatSoles(Number(v)), ""]} />
                <Bar dataKey="revenue" fill="#D4A520" radius={[0,4,4,0]} name="Ingresos" />
                <Bar dataKey="profit" fill="#8BAF7A" radius={[0,4,4,0]} name="Utilidad" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Product detail table */}
      <div className="bg-white rounded-2xl border border-[#F5EDD8] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010]">Detalle de ventas por producto</h2>
        </div>
        {topProds.length === 0 ? (
          <p className="p-6 text-[#9B6B45] text-sm">Sin ventas registradas este mes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">Producto</th>
                  <th className="px-4 py-2 text-right font-bold">Uds.</th>
                  <th className="px-4 py-2 text-right font-bold">Ingresos</th>
                  <th className="px-4 py-2 text-right font-bold">Utilidad</th>
                  <th className="px-4 py-2 text-right font-bold">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EDD8]">
                {topProds.map(p => (
                  <tr key={p.name} className="hover:bg-[#FDF8F0]">
                    <td className="px-4 py-2.5 font-medium text-[#3D2010]">{p.name}</td>
                    <td className="px-4 py-2.5 text-right">{p.qty}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-[#D4A520]">{formatSoles(p.revenue)}</td>
                    <td className={`px-4 py-2.5 text-right font-bold ${p.profit >= 0 ? "text-green-600" : "text-red-500"}`}>{formatSoles(p.profit)}</td>
                    <td className="px-4 py-2.5 text-right text-[#9B6B45]">{p.revenue > 0 ? ((p.profit/p.revenue)*100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
