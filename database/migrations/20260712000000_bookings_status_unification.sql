-- Booking Engine Phase 1: unify the status vocabulary across the 4 existing,
-- independently-built booking tables (guide_bookings, experience_bookings,
-- accommodation_bookings, transport_bookings). None of them had a DB-level
-- constraint on `status` before this migration — it was enforced only by
-- app convention, and that convention already differed between tables
-- ('declined' for guides vs 'cancelled' for the other three).

CREATE TYPE public.booking_status AS ENUM (
  'pending', 'confirmed', 'rejected',
  'cancelled_by_customer', 'cancelled_by_partner',
  'completed', 'no_show'
);

-- Backfill existing free-text values onto the new vocabulary before
-- converting the column type.
UPDATE public.guide_bookings SET status = 'rejected' WHERE status = 'declined';
UPDATE public.experience_bookings SET status = 'cancelled_by_customer' WHERE status = 'cancelled';
UPDATE public.accommodation_bookings SET status = 'cancelled_by_customer' WHERE status = 'cancelled';
UPDATE public.transport_bookings SET status = 'cancelled_by_customer' WHERE status = 'cancelled';

ALTER TABLE public.guide_bookings
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.booking_status USING status::public.booking_status,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.experience_bookings
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.booking_status USING status::public.booking_status,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.accommodation_bookings
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.booking_status USING status::public.booking_status,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.transport_bookings
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.booking_status USING status::public.booking_status,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

-- payment_status is deliberately a separate, orthogonal axis from `status`
-- (a booking can be 'pending' with payment_status='pending_verification'
-- simultaneously) rather than folding payment states into the status enum,
-- avoiding a combinatorial state explosion — mirrors how the partner portal
-- keeps business_verification.status separate from per-document verification.
ALTER TABLE public.guide_bookings ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'refund_requested', 'refunded'));
ALTER TABLE public.experience_bookings ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'refund_requested', 'refunded'));
ALTER TABLE public.accommodation_bookings ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'refund_requested', 'refunded'));
ALTER TABLE public.transport_bookings ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'refund_requested', 'refunded'));

-- guide_bookings/experience_bookings/accommodation_bookings have no currency
-- column at all today (implicitly USD). transport_bookings already has
-- price_currency — reuse it there rather than adding a second, differently
-- named column (a known, accepted inconsistency, not fixed here to avoid an
-- unnecessary breaking rename on an already-working table).
ALTER TABLE public.guide_bookings ADD COLUMN currency text NOT NULL DEFAULT 'USD';
ALTER TABLE public.experience_bookings ADD COLUMN currency text NOT NULL DEFAULT 'USD';
ALTER TABLE public.accommodation_bookings ADD COLUMN currency text NOT NULL DEFAULT 'USD';

-- Accommodations have no owner concept at all today (only a free-text
-- owner_name). This nullable column is a zero-risk, backward-compatible
-- structural fix: it unblocks an owner-side RLS policy on
-- accommodation_bookings for whenever accommodation ownership is actually
-- solved (likely by migrating accommodations into the newer `businesses`
-- model) — nothing populates it in this phase, so accommodation bookings
-- remain admin-only-visible on the owner side until then.
ALTER TABLE public.accommodations ADD COLUMN managed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_accommodations_managed_by ON public.accommodations(managed_by);
