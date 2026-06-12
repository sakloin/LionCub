/**
 * Transactional email helper — Resend wrapper.
 *
 * Two email events for v1:
 *   - sendOrderReceived: customer placed an order (any payment method).
 *   - sendPaymentConfirmed: payment_status transitioned to "pagado".
 *
 * Both send a copy to the admin (ADMIN_EMAIL) so the admin can react
 * without polling /admin/pedidos. If the customer didn't supply an email
 * the customer copy is silently skipped — the admin copy still goes.
 *
 * All sends are best-effort: callers should NOT treat a send failure as
 * a hard error. They wrap in try/catch and log.
 */

import { Resend } from "resend";
import { formatSoles } from "./money";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM     = process.env.EMAIL_FROM     ?? "Lion Cub <onboarding@resend.dev>";
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "";
const PUBLIC_SITE    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lioncub-phi.vercel.app";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface EmailOrder {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  address: string | null;
  district: string | null;
  city: string | null;
  shipping_method: string;
  shalom_agency: string | null;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  delivery_date: string | null;
  delivery_time_slot: string | null;
  created_at: string;
}

export interface EmailOrderItem {
  product_name: string;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const PAYMENT_LABEL: Record<string, string> = {
  yape:           "Yape",
  plin:           "Plin",
  transferencia:  "Transferencia bancaria",
  izipay:         "Izipay",
  culqi:          "Tarjeta (Culqi)",
  contraentrega:  "Pago contra entrega",
};

const SHIPPING_LABEL: Record<string, string> = {
  domicilio: "Envío a domicilio",
  shalom:    "Shalom (recojo en agencia)",
};

// ─── Styling helpers ────────────────────────────────────────────────────
const COLORS = {
  bg:    "#FDF8F0",
  card:  "#FFFFFF",
  ink:   "#3D2010",
  inkMid:"#6B3D1E",
  muted: "#9B6B45",
  gold:  "#D4A520",
  rule:  "#F5EDD8",
};

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${escape(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${COLORS.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.card};border-radius:16px;overflow:hidden;border:1px solid ${COLORS.rule};">
          <tr><td style="padding:28px 32px 18px;text-align:center;border-bottom:1px solid ${COLORS.rule};">
            <p style="margin:0;font-size:11px;letter-spacing:3px;color:${COLORS.muted};text-transform:uppercase;font-weight:700;">BABY CLOTHING · PERÚ</p>
            <p style="margin:6px 0 0;font-size:32px;color:${COLORS.gold};font-style:italic;font-weight:700;font-family:Georgia,serif;">Lion Cub</p>
          </td></tr>
          <tr><td style="padding:24px 32px 32px;">${body}</td></tr>
          <tr><td style="padding:18px 32px;border-top:1px solid ${COLORS.rule};background:${COLORS.bg};text-align:center;">
            <p style="margin:0;font-size:11px;color:${COLORS.muted};">
              ¿Dudas? Escríbenos a <a href="https://wa.me/51920201943" style="color:${COLORS.gold};text-decoration:none;font-weight:700;">+51 920 201 943</a>
              o visita <a href="${PUBLIC_SITE}" style="color:${COLORS.gold};text-decoration:none;font-weight:700;">lioncub.pe</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function escape(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c] as string),
  );
}

function itemRows(items: EmailOrderItem[]): string {
  return items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.rule};font-size:14px;">
        <strong style="color:${COLORS.ink};">${escape(i.product_name)}</strong>
        <span style="color:${COLORS.muted};font-size:12px;">
          ${i.selected_size ? ` · T${escape(i.selected_size)}` : ""}
          ${i.selected_color ? ` · ${escape(i.selected_color)}` : ""}
        </span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.rule};text-align:right;font-size:14px;color:${COLORS.inkMid};white-space:nowrap;">
        ${i.quantity} × ${formatSoles(Number(i.unit_price))}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${COLORS.rule};text-align:right;font-size:14px;font-weight:700;color:${COLORS.gold};white-space:nowrap;">
        ${formatSoles(Number(i.subtotal))}
      </td>
    </tr>
  `).join("");
}

function orderTable(order: EmailOrder, items: EmailOrderItem[]): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${itemRows(items)}
      <tr>
        <td style="padding:12px 0 4px;color:${COLORS.muted};font-size:13px;">Subtotal</td>
        <td colspan="2" style="padding:12px 0 4px;text-align:right;color:${COLORS.ink};font-size:13px;">${formatSoles(Number(order.subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Envío (${escape(SHIPPING_LABEL[order.shipping_method] ?? order.shipping_method)})</td>
        <td colspan="2" style="padding:4px 0;text-align:right;color:${COLORS.ink};font-size:13px;">${formatSoles(Number(order.shipping_cost))}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;border-top:2px solid ${COLORS.rule};color:${COLORS.ink};font-size:15px;font-weight:700;">Total</td>
        <td colspan="2" style="padding:12px 0 0;border-top:2px solid ${COLORS.rule};text-align:right;color:${COLORS.gold};font-size:18px;font-weight:700;">${formatSoles(Number(order.total))}</td>
      </tr>
    </table>
  `;
}

