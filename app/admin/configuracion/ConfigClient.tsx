"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Save, Trash2, X, Eye, EyeOff, Tag, Ruler, Palette, AlertTriangle } from "lucide-react";

export interface ConfigBundle {
  categories: { id: string; name: string }[];
  sizes:      { id: string; name: string; sort_order: number; active: boolean }[];
  colors:     { id: string; name: string; hex_code: string | null; active: boolean }[];
  refs: {
    categories: Record<string, number>;
    sizes:      Record<string, number>;
    colors:     Record<string, number>;
  };
}

type TabId = "categorias" | "tallas" | "colores";

export default function ConfigClient({ initial }: { initial: ConfigBundle }) {
  const [tab, setTab] = useState<TabId>("categorias");
  const [categories, setCategories] = useState(initial.categories);
  const [sizes,      setSizes]      = useState(initial.sizes);
  const [colors,     setColors]     = useState(initial.colors);
  const refs = initial.refs; // ref counts are a snapshot from the server; reload to refresh

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3D2010]">Configuración</h1>
        <p className="text-[#9B6B45] text-sm">Catálogos compartidos entre productos: categorías, tallas y colores.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#F5EDD8]">
        <TabButton id="categorias" active={tab === "categorias"} onClick={() => setTab("categorias")} icon={<Tag size={15} />} label={`Categorías · ${categories.length}`} />
        <TabButton id="tallas"     active={tab === "tallas"}     onClick={() => setTab("tallas")}     icon={<Ruler size={15} />} label={`Tallas · ${sizes.length}`} />
        <TabButton id="colores"    active={tab === "colores"}    onClick={() => setTab("colores")}    icon={<Palette size={15} />} label={`Colores · ${colors.length}`} />
      </div>

      {tab === "categorias" && (
        <CategoriesPanel items={categories} setItems={setCategories} refs={refs.categories} />
      )}
      {tab === "tallas" && (
        <SizesPanel items={sizes} setItems={setSizes} refs={refs.sizes} />
      )}
      {tab === "colores" && (
        <ColorsPanel items={colors} setItems={setColors} refs={refs.colors} />
      )}
    </div>
  );
}

