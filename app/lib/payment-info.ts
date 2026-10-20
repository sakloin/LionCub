// ─── Datos reales de pago (actualizado 2026-10-20) ───────────────────────────
// El QR de Yape acepta también Plin y otras billeteras: se muestra como
// "Yape / Plin". Plin ya no aparece como opción separada en el checkout.

export const PAYMENT_INFO = {
  yape: {
    qrImage: "/yape-qr.png",
    phone:   "916 018 543",
    holder:  "José Heber Chambi Aro",
  },
  bank: {
    name:    "BCP",
    account: "1947115205056",
    cci:     "00219400711520505694",
    holder:  "José Heber Chambi Aro",
    ruc:     "10101500981",
  },
} as const;

/** Nota legal de cobro por cuenta de terceros (mostrar cerca de cada método de pago). */
export const NOTA_COBRO_TERCEROS =
  "Los pagos los recibe José Heber Chambi Aro por encargo de Trejo León Silvia Hulda (RUC 10101500981), quien emite tu comprobante.";

// "plin" e "izipay" permanecen en el tipo para compatibilidad con pedidos antiguos.
export type PaymentMethod = "yape" | "plin" | "transferencia" | "contraentrega" | "izipay" | "culqi";

// Métodos de pago que se anuncian al cliente (bolsa, pie y checkout usan esta
// misma lista). La tarjeta es Culqi y solo aparece si NEXT_PUBLIC_CULQI_ENABLED=true.
export function metodosDePagoVisibles(culqiEnabled: boolean): { es: string; en: string }[] {
  return [
    { es: "Yape / Plin", en: "Yape / Plin" },
    { es: "Transferencia", en: "Bank transfer" },
    { es: "Contra entrega (Lima)", en: "Cash on delivery (Lima)" },
    ...(culqiEnabled ? [{ es: "Tarjeta", en: "Card" }] : []),
  ];
}

// Methods that require a payment proof to be uploaded before confirming.
export const PROOF_REQUIRED: PaymentMethod[] = ["yape", "plin", "transferencia"];
