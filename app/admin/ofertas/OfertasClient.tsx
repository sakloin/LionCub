"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Offer } from "../../lib/types";
import { Plus, Save, Trash2, Pause, Play, Tag, Calendar, Percent } from "lucide-react";
import { formatSoles } from "../../lib/money";
import { effectivePrice, isLive } from "../../lib/offers";

export interface OfertaProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  active: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  conjuntos: "Conjuntos & Ajuares",
  bodies: "Bodies",
  baberos: "Baberos",
  mantas: "Mantas",
};
const CATEGORIES = ["conjuntos", "bodies", "baberos", "mantas"];

interface FormState {
  id: string | null;
  name: string;
  description: string;
  discount_percent: number;
  scope_type: "product" | "category";
  product_id: string;
  category: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
}

const EMPTY: FormState = {
  id: null,
  name: "",
  description: "",
  discount_percent: 10,
  scope_type: "product",
  product_id: "",
  category: "",
  starts_at: "",
  ends_at: "",
  active: true,
};

function fromOffer(o: Offer): FormState {
  return {
    id: o.id,
    name: o.name,
    description: o.description ?? "",
    discount_percent: Number(o.discount_percent),
    scope_type: o.scope_type,
    product_id: o.product_id ?? "",
    category: o.category ?? "",
    starts_at: o.starts_at ? o.starts_at.slice(0, 16) : "",
    ends_at: o.ends_at ? o.ends_at.slice(0, 16) : "",
    active: o.active,
  };
}

type Status = "live" | "paused" | "upcoming" | "expired";
function statusOf(o: Offer): Status {
  if (!o.active) return "paused";
  const now = new Date();
  if (o.starts_at && new Date(o.starts_at) > now) return "upcoming";
  if (o.ends_at && new Date(o.ends_at) < now) return "expired";
  return "live";
}

const STATUS_LABEL: Record<Status, string> = {
  live: "Vigente",
  paused: "Pausada",
  upcoming: "Programada",
  expired: "Expirada",
};
const STATUS_CLASS: Record<Status, string> = {
  live: "bg-green-100 text-green-800",
  paused: "bg-gray-200 text-gray-700",
  upcoming: "bg-blue-100 text-blue-800",
  expired: "bg-red-100 text-red-700",
};

