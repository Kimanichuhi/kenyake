-- Partner Onboarding & Verification Portal: core schema.
-- Additive only — no changes to any existing table. Businesses self-register
-- into this new, generic table set and go through a real verification
-- pipeline before becoming publicly visible.

CREATE TYPE public.business_status AS ENUM (
  'draft', 'submitted', 'pending_review', 'documents_requested',
  'under_review', 'approved', 'rejected', 'suspended', 'archived'
);

-- =========================================================================
-- Business category taxonomy (admin-editable lookup, not an enum/CHECK —
-- ~30 categories will need renaming/reordering/adding over time)
-- =========================================================================
CREATE TABLE public.business_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.business_categories (code, label, sort_order) VALUES
  ('hotel', 'Hotel', 10),
  ('lodge', 'Lodge', 20),
  ('resort', 'Resort', 30),
  ('camp', 'Camp', 40),
  ('homestay', 'Homestay', 50),
  ('vacation_rental', 'Vacation Rental', 60),
  ('airbnb_host', 'Airbnb Host', 70),
  ('restaurant', 'Restaurant', 80),
  ('cafe', 'Café', 90),
  ('tour_operator', 'Tour Operator', 100),
  ('safari_company', 'Safari Company', 110),
  ('tour_guide', 'Tour Guide', 120),
  ('driver_guide', 'Driver Guide', 130),
  ('community_tourism_org', 'Community Tourism Organization', 140),
  ('conservancy', 'Conservancy', 150),
  ('transport_company', 'Transport Company', 160),
  ('car_hire_company', 'Car Hire Company', 170),
  ('taxi_operator', 'Taxi Operator', 180),
  ('boat_operator', 'Boat Operator', 190),
  ('ferry_service', 'Ferry Service', 200),
  ('air_charter_company', 'Air Charter Company', 210),
  ('bicycle_rental', 'Bicycle Rental', 220),
  ('motorcycle_rental', 'Motorcycle Rental', 230),
  ('museum', 'Museum', 240),
  ('cultural_center', 'Cultural Center', 250),
  ('event_organizer', 'Event Organizer', 260),
  ('adventure_company', 'Adventure Company', 270),
  ('travel_agency', 'Travel Agency', 280),
  ('craft_seller', 'Craft Seller', 290),
  ('souvenir_shop', 'Souvenir Shop', 300),
  ('wellness_spa', 'Wellness & Spa Provider', 310);

ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view business categories" ON public.business_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage business categories" ON public.business_categories
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- businesses: owner-writable core profile. NO status/risk column lives
-- here — that structural separation is what keeps an owner from ever being
-- able to self-approve (see business_verification below).
-- =========================================================================
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type_id uuid REFERENCES public.business_categories(id),

  name text NOT NULL,
  slug text UNIQUE,
  description text,
  registration_number text,
  kra_pin text,
  year_established integer,
  website_url text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  whatsapp_number text,

  county text,
  sub_county text,
  ward text,
  address_line text,
  postal_code text,
  lat double precision,
  lng double precision,
  nearby_landmark text,

  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_branch text,
  mpesa_till_number text,
  mpesa_paybill_number text,

  logo_url text,
  cover_image_url text,
  gallery_images text[] NOT NULL DEFAULT '{}',
  video_url text,

  terms_accepted_at timestamptz,
  terms_version text,
  data_consent_accepted_at timestamptz,

  submitted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_businesses_business_type_id ON public.businesses(business_type_id);