function shippingBlock(order: EmailOrder): string {
  if (order.shipping_method === "shalom") {
    return `
      <p style="margin:18px 0 4px;font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:2px;font-weight:700;">Recojo</p>
      <p style="margin:0;color:${COLORS.ink};font-size:14px;">Agencia Shalom — ${escape(order.shalom_agency ?? "agencia por confirmar")}</p>
    `;
  }
  return `
    <p style="margin:18px 0 4px;font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:2px;font-weight:700;">Dirección de envío</p>
    <p style="margin:0;color:${COLORS.ink};font-size:14px;">
      ${escape(order.address ?? "")}<br/>
      ${escape(order.district ?? "")}${order.city ? `, ${escape(order.city)}` : ""}
    </p>
  `;
}

function deliveryBlock(order: EmailOrder): string {
  if (!order.delivery_date && !order.delivery_time_slot) return "";
  return `
    <p style="margin:14px 0 4px;font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:2px;font-weight:700;">Entrega solicitada</p>
    <p style="margin:0;color:${COLORS.ink};font-size:14px;">
      ${order.delivery_date ? new Date(order.delivery_date + "T00:00:00").toLocaleDateString("es-PE", { day:"2-digit", month:"long", year:"numeric" }) : ""}
      ${order.delivery_time_slot ? ` · ${escape(order.delivery_time_slot)}` : ""}
    </p>
  `;
}

function paymentInstructionsBlock(order: EmailOrder): string {
  const method = order.payment_method;
  if (order.payment_status === "pagado") return "";
  if (method === "yape" || method === "plin") {
    return `
      <div style="margin-top:18px;padding:14px;background:${COLORS.bg};border-radius:10px;border:1px solid ${COLORS.rule};">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${COLORS.ink};">Cómo pagar con ${PAYMENT_LABEL[method] ?? method}</p>
        <p style="margin:0;font-size:13px;color:${COLORS.inkMid};line-height:1.5;">
          Yapea / Plinea <strong>${formatSoles(Number(order.total))}</strong> al <strong>+51 920 201 943</strong>
          y mándanos la captura por WhatsApp para confirmar tu pedido.
        </p>
      </div>
    `;
  }
  if (method === "transferencia") {
    return `
      <div style="margin-top:18px;padding:14px;background:${COLORS.bg};border-radius:10px;border:1px solid ${COLORS.rule};">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${COLORS.ink};">Transferencia bancaria</p>
        <p style="margin:0;font-size:13px;color:${COLORS.inkMid};line-height:1.5;">
          Te enviaremos la cuenta por WhatsApp para que transfieras <strong>${formatSoles(Number(order.total))}</strong>.
        </p>
      </div>
    `;
  }
  if (method === "contraentrega") {
    return `
      <div style="margin-top:18px;padding:14px;background:${COLORS.bg};border-radius:10px;border:1px solid ${COLORS.rule};">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${COLORS.ink};">Pago contra entrega</p>
        <p style="margin:0;font-size:13px;color:${COLORS.inkMid};line-height:1.5;">
          Pagas en efectivo al recibir tu pedido. Total: <strong>${formatSoles(Number(order.total))}</strong>.
        </p>
      </div>
    `;
  }
  return "";
}

// ─── Customer emails ────────────────────────────────────────────────────
function customerOrderReceivedHTML(order: EmailOrder, items: EmailOrderItem[]): string {
  const body = `
    <p style="margin:0;font-size:22px;color:${COLORS.ink};font-weight:700;">¡Gracias por tu pedido, ${escape(order.customer_name.split(" ")[0])}!</p>
    <p style="margin:8px 0 0;font-size:14px;color:${COLORS.inkMid};line-height:1.55;">
      Recibimos tu pedido <strong>#${escape(order.id.slice(0, 8))}</strong>.
      Te avisaremos por WhatsApp cuando confirmemos el pago y cuando salga el envío.
    </p>
    ${paymentInstructionsBlock(order)}
    <p style="margin:22px 0 8px;font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:2px;font-weight:700;">Detalle del pedido</p>
    ${orderTable(order, items)}
    ${shippingBlock(order)}
    ${deliveryBlock(order)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td align="center">
        <a href="https://wa.me/51920201943"
           style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:24px;">
          Confirmar pago por WhatsApp
        </a>
      </td></tr>
    </table>
  `;
  return shell("Recibimos tu pedido", body);
}