function TabButton({ id, active, onClick, icon, label }: { id: string; active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      data-tab={id}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
        active
          ? "bg-[#D4A520] text-white"
          : "text-[#6B3D1E] hover:bg-[#F5EDD8]"
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ── Categorías ───────────────────────────────────────────────────────────
function CategoriesPanel({
  items, setItems, refs,
}: {
  items: ConfigBundle["categories"];
  setItems: React.Dispatch<React.SetStateAction<ConfigBundle["categories"]>>;
  refs: Record<string, number>;
}) {
  const [adding, setAdding] = useState(false);
  const [newId, setNewId]     = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const id = newId.trim().toLowerCase().replace(/\s+/g, "-");
    const name = newName.trim();
    if (!id || !name) { setError("ID y nombre son obligatorios"); return; }
    if (items.find(c => c.id === id)) { setError("Ya existe una categoría con ese id"); return; }
    setBusy(true); setError(null);
    try {
      const { data, error: e } = await supabase.from("categories").insert({ id, name }).select("id, name").single();
      if (e) throw new Error(e.message);
      setItems(prev => [...prev, data as { id: string; name: string }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewId(""); setNewName(""); setAdding(false);
    } catch (e: any) {
      setError(e?.message ?? "Error al crear categoría");
    } finally { setBusy(false); }
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) { setError("El nombre es obligatorio"); return; }
    setBusy(true); setError(null);
    try {
      const { error: e } = await supabase.from("categories").update({ name }).eq("id", id);
      if (e) throw new Error(e.message);
      setItems(prev => prev.map(c => c.id === id ? { ...c, name } : c));
      setEditingId(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al actualizar");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    const used = refs[id] ?? 0;
    if (used > 0) {
      alert(`No se puede eliminar: ${used} producto(s) usan esta categoría.`);
      return;
    }
    if (!confirm("¿Eliminar esta categoría?")) return;
    setBusy(true); setError(null);
    try {
      const { error: e } = await supabase.from("categories").delete().eq("id", id);
      if (e) throw new Error(e.message);
      setItems(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar");
    } finally { setBusy(false); }
  }

  return (
    <Panel
      title="Categorías"
      desc="Agrupan productos en el catálogo público. El id se usa como slug; el nombre es lo que ve el cliente."
      error={error}
      onAdd={() => { setAdding(true); setError(null); }}
      addingForm={adding && (
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <Field label="ID (slug, ej. bodies)">
            <input value={newId} onChange={e => setNewId(e.target.value)} className={inputCls} placeholder="bodies" />
          </Field>
          <Field label="Nombre visible">
            <input value={newName} onChange={e => setNewName(e.target.value)} className={inputCls} placeholder="Bodies" />
          </Field>
          <div className="flex gap-2">
            <button onClick={add} disabled={busy} className={primaryBtn}>
              <Save size={14} /> Crear
            </button>
            <button onClick={() => { setAdding(false); setNewId(""); setNewName(""); }} className={ghostBtn}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
          <tr>
            <th className="px-3 py-2 text-left font-bold">ID</th>
            <th className="px-3 py-2 text-left font-bold">Nombre</th>
            <th className="px-3 py-2 text-right font-bold">Productos</th>
            <th className="px-3 py-2 text-center font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5EDD8]">
          {items.length === 0 && (
            <tr><td colSpan={4} className="px-3 py-6 text-center text-[#9B6B45]">No hay categorías.</td></tr>
          )}
          {items.map(c => (
            <tr key={c.id} className="hover:bg-[#FDF8F0]">
              <td className="px-3 py-2 text-[#9B6B45] font-mono text-xs">{c.id}</td>
              <td className="px-3 py-2 text-[#3D2010] font-medium">
                {editingId === c.id
                  ? <input value={editName} onChange={e => setEditName(e.target.value)} className={inputCls + " py-1"} autoFocus />
                  : c.name}
              </td>
              <td className="px-3 py-2 text-right text-[#9B6B45]">{refs[c.id] ?? 0}</td>
              <td className="px-3 py-2 text-center">
                {editingId === c.id ? (
                  <div className="inline-flex gap-1">
                    <button onClick={() => saveEdit(c.id)} disabled={busy} className={iconBtnPrimary}><Save size={13} /></button>
                    <button onClick={() => setEditingId(null)} className={iconBtnGhost}><X size={13} /></button>
                  </div>
                ) : (
                  <div className="inline-flex gap-1">
                    <button onClick={() => { setEditingId(c.id); setEditName(c.name); setError(null); }} className={iconBtnGhost} title="Renombrar">
                      <Save size={13} />
                    </button>
                    <button onClick={() => remove(c.id)} className={iconBtnDanger} title={(refs[c.id] ?? 0) > 0 ? "En uso, no se puede eliminar" : "Eliminar"} disabled={(refs[c.id] ?? 0) > 0}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

// ── Tallas ───────────────────────────────────────────────────────────────
function SizesPanel({
  items, setItems, refs,
}: {
  items: ConfigBundle["sizes"];
  setItems: React.Dispatch<React.SetStateAction<ConfigBundle["sizes"]>>;
  refs: Record<string, number>;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const name = newName.trim();
    if (!name) { setError("El nombre es obligatorio"); return; }
    if (items.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setError("Ya existe una talla con ese nombre"); return;
    }
    setBusy(true); setError(null);
    try {
      const sort_order = items.reduce((m, s) => Math.max(m, s.sort_order), 0) + 1;
      const { data, error: e } = await supabase
        .from("product_sizes")
        .insert({ name, sort_order, active: true })
        .select("id, name, sort_order, active")
        .single();
      if (e) throw new Error(e.message);
      setItems(prev => [...prev, data as ConfigBundle["sizes"][number]].sort((a, b) => a.sort_order - b.sort_order));
      setNewName(""); setAdding(false);
    } catch (e: any) {
      setError(e?.message ?? "Error al crear talla");
    } finally { setBusy(false); }
  }

  async function toggleActive(id: string, active: boolean) {
    setBusy(true); setError(null);
    try {
      const { error: e } = await supabase.from("product_sizes").update({ active: !active }).eq("id", id);
      if (e) throw new Error(e.message);
      setItems(prev => prev.map(s => s.id === id ? { ...s, active: !active } : s));
    } catch (e: any) {
      setError(e?.message ?? "Error al cambiar estado");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    const used = refs[id] ?? 0;
    if (used > 0) {
      alert(`No se puede eliminar: ${used} variante(s) usan esta talla. Puedes ocultarla en su lugar.`);
      return;
    }
    if (!confirm("¿Eliminar esta talla?")) return;
    setBusy(true); setError(null);
    try {
      const { error: e } = await supabase.from("product_sizes").delete().eq("id", id);
      if (e) throw new Error(e.message);
      setItems(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar");
    } finally { setBusy(false); }
  }

  return (
    <Panel
      title="Tallas"
      desc="Se usan al armar variantes (talla × color) en cada producto. Si una talla está en uso, ocúltala en lugar de eliminarla."
      error={error}
      onAdd={() => { setAdding(true); setError(null); }}
      addingForm={adding && (
        <div className="flex gap-2 items-end">
          <Field label="Nombre (ej. 0, 0-3m, RN)">
            <input value={newName} onChange={e => setNewName(e.target.value)} className={inputCls} placeholder="0" />
          </Field>
          <button onClick={add} disabled={busy} className={primaryBtn}>
            <Save size={14} /> Crear
          </button>
          <button onClick={() => { setAdding(false); setNewName(""); }} className={ghostBtn}>
            <X size={14} />
          </button>
        </div>
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
          <tr>
            <th className="px-3 py-2 text-left font-bold">Nombre</th>
            <th className="px-3 py-2 text-right font-bold">Orden</th>
            <th className="px-3 py-2 text-right font-bold">Variantes</th>
            <th className="px-3 py-2 text-center font-bold">Estado</th>
            <th className="px-3 py-2 text-center font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5EDD8]">
          {items.length === 0 && (
            <tr><td colSpan={5} className="px-3 py-6 text-center text-[#9B6B45]">No hay tallas.</td></tr>
          )}
          {items.map(s => (
            <tr key={s.id} className={`hover:bg-[#FDF8F0] ${s.active ? "" : "opacity-60"}`}>
              <td className="px-3 py-2 text-[#3D2010] font-medium">T{s.name}</td>
              <td className="px-3 py-2 text-right text-[#9B6B45]">{s.sort_order}</td>
              <td className="px-3 py-2 text-right text-[#9B6B45]">{refs[s.id] ?? 0}</td>
              <td className="px-3 py-2 text-center">
                {s.active
                  ? <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Activa</span>
                  : <span className="text-[10px] font-bold text-[#9B6B45] bg-[#F5EDD8] px-2 py-0.5 rounded-full uppercase tracking-wider">Oculta</span>}
              </td>
              <td className="px-3 py-2 text-center">
                <div className="inline-flex gap-1">
                  <button onClick={() => toggleActive(s.id, s.active)} className={iconBtnGhost} title={s.active ? "Ocultar" : "Mostrar"}>
                    {s.active ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => remove(s.id)} className={iconBtnDanger} title={(refs[s.id] ?? 0) > 0 ? "En uso, no se puede eliminar" : "Eliminar"} disabled={(refs[s.id] ?? 0) > 0}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

// ── Colores ──────────────────────────────────────────────────────────────
function ColorsPanel({
  items, setItems, refs,
}: {
  items: ConfigBundle["colors"];
  setItems: React.Dispatch<React.SetStateAction<ConfigBundle["colors"]>>;
  refs: Record<string, number>;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex]   = useState("#CFC3AE");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex]   = useState("#CFC3AE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const name = newName.trim();
    if (!name) { setError("El nombre es obligatorio"); return; }
    if (items.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      setError("Ya existe un color con ese nombre"); return;
    }
    setBusy(true); setError(null);
    try {
      const { data, error: e } = await supabase
        .from("product_colors")
        .insert({ name, hex_code: newHex || null, active: true })
        .select("id, name, hex_code, active")
        .single();
      if (e) throw new Error(e.message);
      setItems(prev => [...prev, data as ConfigBundle["colors"][number]].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName(""); setNewHex("#CFC3AE"); setAdding(false);
    } catch (e: any) {
      setError(e?.message ?? "Error al crear color");
    } finally { setBusy(false); }
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) { setError("El nombre es obligatorio"); return; }
    setBusy(true); setError(null);
    try {
      const { error: e } = await supabase.from("product_colors").update({ name, hex_code: editHex || null }).eq("id", id);
      if (e) throw new Error(e.message);
      setItems(prev => prev.map(c => c.id === id ? { ...c, name, hex_code: editHex || null } : c));
      setEditingId(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al actualizar");
    } finally { setBusy(false); }
  }

  async function toggleActive(id: string, active: boolean) {
    setBusy(true); setError(null);
    try {
      const { error: e } = await supabase.from("product_colors").update({ active: !active }).eq("id", id);
      if (e) throw new Error(e.message);
      setItems(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
    } catch (e: any) {
      setError(e?.message ?? "Error al cambiar estado");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    const used = refs[id] ?? 0;
    if (used > 0) {
      alert(`No se puede eliminar: ${used} variante(s) usan este color. Puedes ocultarlo en su lugar.`);
      return;
    }
    if (!confirm("¿Eliminar este color?")) return;
    setBusy(true); setError(null);
    try {
      const { error: e } = await supabase.from("product_colors").delete().eq("id", id);
      if (e) throw new Error(e.message);
      setItems(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Error al eliminar");
    } finally { setBusy(false); }
  }

  return (
    <Panel
      title="Colores"
      desc="Catálogo compartido de colores. El hex se usa para el swatch en el catálogo público."
      error={error}
      onAdd={() => { setAdding(true); setError(null); }}
      addingForm={adding && (
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <Field label="Nombre">
            <input value={newName} onChange={e => setNewName(e.target.value)} className={inputCls} placeholder="Verde menta" />
          </Field>
          <Field label="Color (hex)">
            <div className="flex items-center gap-2">
              <input type="color" value={newHex || "#CFC3AE"} onChange={e => setNewHex(e.target.value)} className="w-10 h-10 rounded-lg border border-[#F5EDD8] cursor-pointer" />
              <input value={newHex} onChange={e => setNewHex(e.target.value)} className={inputCls + " font-mono text-xs"} placeholder="#CFC3AE" />
            </div>
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <button onClick={add} disabled={busy} className={primaryBtn}>
              <Save size={14} /> Crear
            </button>
            <button onClick={() => { setAdding(false); setNewName(""); setNewHex("#CFC3AE"); }} className={ghostBtn}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-[#F5EDD8] text-[#6B3D1E]">
          <tr>
            <th className="px-3 py-2 text-left font-bold">Color</th>
            <th className="px-3 py-2 text-left font-bold">Hex</th>
            <th className="px-3 py-2 text-right font-bold">Variantes</th>
            <th className="px-3 py-2 text-center font-bold">Estado</th>
            <th className="px-3 py-2 text-center font-bold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5EDD8]">
          {items.length === 0 && (
            <tr><td colSpan={5} className="px-3 py-6 text-center text-[#9B6B45]">No hay colores.</td></tr>
          )}
          {items.map(c => (
            <tr key={c.id} className={`hover:bg-[#FDF8F0] ${c.active ? "" : "opacity-60"}`}>
              <td className="px-3 py-2 text-[#3D2010] font-medium">
                <span className="inline-flex items-center gap-2.5">
                  <span className="inline-block w-5 h-5 rounded-full border border-[#EDD9B4]" style={{ background: c.hex_code ?? "#EEE" }} />
                  {editingId === c.id
                    ? <input value={editName} onChange={e => setEditName(e.target.value)} className={inputCls + " py-1"} autoFocus />
                    : c.name}
                </span>
              </td>
              <td className="px-3 py-2 text-[#9B6B45] font-mono text-xs">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2">
                    <input type="color" value={editHex || "#CFC3AE"} onChange={e => setEditHex(e.target.value)} className="w-7 h-7 rounded border border-[#F5EDD8] cursor-pointer" />
                    <input value={editHex} onChange={e => setEditHex(e.target.value)} className={inputCls + " py-1 font-mono text-xs"} />
                  </div>
                ) : (c.hex_code ?? "—")}
              </td>
              <td className="px-3 py-2 text-right text-[#9B6B45]">{refs[c.id] ?? 0}</td>
              <td className="px-3 py-2 text-center">
                {c.active
                  ? <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Activo</span>
                  : <span className="text-[10px] font-bold text-[#9B6B45] bg-[#F5EDD8] px-2 py-0.5 rounded-full uppercase tracking-wider">Oculto</span>}
              </td>
              <td className="px-3 py-2 text-center">
                {editingId === c.id ? (
                  <div className="inline-flex gap-1">
                    <button onClick={() => saveEdit(c.id)} disabled={busy} className={iconBtnPrimary}><Save size={13} /></button>
                    <button onClick={() => setEditingId(null)} className={iconBtnGhost}><X size={13} /></button>
                  </div>
                ) : (
                  <div className="inline-flex gap-1">
                    <button onClick={() => { setEditingId(c.id); setEditName(c.name); setEditHex(c.hex_code ?? "#CFC3AE"); setError(null); }} className={iconBtnGhost} title="Editar">
                      <Save size={13} />
                    </button>
                    <button onClick={() => toggleActive(c.id, c.active)} className={iconBtnGhost} title={c.active ? "Ocultar" : "Mostrar"}>
                      {c.active ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => remove(c.id)} className={iconBtnDanger} title={(refs[c.id] ?? 0) > 0 ? "En uso, no se puede eliminar" : "Eliminar"} disabled={(refs[c.id] ?? 0) > 0}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

// ── Shared shell + atoms ─────────────────────────────────────────────────
function Panel({
  title, desc, error, onAdd, addingForm, children,
}: {
  title: string; desc: string; error: string | null;
  onAdd: () => void; addingForm: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#F5EDD8] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F5EDD8] flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-[#3D2010]">{title}</h2>
          <p className="text-[#9B6B45] text-xs">{desc}</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 bg-[#D4A520] text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-[#A07D10] transition-colors">
          <Plus size={13} /> Nuevo
        </button>
      </div>
      {error && (
        <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
      {addingForm && (
        <div className="px-5 py-4 bg-[#FDF8F0] border-b border-[#F5EDD8]">
          {addingForm}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#6B3D1E] mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls    = "w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]";
const primaryBtn  = "flex items-center gap-1.5 bg-[#D4A520] text-white font-bold text-xs px-3 py-2 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-60";
const ghostBtn    = "flex items-center gap-1.5 text-[#6B3D1E] font-bold text-xs px-3 py-2 rounded-xl hover:bg-[#F5EDD8] transition-colors";
const iconBtnGhost   = "p-1.5 rounded-lg text-[#6B3D1E] hover:bg-[#F5EDD8] transition-colors";
const iconBtnPrimary = "p-1.5 rounded-lg bg-[#D4A520] text-white hover:bg-[#A07D10] transition-colors";
const iconBtnDanger  = "p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent";
