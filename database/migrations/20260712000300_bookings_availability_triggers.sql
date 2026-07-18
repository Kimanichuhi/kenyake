-- Booking Engine Phase 1: real, transactional double-booking prevention.
--
-- Implemented as BEFORE INSERT OR UPDATE triggers, not solely inside a
-- create-booking RPC — booking *creation* deliberately stays a plain,
-- RLS-governed client-side INSERT (customers need to keep INSERT access on
-- their own bookings), so a check that only lived inside an RPC could be
-- routed around by any client with INSERT grant on the table. A trigger
-- fires regardless of call path and closes that gap completely.
--
-- Known Phase-1 simplification: guides/accommodations/transport are treated
-- as single exclusive resources for the given date range (no
-- room/vehicle-count-aware inventory tracking exists or is being built now)
-- — a 10-room accommodation will incorrectly block a 2nd booking on a date
-- where 8 rooms remain free. Experiences use a capacity check instead
-- (multiple bookings per day are expected and fine there).

-- =========================================================================
-- Guides: exclusive date-range per guide, PLUS enforcement of the existing
-- (previously display-only, never enforced) guide_availability table.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.check_guide_booking_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.guide_bookings
    WHERE guide_id = NEW.guide_id
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('pending', 'confirmed')
      AND daterange(start_date, end_date, '[]') && daterange(NEW.start_date, NEW.end_date, '[]')
  ) THEN
    RAISE EXCEPTION 'This guide is already booked or requested for an overlapping date range.' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.guide_availability
    WHERE guide_id = NEW.guide_id AND is_available = false
      AND date BETWEEN NEW.start_date AND NEW.end_date
  ) THEN
    RAISE EXCEPTION 'The guide has marked one or more of these dates as unavailable.' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_guide_booking_overlap
  BEFORE INSERT OR UPDATE OF start_date, end_date, guide_id, status ON public.guide_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_guide_booking_overlap();

-- =========================================================================
-- Accommodations: exclusive date-range per accommodation (see the Phase-1
-- simplification note above — not room-count-aware).
-- =========================================================================
CREATE OR REPLACE FUNCTION public.check_accommodation_booking_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.accommodation_bookings
    WHERE accommodation_id = NEW.accommodation_id
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('pending', 'confirmed')
      AND daterange(check_in, check_out, '[]') && daterange(NEW.check_in, NEW.check_out, '[]')
  ) THEN
    RAISE EXCEPTION 'This accommodation is already booked or requested for overlapping dates.' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_accommodation_booking_overlap
  BEFORE INSERT OR UPDATE OF check_in, check_out, accommodation_id, status ON public.accommodation_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_accommodation_booking_overlap();

-- =========================================================================
-- Transport: exclusive date-range per vehicle (only when a specific vehicle
-- is attached to the booking — vehicle_id is nullable).
-- =========================================================================
CREATE OR REPLACE FUNCTION public.check_transport_booking_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.vehicle_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.transport_bookings
      WHERE vehicle_id = NEW.vehicle_id
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status IN ('pending', 'confirmed')
        AND daterange(pickup_date, COALESCE(return_date, pickup_date), '[]')
            && daterange(NEW.pickup_date, COALESCE(NEW.return_date, NEW.pickup_date), '[]')
    ) THEN
      RAISE EXCEPTION 'This vehicle is already booked or requested for overlapping dates.' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_transport_booking_overlap
  BEFORE INSERT OR UPDATE OF pickup_date, return_date, vehicle_id, status ON public.transport_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_transport_booking_overlap();

-- =========================================================================
-- Experiences: capacity check, not exclusivity — multiple bookings per day
-- are expected and fine, but total guests for a given date cannot exceed
-- max_guests.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.check_experience_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_max integer;
  v_booked integer;
BEGIN
  SELECT max_guests INTO v_max FROM public.experiences WHERE id = NEW.experience_id;

  SELECT COALESCE(SUM(guest_count), 0) INTO v_booked
  FROM public.experience_bookings
  WHERE experience_id = NEW.experience_id
    AND booking_date = NEW.booking_date
    AND status IN ('pending', 'confirmed')
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF v_max IS NOT NULL AND v_booked + NEW.guest_count > v_max THEN
    RAISE EXCEPTION 'This experience is fully booked for the selected date (% of % spots remaining).',
      GREATEST(v_max - v_booked, 0), v_max USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_experience_capacity
  BEFORE INSERT OR UPDATE OF booking_date, experience_id, guest_count, status ON public.experience_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_experience_capacity();
