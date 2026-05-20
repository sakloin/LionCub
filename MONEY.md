# Money handling rules

## Rule 1 — Database stays in soles; calculations go through cents

The Supabase schema stores all monetary values as `numeric` in **Peruvian soles** (S/ XX.XX).  
No migration needed and no schema change.

However, every critical arithmetic operation — subtotals, totals, discounts — must go through
integer **cents** internally to avoid floating-point drift (0.1 + 0.2 ≠ 0.3 in JavaScript).

```typescript
import { toCents, fromCents } from "@/app/lib/money";

// ✅ Correct — accumulate in cents, convert once at the end
const subtotalCents = items.reduce(
  (acc, item) => acc + Math.round(item.price * 100) * item.quantity,
  0
);
const totalSoles = fromCents(subtotalCents + shippingCents);

// ❌ Wrong — floating-point drift accumulates across items
const total = items.reduce((acc, i) => acc + i.quantity * i.price, 0);
```

## Rule 2 — All price display uses `formatSoles()`

**Never** concatenate `"S/ "` manually in JSX or template strings.  
Always use the utility from `app/lib/money.ts`:

```typescript
import { formatSoles, formatSolesFromCents } from "@/app/lib/money";

// ✅ Correct
<span>{formatSoles(product.price)}</span>
<span>{formatSoles(order.total)}</span>
`Total: ${formatSoles(grandTotal)}`  // WhatsApp messages etc.

// ❌ Wrong
<span>S/ {product.price}</span>
<span>S/ {total.toFixed(2)}</span>
`Total: S/ ${grandTotal.toFixed(2)}`
```

`formatSoles` handles null/undefined/NaN → `"S/ 0.00"`. Always 2 decimal places.

## Rule 3 — Culqi always receives integer cents

The Culqi API requires `amount` as an integer in **cents** (1 PEN = 100 cents).  
Always use `toCents()` — never inline `* 100` or `Math.round(x * 100)`:

```typescript
import { toCents } from "@/app/lib/money";

// ✅ Correct
amount: toCents(grandTotal)   // e.g. 5990 for S/ 59.90

// ❌ Wrong
amount: Math.round(grandTotal * 100)
amount: grandTotal * 100
```

## Utility reference — `app/lib/money.ts`

| Function | Purpose |
|---|---|
| `toCents(soles)` | `Math.round(soles × 100)` — soles → integer cents |
| `fromCents(cents)` | `cents / 100` — integer cents → soles |
| `formatSoles(soles)` | `"S/ XX.XX"` — display formatting, null-safe |
| `formatSolesFromCents(cents)` | `formatSoles(fromCents(cents))` shortcut |
| `sumCents(...values)` | Safe integer sum — `reduce((a,b) => a+b, 0)` |
| `applyDiscountCents(cents, pct)` | `Math.round(cents × (1 − pct/100))` |
