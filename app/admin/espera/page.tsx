"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { MessageCircle, CheckCircle, Clock } from "lucide-react";
import { WaitlistEntry } from "../../lib/types";

function fmtPhone(raw: string): string | null {
  const c = raw.replace(/[\s\-\(\)\+]/g, "");
  if (!c) return null;
  if (/^51\d{9}$/.test(c)) return c;
  if (/^\d{9}$/.test(c)) return `51${c}`;
  if (c.length >= 11) return c;
  return null;
}

export default function EsperaAdmin() {
  const [entries,      setEntries]      = useState<WaitlistEntry[]>([]);
  const [productImgs,  setProductImgs]  = useState<Record<string, string>>({});
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filter,       setFilter]       = useState("pendientes");

  async function load() {
    setError(null);
    try {
      const [wlRes, prodsRes] = await Promise.all([
        supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name,image_url"),
      ]);
      if (wlRes.error) throw new Error(wlRes.error.message);
      setEntries(wlRes.data ?? []);
      if (prodsRes.data) {
        const imgs:  Record<string, string> = {};
        const names: Record<string, string> = {};
        prodsRes.data.forEach((p: any) => {
          if (p.image_url) imgs[p.id]  = p.image_url;
          if (p.name)      names[p.id] = p.name;
        });
        setProductImgs(imgs);
        setProductNames(names);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markNotified(id: string) {
    const { error: dbErr } = await supabase.from("waitlist").update({ notified: true }).eq("id", id);
    if (!dbErr) setEntries(prev => prev.map(e => e.id === id ? { ...e, notified: true } : e));
  }

  const filtered =
    filter === "todos"       ? entries :
    filter === "pendientes"  ? entries.filter(e => !e.notified) :
    entries.filter(e => e.notified);

  const pendingCount = entries.filter(e => !e.notified).length;

  if (loading) return <p className="text-[#9B6B45]">Cargando...</p>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
      <p className="font-bold mb-1">Error al cargar lista de espera</p>
      <p className="text-sm font-mono">{error}</p>
      <button onClick={load} className="mt-3 text-xs font-bold underline">Reintentar</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3D2010]">Lista de espera</h1>
        <p className="text-[#9B6B45] text-sm">
          {pendingCount > 0
            ? `${pendingCount} cliente${pendingCount !== 1 ? "s" : ""} esperando notificación`
            : "Todos los clientes han sido notificados"}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["pendientes", "notificados", "todos"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${filter === f ? "bg-[#D4A520] text-white" : "bg-white text-[#6B3D1E] border border-[#F5EDD8] hover:border-[#D4A520]"}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-[#9B6B45] border border-[#F5EDD8]">
          No hay registros {filter !== "todos" ? `"${filter}"` : "aún"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(entry => {
            const imgUrl      = productImgs[entry.product_id];
            const productName = productNames[entry.product_id] ?? entry.product_id;
            const phone       = entry.phone ? fmtPhone(entry.phone) : null;
            const waMsg       = phone
              ? encodeURIComponent(`Hola ${entry.customer_name} 🦁 Te escribimos de Lion Cub. El producto que esperabas ya tiene stock disponible. ¡Pasa a verlo en lioncub.pe!`)
              : null;

            return (
              <div key={entry.id}
                className={`bg-white rounded-2xl shadow-sm border border-[#F5EDD8] overflow-hidden ${entry.notified ? "opacity-60" : ""}`}>
                <div className="p-4 flex items-start gap-4">
                  {/* Product thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F5EDD8] flex-shrink-0">
                    {imgUrl ? (
                      <img src={imgUrl} alt={productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🦁</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#3D2010] text-sm">{entry.customer_name}</p>
                    <p className="text-[#9B6B45] text-xs mt-0.5 line-clamp-1">
                      {productName}
                      <span className="text-[#C4956A] ml-1">({entry.product_id})</span>
                    </p>
                    <p className="text-[#9B6B45] text-xs mt-0.5">
                      {entry.email && <span>{entry.email}</span>}
                      {entry.email && entry.phone && " · "}
                      {entry.phone && <span>{entry.phone}</span>}
                    </p>
                    {(entry.size || entry.color) && (
                      <p className="text-[#9B6B45] text-xs mt-0.5">
                        {[entry.size && `Talla: ${entry.size}`, entry.color && `Color: ${entry.color}`]
                          .filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="text-[#C4956A] text-xs mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(entry.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {phone && waMsg ? (
                      <a
                        href={`https://wa.me/${phone}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#1DA851] transition-colors"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 px-2">Sin teléfono</span>
                    )}

                    {entry.notified ? (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Notificado
                      </span>
                    ) : (
                      <button
                        onClick={() => markNotified(entry.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#9B6B45] hover:text-green-600 border border-[#F5EDD8] hover:border-green-300 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <CheckCircle size={13} /> Marcar notificado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
