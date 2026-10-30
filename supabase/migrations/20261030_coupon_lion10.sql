-- Migration: LION10 first-purchase coupon
-- Heber: run this in Supabase SQL Editor (same as previous migrations).

-- 1. Add coupon columns to orders (idempotent)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_code     text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0;

-- 2. Coupon uses log (one row per redeemed coupon per order)
CREATE TABLE IF NOT EXISTS coupon_uses (
  id             uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code    text      NOT NULL,
  customer_phone text,
  customer_email text,
  order_id       uuid      REFERENCES orders(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coupon_uses_phone_idx ON coupon_uses(customer_phone);
CREATE INDEX IF NOT EXISTS coupon_uses_email_idx ON coupon_uses(customer_email);

-- 3. RLS: only service_role (server-side API) can read/write
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin only coupon_uses" ON coupon_uses;
CREATE POLICY "admin only coupon_uses" ON coupon_uses
  USING (auth.role() = 'service_role');
