"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Product } from "../../lib/types";
import { Plus, Pencil, ToggleLeft, ToggleRight, Save, X, Upload } from "lucide-react";

interface Category { id: string; name: string; }

const FALLBACK_CATS: Category[] = [
  { id: "conjuntos", name: "Conjuntos" },
  { id: "bodies",   name: "Bodies"    },
  { id: "baberos",  name: "Baberos"   },
  { id: "mantas",   name: "Mantas"    },
];

const EMPTY: any = {
  id: "", sku: "", name: "", tagline: "", description: "",
  category: "conjuntos", price: 0, cost: 0, stock: 0,
  sizes: [], colors: [], gender: "Unisex", has_offer: false, image_url: "", active: true,
};

export default function ProductosAdmin() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATS);
  const [editing,    setEditing]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [search,     setSearch]     = useState("");

  // Inline category creation
  const [addingCat,  setAddingCat]  = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat,  setSavingCat]  = useState(false);

  // Image upload
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("*").order("id"),
        supabase.from("categories").select("id,name").order("name"),
      ]);
      if (prodRes.error) throw new Error(prodRes.error.message);
      setProducts(prodRes.data ?? []);
      // If categories table exists and has rows, use it; otherwise keep fallback
      if (catRes.data && catRes.data.length > 0) setCategories(catRes.data);
    } catch (e: any) {
      console.error("[admin/productos] load failed:", e);
      setError(e?.message ?? "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _isNew, ...payload } = editing;
      // Auto-sync sku = id for new products
      if (_isNew) payload.sku = payload.id;

      if (_isNew) {
        const { error: e } = await supabase.from("products").insert(payload);
        if (e) throw new Error(e.message);
      } else {
        const { error: e } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (e) throw new Error(e.message);
      }
      await load();
      setEditing(null);
    } catch (e: any) {
      console.error("[admin/productos] save failed:", e);
      setSaveError(e?.message ?? "Error al guardar producto");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    const { error: e } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    if (!e) setProducts(ps => ps.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  async function handleImageUpload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("Solo se aceptan jpg, png o webp");
      return;
    }
    setUploading(true);
    setSaveError(null);
    try {
      const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // Use editing.id if available; otherwise a timestamped temp name
      const path = `products/${(editing?.id as string)?.trim() || `tmp-${Date.now()}`}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw new Error(`Storage upload: ${upErr.message}`);

      // Use the local `path` variable directly — avoids any data.path discrepancy
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      if (!urlData?.publicUrl) throw new Error("No se pudo obtener la URL pública. Verifica que el bucket existe y es público.");

      console.log("[admin/productos] image uploaded, public URL:", urlData.publicUrl);
      setEditing((prev: any) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (e: any) {
      console.error("[admin/productos] image upload failed:", e);
      setSaveError("Error al subir imagen: " + (e?.message ?? "desconocido"));
    } finally {
      setUploading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    setSaveError(null);
    try {
      const slug = newCatName.trim().toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error: catErr } = await supabase
        .from("categories")
        .insert({ id: slug, name: newCatName.trim() });
      if (catErr && !catErr.message.includes("duplicate") && !catErr.message.includes("unique")) {
        throw new Error(catErr.message);
      }
      const newCat = { id: slug, name: newCatName.trim() };
      setCategories(cats => cats.find(c => c.id === slug) ? cats : [...cats, newCat]);
      setEditing((prev: any) => ({ ...prev, category: slug }));
      setNewCatName("");
      setAddingCat(false);
    } catch (e: any) {
      console.error("[admin/productos] add category failed:", e);
      setSaveError(e?.message ?? "Error al crear categoría");
    } finally {
      setSavingCat(false);
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-[#9B6B45]">Cargando...</p>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
      <p className="font-bold mb-1">Error al cargar productos</p>
      <p className="text-sm font-mono">{error}</p>
      <button onClick={load} className="mt-3 text-xs font-bold underline">Reintentar</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Productos</h1>
          <p className="text-[#9B6B45] text-sm">{products.length} productos en catálogo</p>
        </div>
        <button
          onClick={() => { setSaveError(null); setEditing({ ...EMPTY, _isNew: true }); }}
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
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5EDD8] flex-shrink-0 flex items-center justify-center text-[#C4956A] text-[10px]">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
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
                    <button onClick={() => { setSaveError(null); setEditing({ ...p }); }} className="p-1.5 text-[#9B6B45] hover:text-[#D4A520] transition-colors">
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-[#3D2010] text-lg">
                {editing._isNew ? "Nuevo producto" : `Editar: ${editing.name}`}
              </h2>
              <button onClick={() => setEditing(null)} className="text-[#9B6B45] hover:text-[#3D2010]"><X size={20} /></button>
            </div>

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-mono break-all">
                {saveError}
              </div>
            )}

            {/* Text fields */}
            {([
              { key: "id",          label: "SKU / ID",             type: "text",     ph: "LC-999" },
              { key: "name",        label: "Nombre",               type: "text",     ph: "" },
              { key: "tagline",     label: "Tagline (opcional)",   type: "text",     ph: "" },
              { key: "description", label: "Descripción",          type: "textarea", ph: "" },
              { key: "price",       label: "Precio (S/)",          type: "number",   ph: "" },
              { key: "cost",        label: "Costo (S/)",           type: "number",   ph: "" },
              { key: "stock",       label: "Stock",                type: "number",   ph: "" },
            ] as const).map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    rows={2}
                    value={editing[key] ?? ""}
                    onChange={e => setEditing((prev: any) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                ) : (
                  <input
                    type={type}
                    placeholder={ph}
                    value={editing[key] ?? ""}
                    onChange={e => setEditing((prev: any) => ({
                      ...prev,
                      [key]: type === "number" ? Number(e.target.value) : e.target.value,
                    }))}
                    className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                )}
              </div>
            ))}

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Imagen del producto</label>
              {editing.image_url && (
                <div className="mb-2">
                  <div className="w-28 h-28 rounded-xl overflow-hidden border border-[#F5EDD8] bg-[#F5EDD8] flex items-center justify-center">
                    <img
                      src={editing.image_url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector(".img-err")) {
                          const msg = document.createElement("p");
                          msg.className = "img-err text-[10px] text-red-500 text-center px-2";
                          msg.textContent = "Imagen no cargó — verifica que el bucket sea público";
                          parent.appendChild(msg);
                        }
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#9B6B45] mt-1 break-all max-w-xs">{editing.image_url}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border border-[#D4A520] text-[#D4A520] text-xs font-bold rounded-xl hover:bg-[#FDF8F0] transition-colors disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading ? "Subiendo..." : editing.image_url ? "Cambiar imagen" : "Subir imagen"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
              />
              <p className="text-[10px] text-[#9B6B45] mt-1">jpg · png · webp — bucket "product-images" debe ser público en Supabase Storage</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Categoría</label>
              {!addingCat ? (
                <select
                  value={editing.category ?? ""}
                  onChange={e => {
                    if (e.target.value === "__new__") { setAddingCat(true); }
                    else { setEditing((prev: any) => ({ ...prev, category: e.target.value })); }
                  }}
                  className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__new__">+ Nueva categoría</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    placeholder="Nombre de la nueva categoría"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); }
                      if (e.key === "Escape") { setAddingCat(false); setNewCatName(""); }
                    }}
                    className="flex-1 border border-[#D4A520] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={savingCat || !newCatName.trim()}
                    className="px-3 py-2 bg-[#D4A520] text-white text-xs font-bold rounded-xl hover:bg-[#A07D10] disabled:opacity-50 whitespace-nowrap"
                  >
                    {savingCat ? "..." : "Crear"}
                  </button>
                  <button
                    onClick={() => { setAddingCat(false); setNewCatName(""); }}
                    className="px-3 py-2 border border-[#F5EDD8] text-[#9B6B45] text-xs font-bold rounded-xl hover:bg-[#F5EDD8]"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Has offer */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasOffer"
                checked={editing.has_offer ?? false}
                onChange={e => setEditing((prev: any) => ({ ...prev, has_offer: e.target.checked }))}
              />
              <label htmlFor="hasOffer" className="text-sm font-semibold text-[#6B3D1E]">Tiene oferta 3 × 15% dto</label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm disabled:opacity-60"
              >
                <Save size={15} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
