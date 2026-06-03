
-- Guides table
CREATE TABLE public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  photo_url text,
  bio text,
  languages text[] DEFAULT '{}'::text[],
  specializations text[] DEFAULT '{}'::text[],
  certifications text[] DEFAULT '{}'::text[],
  certification_level text DEFAULT 'bronze',
  location text,
  county text,
  lat double precision,
  lng double precision,
  price_per_day integer,
  price_currency text DEFAULT 'USD',
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  years_experience integer DEFAULT 0,
  response_time_minutes integer DEFAULT 60,
  is_available boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  is_published boolean DEFAULT true,
  total_earnings integer DEFAULT 0,
  total_bookings integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Guide availability calendar
CREATE TABLE public.guide_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  notes text,
  UNIQUE(guide_id, date)
);

-- Guide bookings
CREATE TABLE public.guide_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  tourist_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  group_size integer DEFAULT 1,
  total_price integer,
  status text DEFAULT 'pending',
  message text,
  guide_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Guide reviews
CREATE TABLE public.guide_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  tourist_id uuid NOT NULL,
  booking_id uuid REFERENCES public.guide_bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL,
  title text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Guide skill modules (completable training)
CREATE TABLE public.guide_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_category text DEFAULT 'general',
  completed boolean DEFAULT false,
  score integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(guide_id, skill_name)
);

-- RLS
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_skills ENABLE ROW LEVEL SECURITY;

-- Guides: anyone can view published guides
CREATE POLICY "Anyone can view published guides" ON public.guides FOR SELECT USING (is_published = true);
CREATE POLICY "Guides can update own profile" ON public.guides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth users can register as guide" ON public.guides FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Availability: public read, guide write
CREATE POLICY "Anyone can view availability" ON public.guide_availability FOR SELECT USING (true);
CREATE POLICY "Guides can manage availability" ON public.guide_availability FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_availability.guide_id AND guides.user_id = auth.uid())
);
CREATE POLICY "Guides can update availability" ON public.guide_availability FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_availability.guide_id AND guides.user_id = auth.uid())
);
CREATE POLICY "Guides can delete availability" ON public.guide_availability FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_availability.guide_id AND guides.user_id = auth.uid())
);

-- Bookings: tourist creates, guide and tourist can view/update
CREATE POLICY "Tourists can create bookings" ON public.guide_bookings FOR INSERT WITH CHECK (auth.uid() = tourist_id);
CREATE POLICY "Tourists can view own bookings" ON public.guide_bookings FOR SELECT USING (auth.uid() = tourist_id);
CREATE POLICY "Guides can view their bookings" ON public.guide_bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_bookings.guide_id AND guides.user_id = auth.uid())
);
CREATE POLICY "Guides can update bookings" ON public.guide_bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_bookings.guide_id AND guides.user_id = auth.uid())
);
CREATE POLICY "Tourists can update own bookings" ON public.guide_bookings FOR UPDATE USING (auth.uid() = tourist_id);

-- Reviews: public read, tourist write
CREATE POLICY "Anyone can view reviews" ON public.guide_reviews FOR SELECT USING (true);
CREATE POLICY "Tourists can post reviews" ON public.guide_reviews FOR INSERT WITH CHECK (auth.uid() = tourist_id);

-- Skills: guide-scoped
CREATE POLICY "Guides can view own skills" ON public.guide_skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_skills.guide_id AND guides.user_id = auth.uid())
);
CREATE POLICY "Guides can manage skills" ON public.guide_skills FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_skills.guide_id AND guides.user_id = auth.uid())
);
CREATE POLICY "Guides can update skills" ON public.guide_skills FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_skills.guide_id AND guides.user_id = auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guide_bookings_updated_at BEFORE UPDATE ON public.guide_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
