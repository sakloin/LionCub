"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingBag, AlertTriangle, Wallet, Bell, ChevronRight, Plus, Boxes, Tag,
  CalendarDays, PackageX, Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatSoles } from "../../lib/money";
import { ORDER_STATUS, PageHeader, StatusBadge, btn, card, cx, focusRing, useCountUp } from "./ui";

export interface DashboardStats {
  totalRevenue: number; totalCOGS: number; grossProfit: number; totalPurchases: number;
  orderCount: number; paidCount: number; pendingCount: number;
  todayRevenue: number; todayOrders: number;
  weekRevenue: number; prevWeekRevenue: number; weekOrders: number;
  openByStatus: { nuevo: number; procesando: number; enviado: number };
  paymentsToVerify: number;
  waitlistPending: number;
  salesByDay: { day: string; total: number; isToday?: boolean }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; category: string }[];
  outOfStock: number;
  productCount: number;
  greeting: string;
  todayLabel: string;
}

function plural(n: number, one: string, many: string) { return `${n} ${n === 1 ? one : many}`; }

/* Tarjeta KPI clicable con contador animado */
function KpiCard({
  label, value, format, hint, icon: Icon, href, i,
}: {
  label: string; value: number; format: (n: number) => string; hint?: React.ReactNode;
  icon: LucideIcon; href?: string; i: number;
}) {
  const shown = useCountUp(value);
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        <span className="w-9 h-9 rounded-xl bg-bg-warm text-gold-deep flex items-center justify-center flex-shrink-0">
          <Icon size={18} aria-hidden />
        </span>
      </div>
      <p className="text-[28px] leading-tight font-semibold text-ink tabular-nums mt-2" aria-label={format(value)}>
        {format(shown)}
      </p>
      {hint && <div className="text-sm text-ink-soft mt-1">{hint}</div>}
      {href && (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2 transition-all">
          Ver detalle <ChevronRight size={15} aria-hidden />
        </span>
      )}
    </>
  );
  const cls = cx(card, "p-5 flex flex-col lc-admin-in", href && "group hover:border-ink-soft hover:shadow-[var(--lc-shadow-1)] transition-[border-color,box-shadow]", href && focusRing);
  const style = { "--i": i } as React.CSSProperties;
  return href
    ? <Link href={href} className={cls} style={style}>{body}</Link>
    : <div className={cls} style={style}>{body}</div>;
}

function Delta({ now, prev }: { now: number; prev: number }) {
  if (prev <= 0 && now <= 0) return <span>Sin ventas en 14 días</span>;
  if (prev <= 0) return <span className="inline-flex items-center gap-1"><TrendingUp size={14} aria-hidden /> Primera semana con ventas</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={14} aria-hidden />
      {pct > 0 ? "+" : ""}{pct}% vs. 7 días previos
    </span>
  );
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="lc-display text-[22px] text-ink">{children}</h2>
      {action}
    </div>
  );
}

