"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Product } from "../../lib/types";
import Image from "next/image";
import { Plus, Pencil, ToggleLeft, ToggleRight, Save, X } from "lucide-react";

const EMPTY: Partial<Product> = { id:"", sku:"", name:"", tagline:"", description:"", category:"conjuntos", price:0, cost:0, stock:0, sizes:[], colors:[], gender:"Unisex", has_offer:false, image_url:"", active:true };

export default function ProductosAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const { data } = await supabase.from("products").select("*").order("id");
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    if (editing.id && products.find(p => p.id === editing.id && !editing._isNew)) {
      await supabase.from("products").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("products").insert({ ...editing, _isNew: undefined });
    }
    await load();
    setEditing(null);
    setSaving(false);
  }

  async function toggleActive(p: Product) {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.category.includes(search.toLowerCase())
  );

  if (loading) return <p className="text-[#9B6B45]">Cargando...</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Productos</h1>
          <p className="text-[#9B6B45] text-sm">{products.length} productos en catálogo</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY, _isNew: true } as any)}
          className="flex items-center gap-2 bg-[#D4A520] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#A07D10] transition-colors text-sm"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <input
        placeholder="Buscar por nombre, SKU o categoría..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-white border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm text-[#3D2010] focus:outline-none focus:ring-2 focus:ring-[#D4A520] w-full max-w-sm"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F5EDD8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Producto</th>
                <th className="px-4 py-3 text-right font-bold">Precio</th>
                <th className="px-4 py-3 text-right font-bold">Costo</th>
                <th className="px-4 py-3 text-right font-bold">Stock</th>
                <th className="px-4 py-3 text-center font-bold">Estado</th>
                <th className="px-4 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EDD8]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#FDF8F0] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5EDD8] flex-shrink-0 relative">
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#3D2010]">{p.name}</p>
                        <p className="text-[#9B6B45] text-xs">{p.id} · {p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#D4A520]">S/ {p.price}</td>
                  <td className="px-4 py-3 text-right text-[#9B6B45]">S/ {p.cost ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${p.stock <= 3 ? "text-orange-500" : "text-[#3D2010]"}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(p)} className={`flex items-center gap-1 mx-auto text-xs font-semibold ${p.active ? "text-green-600" : "text-[#9B6B45]"}`}>
                      {p.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {p.active ? "Activo" : "Oculto"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setEditing(p)} className="p-1.5 text-[#9B6B45] hover:text-[#D4A520] transition-colors">
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-[#3D2010] text-lg">{(editing as any)._isNew ? "Nuevo producto" : `Editar: ${editing.name}`}</h2>
              <button onClick={() => setEditing(null)} className="text-[#9B6B45] hover:text-[#3D2010]"><X size={20} /></button>
            </div>

            {[
              { key:"id", label:"SKU/ID", type:"text", placeholder:"LC-999" },
              { key:"name", label:"Nombre", type:"text" },
              { key:"tagline", label:"Tagline", type:"text" },
              { key:"description", label:"Descripción", type:"textarea" },
              { key:"price", label:"Precio (S/)", type:"number" },
              { key:"cost", label:"Costo (S/)", type:"number" },
              { key:"stock", label:"Stock", type:"number" },
              { key:"image_url", label:"URL imagen", type:"text", placeholder:"/products/LC-001.jpeg" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={(editing as any)[key] ?? ""}
                    onChange={e => setEditing(( prev: any) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                ) : (
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(editing as any)[key] ?? ""}
                    onChange={e => setEditing(( prev: any) => ({ ...prev, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Categoría</label>
              <select
                value={editing.category ?? "conjuntos"}
                onChange={e => setEditing(( prev: any) => ({ ...prev, category: e.target.value as any }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              >
                {["conjuntos","bodies","baberos","mantas"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="hasOffer" checked={editing.has_offer ?? false} onChange={e => setEditing(( prev: any) => ({ ...prev, has_offer: e.target.checked }))} />
              <label htmlFor="hasOffer" className="text-sm font-semibold text-[#6B3D1E]">Tiene oferta 3 × 15% dto</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm disabled:opacity-60">
                <Save size={15} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
