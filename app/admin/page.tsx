export const dynamic = "force-dynamic";

import { supabase } from "../lib/supabase";
import DashboardClient, { type DashboardStats } from "./components/DashboardClient";

const TZ = "America/Lima";
/** Clave de día (AAAA-MM-DD) en hora de Lima; el servidor corre en UTC. */
function limaKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

const EMPTY: DashboardStats = {
  totalRevenue: 0, totalCOGS: 0, grossProfit: 0, totalPurchases: 0,
  orderCount: 0, paidCount: 0, pendingCount: 0,
  todayRevenue: 0, todayOrders: 0, weekRevenue: 0, prevWeekRevenue: 0, weekOrders: 0,
  openByStatus: { nuevo: 0, procesando: 0, enviado: 0 }, paymentsToVerify: 0,
  waitlistPending: 0,
  salesByDay: [], topProducts: [], lowStock: [], outOfStock: 0, productCount: 0,
  greeting: "Hola", todayLabel: "",
};

async function getStats(): Promise<DashboardStats> {
  try {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  // El gráfico y los KPI de 7 días necesitan 14 días aunque crucen el mes.
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400e3).toISOString();
  const ordersFrom = fourteenDaysAgo < startOfMonth ? fourteenDaysAgo : startOfMonth;

  const [ordersRes, itemsRes, productsRes, purchasesRes, openRes, waitRes] = await Promise.all([
    supabase.from("orders").select("id,total,subtotal,shipping_cost,payment_status,order_status,created_at").gte("created_at", ordersFrom),
    supabase.from("order_items").select("product_id,product_name,quantity,unit_price,unit_cost,subtotal").gte("created_at", startOfMonth),
    // products.stock se eliminó en Fase 1; el stock real vive en
    // product_variants. Lo embebemos via PostgREST y lo sumamos abajo.
    supabase.from("products").select("id,name,price,cost,category,active,variants:product_variants(stock,active)"),
    supabase.from("purchases").select("total_cost,purchased_at").gte("purchased_at", startOfMonth.slice(0,10)),
    // Pedidos abiertos de cualquier fecha (lo que hay que atender hoy).
    supabase.from("orders").select("id,order_status,payment_status").in("order_status", ["nuevo", "procesando", "enviado"]),
    supabase.from("waitlist").select("id", { count: "exact", head: true }).eq("notified", false),
  ]);

  const allOrders = (ordersRes.data ?? []) as Array<{
    id: string; total: number; payment_status: string; order_status: string; created_at: string;
  }>;
  const orders = allOrders.filter(o => o.created_at >= startOfMonth);
  const items = itemsRes.data ?? [];
  // Aplana stock total por producto desde sus variantes activas.
  const rawProducts = (productsRes.data ?? []) as Array<{
    id: string; name: string; price: number; cost: number | null;
    category: string; active: boolean;
    variants?: { stock: number; active: boolean }[];
  }>;
  const products = rawProducts.map(p => ({
    ...p,
    stock: (p.variants ?? []).filter(v => v.active).reduce((s, v) => s + v.stock, 0),
  }));
  const purchases = purchasesRes.data ?? [];

  const paidOrders = orders.filter(o => o.payment_status === "pagado");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalCOGS = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);
  const totalPurchases = purchases.reduce((s, p) => s + Number(p.total_cost), 0);
  const grossProfit = totalRevenue - totalCOGS;

  // Ventas por día (últimos 14 días, hora de Lima)
  const dayKeys: string[] = [];
  for (let i = 13; i >= 0; i--) dayKeys.push(limaKey(new Date(now.getTime() - i * 86400e3)));
  const salesByDayMap: Record<string, number> = Object.fromEntries(dayKeys.map(k => [k, 0]));
  const ordersByDayMap: Record<string, number> = Object.fromEntries(dayKeys.map(k => [k, 0]));
  allOrders.forEach(o => {
    const k = limaKey(new Date(o.created_at));
    if (ordersByDayMap[k] !== undefined) ordersByDayMap[k] += 1;
    if (o.payment_status === "pagado" && salesByDayMap[k] !== undefined) salesByDayMap[k] += Number(o.total);
  });
  const todayKey = dayKeys[13];
  const last7 = dayKeys.slice(7);
  const prev7 = dayKeys.slice(0, 7);

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  items.forEach(i => {
    if (!productSales[i.product_id]) productSales[i.product_id] = { name: i.product_name, qty: 0, revenue: 0 };
    productSales[i.product_id].qty += i.quantity;
    productSales[i.product_id].revenue += i.subtotal;
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Low stock
  const lowStock = products.filter(p => p.stock <= 3 && p.active).sort((a, b) => a.stock - b.stock);

  const open = (openRes.data ?? []) as Array<{ order_status: string; payment_status: string }>;
  const openByStatus = { nuevo: 0, procesando: 0, enviado: 0 };
  open.forEach(o => { if (o.order_status in openByStatus) openByStatus[o.order_status as keyof typeof openByStatus] += 1; });

  const hour = Number(now.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }));
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const todayLabel = now.toLocaleDateString("es-PE", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

  return {
    totalRevenue, totalCOGS, grossProfit, totalPurchases,
    orderCount: orders.length, paidCount: paidOrders.length,
    pendingCount: orders.filter(o => o.payment_status === "pendiente").length,
    todayRevenue: salesByDayMap[todayKey],
    todayOrders: ordersByDayMap[todayKey],
    weekRevenue: last7.reduce((s, k) => s + salesByDayMap[k], 0),
    prevWeekRevenue: prev7.reduce((s, k) => s + salesByDayMap[k], 0),
    weekOrders: last7.reduce((s, k) => s + ordersByDayMap[k], 0),
    openByStatus,
    paymentsToVerify: open.filter(o => o.payment_status === "pendiente" && o.order_status !== "enviado").length,
    waitlistPending: waitRes.count ?? 0,
    salesByDay: dayKeys.map(k => ({
      day: `${k.slice(8, 10)}/${k.slice(5, 7)}`,
      total: salesByDayMap[k],
      isToday: k === todayKey,
    })),
    topProducts,
    lowStock: lowStock.map(p => ({ id: p.id, name: p.name, stock: p.stock, category: p.category })),
    outOfStock: lowStock.filter(p => p.stock <= 0).length,
    productCount: products.filter(p => p.active).length,
    greeting, todayLabel,
  };
  } catch {
    return EMPTY;
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  return <DashboardClient stats={stats} />;
}
