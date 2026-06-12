"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatSoles } from "../../lib/money";

const CHART_COLORS = ["#D4A520","#8BAF7A","#F5C4A8","#6B3D1E","#87CEEB","#FFD1DC","#C7A8E8","#FFA07A"];

const CATEGORY_LABELS: Record<string, string> = {
  conjuntos: "Conjuntos",
  bodies:    "Bodies",
  baberos:   "Baberos",
  mantas:    "Mantas",
};

interface ProductRow {
  id: string;
  name: string;
  category: string;
  variants?: Array<{
    id: string;
    stock: number;
    active: boolean;
    size:  { name: string; sort_order: number } | null;
    color: { name: string; hex_code: string | null } | null;
  }>;
}

interface ColorRow { name: string; hex_code: string | null }

interface Props {
  data: {
    orders:    any[];
    items:     any[];
    purchases: any[];
    products:  ProductRow[];
    colors:    ColorRow[];
  };
}

export default function ReportesClient({ data }: Props) {
  const { orders, items, purchases, products, colors } = data;

  const productMap = useMemo(() => {
    const m = new Map<string, ProductRow>();
    products.forEach(p => m.set(p.id, p));
    return m;
  }, [products]);

  const colorHex = useMemo(() => {
    const m = new Map<string, string | null>();
    colors.forEach(c => m.set(c.name, c.hex_code));
    return m;
  }, [colors]);

  const months = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => set.add(o.created_at.slice(0,7)));
    if (!set.size) set.add(new Date().toISOString().slice(0,7));
    return Array.from(set).sort().reverse();
  }, [orders]);

  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const monthOrders = orders.filter(o => o.created_at.startsWith(selectedMonth));
  const paidIds     = new Set(monthOrders.filter(o => o.payment_status === "pagado").map(o => o.id));
  const monthPaid   = monthOrders.filter(o => paidIds.has(o.id));
  const monthRevenue = monthPaid.reduce((s, o) => s + Number(o.total), 0);
  const monthItems  = items.filter(i => monthOrders.some(o => o.id === i.order_id));
  const monthCOGS   = monthItems.reduce((s, i) => s + i.quantity * i.unit_cost, 0);
  const monthPurchases = purchases.filter(p => p.purchased_at?.startsWith(selectedMonth));
  const monthPurchaseCost = monthPurchases.reduce((s, p) => s + Number(p.total_cost), 0);
  const monthProfit = monthRevenue - monthCOGS;
  const margin = monthRevenue > 0 ? ((monthProfit / monthRevenue) * 100).toFixed(1) : "0";

  // ── Paid items only for ranking sections ─────────────────────────────────
  const paidItems = monthItems.filter(i => paidIds.has(i.order_id));

  // ── Categories (from product.category, not LC- ranges) ──────────────────
  const catSales: Record<string, number> = {};
  paidItems.forEach(i => {
    const cat = productMap.get(i.product_id)?.category ?? "otros";
    const label = CATEGORY_LABELS[cat] ?? cat;
    catSales[label] = (catSales[label] ?? 0) + Number(i.subtotal);
  });
  const pieData = Object.entries(catSales).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  // ── Product ranking ─────────────────────────────────────────────────────
  const prodSales: Record<string, { name:string; qty:number; revenue:number; profit:number }> = {};
  paidItems.forEach(i => {
    if (!prodSales[i.product_id]) prodSales[i.product_id] = { name: i.product_name, qty:0, revenue:0, profit:0 };
    prodSales[i.product_id].qty     += i.quantity;
    prodSales[i.product_id].revenue += Number(i.subtotal);
    prodSales[i.product_id].profit  += Number(i.subtotal) - i.quantity * Number(i.unit_cost);
  });
  const topProds = Object.values(prodSales).sort((a,b) => b.revenue - a.revenue);

  // ── Per-size sales ──────────────────────────────────────────────────────
  const sizeSales: Record<string, { qty:number; revenue:number }> = {};
  paidItems.forEach(i => {
    const key = i.selected_size ?? "—";
    if (!sizeSales[key]) sizeSales[key] = { qty:0, revenue:0 };
    sizeSales[key].qty     += i.quantity;
    sizeSales[key].revenue += Number(i.subtotal);
  });
  const sizeBars = Object.entries(sizeSales)
    .map(([name, v]) => ({ name: `T${name}`, qty: v.qty, revenue: +v.revenue.toFixed(2) }))
    .sort((a,b) => a.name.localeCompare(b.name));

  // ── Per-color sales ─────────────────────────────────────────────────────
  const colorSales: Record<string, { qty:number; revenue:number }> = {};
  paidItems.forEach(i => {
    const key = i.selected_color ?? "—";
    if (!colorSales[key]) colorSales[key] = { qty:0, revenue:0 };
    colorSales[key].qty     += i.quantity;
    colorSales[key].revenue += Number(i.subtotal);
  });
  const colorBars = Object.entries(colorSales)
    .map(([name, v]) => ({ name, qty: v.qty, revenue: +v.revenue.toFixed(2), hex: colorHex.get(name) ?? null }))
    .sort((a,b) => b.qty - a.qty);

  // ── Top variant combos (talla × color × producto) ───────────────────────
  type ComboRow = { product_name:string; size:string; color:string; qty:number; revenue:number; profit:number };
  const comboMap: Record<string, ComboRow> = {};
  paidItems.forEach(i => {
    const key = `${i.product_id}|${i.selected_size ?? ""}|${i.selected_color ?? ""}`;
    if (!comboMap[key]) {
      comboMap[key] = {
        product_name: i.product_name,
        size:  i.selected_size  ?? "—",
        color: i.selected_color ?? "—",
        qty:0, revenue:0, profit:0,
      };
    }
    comboMap[key].qty     += i.quantity;
    comboMap[key].revenue += Number(i.subtotal);
    comboMap[key].profit  += Number(i.subtotal) - i.quantity * Number(i.unit_cost);
  });
  const topCombos = Object.values(comboMap).sort((a,b) => b.qty - a.qty);

  // ── Stock turnover: variants that sold vs. current stock ───────────────
  // Useful to flag "fast movers running low".
  const variantsFlat = useMemo(() => {
    const list: Array<{
      product_name:string; product_id:string; size:string; color:string;
      stock:number; sold:number;
    }> = [];
    products.forEach(p => {
      (p.variants ?? []).filter(v => v.active).forEach(v => {
        const sizeName  = v.size?.name  ?? "—";
        const colorName = v.color?.name ?? "—";
        const sold = paidItems.reduce((s, i) =>
          i.product_id === p.id
          && i.selected_size  === sizeName
          && i.selected_color === colorName
            ? s + i.quantity
            : s
        , 0);
        list.push({
          product_name: p.name,
          product_id:   p.id,
          size:  sizeName,
          color: colorName,
          stock: v.stock,
          sold,
        });
      });
    });
    return list;
  }, [products, paidItems]);

  const fastMovers = variantsFlat.filter(v => v.sold > 0).sort((a,b) => (b.sold / Math.max(1, b.stock + b.sold)) - (a.sold / Math.max(1, a.stock + a.sold)));
  const lowStockSelling = variantsFlat.filter(v => v.sold > 0 && v.stock <= 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Reportes</h1>
          <p className="text-[#9B6B45] text-sm">Balance, ventas y rendimiento por variante</p>
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

      {/* Stock turnover alerts */}
      {lowStockSelling.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-900">
          <p className="font-bold mb-1">
            {lowStockSelling.length} {lowStockSelling.length === 1 ? "variante" : "variantes"} vendiéndose con stock bajo (≤ 3)
          </p>
          <p className="text-xs">
            {lowStockSelling.slice(0,5).map(v => `${v.product_name} T${v.size}·${v.color} (${v.stock})`).join(" · ")}
            {lowStockSelling.length > 5 && ` · y ${lowStockSelling.length - 5} más`}
          </p>
        </div>
      )}

      {/* Charts row 1: category + top products */}
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
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
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
                <Bar dataKey="profit"  fill="#8BAF7A" radius={[0,4,4,0]} name="Utilidad" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2: per-size + per-color */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010] mb-4">Ventas por talla</h2>
          {sizeBars.length === 0 ? (
            <p className="text-[#9B6B45] text-sm">Sin ventas este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sizeBars}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any, name: any) => name === "revenue" ? [formatSoles(Number(v)), "Ingresos"] : [v, "Unidades"]} />
                <Bar dataKey="qty"     fill="#D4A520" radius={[4,4,0,0]} name="Unidades" />
                <Bar dataKey="revenue" fill="#8BAF7A" radius={[4,4,0,0]} name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010] mb-4">Ventas por color</h2>
          {colorBars.length === 0 ? (
            <p className="text-[#9B6B45] text-sm">Sin ventas este mes</p>
          ) : (
            <div className="space-y-2">
              {colorBars.slice(0, 8).map((c, i) => {
                const max = colorBars[0].qty || 1;
                const pct = (c.qty / max) * 100;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    {c.hex ? (
                      <span className="inline-block w-4 h-4 rounded-full border border-[#EDD9B4] flex-shrink-0" style={{ background: c.hex }} />
                    ) : (
                      <span className="inline-block w-4 h-4 rounded-full bg-[#F5EDD8] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="text-xs font-semibold text-[#3D2010] truncate">{c.name}</span>
                        <span className="text-[10px] text-[#9B6B45] flex-shrink-0">
                          {c.qty} uds · {formatSoles(c.revenue)}
                        </span>
                      </div>
                      <div className="h-2 bg-[#F5EDD8] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top variant combos */}
      <div className="bg-white rounded-2xl border border-[#F5EDD8] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010]">Top combinaciones (producto × talla × color)</h2>
          <p className="text-xs text-[#9B6B45] mt-0.5">Las variantes más vendidas del mes.</p>
        </div>
        {topCombos.length === 0 ? (
          <p className="p-6 text-[#9B6B45] text-sm">Sin ventas este mes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">#</th>
                  <th className="px-4 py-2 text-left font-bold">Producto</th>
                  <th className="px-4 py-2 text-left font-bold">Talla</th>
                  <th className="px-4 py-2 text-left font-bold">Color</th>
                  <th className="px-4 py-2 text-right font-bold">Uds.</th>
                  <th className="px-4 py-2 text-right font-bold">Ingresos</th>
                  <th className="px-4 py-2 text-right font-bold">Utilidad</th>
                  <th className="px-4 py-2 text-right font-bold">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EDD8]">
                {topCombos.slice(0, 15).map((c, idx) => (
                  <tr key={`${c.product_name}-${c.size}-${c.color}-${idx}`} className="hover:bg-[#FDF8F0]">
                    <td className="px-4 py-2.5 text-[#9B6B45] font-bold">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-[#3D2010]">{c.product_name}</td>
                    <td className="px-4 py-2.5 text-[#6B3D1E] font-semibold">T{c.size}</td>
                    <td className="px-4 py-2.5 text-[#6B3D1E]">
                      <span className="inline-flex items-center gap-2">
                        {colorHex.get(c.color) && (
                          <span className="inline-block w-3 h-3 rounded-full border border-[#EDD9B4]" style={{ background: colorHex.get(c.color) ?? undefined }} />
                        )}
                        {c.color}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold">{c.qty}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-[#D4A520]">{formatSoles(c.revenue)}</td>
                    <td className={`px-4 py-2.5 text-right font-bold ${c.profit >= 0 ? "text-green-600" : "text-red-500"}`}>{formatSoles(c.profit)}</td>
                    <td className="px-4 py-2.5 text-right text-[#9B6B45]">{c.revenue > 0 ? ((c.profit/c.revenue)*100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

      {/* Fast movers (sell-through ratio) */}
      {fastMovers.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#F5EDD8] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5EDD8]">
            <h2 className="font-bold text-[#3D2010]">Rotación de inventario</h2>
            <p className="text-xs text-[#9B6B45] mt-0.5">% vendido sobre el total disponible (stock actual + vendidas del mes).</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">Variante</th>
                  <th className="px-4 py-2 text-right font-bold">Vendidas</th>
                  <th className="px-4 py-2 text-right font-bold">Stock</th>
                  <th className="px-4 py-2 text-right font-bold">% rotación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EDD8]">
                {fastMovers.slice(0, 12).map((v, idx) => {
                  const total = v.stock + v.sold;
                  const pct = total > 0 ? (v.sold / total) * 100 : 0;
                  return (
                    <tr key={`${v.product_id}-${v.size}-${v.color}-${idx}`} className={v.stock <= 3 ? "bg-orange-50" : ""}>
                      <td className="px-4 py-2.5 text-[#3D2010] font-medium">
                        {v.product_name} <span className="text-[#9B6B45] text-xs">· T{v.size} · {v.color}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold">{v.sold}</td>
                      <td className={`px-4 py-2.5 text-right font-bold ${v.stock === 0 ? "text-red-600" : v.stock <= 3 ? "text-orange-500" : "text-[#3D2010]"}`}>{v.stock}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-[#D4A520]">{pct.toFixed(0)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
