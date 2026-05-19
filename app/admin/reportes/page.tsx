import { supabase } from "../../lib/supabase";
import ReportesClient from "./ReportesClient";

async function getData() {
  const [ordersRes, itemsRes, purchasesRes] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("*"),
    supabase.from("purchases").select("*").order("purchased_at", { ascending: false }),
  ]);
  return {
    orders: ordersRes.data ?? [],
    items: itemsRes.data ?? [],
    purchases: purchasesRes.data ?? [],
  };
}

export default async function ReportesAdmin() {
  const data = await getData();
  return <ReportesClient data={data} />;
}
