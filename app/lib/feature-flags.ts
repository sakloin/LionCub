// ─── Feature flags ───────────────────────────────────────────────────────────
// Controlled by environment variables set in Vercel Dashboard.
// Default (variable not set) = disabled.

/** Set NEXT_PUBLIC_CULQI_ENABLED="true" in Vercel to activate the Culqi payment option. */
export const CULQI_ENABLED = process.env.NEXT_PUBLIC_CULQI_ENABLED === "true";
