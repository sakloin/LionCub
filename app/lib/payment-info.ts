// ─── Edit this file to set your real payment details ───────────────────────
// Once you have the final Yape/Plin numbers, QR images, and bank data,
// update the values below. The checkout and any future payment screens
// import from this single file.

export const PAYMENT_INFO = {
  yape: {
    // Drop your QR PNG in /public/ and update the path below
    qrImage: "/yape-qr.png",
    phone:   "999 999 999",           // ← replace with real Yape number
    holder:  "Lion Cub Baby Clothing",
  },
  plin: {
    qrImage: "/plin-qr.png",
    phone:   "999 999 999",           // ← replace with real Plin number
    holder:  "Lion Cub Baby Clothing",
  },
  bank: {
    name:    "BCP",                               // ← real bank name
    account: "000-000000-0-00",                   // ← real account number
    cci:     "002-000-000000000000-00",            // ← real CCI (20 digits)
    holder:  "Lion Cub Baby Clothing SAC",
    ruc:     "00000000000",                       // ← real RUC (11 digits)
  },
} as const;

export type PaymentMethod = "yape" | "plin" | "transferencia" | "contraentrega" | "izipay" | "culqi";

// Methods that require a payment proof to be uploaded before confirming.
export const PROOF_REQUIRED: PaymentMethod[] = ["yape", "plin", "transferencia"];
