-- Stage 9: Payment fields for Razorpay integration
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. Add price to events (stored in paise, 0 = free)
-- =============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS price integer DEFAULT 0 CHECK(price >= 0);

-- =============================================
-- 2. Add payment tracking to registrations
-- =============================================
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'free'
  CHECK(payment_status IN ('free', 'pending', 'paid', 'failed'));

-- Mark all existing registrations as free
UPDATE registrations SET payment_status = 'free' WHERE payment_status IS NULL;

-- Index for fast order_id lookups (webhook + verify use this)
CREATE INDEX IF NOT EXISTS idx_registrations_order_id ON registrations(razorpay_order_id);

-- =============================================
-- 3. Update registration count trigger
-- Only count FREE registrations on INSERT
-- (paid registrations are counted on payment confirmation below)
-- =============================================
CREATE OR REPLACE FUNCTION increment_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'free' THEN
    UPDATE events
    SET current_registrations = current_registrations + 1
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. New trigger: increment count when payment is confirmed
-- Fires on UPDATE when payment_status changes to 'paid'
-- =============================================
CREATE OR REPLACE FUNCTION increment_registration_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.payment_status != 'paid' AND NEW.payment_status = 'paid' THEN
    UPDATE events
    SET current_registrations = current_registrations + 1
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists, then recreate
DROP TRIGGER IF EXISTS after_payment_confirmed ON registrations;
CREATE TRIGGER after_payment_confirmed
  AFTER UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION increment_registration_on_payment();