CREATE INDEX idx_businesses_county ON public.businesses(county);

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- business_verification: 1:1, admin-only-writable verification state.
-- =========================================================================
CREATE TABLE public.business_verification (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  status public.business_status NOT NULL DEFAULT 'draft',
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'unrated' CHECK (risk_level IN ('unrated', 'low', 'medium', 'high')),
  confidence_percentage numeric NOT NULL DEFAULT 0 CHECK (confidence_percentage BETWEEN 0 AND 100),
  assigned_reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  internal_notes text,
  last_reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_reviewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_verification_status ON public.business_verification(status);
CREATE INDEX idx_business_verification_risk_level ON public.business_verification(risk_level);

-- =========================================================================
-- business_verification_checklist: 1:1, admin-only-writable, fixed columns
-- (the risk-scoring criteria are fixed and known up front, not admin
-- configurable, so a flexible key/value table buys nothing here).
-- =========================================================================
CREATE TABLE public.business_verification_checklist (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  email_verified boolean NOT NULL DEFAULT false,
  email_verified_note text,
  phone_verified boolean NOT NULL DEFAULT false,
  phone_verified_note text,
  government_registration_verified boolean NOT NULL DEFAULT false,
  government_registration_note text,
  tourism_license_verified boolean NOT NULL DEFAULT false,
  tourism_license_note text,
  insurance_verified boolean NOT NULL DEFAULT false,
  insurance_note text,
  address_verified boolean NOT NULL DEFAULT false,
  address_note text,
  inspection_passed boolean NOT NULL DEFAULT false,
  inspection_note text,
  trusted_referral boolean NOT NULL DEFAULT false,
  trusted_referral_note text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create verification + checklist rows the instant a business is
-- created, via a SECURITY DEFINER trigger — the owner never needs (and
-- never gets) INSERT rights on either table.
CREATE OR REPLACE FUNCTION public.create_business_verification_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.business_verification (business_id) VALUES (NEW.id);
  INSERT INTO public.business_verification_checklist (business_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_business_created AFTER INSERT ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.create_business_verification_row();

-- =========================================================================
-- business_contacts: owner-writable while editable. Real table (not jsonb)
-- so a partial unique index can enforce exactly one primary contact.
-- =========================================================================
CREATE TABLE public.business_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'secondary', 'emergency')),
  designation text,
  email text,
  phone text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_contacts_business_id ON public.business_contacts(business_id);
CREATE UNIQUE INDEX uq_business_contacts_primary ON public.business_contacts(business_id) WHERE is_primary;

CREATE TRIGGER update_business_contacts_updated_at BEFORE UPDATE ON public.business_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- business_documents: owner can insert/view/delete-while-unverified;
-- is_verified/verified_by/rejection_reason are admin-only (no owner
-- UPDATE policy at all).
-- =========================================================================
CREATE TABLE public.business_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN (
    'national_id', 'passport', 'business_registration_certificate', 'kra_pin_certificate',
    'tourism_license', 'insurance_certificate', 'tax_compliance_certificate', 'other'
  )),
  storage_bucket text NOT NULL DEFAULT 'business-documents',
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer,
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  rejection_reason text,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_documents_business_id ON public.business_documents(business_id);

-- =========================================================================
-- business_status_history: full audit trail. No client INSERT policy for
-- anyone — written exclusively inside transition_business_status()/
-- submit_business_application() below.
-- =========================================================================
CREATE TABLE public.business_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  from_status public.business_status,
  to_status public.business_status NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_status_history_business_id ON public.business_status_history(business_id, created_at DESC);

-- =========================================================================
-- business_inspections: admin-only end to end in this phase.
-- =========================================================================
CREATE TABLE public.business_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  inspector_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  gps_lat double precision,
  gps_lng double precision,
  gps_captured_at timestamptz,
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcome text CHECK (outcome IN ('pass', 'fail', 'conditional')),
  recommendation text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_inspections_business_id ON public.business_inspections(business_id);

CREATE TRIGGER update_business_inspections_updated_at BEFORE UPDATE ON public.business_inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- business_notifications: stub only, no delivery UI in this phase.
-- Written only inside transition_business_status().
-- =========================================================================
CREATE TABLE public.business_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_notifications_user_id ON public.business_notifications(user_id, is_read, created_at DESC);

