"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Order } from "../../lib/types";
import { formatSoles } from "../../lib/money";
import {
  ChevronDown, Package2, MessageCircle, FileText, Check, XCircle, Truck, Search, X, RefreshCw,
  MapPin, CalendarDays, CreditCard, CheckCircle2, ShoppingBag, Image as ImageIcon, StickyNote,
} from "lucide-react";
import {
  ConfirmDialog, EmptyState, ErrorState, FilterChip, ListSkeleton, ORDER_STATUS, ORDER_STATUS_ORDER,
  PAY_STATUS, PageHeader, StatusBadge, btn, card, cx, focusRing, notify, timeAgo,
} from "../components/ui";

interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}


function fmtDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" });
}

function fmtPhone(raw: string): string | null {
  const c = raw.replace(/[\s\-\(\)\+]/g, "");
  if (!c) return null;
  if (/^51\d{9}$/.test(c)) return c;
  if (/^\d{9}$/.test(c)) return `51${c}`;
  if (c.length >= 11) return c;
  return null;
}

function orderWaUrl(order: Order): { url: string; valid: boolean } {
  const phone = fmtPhone(order.customer_phone ?? "");
  if (!phone) return { url: "", valid: false };
  const msg = encodeURIComponent(
    `Hola ${order.customer_name}, te escribo de Lion Cub 🦁 por tu pedido #${order.id.slice(0, 8).toUpperCase()} de ${formatSoles(Number(order.total))}. ¿En qué te puedo ayudar?`
  );
  return { url: `https://wa.me/${phone}?text=${msg}`, valid: true };
}

function shortId(id: string) { return id.slice(0, 8).toUpperCase(); }

const PAYMENT_LABEL: Record<string, string> = {
  izipay: "Izipay", transferencia: "Transferencia", contraentrega: "Contra entrega",
  yape: "Yape", plin: "Plin", culqi: "Tarjeta (Culqi)",
};

type ConfirmKind = "pay" | "ship" | "reject" | "cancel";
interface PendingConfirm { kind: ConfirmKind; order: Order; prevValue?: string }

/** Siguiente paso sugerido para un pedido (una sola acción principal). */
function nextAction(o: Order): { kind: "pay" | "ship" | "deliver"; label: string; icon: typeof Check } | null {
  if (o.order_status === "cancelado") return null;
  const needsPay = o.payment_status !== "pagado";
  if (needsPay && (o.payment_method !== "contraentrega" || o.order_status === "entregado")) {
    return { kind: "pay", label: "Confirmar pago", icon: Check };
  }
  if (o.order_status === "nuevo" || o.order_status === "procesando") return { kind: "ship", label: "Marcar enviado", icon: Truck };
  if (o.order_status === "enviado") return { kind: "deliver", label: "Marcar entregado", icon: CheckCircle2 };
  return null;
}

const ESTADOS_VALIDOS = ["todos", ...ORDER_STATUS_ORDER] as const;
function readEstadoFromUrl(): string {
  if (typeof window === "undefined") return "todos";
  const e = new URLSearchParams(window.location.search).get("estado") ?? "todos";
  return (ESTADOS_VALIDOS as readonly string[]).includes(e) ? e : "todos";
}