const linkMore = cx("inline-flex items-center gap-1 min-h-11 px-2 -mr-2 rounded-lg text-sm font-semibold text-ink hover:underline", focusRing);

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const margin = stats.totalRevenue > 0 ? ((stats.grossProfit / stats.totalRevenue) * 100).toFixed(1) : "0";
  const toAttend = stats.openByStatus.nuevo + stats.openByStatus.procesando;
  const bestDay = stats.salesByDay.reduce<{ day: string; total: number } | null>((b, d) => (!b || d.total > b.total ? d : b), null);
  const total14 = stats.salesByDay.reduce((s, d) => s + d.total, 0);

  // Saludo con contexto: qué hay que atender hoy.
  const pending: string[] = [];
  if (stats.openByStatus.nuevo) pending.push(plural(stats.openByStatus.nuevo, "pedido nuevo", "pedidos nuevos"));
  if (stats.paymentsToVerify) pending.push(plural(stats.paymentsToVerify, "pago por verificar", "pagos por verificar"));
  if (stats.waitlistPending) pending.push(plural(stats.waitlistPending, "persona esperando talla", "personas esperando talla"));
  const context = pending.length
    ? `Hoy tienes ${pending.length > 1 ? pending.slice(0, -1).join(", ") + " y " + pending.at(-1) : pending[0]}.`
    : "Todo al día: no hay pedidos por atender.";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={stats.todayLabel || "Resumen"}
        title={stats.greeting}
        subtitle={context}
        actions={
          <>
            <Link href="/admin/productos?nuevo=1" className={btn.secondary}><Plus size={16} aria-hidden /> Nuevo producto</Link>
            <Link href="/admin/pedidos?estado=nuevo" className={btn.primary}><ShoppingBag size={16} aria-hidden /> Atender pedidos</Link>
          </>
        }
      />

      {/* KPI (bento: 1 col móvil → 2 → 4) */}
      <section aria-label="Indicadores clave" className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard i={0} label="Ventas de hoy" value={stats.todayRevenue} format={formatSoles} icon={Wallet}
          hint={plural(stats.todayOrders, "pedido hoy", "pedidos hoy")} />
        <KpiCard i={1} label="Ventas · 7 días" value={stats.weekRevenue} format={formatSoles} icon={CalendarDays}
          hint={<Delta now={stats.weekRevenue} prev={stats.prevWeekRevenue} />} href="/admin/reportes" />
        <KpiCard i={2} label="Por atender" value={toAttend} format={n => String(Math.round(n))} icon={ShoppingBag}
          hint={stats.paymentsToVerify ? plural(stats.paymentsToVerify, "pago pendiente", "pagos pendientes") : "Pagos al día"}
          href="/admin/pedidos?estado=nuevo" />
        <KpiCard i={3} label="Stock bajo" value={stats.lowStock.length} format={n => String(Math.round(n))} icon={AlertTriangle}
          hint={stats.outOfStock ? `${plural(stats.outOfStock, "agotado", "agotados")} · ${stats.productCount} activos` : `de ${stats.productCount} productos activos`}
          href="/admin/productos?filtro=stock-bajo" />
      </section>

      {/* Pedidos por estado + lista de espera + accesos */}
      <div className="grid lg:grid-cols-3 gap-4">
        <section className={cx(card, "p-5 lg:col-span-2 lc-admin-in")} style={{ "--i": 4 } as React.CSSProperties} aria-labelledby="estados-title">
          <SectionTitle action={<Link href="/admin/pedidos" className={linkMore}>Todos los pedidos <ChevronRight size={15} aria-hidden /></Link>}>
            <span id="estados-title">Pedidos en curso</span>
          </SectionTitle>
          <ul className="grid sm:grid-cols-3 gap-3">
            {(["nuevo", "procesando", "enviado"] as const).map(s => (
              <li key={s}>
                <Link
                  href={`/admin/pedidos?estado=${s}`}
                  className={cx("flex sm:flex-col items-center sm:items-start justify-between gap-3 rounded-xl border border-rule p-4 min-h-11 hover:border-ink-soft transition-colors", focusRing)}
                >
                  <StatusBadge meta={ORDER_STATUS[s]} />
                  <span className="text-[28px] leading-none font-semibold tabular-nums text-ink">{stats.openByStatus[s]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={cx(card, "p-5 flex flex-col lc-admin-in")} style={{ "--i": 5 } as React.CSSProperties} aria-labelledby="accesos-title">
          <SectionTitle><span id="accesos-title">Accesos rápidos</span></SectionTitle>
          <div className="flex flex-col gap-2">
            <Link href="/admin/espera" className={cx(btn.secondary, "justify-between!")}>
              <span className="inline-flex items-center gap-2"><Bell size={16} aria-hidden /> Lista de espera</span>
              <span className={cx("min-w-6 px-1.5 py-0.5 rounded-full text-xs tabular-nums", stats.waitlistPending ? "bg-ink text-bg" : "bg-bg-warm text-ink")}>
                {stats.waitlistPending}<span className="sr-only"> pendientes</span>
              </span>
            </Link>
            <Link href="/admin/compras" className={cx(btn.secondary, "justify-start!")}><Boxes size={16} aria-hidden /> Registrar compra</Link>
            <Link href="/admin/ofertas" className={cx(btn.secondary, "justify-start!")}><Tag size={16} aria-hidden /> Crear oferta</Link>
          </div>
        </section>
      </div>

      {/* Gráfico + más vendidos */}
      <div className="grid lg:grid-cols-3 gap-4">
        <section className={cx(card, "lg:col-span-2 p-5")} aria-labelledby="ventas-title">
          <SectionTitle><span id="ventas-title">Ventas pagadas · 14 días</span></SectionTitle>
          <p className="sr-only">
            Total de 14 días {formatSoles(total14)}.{bestDay && bestDay.total > 0 ? ` Mejor día ${bestDay.day} con ${formatSoles(bestDay.total)}.` : ""}
          </p>
          <div aria-hidden>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.salesByDay} barSize={22} margin={{ left: -8, right: 4 }}>
                <CartesianGrid vertical={false} stroke="var(--color-rule)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} tickLine={false} axisLine={{ stroke: "var(--color-rule)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  cursor={{ fill: "var(--color-bg-warm)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-rule)", fontSize: 13 }}
                  formatter={(v) => [formatSoles(Number(v)), "Ventas"]}
                  labelFormatter={(l) => `Día ${l}`}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {stats.salesByDay.map(d => (
                    <Cell key={d.day} fill={d.isToday ? "var(--color-ink)" : "var(--color-gold-deep)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-soft mt-2 flex items-center gap-2">
            <span aria-hidden className="inline-block w-3 h-3 rounded-sm bg-ink" /> Hoy
            <span aria-hidden className="inline-block w-3 h-3 rounded-sm bg-gold-deep ml-3" /> Días anteriores
          </p>
        </section>

        <section className={cx(card, "p-5")} aria-labelledby="top-title">
          <SectionTitle><span id="top-title">Los que más llevan</span></SectionTitle>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-ink-soft">Aún no hay ventas este mes. Cuando entren pedidos, aquí verás los favoritos.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-rule">
              {stats.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="lc-mono text-xs text-gold-deep w-5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-ink font-semibold leading-tight line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-ink tabular-nums">{formatSoles(p.revenue)}</p>
                    <p className="text-xs text-ink-soft">{plural(p.qty, "ud.", "uds.")}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Stock bajo */}
      {stats.lowStock.length > 0 && (
        <section className={cx(card, "p-5")} aria-labelledby="stock-title">
          <SectionTitle action={<Link href="/admin/compras" className={linkMore}>Reponer stock <ChevronRight size={15} aria-hidden /></Link>}>
            <span id="stock-title">Stock bajo (≤ 3 unidades)</span>
          </SectionTitle>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {stats.lowStock.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-rule px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink line-clamp-1">{p.name}</p>
                  <p className="text-xs text-ink-soft capitalize">{p.category}</p>
                </div>
                {p.stock <= 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 text-red-800 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                    <PackageX size={13} aria-hidden /> Agotado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-gold-pale bg-gold-pale/60 text-ink px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                    <AlertTriangle size={13} aria-hidden /> Quedan {p.stock}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Resumen del mes (sin repetir los KPI de arriba) */}
      <section className={cx(card, "p-5")} aria-labelledby="mes-title">
        <SectionTitle><span id="mes-title">Resumen del mes</span></SectionTitle>
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
          {[
            ["Ingresos pagados", formatSoles(stats.totalRevenue), `${plural(stats.paidCount, "pedido pagado", "pedidos pagados")}`],
            ["Costo de mercadería", formatSoles(stats.totalCOGS), "según costo por ítem"],
            ["Compras registradas", formatSoles(stats.totalPurchases), "reposición de stock"],
            ["Utilidad bruta", formatSoles(stats.grossProfit), stats.grossProfit < 0 ? "en negativo" : "ingresos − costo"],
            ["Margen bruto", `${margin}%`, `${plural(stats.orderCount, "pedido", "pedidos")} · ${stats.pendingCount} sin pagar`],
          ].map(([label, value, hint]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-sm text-ink-soft">{label}</dt>
              <dd className={cx("text-xl font-semibold tabular-nums", label === "Utilidad bruta" && stats.grossProfit < 0 ? "text-red-700" : "text-ink")}>{value}</dd>
              <dd className="text-xs text-ink-soft">{hint}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
