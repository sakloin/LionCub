"use client";

import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  DollarSign, ShoppingBag, AlertTriangle, Wallet,
  TrendingUp, TrendingDown, PackageX,
} from "lucide-react";
import { formatSoles } from "../../lib/money";

interface OpenOrder {
  id: string;
  created_at: string;
  customer_name: string;
  total: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
}

interface Stats {
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  totalPurchases: number;
  orderCount: number;
  paidCount: number;
  pendingCount: number;
  todayRevenue: number;
  todayOrders: number;
  toAttend: number;
  paymentsToVerify: number;
  lowStock: { id: string; name: string; stock: number; category: string }[];
  lowStockCount: number;
  productCount: number;
  openOrders: OpenOrder[];
  salesByDay: { day: string; total: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
}

function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function KpiCard({
  label, value, hint, icon: Icon, href,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
  href: string;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink-soft leading-tight">{label}</p>
        <span className="w-11 h-11 rounded-xl bg-bg-warm flex items-center justify-center flex-shrink-0 text-gold-deep">
          <Icon size={20} aria-hidden />
        </span>
      </div>
      <p className="text-3xl font-bold text-ink tabular-nums mt-2 leading-none">{value}</p>
      <p className="text-sm text-ink-soft mt-1">{hint}</p>
    </>
  );
  return (
    <Link
      href={href}
      className="bg-bg-card rounded-2xl border border-rule p-5 shadow-sm flex flex-col min-h-[100px] hover:border-ink-soft hover:shadow-md transition-[border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
    >
      {inner}
    </Link>
  );
}

const STATUS_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  procesando: "Procesando",
  enviado: "Enviado",
  entregado: "Entregado",
};

const STATUS_CLASS: Record<string, string> = {
  nuevo: "bg-blue-50 text-blue-700 border border-blue-200",
  procesando: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  enviado: "bg-green-50 text-green-700 border border-green-200",
  entregado: "bg-bg-soft text-ink-soft border border-rule",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cx("inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap", STATUS_CLASS[status] ?? "bg-bg-soft text-ink-soft border border-rule")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" });
}