export default function PedidosAdmin() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [orderItems,   setOrderItems]   = useState<Record<string, OrderItemDetail[]>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [productImgs,  setProductImgs]  = useState<Record<string, string>>({});
  // Map of the publicUrl/path stored in orders.payment_proof_url → time-limited
  // signed URL fetched from /api/admin/proof-url. Built after orders load.
  const [proofUrls,    setProofUrls]    = useState<Record<string, string>>({});
  const [filter,       setFilter]       = useState<string>(readEstadoFromUrl);
  const [payFilter,    setPayFilter]    = useState("todos");
  const [search,       setSearch]       = useState("");
  // Acción sensible pendiente de confirmación (notifica al cliente o cancela).
  const [confirm,      setConfirm]      = useState<PendingConfirm | null>(null);
  const [confirmBusy,  setConfirmBusy]  = useState(false);

  function showToast(msg: string, ok = true, undo?: () => void) {
    if (ok) notify.ok(msg, { undo });
    else notify.error(msg);
  }

  async function load() {
    setError(null);
    try {
      const [ordersRes, prodsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,image_url"),
      ]);
      if (ordersRes.error) throw new Error(ordersRes.error.message);
      const fetched = ordersRes.data ?? [];
      setOrders(fetched);
      if (prodsRes.data) {
        const map: Record<string, string> = {};
        prodsRes.data.forEach((p: any) => { if (p.image_url) map[p.id] = p.image_url; });
        setProductImgs(map);
      }
      // Fire-and-forget: request signed URLs for every order that has a proof.
      // payment-proofs is a private bucket; the publicUrl stored historically
      // no longer renders, so we always need a fresh signed URL.
      void fetchProofUrls(fetched);
    } catch (e: any) {
      console.error("[admin/pedidos] load failed:", e);
      setError(e?.message ?? "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProofUrls(orderList: Order[]) {
    const paths = Array.from(
      new Set(
        orderList
          .map((o) => o.payment_proof_url)
          .filter((p): p is string => typeof p === "string" && p.length > 0)
      )
    );
    if (paths.length === 0) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return; // No sesión — el RLS de admin debería haberlo evitado igual.
      const res = await fetch("/api/admin/proof-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paths }),
      });
      if (!res.ok) {
        console.error("[admin/pedidos] proof-url fetch failed:", res.status);
        return;
      }
      const json = await res.json();
      const signed = (json?.signedUrls ?? {}) as Record<string, string>;
      setProofUrls((prev) => ({ ...prev, ...signed }));
    } catch (e) {
      console.error("[admin/pedidos] proof-url fetch error:", e);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleExpand(orderId: string) {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (orderItems[orderId]) return;
    setLoadingItems(prev => new Set(prev).add(orderId));
    try {
      const { data } = await supabase
        .from("order_items")
        .select("id,product_id,product_name,product_sku,selected_size,selected_color,quantity,unit_price,subtotal")
        .eq("order_id", orderId)
        .order("id");
      setOrderItems(prev => ({ ...prev, [orderId]: data ?? [] }));
    } catch (e) {
      console.error("[admin/pedidos] loadItems failed:", e);
    } finally {
      setLoadingItems(prev => { const s = new Set(prev); s.delete(orderId); return s; });
    }
  }

  // Best-effort customer + admin "payment confirmed" email after a manual
  // mark from /admin/pedidos. The status update has already gone through
  // by the time we get here; if Resend is down the admin still sees the
  // status flipped — just no email.
  async function fireNotifyPaidEmail(orderId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      await fetch("/api/admin/orders/notify-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      });
    } catch (e: any) {
      console.error("[admin/pedidos] notify-paid failed:", e?.message ?? e);
    }
  }

  async function fireNotifyShippedWhatsApp(orderId: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return false;
      const res = await fetch("/api/admin/orders/notify-shipped", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: orderId }),
      });
      return res.ok;
    } catch (e: any) {
      console.error("[admin/pedidos] notify-shipped failed:", e?.message ?? e);
      return false;
    }
  }

  async function handleMarkShipped(orderId: string) {
    try {
      const { error: dbErr } = await supabase.from("orders").update({ order_status: "enviado" }).eq("id", orderId);
      if (dbErr) throw dbErr;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: "enviado" } : o));
      showToast(`Pedido #${shortId(orderId)} enviado · WhatsApp al cliente en camino`);
      const ok = await fireNotifyShippedWhatsApp(orderId);
      if (!ok) showToast("Estado actualizado — WhatsApp no enviado", false);
    } catch (e: any) {
      showToast(e?.message ?? "Error al marcar como enviado", false);
    }
  }

  async function updateStatus(id: string, field: "order_status" | "payment_status", value: string, prevValue?: string) {
    try {
      const { error: dbErr } = await supabase.from("orders").update({ [field]: value }).eq("id", id);
      if (dbErr) throw dbErr;
      setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
      setExpandedId(null);
      // Deshacer solo cuando ni el cambio ni su reversa tocan «pagado»
      // (pagado dispara el correo al cliente; no se ofrece deshacer ahí).
      const touchesPaid = field === "payment_status" && (value === "pagado" || prevValue === "pagado");
      const canUndo = prevValue !== undefined && !touchesPaid;
      const label = field === "order_status" ? ORDER_STATUS[value]?.label : PAY_STATUS[value]?.label;
      showToast(
        label ? `Pedido #${shortId(id)}: ${label.toLowerCase()}` : "Pedido actualizado",
        true,
        canUndo ? () => { void undoStatus(id, field, value, prevValue!); } : undefined,
      );
      if (field === "payment_status" && value === "pagado") {
        void fireNotifyPaidEmail(id);
      }
    } catch (e: any) {
      showToast(e?.message ?? "Error al actualizar", false);
    }
  }

  /**
   * Revierte un cambio de estado SIN notificar a nadie. Solo escribe si el
   * pedido sigue con el valor que puso este admin (`expected`), para no pisar
   * un cambio hecho mientras tanto desde otra pestaña o por el webhook de pago.
   */
  async function undoStatus(id: string, field: "order_status" | "payment_status", expected: string, restore: string) {
    try {
      const { data, error: dbErr } = await supabase
        .from("orders")
        .update({ [field]: restore })
        .eq("id", id)
        .eq(field, expected)
        .select("id");
      if (dbErr) throw dbErr;
      if (!data || data.length === 0) {
        showToast("No se deshizo: el pedido cambió mientras tanto. Actualiza la lista.", false);
        return;
      }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: restore } : o));
      showToast(`Cambio deshecho en el pedido #${shortId(id)}`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "No se pudo deshacer", false);
    }
  }

  async function handleConfirmPayment(id: string) {
    try {
      const { error: dbErr } = await supabase.from("orders").update({ payment_status: "pagado" }).eq("id", id);
      if (dbErr) throw dbErr;
      setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: "pagado" } : o));
      setExpandedId(null);
      showToast(`Pago del pedido #${shortId(id)} confirmado`);
      void fireNotifyPaidEmail(id);
    } catch (e: any) {
      showToast(e?.message ?? "Error al confirmar pago", false);
    }
  }

  async function handleRejectPayment(order: Order) {
    try {
      const { error: dbErr } = await supabase.from("orders").update({ payment_status: "fallido" }).eq("id", order.id);
      if (dbErr) throw dbErr;
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: "fallido" } : o));
      setExpandedId(null);
      showToast(`Comprobante del pedido #${shortId(order.id)} marcado como inválido`);
      const phone = fmtPhone(order.customer_phone ?? "");
      if (phone) {
        const msg = encodeURIComponent(
          `Hola ${order.customer_name}, no pudimos validar tu comprobante del pedido #${order.id.slice(0, 8).toUpperCase()}. ¿Podrías reenviarlo? 🦁`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      }
    } catch (e: any) {
      showToast(e?.message ?? "Error al rechazar pago", false);
    }
  }

  function changeFilter(next: string) {
    setFilter(next);
    // Mantiene el filtro en la URL para poder compartirlo / volver atrás.
    const url = new URL(window.location.href);
    if (next === "todos") url.searchParams.delete("estado"); else url.searchParams.set("estado", next);
    window.history.replaceState(null, "", url.toString());
  }

  function onSelectChange(order: Order, field: "order_status" | "payment_status", value: string) {
    const prevValue = order[field];
    if (value === prevValue) return;
    if (field === "order_status" && value === "cancelado") { setConfirm({ kind: "cancel", order, prevValue }); return; }
    if (field === "payment_status" && value === "pagado") { setConfirm({ kind: "pay", order }); return; }
    void updateStatus(order.id, field, value, prevValue);
  }

  function runNextAction(order: Order, kind: "pay" | "ship" | "deliver") {
    if (kind === "deliver") { void updateStatus(order.id, "order_status", "entregado", order.order_status); return; }
    setConfirm({ kind, order });
  }

  async function onConfirm() {
    if (!confirm) return;
    setConfirmBusy(true);
    const { kind, order, prevValue } = confirm;
    try {
      if (kind === "pay") await handleConfirmPayment(order.id);
      else if (kind === "ship") await handleMarkShipped(order.id);
      else if (kind === "reject") await handleRejectPayment(order);
      else if (kind === "cancel") await updateStatus(order.id, "order_status", "cancelado", prevValue);
    } finally {
      setConfirmBusy(false);
      setConfirm(null);
    }
  }

  // Búsqueda: nombre, teléfono, código, distrito, agencia o correo.
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^#/, "");
    return orders.filter(o => {
      if (payFilter !== "todos" && o.payment_status !== payFilter) return false;
      if (!q) return true;
      return [o.customer_name, o.customer_phone, o.id.slice(0, 8), o.district, o.shalom_agency, o.customer_email]
        .some(v => (v ?? "").toLowerCase().includes(q));
    });
  }, [orders, search, payFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: searched.length };
    for (const s of ORDER_STATUS_ORDER) c[s] = 0;
    searched.forEach(o => { c[o.order_status] = (c[o.order_status] ?? 0) + 1; });
    return c;
  }, [searched]);

  const filtered = filter === "todos" ? searched : searched.filter(o => o.order_status === filter);
  const hasFilters = filter !== "todos" || payFilter !== "todos" || search.trim() !== "";

  const header = (
    <PageHeader
      eyebrow="Hoy"
      title="Pedidos"
      subtitle={loading ? "Cargando pedidos…" : `${orders.length} pedidos · ${counts.nuevo ?? 0} nuevos por atender`}
      actions={
        <button onClick={() => { setLoading(true); void load(); }} className={btn.secondary} disabled={loading}>
          <RefreshCw size={16} aria-hidden className={loading ? "motion-safe:animate-spin" : undefined} /> Actualizar
        </button>
      }
    />
  );

  if (loading) return <div className="flex flex-col gap-5">{header}<ListSkeleton rows={4} label="Cargando pedidos…" /></div>;
  if (error) return <div className="flex flex-col gap-5">{header}<ErrorState title="No se pudieron cargar los pedidos" detail={error} onRetry={load} /></div>;

  const confirmCopy: Record<ConfirmKind, { title: string; body: string; label: string; danger?: boolean }> = {
    pay:    { title: "¿Confirmar el pago?", body: "El pedido quedará como pagado y el cliente recibirá el correo de confirmación.", label: "Confirmar pago" },
    ship:   { title: "¿Marcar como enviado?", body: "El pedido pasará a «Enviado» y se avisará al cliente por WhatsApp.", label: "Marcar enviado" },
    reject: { title: "¿Comprobante inválido?", body: "El pago quedará como fallido y se abrirá WhatsApp para pedirle al cliente un nuevo comprobante.", label: "Marcar inválido", danger: true },
    cancel: { title: "¿Cancelar el pedido?", body: "El pedido pasará a «Cancelado». Podrás deshacerlo durante unos segundos.", label: "Cancelar pedido", danger: true },
  };
  const cc = confirm ? confirmCopy[confirm.kind] : null;

  return (
    <div className="flex flex-col gap-5">
      {header}

      {/* Búsqueda + filtro de pago */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="pedidos-buscar" className="sr-only">Buscar pedidos</label>
          <Search size={18} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
          <input
            id="pedidos-buscar"
            type="search"
            placeholder="Buscar por cliente, teléfono, código o distrito"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cx("w-full min-h-11 pl-10 pr-11 rounded-xl border border-rule bg-bg-card text-ink placeholder:text-ink-soft/80", focusRing)}
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Limpiar búsqueda" className={cx(btn.icon, "absolute right-0 top-0")}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pedidos-pago" className="text-sm text-ink-soft whitespace-nowrap">Pago</label>
          <select
            id="pedidos-pago"
            value={payFilter}
            onChange={e => setPayFilter(e.target.value)}
            className={cx("min-h-11 rounded-xl border border-rule bg-bg-card text-ink px-3 text-sm", focusRing)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="fallido">Fallido</option>
          </select>
        </div>
      </div>

      {/* Filtros por estado con conteo */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto" role="group" aria-label="Filtrar por estado">
        <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap pb-1">
          <FilterChip active={filter === "todos"} onClick={() => changeFilter("todos")} count={counts.todos}>Todos</FilterChip>
          {ORDER_STATUS_ORDER.map(s => (
            <FilterChip key={s} active={filter === s} onClick={() => changeFilter(s)} count={counts[s]} icon={ORDER_STATUS[s].icon}>
              {ORDER_STATUS[s].label}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Aún no hay pedidos" description="Cuando alguien compre en la tienda, su pedido aparecerá aquí con su pago y su envío." />
        ) : (
          <EmptyState
            icon={Search}
            title="Nada con estos filtros"
            description="Prueba con otro estado o borra la búsqueda."
            action={hasFilters ? <button onClick={() => { setSearch(""); setPayFilter("todos"); changeFilter("todos"); }} className={btn.secondary}>Quitar filtros</button> : undefined}
          />
        )
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Lista de pedidos">
          {filtered.map((order, idx) => {
            const isExpanded     = expandedId === order.id;
            const items          = orderItems[order.id];
            const isLoadingItems = loadingItems.has(order.id);
            const wa             = orderWaUrl(order);
            const proofUrl       = order.payment_proof_url;
            const proofIsPdf     = !!proofUrl && proofUrl.toLowerCase().includes(".pdf");
            const proofSigned    = proofUrl ? proofUrls[proofUrl] : null;
            const next           = nextAction(order);
            const detailsId      = `pedido-${order.id}-detalle`;

            return (
              <li
                key={order.id}
                className={cx(card, "overflow-hidden lc-admin-in", order.order_status === "nuevo" && "border-l-4 border-l-gold")}
                style={{ "--i": Math.min(idx, 6) } as React.CSSProperties}
              >
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                  {/* Cabecera: código, tiempo, total */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="lc-mono text-xs text-ink-soft tracking-wider">
                        #{shortId(order.id)} ·{" "}
                        <time dateTime={order.created_at} title={new Date(order.created_at).toLocaleString("es-PE")}>{timeAgo(order.created_at)}</time>
                      </p>
                      <p className="text-lg font-semibold text-ink leading-snug mt-0.5 truncate">{order.customer_name}</p>
                      <p className="text-sm text-ink-soft">{order.customer_phone}</p>
                    </div>
                    <p className="text-xl font-semibold text-ink tabular-nums whitespace-nowrap">{formatSoles(Number(order.total))}</p>
                  </div>

                  {/* Estados y datos clave (color + ícono + texto, sin emojis) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge meta={ORDER_STATUS[order.order_status]} />
                    <StatusBadge meta={PAY_STATUS[order.payment_status]} />
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft px-1">
                      {order.shipping_method === "shalom" ? <Package2 size={14} aria-hidden /> : <MapPin size={14} aria-hidden />}
                      {order.shipping_method === "shalom" ? `Shalom · ${order.shalom_agency ?? "—"}` : `Domicilio · ${order.district}`}
                    </span>
                    {order.delivery_date && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft px-1">
                        <CalendarDays size={14} aria-hidden />
                        {fmtDate(order.delivery_date)}{order.delivery_time_slot ? ` · ${order.delivery_time_slot}` : ""}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft px-1">
                      <CreditCard size={14} aria-hidden /> {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
                    </span>
                    {proofUrl && (
                      <a
                        href={proofSigned ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!proofSigned}
                        className={cx("inline-flex items-center gap-1.5 min-h-11 px-2 rounded-lg text-xs font-semibold text-ink underline underline-offset-2", focusRing, !proofSigned && "opacity-50 pointer-events-none")}
                        title={proofSigned ? "Abrir comprobante" : "Generando enlace…"}
                      >
                        {proofIsPdf ? <FileText size={14} aria-hidden /> : <ImageIcon size={14} aria-hidden />}
                        Ver comprobante{proofIsPdf ? " (PDF)" : ""}
                      </a>
                    )}
                  </div>

                  {order.notes && (
                    <p className="flex items-start gap-2 text-sm text-ink-soft bg-bg-soft rounded-xl px-3 py-2">
                      <StickyNote size={15} aria-hidden className="mt-0.5 flex-shrink-0" /> <span>«{order.notes}»</span>
                    </p>
                  )}

                  {/* Acciones: una principal + secundarias */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {next && (
                      <button onClick={() => runNextAction(order, next.kind)} className={btn.primary}>
                        <next.icon size={16} aria-hidden /> {next.label}
                      </button>
                    )}
                    {order.payment_status === "pendiente" && order.payment_method !== "contraentrega" && (
                      <button onClick={() => setConfirm({ kind: "reject", order })} className={btn.danger}>
                        <XCircle size={16} aria-hidden /> Comprobante inválido
                      </button>
                    )}
                    {wa.valid ? (
                      <a href={wa.url} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                        <MessageCircle size={16} aria-hidden /> WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-ink-soft" title="El teléfono no tiene un formato válido">Sin WhatsApp</span>
                    )}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      className={cx(btn.ghost, "sm:ml-auto")}
                    >
                      Detalle
                      <ChevronDown size={16} aria-hidden className={cx("transition-transform duration-200", isExpanded && "rotate-180")} />
                    </button>
                  </div>
                </div>

                {/* Detalle: productos, totales y cambio manual de estado */}
                {isExpanded && (
                  <div id={detailsId} className="border-t border-rule bg-bg-soft px-4 sm:px-5 py-4 flex flex-col gap-4">
                    {isLoadingItems ? (
                      <ListSkeleton rows={1} label="Cargando productos del pedido…" />
                    ) : !items || items.length === 0 ? (
                      <p className="text-sm text-ink-soft">Este pedido no tiene productos registrados.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {items.map(item => {
                          const imgUrl = productImgs[item.product_id];
                          return (
                            <div key={item.id} className="flex items-center gap-3 bg-bg-card rounded-xl border border-rule p-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-warm flex-shrink-0">
                                {imgUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={imgUrl} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-ink-soft text-[10px] font-semibold">{item.product_sku}</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ink text-sm leading-tight line-clamp-1">{item.product_name}</p>
                                <p className="text-ink-soft text-xs">
                                  {item.product_sku}
                                  {item.selected_size  ? ` · ${item.selected_size}`  : ""}
                                  {item.selected_color ? ` · ${item.selected_color}` : ""}
                                </p>
                                <p className="text-ink-soft text-xs">{formatSoles(Number(item.unit_price))} c/u</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-semibold text-ink">× {item.quantity}</p>
                                <p className="font-semibold text-ink text-sm tabular-nums">{formatSoles(Number(item.subtotal))}</p>
                              </div>
                            </div>
                          );
                        })}
                        <dl className="flex flex-wrap justify-end gap-x-5 gap-y-1 pt-1 text-sm text-ink-soft">
                          <div className="flex gap-1"><dt>Subtotal</dt><dd className="font-semibold text-ink tabular-nums">{formatSoles(Number(order.subtotal))}</dd></div>
                          <div className="flex gap-1"><dt>Envío</dt><dd className="font-semibold text-ink tabular-nums">{formatSoles(Number(order.shipping_cost))}</dd></div>
                          <div className="flex gap-1"><dt>Total</dt><dd className="font-semibold text-ink tabular-nums">{formatSoles(Number(order.total))}</dd></div>
                        </dl>
                      </div>
                    )}

                    <fieldset className="flex flex-col sm:flex-row gap-3 border-t border-rule pt-4">
                      <legend className="text-sm font-semibold text-ink mb-2">Cambiar estado manualmente</legend>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`estado-${order.id}`} className="text-sm text-ink-soft w-14 sm:w-auto">Pedido</label>
                        <select
                          id={`estado-${order.id}`}
                          value={order.order_status}
                          onChange={e => onSelectChange(order, "order_status", e.target.value)}
                          className={cx("min-h-11 rounded-xl border border-rule bg-bg-card text-ink px-3 text-sm", focusRing)}
                        >
                          {ORDER_STATUS_ORDER.map(s => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor={`pago-${order.id}`} className="text-sm text-ink-soft w-14 sm:w-auto">Pago</label>
                        <select
                          id={`pago-${order.id}`}
                          value={order.payment_status}
                          onChange={e => onSelectChange(order, "payment_status", e.target.value)}
                          className={cx("min-h-11 rounded-xl border border-rule bg-bg-card text-ink px-3 text-sm", focusRing)}
                        >
                          {["pendiente", "pagado", "fallido"].map(s => <option key={s} value={s}>{PAY_STATUS[s].label}</option>)}
                        </select>
                      </div>
                    </fieldset>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={cc?.title ?? ""}
        description={confirm && cc ? (
          <>
            <p className="font-semibold text-ink">#{shortId(confirm.order.id)} · {confirm.order.customer_name} · {formatSoles(Number(confirm.order.total))}</p>
            <p className="mt-1">{cc.body}</p>
          </>
        ) : undefined}
        confirmLabel={cc?.label ?? "Confirmar"}
        cancelLabel="Volver"
        tone={cc?.danger ? "danger" : "default"}
        busy={confirmBusy}
        onConfirm={onConfirm}
        onCancel={() => { if (!confirmBusy) setConfirm(null); }}
      />
    </div>
  );
}
