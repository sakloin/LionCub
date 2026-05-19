"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabase";
import { Product } from "../../lib/types";
import { Plus, Pencil, ToggleLeft, ToggleRight, Save, X, Upload, Trash2, AlertTriangle, FileDown, FileUp, CheckCircle2 } from "lucide-react";

interface Category { id: string; name: string; }

interface ImportRow {
  rowNum: number;
  raw: Record<string, any>;
  errors: string[];
  // normalized
  id: string; sku: string; name: string; tagline: string; description: string;
  category: string; price: number; cost: number; stock: number;
  sizes: string[]; colors: string[]; gender: string; material: string;
  has_offer: boolean; active: boolean;
}

const TEMPLATE_COLS = ["id","name","tagline","description","category","price","cost","stock","sizes","colors","gender","material","has_offer","active"] as const;
const COL_WIDTHS     = [12,28,22,40,16,9,9,8,24,22,10,24,12,8];

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

function parseBool(v: any, defaultVal = false): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toUpperCase();
  if (["TRUE","SÍ","SI","1","YES"].includes(s)) return true;
  if (["FALSE","NO","0"].includes(s)) return false;
  return defaultVal;
}

function parseArr(v: any): string[] {
  if (!v) return [];
  return String(v).split(",").map(s => s.trim()).filter(Boolean);
}

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

  // Delete
  const [deleteTarget,   setDeleteTarget]   = useState<Product | null>(null);
  const [deleteHasSales, setDeleteHasSales] = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [deleteError,    setDeleteError]    = useState<string | null>(null);

  // Import
  const importRef   = useRef<HTMLInputElement>(null);
  const [importRows,    setImportRows]    = useState<ImportRow[] | null>(null);
  const [importError,   setImportError]   = useState<string | null>(null);
  const [importSaving,  setImportSaving]  = useState(false);
  const [importResult,  setImportResult]  = useState<{ imported: number; skipped: number } | null>(null);

  async function load() {
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("*").order("id"),
        supabase.from("categories").select("id,name").order("name"),
      ]);
      if (prodRes.error) throw new Error(prodRes.error.message);
      setProducts(prodRes.data ?? []);
      if (catRes.data && catRes.data.length > 0) setCategories(catRes.data);
    } catch (e: any) {
      console.error("[admin/productos] load failed:", e);
      setError(e?.message ?? "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Edit / Save ────────────────────────────────────────────────────────────
  async function save() {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _isNew, ...payload } = editing;
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

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDeleteClick(p: Product) {
    setDeleteError(null);
    const { count, error: countErr } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", p.id);
    if (countErr) { setDeleteError(countErr.message); setDeleteTarget(p); setDeleteHasSales(false); return; }
    setDeleteHasSales((count ?? 0) > 0);
    setDeleteTarget(p);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { error: delErr } = await supabase.from("products").delete().eq("id", deleteTarget.id);
      if (delErr) throw new Error(delErr.message);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      console.error("[admin/productos] delete failed:", e);
      setDeleteError(e?.message ?? "Error al eliminar producto");
    } finally {
      setDeleting(false);
    }
  }

  // ── Image upload ───────────────────────────────────────────────────────────
  async function handleImageUpload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("Solo se aceptan jpg, png o webp");
      return;
    }
    setUploading(true);
    setSaveError(null);
    try {
      const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `products/${(editing?.id as string)?.trim() || `tmp-${Date.now()}`}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw new Error(`Storage upload: ${upErr.message}`);

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
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

  // ── Inline category ────────────────────────────────────────────────────────
  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    setSaveError(null);
    try {
      const slug = newCatName.trim().toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error: catErr } = await supabase.from("categories").insert({ id: slug, name: newCatName.trim() });
      if (catErr && !catErr.message.includes("duplicate") && !catErr.message.includes("unique")) throw new Error(catErr.message);
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

  // ── Excel template download ────────────────────────────────────────────────
  function downloadTemplate() {
    const catIds = categories.map(c => c.id).join(" | ");
    const header  = [...TEMPLATE_COLS];
    const note    = ["← obligatorio","← obligatorio","","","← obligatorio. Categorías: " + catIds,"← obligatorio, número","número (≥0)","entero (≥0)","separar con comas","separar con comas","Unisex | Niño | Niña","","TRUE o FALSE","TRUE o FALSE"];
    const example1 = ["LC-999","Nombre del Producto","Tagline breve","Descripción completa del producto","conjuntos",59,0,10,"RN,0-3m,3-6m","Blanco,Celeste","Unisex","100% Algodón Pima","FALSE","TRUE"];
    const example2 = ["LC-998","Otro Producto","","Cuerpo de descripción","bodies",29,0,20,"RN,0-3m","Rosa","Niña","100% Algodón Pima","TRUE","TRUE"];

    const ws = XLSX.utils.aoa_to_sheet([header, note, example1, example2]);
    ws["!cols"] = TEMPLATE_COLS.map((_, i) => ({ wch: COL_WIDTHS[i] }));

    // Style the note row (row index 1) with italic — basic cell metadata
    TEMPLATE_COLS.forEach((_, ci) => {
      const ref = XLSX.utils.encode_cell({ r: 1, c: ci });
      if (ws[ref]) ws[ref].s = { font: { italic: true, color: { rgb: "888888" } } };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "plantilla-productos-lioncub.xlsx");
  }

  // ── Excel import ───────────────────────────────────────────────────────────
  function handleImportFile(file: File) {
    setImportError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data  = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb    = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        if (!sheet) throw new Error("El archivo Excel está vacío o no tiene hojas.");

        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (rows.length < 2) throw new Error("El archivo no tiene filas de datos (solo encabezados o vacío).");

        // Detect header row — skip any leading rows until we find TEMPLATE_COLS[0] ("id")
        let headerIdx = rows.findIndex(r => String(r[0] ?? "").trim().toLowerCase() === "id");
        if (headerIdx === -1) throw new Error(`No se encontró una fila con encabezado "id". Asegúrate de usar la plantilla descargada.`);

        const headers = rows[headerIdx].map((h: any) => String(h ?? "").trim().toLowerCase());
        const missing = TEMPLATE_COLS.filter(c => !headers.includes(c));
        if (missing.length > 0) throw new Error(`Columnas faltantes en el Excel: ${missing.join(", ")}. Usa la plantilla oficial.`);

        const catSet      = new Set(categories.map(c => c.id));
        const existingIds = new Set(products.map(p => p.id));
        const seenIds     = new Set<string>();

        const dataRows = rows.slice(headerIdx + 1);
        // Skip note / instruction rows (if row 0 col "price" is not a number and row 0 col "id" starts with "←")
        const parsed: ImportRow[] = [];

        dataRows.forEach((raw, idx) => {
          const rowNum = headerIdx + idx + 2; // 1-based Excel row
          const cell = (col: string) => {
            const ci = headers.indexOf(col);
            return ci >= 0 ? raw[ci] : "";
          };

          // Skip blank rows and instruction rows
          const rawId = String(cell("id") ?? "").trim();
          if (!rawId || rawId.startsWith("←")) return;

          const errors: string[] = [];

          // id
          if (!rawId) errors.push("id es obligatorio");
          else if (seenIds.has(rawId)) errors.push(`id "${rawId}" duplicado en el archivo`);
          else if (existingIds.has(rawId)) errors.push(`id "${rawId}" ya existe en la tienda`);
          seenIds.add(rawId);

          // name
          const rawName = String(cell("name") ?? "").trim();
          if (!rawName) errors.push("name (nombre) es obligatorio");

          // category
          const rawCat = String(cell("category") ?? "").trim().toLowerCase();
          if (!rawCat) errors.push("category es obligatorio");
          else if (!catSet.has(rawCat)) errors.push(`categoría "${rawCat}" no existe (usa: ${[...catSet].join(", ")})`);

          // price
          const rawPrice = Number(cell("price"));
          if (isNaN(rawPrice) || rawPrice <= 0) errors.push("price debe ser un número mayor a 0");

          // cost
          const rawCost = cell("cost") !== "" ? Number(cell("cost")) : 0;
          if (isNaN(rawCost) || rawCost < 0) errors.push("cost debe ser un número >= 0");

          // stock
          const rawStock = cell("stock") !== "" ? Number(cell("stock")) : 0;
          if (isNaN(rawStock) || rawStock < 0 || !Number.isInteger(rawStock))
            errors.push("stock debe ser un entero >= 0");

          parsed.push({
            rowNum,
            raw: Object.fromEntries(TEMPLATE_COLS.map(c => [c, cell(c)])),
            errors,
            id:          rawId,
            sku:         rawId,
            name:        rawName,
            tagline:     String(cell("tagline") ?? "").trim(),
            description: String(cell("description") ?? "").trim(),
            category:    rawCat,
            price:       rawPrice,
            cost:        isNaN(rawCost)  ? 0 : rawCost,
            stock:       isNaN(rawStock) ? 0 : rawStock,
            sizes:       parseArr(cell("sizes")),
            colors:      parseArr(cell("colors")),
            gender:      String(cell("gender") ?? "Unisex").trim() || "Unisex",
            material:    String(cell("material") ?? "100% Algodón Pima").trim() || "100% Algodón Pima",
            has_offer:   parseBool(cell("has_offer"), false),
            active:      parseBool(cell("active"), true),
          });
        });

        if (parsed.length === 0) throw new Error("No se encontraron filas de datos válidas en el archivo.");

        setImportRows(parsed);
      } catch (e: any) {
        console.error("[admin/productos] import parse failed:", e);
        setImportError(e?.message ?? "Error al leer el archivo");
        setImportRows(null);
      }
    };
    reader.onerror = () => setImportError("No se pudo leer el archivo");
    reader.readAsArrayBuffer(file);
  }

  async function confirmImport() {
    if (!importRows) return;
    const valid = importRows.filter(r => r.errors.length === 0);
    if (valid.length === 0) { setImportError("No hay filas válidas para importar."); return; }

    setImportSaving(true);
    setImportError(null);
    try {
      const payload = valid.map(({ id, sku, name, tagline, description, category, price, cost, stock, sizes, colors, gender, material, has_offer, active }) => ({
        id, sku, name, tagline, description, category, price, cost, stock, sizes, colors, gender, material, has_offer, active,
      }));
      const { error: insErr } = await supabase.from("products").insert(payload);
      if (insErr) throw new Error(insErr.message);

      const skipped = importRows.filter(r => r.errors.length > 0).length;
      setImportResult({ imported: valid.length, skipped });
      setImportRows(null);
      await load();
    } catch (e: any) {
      console.error("[admin/productos] import insert failed:", e);
      setImportError(e?.message ?? "Error al insertar en la base de datos");
    } finally {
      setImportSaving(false);
    }
  }

  function closeImport() {
    setImportRows(null);
    setImportError(null);
    if (importRef.current) importRef.current.value = "";
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Productos</h1>
          <p className="text-[#9B6B45] text-sm">{products.length} productos en catálogo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 border border-[#D4A520] text-[#D4A520] font-bold px-3 py-2 rounded-xl hover:bg-[#FDF8F0] transition-colors text-xs"
          >
            <FileDown size={14} /> Plantilla
          </button>
          <button
            onClick={() => { setImportError(null); setImportResult(null); importRef.current?.click(); }}
            className="flex items-center gap-2 border border-[#9B6B45] text-[#9B6B45] font-bold px-3 py-2 rounded-xl hover:bg-[#FDF8F0] transition-colors text-xs"
          >
            <FileUp size={14} /> Importar Excel
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }}
          />
          <button
            onClick={() => { setSaveError(null); setEditing({ ...EMPTY, _isNew: true }); }}
            className="flex items-center gap-2 bg-[#D4A520] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-[#A07D10] transition-colors text-sm"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Import result banner */}
      {importResult && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-green-700">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span className="text-sm font-semibold">
            {importResult.imported} producto{importResult.imported !== 1 ? "s" : ""} importado{importResult.imported !== 1 ? "s" : ""} correctamente.
            {importResult.skipped > 0 && ` ${importResult.skipped} omitido${importResult.skipped !== 1 ? "s" : ""} por errores.`}
          </span>
          <button onClick={() => setImportResult(null)} className="ml-auto text-green-600 hover:text-green-800"><X size={16} /></button>
        </div>
      )}

      <input
        placeholder="Buscar por nombre, SKU o categoría..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-white border border-[#F5EDD8] rounded-xl px-4 py-2.5 text-sm text-[#3D2010] focus:outline-none focus:ring-2 focus:ring-[#D4A520] w-full max-w-sm"
      />

      {/* Product table */}
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
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
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
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setSaveError(null); setEditing({ ...p }); }} className="p-1.5 text-[#9B6B45] hover:text-[#D4A520] transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDeleteClick(p)} className="p-1.5 text-[#9B6B45] hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete dialog ───────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            {deleteHasSales ? (
              <>
                <div className="flex items-center gap-3 text-orange-600">
                  <AlertTriangle size={22} />
                  <h2 className="font-extrabold text-[#3D2010] text-lg">No se puede eliminar</h2>
                </div>
                <p className="text-sm text-[#6B3D1E]">
                  <strong>{deleteTarget.name}</strong> tiene ventas registradas y no puede eliminarse.
                </p>
                <p className="text-sm text-[#9B6B45]">
                  Si ya no quieres venderlo, puedes <strong>desactivarlo</strong> para ocultarlo de la tienda sin perder el historial de pedidos.
                </p>
                {deleteError && <p className="text-xs text-red-600 font-mono break-all">{deleteError}</p>}
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                  className="w-full py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm"
                >
                  Entendido
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-red-600">
                  <Trash2 size={22} />
                  <h2 className="font-extrabold text-[#3D2010] text-lg">Eliminar producto</h2>
                </div>
                <p className="text-sm text-[#6B3D1E]">
                  ¿Eliminar <strong>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
                </p>
                {deleteError && <p className="text-xs text-red-600 font-mono break-all">{deleteError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                    className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm disabled:opacity-60"
                  >
                    {deleting ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Import preview modal ────────────────────────────────────────────── */}
      {(importRows || importError) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5EDD8]">
              <h2 className="font-extrabold text-[#3D2010] text-lg flex items-center gap-2">
                <FileUp size={20} className="text-[#D4A520]" />
                Vista previa — importación
              </h2>
              <button onClick={closeImport} className="text-[#9B6B45] hover:text-[#3D2010]"><X size={20} /></button>
            </div>

            {/* Parse error */}
            {importError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-mono break-all">
                {importError}
              </div>
            )}

            {/* Preview table */}
            {importRows && importRows.length > 0 && (
              <>
                <div className="px-6 pt-3 pb-1 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-green-700 font-semibold">
                    <CheckCircle2 size={15} />
                    {importRows.filter(r => r.errors.length === 0).length} válidas
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                    <AlertTriangle size={15} />
                    {importRows.filter(r => r.errors.length > 0).length} con errores
                  </span>
                  <span className="text-[#9B6B45] text-xs ml-auto">Las filas con error NO se importarán</span>
                </div>

                <div className="overflow-auto flex-1 px-6 pb-4">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5EDD8] text-[#6B3D1E]">
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Fila</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">ID</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Nombre</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Categoría</th>
                        <th className="px-2 py-2 text-right font-bold border border-[#EDD9B4]">Precio</th>
                        <th className="px-2 py-2 text-right font-bold border border-[#EDD9B4]">Stock</th>
                        <th className="px-2 py-2 text-left font-bold border border-[#EDD9B4]">Estado / Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map(r => {
                        const ok = r.errors.length === 0;
                        return (
                          <tr key={r.rowNum} className={ok ? "bg-green-50" : "bg-red-50"}>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-[#9B6B45]">{r.rowNum}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] font-mono">{r.id}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">{r.name}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">{r.category}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">S/ {r.price}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4] text-right">{r.stock}</td>
                            <td className="px-2 py-1.5 border border-[#EDD9B4]">
                              {ok ? (
                                <span className="text-green-700 font-semibold">✓ Lista para importar</span>
                              ) : (
                                <span className="text-red-600">{r.errors.join(" · ")}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Footer actions */}
            {importRows && (
              <div className="flex gap-3 px-6 py-4 border-t border-[#F5EDD8]">
                <button
                  onClick={closeImport}
                  className="flex-1 py-2.5 border border-[#F5EDD8] rounded-xl text-[#9B6B45] font-semibold hover:bg-[#F5EDD8] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmImport}
                  disabled={importSaving || importRows.filter(r => r.errors.length === 0).length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D4A520] text-white font-bold rounded-xl hover:bg-[#A07D10] transition-colors text-sm disabled:opacity-50"
                >
                  <FileUp size={15} />
                  {importSaving
                    ? "Importando..."
                    : `Importar ${importRows.filter(r => r.errors.length === 0).length} producto${importRows.filter(r => r.errors.length === 0).length !== 1 ? "s" : ""}`
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit / Create modal ─────────────────────────────────────────────── */}
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