export default function DashboardClient({ stats }: { stats: Stats }) {
  const margin =
    stats.totalRevenue > 0
      ? ((stats.grossProfit / stats.totalRevenue) * 100).toFixed(1)
      : "0";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
        <p className="text-ink-soft text-sm">Resumen de hoy y del mes</p>
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ventas hoy"
          value={formatSoles(stats.todayRevenue)}
          hint={`${stats.todayOrders} pedido${stats.todayOrders !== 1 ? "s" : ""}`}
          icon={DollarSign}
          href="/admin/pedidos?estado=pagado"
        />
        <KpiCard
          label="Pedidos por preparar"
          value={String(stats.toAttend)}
          hint="nuevo + procesando"
          icon={ShoppingBag}
          href="/admin/pedidos?estado=nuevo"
        />
        <KpiCard
          label="Stock bajo"
          value={String(stats.lowStockCount)}
          hint={`de ${stats.productCount} activos`}
          icon={AlertTriangle}
          href="/admin/productos?filtro=stock-bajo"
        />
        <KpiCard
          label="Pedidos por cobrar"
          value={String(stats.paymentsToVerify)}
          hint="pagos por verificar"
          icon={Wallet}
          href="/admin/pedidos"
        />
      </div>

      {/* ── Pedidos por estado ── */}
      <div className="bg-bg-card rounded-2xl border border-rule p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-bold text-ink">Pedidos por estado</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm font-semibold text-gold-deep hover:underline min-h-11 flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
          >
            Ver todos →
          </Link>
        </div>

        {stats.openOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-ink-soft">
            <ShoppingBag size={32} aria-hidden />
            <p className="text-sm">No hay pedidos abiertos ahora mismo</p>
          </div>
        ) : (
          <>
            {/* Mobile cards (< sm) */}
            <ul className="flex flex-col gap-3 sm:hidden">
              {stats.openOrders.map(o => (
                <li key={o.id}>
                  <Link
                    href="/admin/pedidos"
                    className="flex flex-col gap-2 rounded-xl border border-rule p-3 hover:border-ink-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-ink truncate">{o.customer_name}</span>
                      <span className="text-xs text-ink-soft flex-shrink-0">{fmtDate(o.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={o.order_status} />
                      <span className="font-bold text-sm text-ink tabular-nums">{formatSoles(o.total)}</span>
                    </div>
                    <span className={cx("text-xs", o.payment_status === "pagado" ? "text-green-700" : "text-yellow-700")}>
                      {o.payment_status === "pagado" ? "Pagado" : "Pago pendiente"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop table (sm+) */}
            <div className="hidden sm:block -mx-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule text-left">
                    <th className="px-2 py-2 font-semibold text-ink-soft whitespace-nowrap">Nro</th>
                    <th className="px-2 py-2 font-semibold text-ink-soft whitespace-nowrap">Fecha</th>
                    <th className="px-2 py-2 font-semibold text-ink-soft">Cliente</th>
                    <th className="px-2 py-2 font-semibold text-ink-soft text-right whitespace-nowrap">Total</th>
                    <th className="px-2 py-2 font-semibold text-ink-soft whitespace-nowrap">Estado</th>
                    <th className="px-2 py-2 font-semibold text-ink-soft whitespace-nowrap">Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {stats.openOrders.map(o => (
                    <tr
                      key={o.id}
                      className="hover:bg-bg-soft transition-colors"
                    >
                      <td className="px-2 py-2.5 font-mono text-xs text-ink-mute whitespace-nowrap">
                        #{o.id.slice(0, 6).toUpperCase()}
                      </td>
                      <td className="px-2 py-2.5 text-ink-soft whitespace-nowrap">{fmtDate(o.created_at)}</td>
                      <td className="px-2 py-2.5 text-ink font-semibold max-w-[160px] truncate">{o.customer_name}</td>
                      <td className="px-2 py-2.5 text-ink font-bold text-right tabular-nums whitespace-nowrap">
                        {formatSoles(o.total)}
                      </td>
                      <td className="px-2 py-2.5 whitespace-nowrap">
                        <StatusBadge status={o.order_status} />
                      </td>
                      <td className={cx("px-2 py-2.5 text-xs font-semibold whitespace-nowrap", o.payment_status === "pagado" ? "text-green-700" : "text-yellow-700")}>
                        {o.payment_status === "pagado" ? "Pagado" : "Pendiente"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Chart + Top products ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-card rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="font-bold text-ink mb-4">Ventas últimos 14 días</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.salesByDay} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-rule)", fontSize: 13 }}
                formatter={(v: unknown) => [formatSoles(Number(v)), "Ventas"]}
              />
              <Bar dataKey="total" fill="var(--color-gold-deep)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-bg-card rounded-2xl p-5 shadow-sm border border-rule">
          <h2 className="font-bold text-ink mb-4">Los que más llevan</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-ink-soft text-sm">Sin ventas aún este mes</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-bg-warm text-gold-deep text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-ink font-semibold leading-tight line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gold-deep">{formatSoles(p.revenue)}</p>
                    <p className="text-xs text-ink-soft">{p.qty} uds.</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Stock bajo ── */}
      {stats.lowStock.length > 0 && (
        <div className="bg-bg-card rounded-2xl p-5 shadow-sm border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" aria-hidden />
            <h2 className="font-bold text-ink">Stock bajo (≤ 3 unidades)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.lowStock.map(p => (
              <div key={p.id} className="bg-orange-50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {p.stock <= 0 && <PackageX size={14} className="text-red-600" aria-hidden />}
                  <p className="font-bold text-orange-700 text-sm">
                    {p.stock <= 0 ? "Agotado" : p.stock}
                  </p>
                </div>
                <p className="text-xs text-orange-600 leading-tight line-clamp-2">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Resumen financiero del mes ── */}
      <div className="bg-ink text-bg rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: "Ingresos", value: formatSoles(stats.totalRevenue), highlight: true },
          { label: "Costo mercadería", value: formatSoles(stats.totalCOGS), highlight: false },
          { label: "Compras realizadas", value: formatSoles(stats.totalPurchases), highlight: false },
          {
            label: "Utilidad bruta",
            value: formatSoles(stats.grossProfit),
            highlight: false,
            negative: stats.grossProfit < 0,
          },
        ].map(({ label, value, highlight, negative }) => (
          <div key={label} className="text-center">
            <p className="text-bg/60 text-xs mb-1">{label}</p>
            <p className={cx(
              "text-xl font-extrabold tabular-nums",
              highlight ? "text-gold-deep" : negative ? "text-red-400" : "text-bg",
            )}>
              {value}
            </p>
          </div>
        ))}
        <div className="col-span-2 sm:col-span-4 border-t border-bg/10 pt-4 flex flex-wrap gap-4 justify-center text-xs text-bg/60">
          <span>{stats.paidCount} pagados · {stats.pendingCount} pendientes · margen {margin}%</span>
          <span className="inline-flex items-center gap-1">
            {stats.grossProfit >= 0
              ? <TrendingUp size={13} aria-hidden />
              : <TrendingDown size={13} aria-hidden />}
            mes actual
          </span>
        </div>
      </div>
    </div>
  );
}
