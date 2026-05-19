export const dynamic = "force-dynamic";

import { supabase } from "../lib/supabase";
import DashboardClient from "./components/DashboardClient";

async function getStats(): Promise<any> {
  try {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersRes, itemsRes, productsRes, purchasesRes] = await Promise.all([
    supabase.from("orders").select("id,total,subtotal,shipping_cost,payment_status,order_status,created_at").gte("created_at", startOfMonth),
    supabase.from("order_items").select("product_id,product_name,quantity,unit_price,unit_cost,subtotal").gte("created_at", startOfMonth),
    supabase.from("products").select("id,name,stock,price,cost,category,active"),
    supabase.from("purchases").select("total_cost,purchased_at").gte("purchased_at", startOfMonth.slice(0,10)),
  ]);

  const orders = ordersRes.data ?? [];
  const items = itemsRes.data ?? [];
  const products = productsRes.data ?? [];
  const purchases = purchasesRes.data ?? [];

  const paidOrders = orders.filter(o => o.payment_status === "pagado");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalCOGS = items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);
  const totalPurchases = purchases.reduce((s, p) => s + Number(p.total_cost), 0);
  const grossProfit = totalRevenue - totalCOGS;

  // Sales by day (last 14 days)
  const salesByDay: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    salesByDay[d.toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit" })] = 0;
  }
  paidOrders.forEach(o => {
    const day = new Date(o.created_at).toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit" });
    if (salesByDay[day] !== undefined) salesByDay[day] += Number(o.total);
  });

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

  return {
    totalRevenue, totalCOGS, grossProfit, totalPurchases,
    orderCount: orders.length, paidCount: paidOrders.length,
    pendingCount: orders.filter(o => o.payment_status === "pendiente").length,
    salesByDay: Object.entries(salesByDay).map(([day, total]) => ({ day, total })),
    topProducts, lowStock,
    productCount: products.filter(p => p.active).length,
  };
  } catch {
    return {
      totalRevenue: 0, totalCOGS: 0, grossProfit: 0, totalPurchases: 0,
      orderCount: 0, paidCount: 0, pendingCount: 0,
      salesByDay: [], topProducts: [], lowStock: [], productCount: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  return <DashboardClient stats={stats} />;
}
