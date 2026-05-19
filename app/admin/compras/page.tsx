"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Purchase, Product } from "../../lib/types";
import { Plus, Save } from "lucide-react";

interface PurchaseForm {
  product_id: string; product_name: string;
  quantity: number; unit_cost: number; supplier: string; notes: string; purchased_at: string;
}

const EMPTY_FORM: PurchaseForm = { product_id:"", product_name:"", quantity:1, unit_cost:0, supplier:"", notes:"", purchased_at: new Date().toISOString().slice(0,10) };

export default function ComprasAdmin() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<PurchaseForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [p, pr] = await Promise.all([
      supabase.from("purchases").select("*").order("purchased_at", { ascending: false }),
      supabase.from("products").select("id,name,stock,cost").order("id"),
    ]);
    setPurchases(p.data ?? []);
    setProducts(pr.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function selectProduct(id: string) {
    const p = products.find(x => x.id === id);
    if (p) setForm(f => ({ ...f, product_id: id, product_name: p.name, unit_cost: p.cost ?? 0 }));
  }

  async function save() {
    if (!form.product_id || form.quantity <= 0) return;
    setSaving(true);
    const total_cost = form.quantity * form.unit_cost;
    await supabase.from("purchases").insert({ ...form, total_cost });
    // Update stock and cost
    const product = products.find(p => p.id === form.product_id);
    if (product) {
      await supabase.from("products").update({
        stock: (product.stock ?? 0) + form.quantity,
        cost: form.unit_cost,
      }).eq("id", form.product_id);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
    await load();
    setSaving(false);
  }

  const totalInvested = purchases.reduce((s, p) => s + Number(p.total_cost), 0);

  if (loading) return <p className="text-[#9B6B45]">Cargando...</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Compras & Stock</h1>
          <p className="text-[#9B6B45] text-sm">Total invertido: <strong className="text-[#D4A520]">S/ {totalInvested.toFixed(2)}</strong></p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 bg-[#D4A520] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#A07D10] transition-colors text-sm"
        >
          <Plus size={16} /> Registrar compra
        </button>
      </div>

      {/* Stock summary */}
      <div className="bg-white rounded-2xl p-5 border border-[#F5EDD8] shadow-sm">
        <h2 className="font-bold text-[#3D2010] mb-4">Stock actual</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
              <tr>
                <th className="px-3 py-2 text-left font-bold">Producto</th>
                <th className="px-3 py-2 text-right font-bold">Stock</th>
                <th className="px-3 py-2 text-right font-bold">Costo unit.</th>
                <th className="px-3 py-2 text-right font-bold">Valor stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EDD8]">
              {products.map(p => (
                <tr key={p.id} className={p.stock <= 3 ? "bg-orange-50" : ""}>
                  <td className="px-3 py-2 text-[#3D2010] font-medium">{p.name} <span className="text-[#9B6B45] text-xs">({p.id})</span></td>
                  <td className={`px-3 py-2 text-right font-bold ${p.stock <= 3 ? "text-orange-500" : "text-[#3D2010]"}`}>{p.stock}</td>
                  <td className="px-3 py-2 text-right text-[#9B6B45]">S/ {p.cost ?? 0}</td>
                  <td className="px-3 py-2 text-right font-semibold text-[#D4A520]">S/ {((p.stock ?? 0) * (p.cost ?? 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New purchase form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-[#F5EDD8] shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-[#3D2010]">Nueva compra</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Producto</label>
              <select value={form.product_id} onChange={e => selectProduct(e.target.value)} className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]">
                <option value="">Seleccionar...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Proveedor</label>
              <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Cantidad</label>
              <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Costo unitario (S/)</label>
              <input type="number" min={0} step={0.01} value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: +e.target.value }))} className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Fecha de compra</label>
              <input type="date" value={form.purchased_at} onChange={e => setForm(f => ({ ...f, purchased_at: e.target.value }))} className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Total: <span className="text-[#D4A520] font-extrabold">S/ {(form.quantity * form.unit_cost).toFixed(2)}</span></label>
              <input placeholder="Notas opcionales..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]" />
            </div>
          </div>
          <button onClick={save} disabled={saving} className="flex items-center justify-center gap-2 bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors text-sm self-start px-8 disabled:opacity-60">
            <Save size={15} /> {saving ? "Guardando..." : "Registrar compra"}
          </button>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl border border-[#F5EDD8] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010]">Historial de compras</h2>
        </div>
        {purchases.length === 0 ? (
          <p className="p-6 text-[#9B6B45] text-sm">Sin compras registradas aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">Fecha</th>
                  <th className="px-4 py-2 text-left font-bold">Producto</th>
                  <th className="px-4 py-2 text-right font-bold">Cant.</th>
                  <th className="px-4 py-2 text-right font-bold">C/U</th>
                  <th className="px-4 py-2 text-right font-bold">Total</th>
                  <th className="px-4 py-2 text-left font-bold">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EDD8]">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-[#FDF8F0]">
                    <td className="px-4 py-2.5 text-[#9B6B45]">{new Date(p.purchased_at + "T00:00:00").toLocaleDateString("es-PE")}</td>
                    <td className="px-4 py-2.5 font-medium text-[#3D2010]">{p.product_name}</td>
                    <td className="px-4 py-2.5 text-right">{p.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-[#9B6B45]">S/ {Number(p.unit_cost).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-[#D4A520]">S/ {Number(p.total_cost).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-[#9B6B45]">{p.supplier ?? "-"}</td>
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
