-- Booking Engine Phase 1: payment tracking, status audit trail, and a
-- generic in-app notifications table. All three are polymorphic across the
-- 4 booking tables (resource_type + booking_id, no FK — a single column
-- can't reference 4 different tables) — integrity is enforced entirely by
-- routing all writes through SECURITY DEFINER RPCs (see the next migration),
-- the same trade-off the partner portal already accepted for
-- business_notifications, just spanning 4 possible parent tables instead of 1.

-- =========================================================================
-- booking_payments: normalized, not 5 columns x 4 tables — a booking can
-- have more than one payment attempt (wrong reference submitted, rejected,
-- resubmitted), which is a real 1:many relationship.
-- =========================================================================
CREATE TABLE public.booking_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL CHECK (resource_type IN ('guide', 'experience', 'accommodation', 'transport')),
  booking_id uuid NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  method text NOT NULL CHECK (method IN ('mpesa', 'airtel_money', 'card', 'bank_transfer', 'cash_on_arrival')),
  reference_note text,
  status text NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification', 'verified', 'rejected', 'refund_requested', 'refunded')),
  submitted_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_payments_booking ON public.booking_payments(resource_type, booking_id);

CREATE TRIGGER update_booking_payments_updated_at BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- booking_status_history: audit trail, mirrors business_status_history.
-- No client INSERT policy anywhere — written only inside
-- transition_booking_status().
-- =========================================================================
CREATE TABLE public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL CHECK (resource_type IN ('guide', 'experience', 'accommodation', 'transport')),
  booking_id uuid NOT NULL,
  from_status public.booking_status,
  to_status public.booking_status NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_status_history_booking ON public.booking_status_history(resource_type, booking_id, created_at DESC);

-- =========================================================================
-- notifications: new, generic in-app notification table. NOT the partner
-- portal's hard-FK'd business_notifications stub (which stays untouched) —
-- this one is reusable beyond bookings, since resource_type/resource_id are
-- plain text/uuid rather than a hard foreign key to one specific table.
-- =========================================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link_path text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
