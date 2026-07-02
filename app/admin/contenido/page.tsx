"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { BarChart3, Loader2, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Row {
  post_id: string;
  red: string;
  formato: string;
  tipo_hook: string;
  paleta: string;
  recurso_visual: string;
  angulo_marca: string;
  producto_categoria: string;
  estilo_edicion: string;
  producto: string;
  snapshot: string;
  fecha_publicacion?: string;
  engagement_rate: number;
  metrica_primaria_valor: number;
  views: number;
  saves: number;
  shares: number;
  seguidores_ganados: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REDES = ["Facebook", "Instagram", "TikTok", "YouTube"] as const;
type Red = typeof REDES[number];

const SNAPSHOTS: { value: string; label: string }[] = [
  { value: "24h", label: "Últimas 24 h" },
  { value: "7d",  label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
];

const METRICAS: { value: string; label: string }[] = [
  { value: "engagement_rate",        label: "Engagement rate %" },
  { value: "metrica_primaria_valor", label: "Métrica primaria" },
  { value: "views",                  label: "Views" },
  { value: "saves",                  label: "Saves" },
  { value: "shares",                 label: "Shares" },
  { value: "seguidores_ganados",     label: "Seguidores ganados" },
];

const DESGLOSE: { value: string; label: string }[] = [
  { value: "formato",            label: "Formato" },
  { value: "tipo_hook",          label: "Tipo de hook" },
  { value: "paleta",             label: "Paleta" },
  { value: "recurso_visual",     label: "Recurso visual" },
  { value: "angulo_marca",       label: "Ángulo de marca" },
  { value: "producto_categoria", label: "Categoría de producto" },
  { value: "estilo_edicion",     label: "Estilo de edición" },
];

const RED_COLOR: Record<string, string> = {
  Facebook:  "#1877F2",
  Instagram: "#E1306C",
  TikTok:    "#2DD4BF",
  YouTube:   "#FF0000",
};

const TABLE_COLS: { key: string; label: string; numeric?: boolean }[] = [
  { key: "post_id",              label: "Post ID" },
  { key: "red",                  label: "Red" },
  { key: "formato",              label: "Formato" },
  { key: "tipo_hook",            label: "Hook" },
  { key: "paleta",               label: "Paleta" },
  { key: "recurso_visual",       label: "Recurso visual" },
  { key: "metrica_primaria_valor", label: "Métrica", numeric: true },
  { key: "engagement_rate",      label: "Eng. rate", numeric: true },
  { key: "views",                label: "Views", numeric: true },
  { key: "saves",                label: "Saves", numeric: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowAvg(rows: Row[], key: string): number {
  if (!rows.length) return 0;
  return rows.reduce((s, r) => s + (Number((r as any)[key]) || 0), 0) / rows.length;
}

function groupBy(rows: Row[], key: string): Map<string, Row[]> {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const k = String((r as any)[key] ?? "") || "(sin valor)";
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(r);
  }
  return m;
}

function fmtVal(val: number, metricaKey: string): string {
  if (metricaKey === "engagement_rate") return `${val.toFixed(2)}%`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
  return String(Math.round(val));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContenidoPage() {
  // Fetch state
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Filter state
  const [snapshot,    setSnapshot]    = useState("7d");
  const [selectedRedes, setSelectedRedes] = useState<Set<string>>(new Set(REDES));
  const [producto,    setProducto]    = useState("");
  const [metrica,     setMetrica]     = useState("engagement_rate");
  const [desglosarPor, setDesglosarPor] = useState("formato");

  // Table sort state
  const [sortCol, setSortCol] = useState("engagement_rate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token ?? "";
        const params = new URLSearchParams({ snapshot });
        if (producto) params.set("producto", producto);
        const res = await fetch(`/api/admin/contenido?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `Error ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) setRows(json.rows ?? []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [snapshot, producto]);

  // ── Toggle red chip ────────────────────────────────────────────────────────
  function toggleRed(red: string) {
    setSelectedRedes(prev => {
      const next = new Set(prev);
      if (next.has(red)) {
        if (next.size === 1) return next; // keep at least one
        next.delete(red);
      } else {
        next.add(red);
      }
      return next;
    });
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const productos = useMemo(
    () => [...new Set(rows.map(r => r.producto).filter(Boolean))].sort(),
    [rows],
  );

  const filteredRows = useMemo(
    () => rows.filter(r =>
      selectedRedes.has(r.red) &&
      (producto === "" || r.producto === producto),
    ),
    [rows, selectedRedes, producto],
  );

  // KPIs
  const kpis = useMemo(() => {
    if (!filteredRows.length) return null;
    const n = filteredRows.length;
    const engAvg = rowAvg(filteredRows, "engagement_rate");

    const byRed = groupBy(filteredRows, "red");
    let bestRed = "—"; let bestRedVal = -Infinity;
    byRed.forEach((rs, k) => {
      const v = rowAvg(rs, metrica);
      if (v > bestRedVal) { bestRedVal = v; bestRed = k; }
    });

    const byFormato = groupBy(filteredRows, "formato");
    let bestFormato = "—"; let bestFormatoVal = -Infinity;
    byFormato.forEach((rs, k) => {
      const v = rowAvg(rs, metrica);
      if (v > bestFormatoVal) { bestFormatoVal = v; bestFormato = k; }
    });

    return { n, engAvg, bestRed, bestFormato };
  }, [filteredRows, metrica]);

  // Chart 1: rendimiento por red
  const chartRed = useMemo(() => {
    const byRed = groupBy(filteredRows, "red");
    return [...byRed.entries()]
      .map(([red, rs]) => ({ red, valor: parseFloat(rowAvg(rs, metrica).toFixed(2)) }))
      .sort((a, b) => b.valor - a.valor);
  }, [filteredRows, metrica]);

  // Chart 2: rendimiento por dimensión
  const chartDim = useMemo(() => {
    const byDim = groupBy(filteredRows, desglosarPor);
    return [...byDim.entries()]
      .map(([dim, rs]) => ({ dim, valor: parseFloat(rowAvg(rs, metrica).toFixed(2)) }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [filteredRows, metrica, desglosarPor]);

  // Chart 3: evolución en el tiempo
  const { chartTiempo, redesEnTiempo } = useMemo(() => {
    const hasFecha = filteredRows.some(r => r.fecha_publicacion);
    if (!hasFecha) return { chartTiempo: [], redesEnTiempo: [] };

    const redesSet = [...new Set(filteredRows.map(r => r.red))];
    const byFecha = groupBy(filteredRows, "fecha_publicacion");

    const data = [...byFecha.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, rs]) => {
        const point: Record<string, unknown> = { fecha_publicacion: fecha.slice(0, 10) };
        const byRedLocal = groupBy(rs, "red");
        for (const red of redesSet) {
          point[red] = parseFloat(rowAvg(byRedLocal.get(red) ?? [], metrica).toFixed(2));
        }
        return point;
      });

    return { chartTiempo: data, redesEnTiempo: redesSet };
  }, [filteredRows, metrica]);

  // Table sort
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const av = (a as any)[sortCol] ?? "";
      const bv = (b as any)[sortCol] ?? "";
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredRows, sortCol, sortDir]);

  function handleSort(col: string) {
    if (sortCol === col) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const metricaLabel = METRICAS.find(m => m.value === metrica)?.label ?? metrica;
  const desglosarLabel = DESGLOSE.find(d => d.value === desglosarPor)?.label ?? desglosarPor;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#F5EDD8] rounded-xl">
          <BarChart3 size={22} className="text-[#D4A520]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#3D2010]">Contenido</h1>
          <p className="text-xs text-[#9B6B45]">Análisis de rendimiento por publicación</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-[#F5EDD8] p-4 space-y-4">

        {/* Redes (chips multi-toggle) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#9B6B45] uppercase tracking-wide w-16">Red</span>
          {REDES.map(red => (
            <button
              key={red}
              onClick={() => toggleRed(red)}
              className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
              style={
                selectedRedes.has(red)
                  ? { backgroundColor: RED_COLOR[red], borderColor: RED_COLOR[red], color: "#fff" }
                  : { backgroundColor: "#fff", borderColor: "#F5EDD8", color: "#9B6B45" }
              }
            >
              {red}
            </button>
          ))}
        </div>

        {/* Selectors row */}
        <div className="flex flex-wrap gap-3">
          {/* Snapshot */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#9B6B45] uppercase tracking-wide">Periodo</label>
            <div className="flex rounded-xl border border-[#F5EDD8] overflow-hidden">
              {SNAPSHOTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSnapshot(s.value)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    snapshot === s.value
                      ? "bg-[#D4A520] text-white"
                      : "bg-white text-[#9B6B45] hover:bg-[#F5EDD8]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Producto */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#9B6B45] uppercase tracking-wide">Producto</label>
            <select
              value={producto}
              onChange={e => setProducto(e.target.value)}
              className="border border-[#F5EDD8] rounded-xl px-3 py-1.5 text-sm text-[#3D2010] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
            >
              <option value="">Todos</option>
              {productos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Métrica */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#9B6B45] uppercase tracking-wide">Métrica a comparar</label>
            <select
              value={metrica}
              onChange={e => setMetrica(e.target.value)}
              className="border border-[#F5EDD8] rounded-xl px-3 py-1.5 text-sm text-[#3D2010] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
            >
              {METRICAS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* Desglosar por */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#9B6B45] uppercase tracking-wide">Desglosar por</label>
            <select
              value={desglosarPor}
              onChange={e => setDesglosarPor(e.target.value)}
              className="border border-[#F5EDD8] rounded-xl px-3 py-1.5 text-sm text-[#3D2010] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A520]"
            >
              {DESGLOSE.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Loading / Error ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#D4A520]" />
          <span className="ml-3 text-[#9B6B45]">Cargando datos…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && filteredRows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 size={40} className="text-[#F5EDD8] mb-3" />
          <p className="text-[#9B6B45] font-semibold">Sin publicaciones para estos filtros</p>
          <p className="text-[#9B6B45] text-sm mt-1">Prueba cambiando el periodo o las redes seleccionadas</p>
        </div>
      )}

      {/* ── KPIs ── */}
      {!loading && !error && kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Publicaciones",      value: String(kpis.n),                     sub: "en el periodo" },
            { label: "Engagement promedio", value: `${kpis.engAvg.toFixed(2)}%`,       sub: "todas las redes" },
            { label: "Mejor red",          value: kpis.bestRed,                        sub: `por ${metricaLabel}` },
            { label: "Mejor formato",      value: kpis.bestFormato,                    sub: `por ${metricaLabel}` },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-[#F5EDD8] p-4">
              <p className="text-xs text-[#9B6B45] font-semibold uppercase tracking-wide">{kpi.label}</p>
              <p className="text-2xl font-bold text-[#3D2010] mt-1 truncate">{kpi.value}</p>
              <p className="text-xs text-[#9B6B45] mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts row 1 ── */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Chart 1: por red */}
          <div className="bg-white rounded-2xl border border-[#F5EDD8] p-5">
            <p className="text-sm font-bold text-[#3D2010] mb-4">Rendimiento por red</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartRed} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EDD8" />
                <XAxis dataKey="red" tick={{ fontSize: 12, fill: "#9B6B45" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9B6B45" }}
                  tickFormatter={v => fmtVal(v, metrica)}
                />
                <Tooltip
                  formatter={((v: number) => [fmtVal(v, metrica), metricaLabel]) as any}
                  contentStyle={{ borderRadius: 12, borderColor: "#F5EDD8", fontSize: 12 }}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {chartRed.map(entry => (
                    <Cell key={entry.red} fill={RED_COLOR[entry.red] ?? "#D4A520"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: por dimensión */}
          <div className="bg-white rounded-2xl border border-[#F5EDD8] p-5">
            <p className="text-sm font-bold text-[#3D2010] mb-4">
              Rendimiento por {desglosarLabel.toLowerCase()}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartDim}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EDD8" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9B6B45" }}
                  tickFormatter={v => fmtVal(v, metrica)}
                />
                <YAxis
                  type="category"
                  dataKey="dim"
                  width={90}
                  tick={{ fontSize: 11, fill: "#9B6B45" }}
                />
                <Tooltip
                  formatter={((v: number) => [fmtVal(v, metrica), metricaLabel]) as any}
                  contentStyle={{ borderRadius: 12, borderColor: "#F5EDD8", fontSize: 12 }}
                />
                <Bar dataKey="valor" fill="#D4A520" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Chart 3: evolución en el tiempo ── */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#F5EDD8] p-5">
          <p className="text-sm font-bold text-[#3D2010] mb-4">
            Evolución en el tiempo — {metricaLabel}
          </p>
          {chartTiempo.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-[#9B6B45] text-sm">
              Sin datos de fecha para mostrar evolución
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartTiempo} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EDD8" />
                <XAxis dataKey="fecha_publicacion" tick={{ fontSize: 11, fill: "#9B6B45" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9B6B45" }}
                  tickFormatter={v => fmtVal(v, metrica)}
                />
                <Tooltip
                  formatter={((v: number, name: string) => [fmtVal(v, metrica), name]) as any}
                  contentStyle={{ borderRadius: 12, borderColor: "#F5EDD8", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {redesEnTiempo.map(red => (
                  <Line
                    key={red}
                    type="monotone"
                    dataKey={red}
                    stroke={RED_COLOR[red] ?? "#D4A520"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#F5EDD8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5EDD8]">
            <p className="text-sm font-bold text-[#3D2010]">
              Publicaciones ({filteredRows.length})
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5EDD8] bg-[#FAF7F0]">
                  {TABLE_COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#9B6B45] uppercase tracking-wide cursor-pointer select-none hover:text-[#3D2010] whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortCol === col.key ? (
                          sortDir === "asc"
                            ? <ChevronUp size={13} />
                            : <ChevronDown size={13} />
                        ) : (
                          <ChevronsUpDown size={13} className="opacity-30" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => (
                  <tr
                    key={`${row.post_id}-${i}`}
                    className="border-b border-[#F5EDD8] last:border-0 hover:bg-[#FAF7F0] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#3D2010] font-mono text-xs">{row.post_id}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                        style={{ backgroundColor: RED_COLOR[row.red] ?? "#9B6B45" }}
                      >
                        {row.red}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3D2010]">{row.formato}</td>
                    <td className="px-4 py-3 text-[#9B6B45] text-xs">{row.tipo_hook}</td>
                    <td className="px-4 py-3 text-[#9B6B45] text-xs">{row.paleta}</td>
                    <td className="px-4 py-3 text-[#9B6B45] text-xs">{row.recurso_visual}</td>
                    <td className="px-4 py-3 text-[#3D2010] font-semibold text-right">
                      {fmtVal(row.metrica_primaria_valor, "metrica_primaria_valor")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${row.engagement_rate >= 3 ? "text-green-600" : "text-[#9B6B45]"}`}>
                        {row.engagement_rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3D2010] text-right">
                      {fmtVal(row.views, "views")}
                    </td>
                    <td className="px-4 py-3 text-[#3D2010] text-right">
                      {fmtVal(row.saves, "saves")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
