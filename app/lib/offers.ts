import type { Offer } from "./types";
import { toCents, fromCents } from "./money";

/** True if the offer is active AND inside its starts/ends window at `now`. */
export function isLive(o: Offer, now: Date = new Date()): boolean {
  if (!o.active) return false;
  if (o.starts_at && new Date(o.starts_at) > now) return false;
  if (o.ends_at && new Date(o.ends_at) < now) return false;
  return true;
}

/**
 * Most specific live offer for a product:
 *   1. product-scoped offer matching product.id
 *   2. otherwise category-scoped offer matching product.category
 * Within the same scope, the highest discount_percent wins.
 * Returns null if no offer applies.
 */
export function bestOfferFor(
  product: { id: string; category: string },
  offers: Offer[],
  now: Date = new Date(),
): Offer | null {
  const live = offers.filter(o => isLive(o, now));
  const productMatches = live.filter(
    o => o.scope_type === "product" && o.product_id === product.id,
  );
  if (productMatches.length) {
    return productMatches.reduce((a, b) =>
      b.discount_percent > a.discount_percent ? b : a,
    );
  }
  const categoryMatches = live.filter(
    o => o.scope_type === "category" && o.category === product.category,
  );
  if (categoryMatches.length) {
    return categoryMatches.reduce((a, b) =>
      b.discount_percent > a.discount_percent ? b : a,
    );
  }
  return null;
}

/** Apply offer discount in cents (rounded). No offer → returns base unchanged. */
export function applyOfferCents(baseCents: number, offer: Offer | null): number {
  if (!offer) return baseCents;
  return Math.round(baseCents * (1 - offer.discount_percent / 100));
}

/** Convenience: base soles → effective soles after offer. */
export function effectivePrice(basePrice: number, offer: Offer | null): number {
  return fromCents(applyOfferCents(toCents(basePrice), offer));
}