export default function OfertasClient({
  initialOffers,
  products,
}: {
  initialOffers: Offer[];
  products: OfertaProduct[];
}) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const productMap = useMemo(() => {
    const m = new Map<string, OfertaProduct>();
    products.forEach(p => m.set(p.id, p));
    return m;
  }, [products]);

  function openNew() {
    setForm(EMPTY);
    setSaveError(null);
    setShowForm(true);
  }

  function openEdit(o: Offer) {
    setForm(fromOffer(o));
    setSaveError(null);
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setForm(EMPTY);
    setSaveError(null);
  }

  async function save() {
    setSaveError(null);
    if (!form.name.trim()) { setSaveError("El nombre es obligatorio"); return; }
    if (!(form.discount_percent > 0 && form.discount_percent <= 90)) {
      setSaveError("El % de descuento debe estar entre 1 y 90");
      return;
    }
    if (form.scope_type === "product" && !form.product_id) {
      setSaveError("Selecciona un producto");
      return;
    }
    if (form.scope_type === "category" && !form.category) {
      setSaveError("Selecciona una categoría");
      return;
    }
    if (form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      setSaveError("La fecha de fin debe ser posterior al inicio");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        discount_percent: Number(form.discount_percent),
        scope_type: form.scope_type,
        product_id: form.scope_type === "product" ? form.product_id : null,
        category:   form.scope_type === "category" ? form.category   : null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at:   form.ends_at   ? new Date(form.ends_at).toISOString()   : null,
        active: form.active,
      };

      let saved: Offer;
      if (form.id) {
        const { data, error } = await supabase
          .from("offers")
          .update(payload)
          .eq("id", form.id)
          .select("*")
          .single();
        if (error) throw new Error(error.message);
        saved = data as Offer;
        setOffers(prev => prev.map(o => o.id === saved.id ? saved : o));
      } else {
        const { data, error } = await supabase
          .from("offers")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw new Error(error.message);
        saved = data as Offer;
        setOffers(prev => [saved, ...prev]);
      }
      setShowForm(false);
      setForm(EMPTY);
    } catch (e: any) {
      console.error("[admin/ofertas] save failed:", e);
      setSaveError(e?.message ?? "Error al guardar la oferta");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(o: Offer) {
    const { data, error } = await supabase
      .from("offers")
      .update({ active: !o.active })
      .eq("id", o.id)
      .select("*")
      .single();
    if (error) {
      console.error("[admin/ofertas] toggle failed:", error.message);
      return;
    }
    setOffers(prev => prev.map(x => x.id === o.id ? (data as Offer) : x));
  }

  async function remove(o: Offer) {
    if (!confirm(`¿Eliminar la oferta "${o.name}"?`)) return;
    const { error } = await supabase.from("offers").delete().eq("id", o.id);
    if (error) {
      console.error("[admin/ofertas] delete failed:", error.message);
      alert("No se pudo eliminar: " + error.message);
      return;
    }
    setOffers(prev => prev.filter(x => x.id !== o.id));
  }

  function scopeLabel(o: Offer): string {
    if (o.scope_type === "product") {
      const p = o.product_id ? productMap.get(o.product_id) : null;
      return p ? p.name : "(producto eliminado)";
    }
    return CATEGORY_LABELS[o.category ?? ""] ?? o.category ?? "—";
  }

  function previewPrices(o: Offer): Array<{ name: string; base: number; eff: number }> {
    const matches = o.scope_type === "product"
      ? products.filter(p => p.id === o.product_id)
      : products.filter(p => p.category === o.category);
    return matches.slice(0, 3).map(p => ({
      name: p.name,
      base: p.price,
      eff: effectivePrice(p.price, o),
    }));
  }

  const liveCount = offers.filter(o => statusOf(o) === "live").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Ofertas</h1>
          <p className="text-[#9B6B45] text-sm">
            {liveCount} {liveCount === 1 ? "oferta vigente" : "ofertas vigentes"} ·{" "}
            {offers.length} en total
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#D4A520] text-white font-bold px-5 py-3 rounded-xl hover:bg-[#A07D10] transition-colors"
        >
          <Plus size={17} /> Nueva oferta
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-[#F5EDD8] shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-[#3D2010]">
            {form.id ? "Editar oferta" : "Nueva oferta"}
          </h2>
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-mono">
              {saveError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Nombre</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Black Friday 2026"
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">% de descuento</label>
              <input
                type="number"
                min={1}
                max={90}
                step={1}
                value={form.discount_percent}
                onChange={e => setForm(f => ({ ...f, discount_percent: +e.target.value }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Estado</label>
              <label className="flex items-center gap-2 px-3 py-2 border border-[#F5EDD8] rounded-xl text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                />
                {form.active ? "Activa" : "Pausada"}
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#6B3D1E] mb-2">Alcance</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, scope_type: "product", category: "" }))}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    form.scope_type === "product"
                      ? "bg-[#D4A520] text-white border-[#D4A520]"
                      : "bg-white text-[#6B3D1E] border-[#F5EDD8] hover:border-[#D4A520]"
                  }`}
                >
                  Producto específico
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, scope_type: "category", product_id: "" }))}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    form.scope_type === "category"
                      ? "bg-[#D4A520] text-white border-[#D4A520]"
                      : "bg-white text-[#6B3D1E] border-[#F5EDD8] hover:border-[#D4A520]"
                  }`}
                >
                  Categoría completa
                </button>
              </div>

              {form.scope_type === "product" ? (
                <select
                  value={form.product_id}
                  onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                  className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                >
                  <option value="">Seleccionar producto…</option>
                  {products.filter(p => p.active).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatSoles(p.price)} ({CATEGORY_LABELS[p.category] ?? p.category})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
                >
                  <option value="">Seleccionar categoría…</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]} ({products.filter(p => p.category === c && p.active).length} productos)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Inicio (opcional)</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
              <p className="text-[10px] text-[#9B6B45] mt-1">Vacío = empieza ahora</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Fin (opcional)</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
              <p className="text-[10px] text-[#9B6B45] mt-1">Vacío = sin fecha de fin</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#6B3D1E] mb-1">Descripción (opcional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Nota interna o texto promocional"
                rows={2}
                className="w-full border border-[#F5EDD8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-[#D4A520] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#A07D10] transition-colors text-sm disabled:opacity-60"
            >
              <Save size={15} /> {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={cancel}
              className="text-[#6B3D1E] font-bold py-3 px-6 rounded-xl hover:bg-[#F5EDD8] transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-[#F5EDD8] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010]">Ofertas registradas</h2>
        </div>
        {offers.length === 0 ? (
          <div className="p-8 text-center">
            <Tag size={28} className="mx-auto text-[#9B6B45] mb-3" />
            <p className="text-[#9B6B45] text-sm mb-3">No hay ofertas aún.</p>
            <button
              onClick={openNew}
              className="text-[#D4A520] font-bold text-sm hover:underline"
            >
              Crear la primera oferta →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F5EDD8]">
            {offers.map(o => {
              const st = statusOf(o);
              const preview = previewPrices(o);
              return (
                <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#3D2010]">{o.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${STATUS_CLASS[st]}`}>
                        {STATUS_LABEL[st]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#9B6B45] mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-[#D4A520]">
                        <Percent size={12} /> {Number(o.discount_percent)}% off
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {o.scope_type === "product" ? "Producto" : "Categoría"}: <strong>{scopeLabel(o)}</strong>
                      </span>
                      {(o.starts_at || o.ends_at) && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {o.starts_at ? new Date(o.starts_at).toLocaleDateString("es-PE") : "ahora"}
                          {" → "}
                          {o.ends_at ? new Date(o.ends_at).toLocaleDateString("es-PE") : "sin fin"}
                        </span>
                      )}
                    </div>
                    {preview.length > 0 && isLive(o) && (
                      <div className="mt-2 text-xs text-[#6B3D1E] flex gap-3 flex-wrap">
                        {preview.map(p => (
                          <span key={p.name}>
                            {p.name}: <span className="line-through text-[#9B6B45]">{formatSoles(p.base)}</span>{" "}
                            <strong className="text-[#D4A520]">{formatSoles(p.eff)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                    {o.description && (
                      <p className="text-xs text-[#9B6B45] mt-1 italic">{o.description}</p>
                    )}
                  </div>

                  <div className="flex gap-1.5 sm:flex-col sm:gap-1">
                    <button
                      onClick={() => openEdit(o)}
                      className="text-xs font-bold text-[#6B3D1E] hover:bg-[#F5EDD8] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(o)}
                      title={o.active ? "Pausar" : "Reactivar"}
                      className="flex items-center gap-1 text-xs font-bold text-[#6B3D1E] hover:bg-[#F5EDD8] px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {o.active ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Reactivar</>}
                    </button>
                    <button
                      onClick={() => remove(o)}
                      className="flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
