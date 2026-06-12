"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Purchase } from "../../lib/types";
import { Plus, Save, X, AlertTriangle, Package } from "lucide-react";
import { formatSoles } from "../../lib/money";

// Shape we use on the page; not a public type because it carries denormalised
// joins we only need for the stock table.
interface VariantRow {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  size_id: string;
  size_name: string;
  size_sort: number;
  color_id: string;
  color_name: string;
  color_hex: string | null;
  stock: number;
  cost: number | null;
  active: boolean;
}

interface PurchaseForm {
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_cost: number;
  supplier: string;
  notes: string;
  purchased_at: string;
}

const EMPTY_FORM: PurchaseForm = {
  product_id: "",
  variant_id: "",
  quantity: 1,
  unit_cost: 0,
  supplier: "",
  notes: "",
  purchased_at: new Date().toISOString().slice(0, 10),
};

export default function ComprasAdmin() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [form, setForm] = useState<PurchaseForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [pRes, vRes] = await Promise.all([
        supabase
          .from("purchases")
          .select("*")
          .order("purchased_at", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("product_variants")
          .select(`
            id, product_id, size_id, color_id, stock, cost, active,
            product:products(name, cost, image_url, active),
            size:product_sizes(name, sort_order),
            color:product_colors(name, hex_code)
          `)
          .eq("active", true),
      ]);
      if (pRes.error) throw new Error(pRes.error.message);
      if (vRes.error) throw new Error(vRes.error.message);

      setPurchases((pRes.data ?? []) as Purchase[]);

      const flat = ((vRes.data ?? []) as any[]).map(r => ({
        id: r.id,
        product_id: r.product_id,
        product_name: r.product?.name ?? "—",
        product_image: r.product?.image_url ?? null,
        size_id: r.size_id,
        size_name: r.size?.name ?? "—",
        size_sort: r.size?.sort_order ?? 0,
        color_id: r.color_id,
        color_name: r.color?.name ?? "—",
        color_hex: r.color?.hex_code ?? null,
        stock: r.stock,
        cost: r.cost ?? r.product?.cost ?? null,
        active: r.active && (r.product?.active ?? true),
      })) as VariantRow[];

      // Sort by stock asc, then product name, then size order.
      flat.sort((a, b) =>
        a.stock - b.stock
        || a.product_name.localeCompare(b.product_name)
        || a.size_sort - b.size_sort
        || a.color_name.localeCompare(b.color_name),
      );
      setVariants(flat.filter(v => v.active));
    } catch (e: any) {
      console.error("[admin/compras] load failed:", e);
      setError(e?.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Group variants by product for the picker.
  const variantsByProduct = useMemo(() => {
    const m = new Map<string, VariantRow[]>();
    variants.forEach(v => {
      if (!m.has(v.product_id)) m.set(v.product_id, []);
      m.get(v.product_id)!.push(v);
    });
    return m;
  }, [variants]);

  const products = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    variants.forEach(v => {
      if (!seen.has(v.product_id)) seen.set(v.product_id, { id: v.product_id, name: v.product_name });
    });
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [variants]);

  function openFormBlank() {
    setForm(EMPTY_FORM);
    setSaveError(null);
    setShowForm(true);
  }

  function openFormForVariant(v: VariantRow) {
    setForm({
      ...EMPTY_FORM,
      product_id: v.product_id,
      variant_id: v.id,
      unit_cost: v.cost ?? 0,
    });
    setSaveError(null);
    setShowForm(true);
  }

  function selectProduct(productId: string) {
    const variantsForProduct = variantsByProduct.get(productId) ?? [];
    const first = variantsForProduct[0];
    setForm(f => ({
      ...f,
      product_id: productId,
      variant_id: first?.id ?? "",
      unit_cost: first?.cost ?? 0,
    }));
  }

  function selectVariant(variantId: string) {
    const v = variants.find(x => x.id === variantId);
    setForm(f => ({
      ...f,
      variant_id: variantId,
      unit_cost: v?.cost ?? f.unit_cost,
    }));
  }

  async function save() {
    setSaveError(null);
    if (!form.product_id) { setSaveError("Selecciona un producto"); return; }
    if (!form.variant_id) { setSaveError("Selecciona una variante (talla y color)"); return; }
    if (form.quantity <= 0 || !Number.isInteger(form.quantity)) {
      setSaveError("La cantidad debe ser un entero mayor a 0");
      return;
    }
    if (form.unit_cost < 0) { setSaveError("El costo no puede ser negativo"); return; }

    setSaving(true);
    try {
      const { error: rpcErr } = await supabase.rpc("register_purchase", {
        p_variant_id:   form.variant_id,
        p_quantity:     form.quantity,
        p_unit_cost:    form.unit_cost,
        p_supplier:     form.supplier || null,
        p_notes:        form.notes || null,
        p_purchased_at: form.purchased_at,
      });
      if (rpcErr) throw new Error(rpcErr.message);

      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (e: any) {
      console.error("[admin/compras] save failed:", e);
      setSaveError(e?.message ?? "Error al registrar compra");
    } finally {
      setSaving(false);
    }
  }

  const totalInvested = purchases.reduce((s, p) => s + Number(p.total_cost), 0);
  const lowStock      = variants.filter(v => v.stock <= 3);
  const stockValue    = variants.reduce((s, v) => s + v.stock * (v.cost ?? 0), 0);
  const formVariant   = variants.find(v => v.id === form.variant_id) ?? null;
  const formVariants  = form.product_id ? (variantsByProduct.get(form.product_id) ?? []) : [];

  if (loading) return <p className="text-[#9B6B45]">Cargando...</p>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
      <p className="font-bold mb-1">Error al cargar compras</p>
      <p className="text-sm font-mono">{error}</p>
      <button onClick={load} className="mt-3 text-xs font-bold underline">Reintentar</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Compras & Stock</h1>
          <p className="text-[#9B6B45] text-sm">
            Total invertido: <strong className="text-[#D4A520]">{formatSoles(totalInvested)}</strong>
            {" · "}
            Valor del stock: <strong className="text-[#D4A520]">{formatSoles(stockValue)}</strong>
          </p>
        </div>
        <button
          onClick={openFormBlank}
          className="flex items-center gap-2 bg-[#D4A520] text-white font-bold px-5 py-3 rounded-xl hover:bg-[#A07D10] transition-colors"
        >
          <Plus size={17} /> Registrar compra
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-900 flex gap-3">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">{lowStock.length} {lowStock.length === 1 ? "variante con stock bajo" : "variantes con stock bajo"} (≤ 3)</p>
            <p className="text-xs">Las verás resaltadas abajo. Click en "Reponer" para abrir el form prellenado.</p>
          </div>
        </div>
      )}

      {/* New purchase form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-[#F5EDD8] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#3D2010]">Nueva compra</h2>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setSaveError(null); }}
              className="text-[#9B6B45] hover:text-[#3D2010]"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-mono">
              {saveError}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Producto</label>
              <select
                value={form.product_id}
                onChange={e => selectProduct(e.target.value)}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              >
                <option value="">Seleccionar...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Variante (talla × color)</label>
              <select
                value={form.variant_id}
                onChange={e => selectVariant(e.target.value)}
                disabled={!form.product_id}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520] disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                {formVariants.map(v => (
                  <option key={v.id} value={v.id}>
                    T{v.size_name} · {v.color_name} — stock {v.stock}
                  </option>
                ))}
              </select>
              {formVariant && (
                <p className="text-[10px] text-[#9B6B45] mt-1">
                  Stock actual: <strong>{formVariant.stock}</strong> · Después de esta compra: <strong className="text-[#D4A520]">{formVariant.stock + (Number.isFinite(form.quantity) ? form.quantity : 0)}</strong>
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                step={1}
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: Math.trunc(+e.target.value) || 0 }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Costo unitario (S/)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.unit_cost}
                onChange={e => setForm(f => ({ ...f, unit_cost: +e.target.value }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
              <p className="text-[10px] text-[#9B6B45] mt-1">Prellenado con el costo registrado para esa variante.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Proveedor (opcional)</label>
              <input
                value={form.supplier}
                onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Fecha de compra</label>
              <input
                type="date"
                value={form.purchased_at}
                onChange={e => setForm(f => ({ ...f, purchased_at: e.target.value }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">
                Total a registrar: <span className="text-[#D4A520] font-extrabold">{formatSoles(form.quantity * form.unit_cost)}</span>
              </label>
              <input
                placeholder="Notas opcionales..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#D4A520] text-white font-bold py-3 rounded-xl hover:bg-[#A07D10] transition-colors text-sm self-start px-8 disabled:opacity-60"
          >
            <Save size={15} /> {saving ? "Guardando..." : "Registrar compra"}
          </button>
        </div>
      )}

      {/* Stock per variant */}
      <div className="bg-white rounded-2xl p-5 border border-[#F5EDD8] shadow-sm">
        <h2 className="font-bold text-[#3D2010] mb-1">Stock por variante</h2>
        <p className="text-xs text-[#9B6B45] mb-4">Ordenado por menor stock primero. Click en "Reponer" para abrir el form prellenado.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
              <tr>
                <th className="px-3 py-2 text-left font-bold">Producto</th>
                <th className="px-3 py-2 text-left font-bold">Talla</th>
                <th className="px-3 py-2 text-left font-bold">Color</th>
                <th className="px-3 py-2 text-right font-bold">Stock</th>
                <th className="px-3 py-2 text-right font-bold">Costo</th>
                <th className="px-3 py-2 text-right font-bold">Valor</th>
                <th className="px-3 py-2 text-center font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EDD8]">
              {variants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-[#9B6B45]">
                    <Package size={28} className="mx-auto mb-2 opacity-60" />
                    No hay variantes activas. Crea variantes en <a href="/admin/productos" className="underline font-bold">Productos</a>.
                  </td>
                </tr>
              )}
              {variants.map(v => (
                <tr key={v.id} className={v.stock <= 3 ? "bg-orange-50" : ""}>
                  <td className="px-3 py-2 text-[#3D2010] font-medium">
                    {v.product_name} <span className="text-[#9B6B45] text-xs">({v.product_id})</span>
                  </td>
                  <td className="px-3 py-2 text-[#6B3D1E] font-semibold">T{v.size_name}</td>
                  <td className="px-3 py-2 text-[#6B3D1E]">
                    <span className="inline-flex items-center gap-2">
                      {v.color_hex && (
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-[#EDD9B4]"
                          style={{ background: v.color_hex }}
                        />
                      )}
                      {v.color_name}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${v.stock === 0 ? "text-red-600" : v.stock <= 3 ? "text-orange-500" : "text-[#3D2010]"}`}>
                    {v.stock}
                  </td>
                  <td className="px-3 py-2 text-right text-[#9B6B45]">{formatSoles(v.cost ?? 0)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-[#D4A520]">{formatSoles(v.stock * (v.cost ?? 0))}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => openFormForVariant(v)}
                      className="text-xs font-bold text-[#D4A520] hover:bg-[#FDF8F0] px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Reponer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                  <th className="px-4 py-2 text-left font-bold">Variante</th>
                  <th className="px-4 py-2 text-right font-bold">Cant.</th>
                  <th className="px-4 py-2 text-right font-bold">C/U</th>
                  <th className="px-4 py-2 text-right font-bold">Total</th>
                  <th className="px-4 py-2 text-left font-bold">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EDD8]">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-[#FDF8F0]">
                    <td className="px-4 py-2.5 text-[#9B6B45] whitespace-nowrap">
                      {new Date(p.purchased_at + "T00:00:00").toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[#3D2010]">{p.product_name}</td>
                    <td className="px-4 py-2.5 text-[#6B3D1E]">
                      {p.selected_size || p.selected_color ? (
                        <>
                          {p.selected_size && <span className="font-semibold">T{p.selected_size}</span>}
                          {p.selected_size && p.selected_color && " · "}
                          {p.selected_color}
                        </>
                      ) : <span className="text-[#9B6B45] italic text-xs">sin variante (histórico)</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">{p.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-[#9B6B45]">{formatSoles(Number(p.unit_cost))}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-[#D4A520]">{formatSoles(Number(p.total_cost))}</td>
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