function customerPaymentConfirmedHTML(order: EmailOrder, items: EmailOrderItem[]): string {
  const body = `
    <p style="margin:0;font-size:22px;color:${COLORS.ink};font-weight:700;">¡Confirmamos tu pago, ${escape(order.customer_name.split(" ")[0])}!</p>
    <p style="margin:8px 0 0;font-size:14px;color:${COLORS.inkMid};line-height:1.55;">
      Estamos preparando tu pedido <strong>#${escape(order.id.slice(0, 8))}</strong> con cariño.
      Te avisamos por WhatsApp cuando salga el envío.
    </p>
    <p style="margin:22px 0 8px;font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:2px;font-weight:700;">Tu pedido</p>
    ${orderTable(order, items)}
    ${shippingBlock(order)}
    ${deliveryBlock(order)}
  `;
  return shell("Pago confirmado", body);
}

// ─── Admin emails ───────────────────────────────────────────────────────
function adminOrderHTML(order: EmailOrder, items: EmailOrderItem[], headline: string, accent: string): string {
  const body = `
    <p style="margin:0;font-size:11px;letter-spacing:2px;color:${accent};text-transform:uppercase;font-weight:700;">${escape(headline)}</p>
    <p style="margin:6px 0 0;font-size:22px;color:${COLORS.ink};font-weight:700;">${escape(order.customer_name)}</p>
    <p style="margin:4px 0 0;font-size:13px;color:${COLORS.muted};">
      #${escape(order.id.slice(0, 8))} ·
      <a href="tel:${escape(order.customer_phone)}" style="color:${COLORS.inkMid};text-decoration:none;">${escape(order.customer_phone)}</a>
      ${order.customer_email ? ` · <a href="mailto:${escape(order.customer_email)}" style="color:${COLORS.inkMid};text-decoration:none;">${escape(order.customer_email)}</a>` : ""}
    </p>
    <p style="margin:14px 0 0;font-size:13px;color:${COLORS.inkMid};">
      <strong>Método:</strong> ${escape(PAYMENT_LABEL[order.payment_method] ?? order.payment_method)}
      · <strong>Estado:</strong> ${escape(order.payment_status)}
    </p>
    ${orderTable(order, items)}
    ${shippingBlock(order)}
    ${deliveryBlock(order)}
    ${order.notes ? `
      <p style="margin:14px 0 4px;font-size:12px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:2px;font-weight:700;">Notas del cliente</p>
      <p style="margin:0;color:${COLORS.ink};font-size:14px;font-style:italic;">"${escape(order.notes)}"</p>
    ` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td align="center">
        <a href="${PUBLIC_SITE}/admin/pedidos"
           style="display:inline-block;background:${COLORS.ink};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:24px;">
          Abrir en /admin/pedidos
        </a>
      </td></tr>
    </table>
  `;
  return shell(headline, body);
}

// ─── Public API ─────────────────────────────────────────────────────────

async function send(to: string | string[], subject: string, html: string, tag: string): Promise<void> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set, skipping ${tag} email to`, to);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
    if (error) {
      console.error(`[email] ${tag} failed:`, error.message ?? error);
    }
  } catch (err: any) {
    console.error(`[email] ${tag} threw:`, err?.message ?? err);
  }
}

/**
 * Customer placed an order. Email them a receipt + payment instructions
 * (when applicable) and ping the admin so they don't have to refresh
 * /admin/pedidos to know a new order arrived.
 */
export async function sendOrderReceived(order: EmailOrder, items: EmailOrderItem[]): Promise<void> {
  const subject = `Recibimos tu pedido #${order.id.slice(0, 8)} · Lion Cub`;
  if (order.customer_email) {
    await send(order.customer_email, subject, customerOrderReceivedHTML(order, items), "customer/order-received");
  }
  if (ADMIN_EMAIL) {
    await send(
      ADMIN_EMAIL,
      `🛍️ Pedido nuevo · ${order.customer_name} · ${formatSoles(Number(order.total))}`,
      adminOrderHTML(order, items, "PEDIDO NUEVO", COLORS.gold),
      "admin/order-received",
    );
  }
}

/**
 * Payment for an existing order was confirmed (Culqi webhook or admin
 * manual mark). Tell the customer their stuff is on the way and ping
 * the admin as an audit trail.
 */
export async function sendPaymentConfirmed(order: EmailOrder, items: EmailOrderItem[]): Promise<void> {
  const subject = `Pago confirmado · #${order.id.slice(0, 8)} · Lion Cub`;
  if (order.customer_email) {
    await send(order.customer_email, subject, customerPaymentConfirmedHTML(order, items), "customer/payment-confirmed");
  }
  if (ADMIN_EMAIL) {
    await send(
      ADMIN_EMAIL,
      `✅ Pago confirmado · ${order.customer_name} · ${formatSoles(Number(order.total))}`,
      adminOrderHTML(order, items, "PAGO CONFIRMADO", "#1e8e3e"),
      "admin/payment-confirmed",
    );
  }
}
