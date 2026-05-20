/** Convert soles to integer cents. Always use Math.round — never floor/ceil. */
export function toCents(soles: number): number {
  return Math.round(soles * 100);
}

/** Convert integer cents back to soles. */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Format a soles value for display: "S/ 59.00".
 * Handles null/undefined/NaN by returning "S/ 0.00".
 */
export function formatSoles(soles: number | null | undefined): string {
  const n = (typeof soles === "number" && isFinite(soles)) ? soles : 0;
  return `S/ ${n.toFixed(2)}`;
}

/** Shortcut: formatSoles(fromCents(cents)). */
export function formatSolesFromCents(cents: number): string {
  return formatSoles(fromCents(cents));
}

/** Safe integer sum of cent values — no floating-point drift. */
export function sumCents(...values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Apply a percentage discount to a cent value. */
export function applyDiscountCents(cents: number, percent: number): number {
  return Math.round(cents * (1 - percent / 100));
}