-- =========================================================================
-- Risk scoring: rule-based point formula, trigger-invoked so the admin
-- queue can filter/sort by risk_level cheaply and consistently without any
-- call site needing to remember to recompute it.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.calculate_business_risk_score(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c record;
  v_score integer := 0;
BEGIN
  SELECT * INTO c FROM public.business_verification_checklist WHERE business_id = p_business_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF c.email_verified THEN v_score := v_score + 5; END IF;
  IF c.phone_verified THEN v_score := v_score + 5; END IF;
  IF c.government_registration_verified THEN v_score := v_score + 20; END IF;
  IF c.tourism_license_verified THEN v_score := v_score + 25; END IF;
  IF c.insurance_verified THEN v_score := v_score + 15; END IF;
  IF c.address_verified THEN v_score := v_score + 10; END IF;
  IF c.inspection_passed THEN v_score := v_score + 30; END IF;
  IF c.trusted_referral THEN v_score := v_score + 10; END IF;

  UPDATE public.business_verification
  SET risk_score = v_score,
      risk_level = CASE
        WHEN v_score >= 80 THEN 'low'
        WHEN v_score >= 45 THEN 'medium'
        ELSE 'high'
      END,
      confidence_percentage = LEAST(100, ROUND((v_score::numeric / 120) * 100)),
      updated_at = now()
  WHERE business_id = p_business_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_business_risk_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.calculate_business_risk_score(NEW.business_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER recalc_risk_on_checklist_change
  AFTER UPDATE ON public.business_verification_checklist
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_business_risk_score();

-- Completing an inspection with outcome='pass' auto-flips the checklist,
-- which cascades into the recalc trigger above for free.
CREATE OR REPLACE FUNCTION public.trg_sync_inspection_outcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.outcome IS DISTINCT FROM OLD.outcome AND NEW.outcome IS NOT NULL THEN
    UPDATE public.business_verification_checklist
    SET inspection_passed = (NEW.outcome = 'pass'),
        inspection_note = NEW.recommendation,
        updated_at = now()
    WHERE business_id = NEW.business_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_inspection_outcome AFTER UPDATE ON public.business_inspections
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_inspection_outcome();

-- =========================================================================
-- Status transition & submission RPCs (SECURITY DEFINER, mirroring the
-- has_role/log_audit_event pattern already used in this codebase).
-- =========================================================================
-- Generates a unique, URL-safe slug from a business name (lowercase,
-- non-alphanumerics collapsed to hyphens, deduped with a numeric suffix on
-- collision). Used only on first approval — see transition_business_status.
CREATE OR REPLACE FUNCTION public.generate_business_slug(p_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base text;
  v_candidate text;
  v_suffix integer := 0;
BEGIN
  v_base := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_base := trim(both '-' from v_base);
  IF v_base = '' THEN
    v_base := 'business';
  END IF;

  v_candidate := v_base;
  WHILE EXISTS (SELECT 1 FROM public.businesses WHERE slug = v_candidate) LOOP
    v_suffix := v_suffix + 1;
    v_candidate := v_base || '-' || v_suffix;
  END LOOP;

  RETURN v_candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_business_status(
  p_business_id uuid,
  p_new_status public.business_status,
  p_reason text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old public.business_status;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins may change verification status';
  END IF;

  SELECT status INTO v_old FROM public.business_verification WHERE business_id = p_business_id FOR UPDATE;

  UPDATE public.business_verification
  SET status = p_new_status, last_reviewed_by = auth.uid(), last_reviewed_at = now(), updated_at = now()
  WHERE business_id = p_business_id;

  -- First approval: assign a slug and publish timestamp if not already set.
  IF p_new_status = 'approved' THEN
    UPDATE public.businesses
    SET slug = COALESCE(slug, public.generate_business_slug(name)),
        published_at = COALESCE(published_at, now())
    WHERE id = p_business_id;
  END IF;

  INSERT INTO public.business_status_history (business_id, from_status, to_status, changed_by, reason, notes)
  VALUES (p_business_id, v_old, p_new_status, auth.uid(), p_reason, p_notes);

  INSERT INTO public.business_notifications (business_id, user_id, type, title, body)
  SELECT p_business_id, b.user_id, 'status_changed',
         'Your application status changed to ' || p_new_status, p_reason
  FROM public.businesses b WHERE b.id = p_business_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_business_application(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old public.business_status;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.businesses WHERE id = p_business_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not your business';
  END IF;

  SELECT status INTO v_old FROM public.business_verification WHERE business_id = p_business_id;
  IF v_old NOT IN ('draft', 'documents_requested') THEN
    RAISE EXCEPTION 'Application cannot be submitted from status %', v_old;
  END IF;

  UPDATE public.business_verification SET status = 'pending_review', updated_at = now() WHERE business_id = p_business_id;
  UPDATE public.businesses SET submitted_at = now() WHERE id = p_business_id;

  INSERT INTO public.business_status_history (business_id, from_status, to_status, changed_by, reason)
  VALUES (p_business_id, v_old, 'pending_review', auth.uid(), 'Submitted by owner');
END;
$$;
