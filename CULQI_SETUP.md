# Culqi Integration Setup

## Prerequisites

1. A Culqi account — sign up at https://culqi.com
2. Live API keys from the Culqi Dashboard → Developers → API Keys

---

## Step 1 — Add environment variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_CULQI_PUBLIC_KEY` | `pk_live_...` | Production |
| `CULQI_SECRET_KEY` | `sk_live_...` | Production |
| `CULQI_WEBHOOK_SECRET` | *(see Step 3)* | Production |
| `NEXT_PUBLIC_CULQI_ENABLED` | `true` | Production |

For local testing use `pk_test_...` / `sk_test_...` in `.env.local`.

---

## Step 2 — Run the SQL migration in Supabase

Go to Supabase Dashboard → SQL Editor and run:

```sql
alter table orders add column if not exists payment_provider  text;
alter table orders add column if not exists payment_reference text;
alter table orders add column if not exists payment_paid_at   timestamptz;
```

---

## Step 3 — Configure the Culqi webhook

1. In the Culqi Dashboard go to **Developers → Webhooks → Add Webhook**
2. Set the URL to: `https://your-domain.com/api/payments/culqi/webhook`
3. Select the event **`charge.paid`**
4. Copy the **webhook secret** and add it as `CULQI_WEBHOOK_SECRET` in Vercel

---

## Step 4 — Deploy

Redeploy the project after adding the environment variables. The Culqi option will appear automatically in checkout once `NEXT_PUBLIC_CULQI_ENABLED=true` is set and the build is live.

---

## How it works

### Frontend
- `checkout-js` is loaded lazily from `https://js.culqi.com/checkout-js`
- Only loaded when `CULQI_ENABLED=true`
- When the customer confirms, the order is created first (status `pendiente`), then the Culqi popup opens
- On success a token is sent to our backend

### Backend — `POST /api/payments/culqi/charge`
- Receives `{ token, orderId, amount, email }`
- Calls `https://api.culqi.com/v2/charges` with Bearer `CULQI_SECRET_KEY`
- On success updates the order: `payment_status=pagado`, `payment_provider=culqi`, `payment_reference=<chargeId>`, `payment_paid_at=<now>`

### Webhook — `POST /api/payments/culqi/webhook`
- Handles `charge.paid` events from Culqi (backup for failed browser sessions)
- Validates HMAC-SHA256 signature if `CULQI_WEBHOOK_SECRET` is set
- Updates the same fields on the order

---

## Testing with sandbox keys

Set `NEXT_PUBLIC_CULQI_ENABLED=true` in `.env.local` with test keys:

```
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
CULQI_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_CULQI_ENABLED=true
```

Culqi test cards: https://docs.culqi.com/#/pagos/tokens?id=tarjetas-de-prueba
