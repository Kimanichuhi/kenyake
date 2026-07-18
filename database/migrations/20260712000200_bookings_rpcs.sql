-- Booking Engine Phase 1: SECURITY DEFINER RPCs, mirroring the
-- transition_business_status() pattern already proven out by the partner
-- portal. These are the ONLY way a booking's status/payment state changes
-- after creation — the RLS migration that follows removes all direct client
-- UPDATE policies on the 4 booking tables, closing a real bug where a
-- customer could today UPDATE their own booking's status straight to
-- 'confirmed'.
--
-- Dispatch across the 4 differently-shaped booking tables is done with an
-- explicit IF/ELSIF chain rather than dynamic SQL (EXECUTE format(...)) —
-- slightly more verbose, but fully type-checked at function-creation time
-- and closes off a SQL-injection-shaped foot-gun for barely any extra code.

CREATE OR REPLACE FUNCTION public.transition_booking_status(
  p_resource_type text,
  p_booking_id uuid,
  p_new_status public.booking_status,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old public.booking_status;
  v_customer_id uuid;
  v_owner_id uuid;
  v_is_customer boolean;
  v_is_owner boolean;
  v_is_admin boolean;
  v_authorized boolean := false;
  v_owner_link text;
BEGIN
  IF p_resource_type = 'guide' THEN
    SELECT gb.status, gb.tourist_id, g.user_id INTO v_old, v_customer_id, v_owner_id
    FROM public.guide_bookings gb JOIN public.guides g ON g.id = gb.guide_id
    WHERE gb.id = p_booking_id FOR UPDATE OF gb;
  ELSIF p_resource_type = 'experience' THEN
    SELECT eb.status, eb.user_id, c.managed_by INTO v_old, v_customer_id, v_owner_id
    FROM public.experience_bookings eb
    JOIN public.experiences e ON e.id = eb.experience_id
    LEFT JOIN public.communities c ON c.id = e.community_id
    WHERE eb.id = p_booking_id FOR UPDATE OF eb;
  ELSIF p_resource_type = 'accommodation' THEN
    SELECT ab.status, ab.user_id, a.managed_by INTO v_old, v_customer_id, v_owner_id
    FROM public.accommodation_bookings ab
    JOIN public.accommodations a ON a.id = ab.accommodation_id
    WHERE ab.id = p_booking_id FOR UPDATE OF ab;
  ELSIF p_resource_type = 'transport' THEN
    SELECT tb.status, tb.user_id, d.user_id INTO v_old, v_customer_id, v_owner_id
    FROM public.transport_bookings tb
    LEFT JOIN public.transport_drivers d ON d.id = tb.driver_id
    WHERE tb.id = p_booking_id FOR UPDATE OF tb;
  ELSE
    RAISE EXCEPTION 'Unknown resource_type: %', p_resource_type;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  v_is_customer := (auth.uid() = v_customer_id);
  v_is_owner := (v_owner_id IS NOT NULL AND auth.uid() = v_owner_id);
  v_is_admin := public.has_role(auth.uid(), 'admin');

  IF v_is_admin THEN
    v_authorized := true;
  ELSIF v_is_customer AND p_new_status = 'cancelled_by_customer' AND v_old IN ('pending', 'confirmed') THEN
    v_authorized := true;
  ELSIF v_is_owner THEN
    IF v_old = 'pending' AND p_new_status IN ('confirmed', 'rejected') THEN
      v_authorized := true;
    ELSIF v_old = 'confirmed' AND p_new_status IN ('completed', 'no_show', 'cancelled_by_partner') THEN
      v_authorized := true;
    END IF;
  END IF;

  IF NOT v_authorized THEN
    RAISE EXCEPTION 'You are not authorized to make this status change.';
  END IF;

  IF p_resource_type = 'guide' THEN
    UPDATE public.guide_bookings SET status = p_new_status WHERE id = p_booking_id;
  ELSIF p_resource_type = 'experience' THEN
    UPDATE public.experience_bookings SET status = p_new_status WHERE id = p_booking_id;
  ELSIF p_resource_type = 'accommodation' THEN
    UPDATE public.accommodation_bookings SET status = p_new_status WHERE id = p_booking_id;
  ELSIF p_resource_type = 'transport' THEN
    UPDATE public.transport_bookings SET status = p_new_status WHERE id = p_booking_id;
  END IF;

  INSERT INTO public.booking_status_history (resource_type, booking_id, from_status, to_status, changed_by, reason)
  VALUES (p_resource_type, p_booking_id, v_old, p_new_status, auth.uid(), p_reason);

  v_owner_link := CASE p_resource_type
    WHEN 'guide' THEN '/guide-dashboard'
    WHEN 'experience' THEN '/community-dashboard'
    WHEN 'transport' THEN '/transport-dashboard'
    ELSE '/platform-admin'
  END;

  IF NOT v_is_customer THEN
    INSERT INTO public.notifications (user_id, resource_type, resource_id, type, title, body, link_path)
    VALUES (v_customer_id, p_resource_type || '_booking', p_booking_id, 'booking_status_changed',
      'Your booking status changed to ' || p_new_status, p_reason, '/profile?tab=bookings');
  END IF;

  IF v_owner_id IS NOT NULL AND NOT v_is_owner THEN
    INSERT INTO public.notifications (user_id, resource_type, resource_id, type, title, body, link_path)
    VALUES (v_owner_id, p_resource_type || '_booking', p_booking_id, 'booking_status_changed',
      'A booking status changed to ' || p_new_status, p_reason, v_owner_link);
  END IF;
END;
$$;

-- =========================================================================
-- Manual payment confirmation flow.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.submit_booking_payment(
  p_resource_type text,
  p_booking_id uuid,
  p_amount integer,
  p_currency text,
  p_method text,
  p_reference_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
  v_payment_id uuid;
BEGIN
  IF p_resource_type = 'guide' THEN
    SELECT tourist_id INTO v_customer_id FROM public.guide_bookings WHERE id = p_booking_id;
  ELSIF p_resource_type = 'experience' THEN
    SELECT user_id INTO v_customer_id FROM public.experience_bookings WHERE id = p_booking_id;
  ELSIF p_resource_type = 'accommodation' THEN
    SELECT user_id INTO v_customer_id FROM public.accommodation_bookings WHERE id = p_booking_id;
  ELSIF p_resource_type = 'transport' THEN
    SELECT user_id INTO v_customer_id FROM public.transport_bookings WHERE id = p_booking_id;
  ELSE
    RAISE EXCEPTION 'Unknown resource_type: %', p_resource_type;
  END IF;

  IF v_customer_id IS NULL OR v_customer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not your booking';
  END IF;

  INSERT INTO public.booking_payments (resource_type, booking_id, amount, currency, method, reference_note, submitted_by)
  VALUES (p_resource_type, p_booking_id, p_amount, p_currency, p_method, p_reference_note, auth.uid())
  RETURNING id INTO v_payment_id;

  IF p_resource_type = 'guide' THEN
    UPDATE public.guide_bookings SET payment_status = 'pending_verification' WHERE id = p_booking_id;
  ELSIF p_resource_type = 'experience' THEN
    UPDATE public.experience_bookings SET payment_status = 'pending_verification' WHERE id = p_booking_id;
  ELSIF p_resource_type = 'accommodation' THEN
    UPDATE public.accommodation_bookings SET payment_status = 'pending_verification' WHERE id = p_booking_id;
  ELSIF p_resource_type = 'transport' THEN
    UPDATE public.transport_bookings SET payment_status = 'pending_verification' WHERE id = p_booking_id;
  END IF;

  RETURN v_payment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_booking_payment(
  p_payment_id uuid,
  p_approve boolean,
  p_rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.booking_payments%ROWTYPE;
  v_owner_id uuid;
  v_is_owner boolean;
  v_is_admin boolean;
  v_booking_status public.booking_status;
BEGIN
  SELECT * INTO v_payment FROM public.booking_payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  IF v_payment.resource_type = 'guide' THEN
    SELECT g.user_id INTO v_owner_id
    FROM public.guide_bookings gb JOIN public.guides g ON g.id = gb.guide_id
    WHERE gb.id = v_payment.booking_id;
  ELSIF v_payment.resource_type = 'experience' THEN
    SELECT c.managed_by INTO v_owner_id
    FROM public.experience_bookings eb
    JOIN public.experiences e ON e.id = eb.experience_id
    LEFT JOIN public.communities c ON c.id = e.community_id
    WHERE eb.id = v_payment.booking_id;
  ELSIF v_payment.resource_type = 'accommodation' THEN
    SELECT a.managed_by INTO v_owner_id
    FROM public.accommodation_bookings ab JOIN public.accommodations a ON a.id = ab.accommodation_id
    WHERE ab.id = v_payment.booking_id;
  ELSIF v_payment.resource_type = 'transport' THEN
    SELECT d.user_id INTO v_owner_id
    FROM public.transport_bookings tb LEFT JOIN public.transport_drivers d ON d.id = tb.driver_id
    WHERE tb.id = v_payment.booking_id;
  END IF;

  v_is_owner := (v_owner_id IS NOT NULL AND auth.uid() = v_owner_id);
  v_is_admin := public.has_role(auth.uid(), 'admin');

  IF NOT (v_is_owner OR v_is_admin) THEN
    RAISE EXCEPTION 'Not authorized to verify this payment';
  END IF;

  IF p_approve THEN
    UPDATE public.booking_payments SET status = 'verified', verified_by = auth.uid(), verified_at = now()
    WHERE id = p_payment_id;
  ELSE
    UPDATE public.booking_payments
    SET status = 'rejected', verified_by = auth.uid(), verified_at = now(), rejection_reason = p_rejection_reason
    WHERE id = p_payment_id;
  END IF;

  IF v_payment.resource_type = 'guide' THEN
    UPDATE public.guide_bookings SET payment_status = CASE WHEN p_approve THEN 'paid' ELSE 'unpaid' END
      WHERE id = v_payment.booking_id RETURNING status INTO v_booking_status;
  ELSIF v_payment.resource_type = 'experience' THEN
    UPDATE public.experience_bookings SET payment_status = CASE WHEN p_approve THEN 'paid' ELSE 'unpaid' END
      WHERE id = v_payment.booking_id RETURNING status INTO v_booking_status;
  ELSIF v_payment.resource_type = 'accommodation' THEN
    UPDATE public.accommodation_bookings SET payment_status = CASE WHEN p_approve THEN 'paid' ELSE 'unpaid' END
      WHERE id = v_payment.booking_id RETURNING status INTO v_booking_status;
  ELSIF v_payment.resource_type = 'transport' THEN
    UPDATE public.transport_bookings SET payment_status = CASE WHEN p_approve THEN 'paid' ELSE 'unpaid' END
      WHERE id = v_payment.booking_id RETURNING status INTO v_booking_status;
  END IF;

  -- Approving a payment on a still-pending booking auto-confirms it — the
  -- whole point of the manual-confirmation flow.
  IF p_approve AND v_booking_status = 'pending' THEN
    PERFORM public.transition_booking_status(v_payment.resource_type, v_payment.booking_id, 'confirmed', 'Payment verified');
  END IF;
END;
$$;
