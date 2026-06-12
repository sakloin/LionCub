"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { formatSoles } from "../../lib/money";

export interface CatalogProduct {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  price: number;
  cost: number | null;
  has_offer: boolean;
  image_url: string | null;
  active: boolean;
  variants?: Array<{
    id: string;
    stock: number;
    active: boolean;
    size: { id: string; name: string; sort_order: number } | null;
    color: { id: string; name: string; hex_code: string | null } | null;
  }>;
  images?: Array<{ id: string; url: string; is_primary: boolean; is_hover: boolean; sort_order: number }>;
}

interface Brand {
  whatsapp: string;
  whatsappUrl: string;
  website: string;
  email: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  conjuntos: "Conjuntos & Ajuares",
  bodies: "Bodies",
  baberos: "Baberos",
  mantas: "Mantas",
};
const CATEGORY_ORDER = ["conjuntos", "bodies", "baberos", "mantas"];

function primaryImageUrl(p: CatalogProduct): string | null {
  const fromGallery = p.images?.find(i => i.is_primary)?.url
    ?? p.images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  return fromGallery ?? p.image_url ?? null;
}

function totalStock(p: CatalogProduct): number {
  return (p.variants ?? []).filter(v => v.active).reduce((s, v) => s + v.stock, 0);
}

function uniqueSizes(p: CatalogProduct): string[] {
  const set = new Map<string, number>();
  (p.variants ?? []).forEach(v => {
    if (v.active && v.size) set.set(v.size.name, v.size.sort_order);
  });
  return Array.from(set.entries()).sort((a, b) => a[1] - b[1]).map(e => e[0]);
}

function uniqueColors(p: CatalogProduct): Array<{ name: string; hex: string | null }> {
  const map = new Map<string, string | null>();
  (p.variants ?? []).forEach(v => {
    if (v.active && v.color) map.set(v.color.name, v.color.hex_code);
  });
  return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
}

export default function CatalogoClient({ products, brand }: { products: CatalogProduct[]; brand: Brand }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const out: Record<string, CatalogProduct[]> = {};
    products.forEach(p => {
      const k = CATEGORY_ORDER.includes(p.category) ? p.category : "otros";
      (out[k] ??= []).push(p);
    });
    return out;
  }, [products]);

  const productCount = products.length;
  const inStockCount = products.filter(p => totalStock(p) > 0).length;

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const [{ pdf }, { CatalogDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./CatalogDocument"),
      ]);
      const blob = await pdf(<CatalogDocument products={products} brand={brand} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `lion-cub-catalogo-${today}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      console.error("[admin/catalogo] pdf generation failed:", e);
      setError(e?.message ?? "No se pudo generar el PDF");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3D2010]">Catálogo PDF</h1>
          <p className="text-[#9B6B45] text-sm">
            Descarga un PDF imprimible del catálogo público para compartir por WhatsApp.
          </p>
        </div>
        <button
          onClick={download}
          disabled={busy || productCount === 0}
          className="flex items-center gap-2 bg-[#D4A520] text-white font-bold px-5 py-3 rounded-xl hover:bg-[#A07D10] transition-colors disabled:opacity-60"
        >
          {busy ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
          {busy ? "Generando…" : "Descargar PDF"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-mono">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#F5EDD8]">
          <p className="text-[#9B6B45] text-xs font-bold uppercase tracking-wider">Productos</p>
          <p className="text-2xl font-extrabold text-[#3D2010]">{productCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#F5EDD8]">
          <p className="text-[#9B6B45] text-xs font-bold uppercase tracking-wider">Con stock</p>
          <p className="text-2xl font-extrabold text-[#D4A520]">{inStockCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#F5EDD8]">
          <p className="text-[#9B6B45] text-xs font-bold uppercase tracking-wider">Categorías</p>
          <p className="text-2xl font-extrabold text-[#3D2010]">{Object.keys(grouped).length}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 flex gap-3">
        <FileText size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">Cómo se ve el PDF</p>
          <ul className="list-disc ml-4 space-y-0.5">
            <li>Portada con logo y datos de contacto.</li>
            <li>Productos agrupados por categoría, con foto principal, precio, tallas y colores disponibles.</li>
            <li>Botones clicables de WhatsApp ({brand.whatsapp}) y web ({brand.website}) en cada página.</li>
            <li>Los productos sin stock aparecen marcados como "Agotado".</li>
          </ul>
        </div>
      </div>

      {/* Preview list */}
      <div className="bg-white rounded-2xl border border-[#F5EDD8] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5EDD8]">
          <h2 className="font-bold text-[#3D2010]">Vista previa</h2>
          <p className="text-[#9B6B45] text-xs">Lo que se incluirá en el PDF (productos activos).</p>
        </div>
        <div className="divide-y divide-[#F5EDD8]">
          {CATEGORY_ORDER.filter(c => grouped[c]?.length).map(cat => (
            <div key={cat} className="p-5">
              <h3 className="font-bold text-[#6B3D1E] mb-3 text-sm uppercase tracking-wider">
                {CATEGORY_LABELS[cat]} <span className="text-[#9B6B45] font-normal">· {grouped[cat].length}</span>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[cat].map(p => {
                  const stock = totalStock(p);
                  const img = primaryImageUrl(p);
                  return (
                    <div key={p.id} className="flex gap-3 items-center border border-[#F5EDD8] rounded-xl p-2">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-[#F5EDD8] rounded-lg flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#3D2010] text-sm truncate">{p.name}</p>
                        <p className="text-[#D4A520] font-extrabold text-sm">{formatSoles(p.price)}</p>
                        <p className={`text-xs ${stock === 0 ? "text-red-500" : "text-[#9B6B45]"}`}>
                          {stock === 0 ? "Agotado" : `${stock} en stock`} · {uniqueSizes(p).length} tallas
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {productCount === 0 && (
            <p className="p-6 text-[#9B6B45] text-sm">No hay productos activos para incluir.</p>
          )}
        </div>
      </div>
    </div>
  );
}
