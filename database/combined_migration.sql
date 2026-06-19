-- ============================================================
-- SafariSync / Kenyake — Combined Database Migration
-- Generated 2026-06-19
-- Paste the entire contents of this file into:
-- Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ============================================================
-- MIGRATION 1: Core user profiles, saved destinations, trip history
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  nationality TEXT,
  traveler_type TEXT DEFAULT 'tourist' CHECK (traveler_type IN ('tourist', 'diaspora', 'nomad', 'corporate')),
  travel_styles TEXT[] DEFAULT '{}',
  budget_range TEXT,
  accessibility_needs TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  first_visit BOOLEAN DEFAULT true,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.saved_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, destination_id)
);

ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view saved destinations" ON public.saved_destinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save destinations" ON public.saved_destinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave destinations" ON public.saved_destinations FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.trip_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their trips" ON public.trip_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add trips" ON public.trip_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update trips" ON public.trip_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete trips" ON public.trip_history FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 2: Wildlife sightings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.wildlife_sightings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  species text NOT NULL,
  species_category text NOT NULL DEFAULT 'other',
  location_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  park_name text,
  description text,
  animal_count integer DEFAULT 1,
  behavior text,
  photo_url text,
  verified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wildlife_sightings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sightings" ON public.wildlife_sightings FOR SELECT USING (true);
CREATE POLICY "Auth users can post sightings" ON public.wildlife_sightings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sightings" ON public.wildlife_sightings FOR DELETE TO authenticated USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.wildlife_sightings;

-- ============================================================
-- MIGRATION 3: Communities, community_content, community_gallery
-- ============================================================

CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  county text NOT NULL,
  region text,
  hero_image text,
  description text,
  origin_story text,
  history text,
  population integer,
  established_year text,
  specialty text,
  traditional_dress text,
  adornment_explanation text,
  leader_name text,
  leader_title text,
  contact_email text,
  contact_phone text,
  max_daily_visitors integer DEFAULT 20,
  current_visitor_count integer DEFAULT 0,
  visitor_guidelines text,
  ecological_knowledge text,
  lat double precision,
  lng double precision,
  is_published boolean DEFAULT false,
  managed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published communities" ON public.communities FOR SELECT USING (is_published = true);
CREATE POLICY "Managers can update their community" ON public.communities FOR UPDATE USING (auth.uid() = managed_by);

CREATE TABLE IF NOT EXISTS public.community_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL,
  title text NOT NULL,
  body text,
  media_url text,
  media_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view community content" ON public.community_content FOR SELECT USING (true);
CREATE POLICY "Managers can insert content" ON public.community_content FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));
CREATE POLICY "Managers can update content" ON public.community_content FOR UPDATE USING (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));
CREATE POLICY "Managers can delete content" ON public.community_content FOR DELETE USING (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));

CREATE TABLE IF NOT EXISTS public.community_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved gallery" ON public.community_gallery FOR SELECT USING (is_approved = true);
CREATE POLICY "Auth users can upload to gallery" ON public.community_gallery FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Managers can update gallery items" ON public.community_gallery FOR UPDATE USING (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));
CREATE POLICY "Managers can delete gallery items" ON public.community_gallery FOR DELETE USING (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));

CREATE TABLE IF NOT EXISTS public.community_review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  reviewer_name text NOT NULL,
  review_text text NOT NULL,
  review_rating integer,
  review_date timestamptz,
  response_text text,
  responded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_review_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view review responses" ON public.community_review_responses FOR SELECT USING (true);
CREATE POLICY "Managers can respond to reviews" ON public.community_review_responses FOR UPDATE USING (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));
CREATE POLICY "Managers can insert reviews" ON public.community_review_responses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));

INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Anyone can view community media" ON storage.objects FOR SELECT USING (bucket_id = 'community-media');
CREATE POLICY "Auth users can upload community media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-media' AND auth.role() = 'authenticated');

-- ============================================================
-- MIGRATION 4: Community events, event invitations, event photos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  event_type text NOT NULL DEFAULT 'festival',
  description text,
  start_date date NOT NULL,
  end_date date,
  start_time text,
  end_time text,
  recurrence text,
  recurrence_detail text,
  location_name text,
  county text,
  lat double precision,
  lng double precision,
  max_attendees integer DEFAULT 50,
  current_attendees integer DEFAULT 0,
  invitation_required boolean DEFAULT true,
  price text,
  what_to_bring text,
  what_to_wear text,
  etiquette_notes text,
  preparation_guide text,
  cover_image text,
  is_published boolean DEFAULT true,
  is_past boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published events" ON public.community_events FOR SELECT USING (is_published = true);
CREATE POLICY "Community managers can insert events" ON public.community_events FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));
CREATE POLICY "Community managers can update events" ON public.community_events FOR UPDATE USING (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));
CREATE POLICY "Community managers can delete events" ON public.community_events FOR DELETE USING (EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid()));

CREATE TABLE IF NOT EXISTS public.event_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  message text,
  group_size integer DEFAULT 1,
  response_message text,
  responded_at timestamptz,
  notify_recurring boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invitations" ON public.event_invitations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request invitations" ON public.event_invitations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invitations" ON public.event_invitations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Community managers can view event invitations" ON public.event_invitations FOR SELECT USING (EXISTS (SELECT 1 FROM public.community_events ce JOIN public.communities c ON c.id = ce.community_id WHERE ce.id = event_id AND c.managed_by = auth.uid()));
CREATE POLICY "Community managers can update invitations" ON public.event_invitations FOR UPDATE USING (EXISTS (SELECT 1 FROM public.community_events ce JOIN public.communities c ON c.id = ce.community_id WHERE ce.id = event_id AND c.managed_by = auth.uid()));

CREATE TABLE IF NOT EXISTS public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  caption text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved event photos" ON public.event_photos FOR SELECT USING (is_approved = true);
CREATE POLICY "Auth users can upload event photos" ON public.event_photos FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Community managers can manage event photos" ON public.event_photos FOR UPDATE USING (EXISTS (SELECT 1 FROM public.community_events ce JOIN public.communities c ON c.id = ce.community_id WHERE ce.id = event_id AND c.managed_by = auth.uid()));
CREATE POLICY "Community managers can delete event photos" ON public.event_photos FOR DELETE USING (EXISTS (SELECT 1 FROM public.community_events ce JOIN public.communities c ON c.id = ce.community_id WHERE ce.id = event_id AND c.managed_by = auth.uid()));

-- ============================================================
-- MIGRATION 5: Education modules, lessons, progress, certifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.education_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'general',
  icon text,
  cover_image text,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  difficulty text DEFAULT 'beginner',
  estimated_minutes integer DEFAULT 10,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.education_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.education_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  media_type text,
  media_url text,
  quiz_questions jsonb DEFAULT '[]'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_education_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.education_modules(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.education_lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  quiz_score integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  certification_type text NOT NULL,
  title text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  modules_completed uuid[] DEFAULT '{}'::uuid[],
  UNIQUE(user_id, certification_type)
);

ALTER TABLE public.education_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published modules" ON public.education_modules FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view lessons" ON public.education_lessons FOR SELECT USING (true);
CREATE POLICY "Users can view own progress" ON public.user_education_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_education_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_education_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own certs" ON public.user_certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view certs" ON public.user_certifications FOR SELECT USING (true);
CREATE POLICY "Users can earn certs" ON public.user_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 6: Guides
-- ============================================================

CREATE TABLE IF NOT EXISTS public.guides (
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

CREATE TABLE IF NOT EXISTS public.guide_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  notes text,
  UNIQUE(guide_id, date)
);

CREATE TABLE IF NOT EXISTS public.guide_bookings (
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

CREATE TABLE IF NOT EXISTS public.guide_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  tourist_id uuid NOT NULL,
  booking_id uuid REFERENCES public.guide_bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL,
  title text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guide_skills (
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

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published guides" ON public.guides FOR SELECT USING (is_published = true);
CREATE POLICY "Guides can update own profile" ON public.guides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth users can register as guide" ON public.guides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view availability" ON public.guide_availability FOR SELECT USING (true);
CREATE POLICY "Guides can manage availability" ON public.guide_availability FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_availability.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Guides can update availability" ON public.guide_availability FOR UPDATE USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_availability.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Guides can delete availability" ON public.guide_availability FOR DELETE USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_availability.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Tourists can create bookings" ON public.guide_bookings FOR INSERT WITH CHECK (auth.uid() = tourist_id);
CREATE POLICY "Tourists can view own bookings" ON public.guide_bookings FOR SELECT USING (auth.uid() = tourist_id);
CREATE POLICY "Guides can view their bookings" ON public.guide_bookings FOR SELECT USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_bookings.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Guides can update bookings" ON public.guide_bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_bookings.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Tourists can update own bookings" ON public.guide_bookings FOR UPDATE USING (auth.uid() = tourist_id);
CREATE POLICY "Anyone can view reviews" ON public.guide_reviews FOR SELECT USING (true);
CREATE POLICY "Tourists can post reviews" ON public.guide_reviews FOR INSERT WITH CHECK (auth.uid() = tourist_id);
CREATE POLICY "Guides can view own skills" ON public.guide_skills FOR SELECT USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_skills.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Guides can manage skills" ON public.guide_skills FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_skills.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Guides can update skills" ON public.guide_skills FOR UPDATE USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = guide_skills.guide_id AND guides.user_id = auth.uid()));

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guide_bookings_updated_at BEFORE UPDATE ON public.guide_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- MIGRATION 7: Group trips and guide messages
-- ============================================================

CREATE TABLE IF NOT EXISTS public.group_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  group_size integer DEFAULT 1,
  status text DEFAULT 'planning',
  total_price integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_trip_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  role text DEFAULT 'guide',
  status text DEFAULT 'pending',
  price_agreed integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trip_id, guide_id)
);

CREATE TABLE IF NOT EXISTS public.guide_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.group_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trip_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tourists can manage own trips" ON public.group_trips FOR ALL USING (auth.uid() = tourist_id);
CREATE POLICY "Guides can view assigned trips" ON public.group_trips FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_trip_guides gtg JOIN public.guides g ON g.id = gtg.guide_id WHERE gtg.trip_id = group_trips.id AND g.user_id = auth.uid()));
CREATE POLICY "Trip owners can manage guides" ON public.group_trip_guides FOR ALL USING (EXISTS (SELECT 1 FROM public.group_trips WHERE group_trips.id = group_trip_guides.trip_id AND group_trips.tourist_id = auth.uid()));
CREATE POLICY "Guides can view own assignments" ON public.group_trip_guides FOR SELECT USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = group_trip_guides.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Guides can update own assignment" ON public.group_trip_guides FOR UPDATE USING (EXISTS (SELECT 1 FROM public.guides WHERE guides.id = group_trip_guides.guide_id AND guides.user_id = auth.uid()));
CREATE POLICY "Trip participants can view messages" ON public.guide_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_trips WHERE group_trips.id = guide_messages.trip_id AND group_trips.tourist_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.group_trip_guides gtg JOIN public.guides g ON g.id = gtg.guide_id WHERE gtg.trip_id = guide_messages.trip_id AND g.user_id = auth.uid()));
CREATE POLICY "Trip participants can send messages" ON public.guide_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND (EXISTS (SELECT 1 FROM public.group_trips WHERE group_trips.id = guide_messages.trip_id AND group_trips.tourist_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.group_trip_guides gtg JOIN public.guides g ON g.id = gtg.guide_id WHERE gtg.trip_id = guide_messages.trip_id AND g.user_id = auth.uid())));

ALTER PUBLICATION supabase_realtime ADD TABLE public.guide_messages;
CREATE TRIGGER update_group_trips_updated_at BEFORE UPDATE ON public.group_trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- MIGRATION 8: Experiences, experience_bookings, experience_reviews
-- ============================================================

CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'cultural',
  subcategory text,
  description text,
  short_description text,
  host_name text NOT NULL,
  host_bio text,
  host_photo text,
  community_id uuid REFERENCES public.communities(id),
  location_name text,
  county text,
  lat double precision,
  lng double precision,
  duration_minutes integer DEFAULT 120,
  price_amount integer NOT NULL DEFAULT 0,
  price_currency text DEFAULT 'USD',
  price_display text,
  max_guests integer DEFAULT 10,
  min_guests integer DEFAULT 1,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  cover_image text,
  gallery_images text[] DEFAULT '{}',
  what_to_bring text,
  what_to_wear text,
  skill_level text DEFAULT 'beginner',
  languages text[] DEFAULT '{English}',
  includes text[] DEFAULT '{}',
  accessibility_notes text,
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  available_days text[] DEFAULT '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}',
  start_times text[] DEFAULT '{09:00,14:00}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published experiences" ON public.experiences FOR SELECT USING (is_published = true);
CREATE POLICY "Community managers can insert experiences" ON public.experiences FOR INSERT WITH CHECK (community_id IS NULL OR EXISTS (SELECT 1 FROM communities WHERE communities.id = experiences.community_id AND communities.managed_by = auth.uid()));
CREATE POLICY "Community managers can update experiences" ON public.experiences FOR UPDATE USING (community_id IS NULL OR EXISTS (SELECT 1 FROM communities WHERE communities.id = experiences.community_id AND communities.managed_by = auth.uid()));

CREATE TABLE IF NOT EXISTS public.experience_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  booking_date date NOT NULL,
  start_time text,
  guest_count integer DEFAULT 1,
  total_price integer,
  status text DEFAULT 'pending',
  special_requests text,
  contact_phone text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.experience_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.experience_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.experience_bookings FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.experience_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  booking_id uuid REFERENCES public.experience_bookings(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.experience_reviews FOR SELECT USING (true);
CREATE POLICY "Users can post reviews" ON public.experience_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_bookings_updated_at BEFORE UPDATE ON public.experience_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION 9: Accommodations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  property_type text NOT NULL DEFAULT 'guesthouse',
  tier text NOT NULL DEFAULT 'mid-range',
  description text,
  short_description text,
  community_id uuid REFERENCES public.communities(id),
  is_community_owned boolean DEFAULT false,
  owner_name text,
  location_name text,
  county text,
  lat double precision,
  lng double precision,
  price_per_night integer NOT NULL DEFAULT 0,
  price_currency text DEFAULT 'USD',
  price_display text,
  max_guests integer DEFAULT 4,
  rooms_available integer DEFAULT 1,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  cover_image text,
  gallery_images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  accessibility_features text[] DEFAULT '{}',
  wifi_speed_mbps integer,
  has_hot_water boolean DEFAULT false,
  has_generator boolean DEFAULT false,
  has_solar boolean DEFAULT false,
  impact_score integer DEFAULT 0,
  local_employment_count integer DEFAULT 0,
  local_procurement_percent integer DEFAULT 0,
  nearby_activities text[] DEFAULT '{}',
  group_capacity integer DEFAULT 4,
  check_in_time text DEFAULT '14:00',
  check_out_time text DEFAULT '10:00',
  cancellation_policy text DEFAULT 'Free cancellation up to 48 hours before check-in',
  contact_phone text,
  contact_email text,
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published accommodations" ON public.accommodations FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.accommodation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id uuid NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guest_count integer DEFAULT 1,
  rooms integer DEFAULT 1,
  total_price integer,
  status text DEFAULT 'pending',
  special_requests text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodation_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own accommodation bookings" ON public.accommodation_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create accommodation bookings" ON public.accommodation_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accommodation bookings" ON public.accommodation_bookings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON public.accommodations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accommodation_bookings_updated_at BEFORE UPDATE ON public.accommodation_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION 10: Marketplace
-- ============================================================

CREATE TABLE IF NOT EXISTS public.marketplace_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid REFERENCES public.communities(id),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  seller_type text NOT NULL DEFAULT 'individual',
  bio text,
  story text,
  photo_url text,
  location text,
  county text,
  is_cooperative boolean DEFAULT false,
  cooperative_members integer,
  is_verified boolean DEFAULT false,
  is_published boolean DEFAULT true,
  accepts_mpesa boolean DEFAULT true,
  mpesa_phone text,
  accepts_card boolean DEFAULT false,
  ships_internationally boolean DEFAULT false,
  shipping_notes text,
  accepts_commissions boolean DEFAULT false,
  commission_lead_days integer DEFAULT 14,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published sellers" ON public.marketplace_sellers FOR SELECT USING (is_published = true);
CREATE POLICY "Users can register as seller" ON public.marketplace_sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update own profile" ON public.marketplace_sellers FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.marketplace_sellers(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'crafts',
  subcategory text,
  description text,
  made_by_story text,
  materials text,
  dimensions text,
  weight_grams integer,
  price_amount integer NOT NULL DEFAULT 0,
  price_currency text DEFAULT 'KES',
  price_display text,
  price_usd integer,
  images text[] DEFAULT '{}',
  cover_image text,
  in_stock boolean DEFAULT true,
  stock_count integer,
  is_preorder boolean DEFAULT false,
  preorder_lead_days integer,
  is_custom_commission boolean DEFAULT false,
  commission_starting_price integer,
  is_authentic_verified boolean DEFAULT false,
  authenticity_notes text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  order_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published products" ON public.marketplace_products FOR SELECT USING (is_published = true);
CREATE POLICY "Sellers can insert products" ON public.marketplace_products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_products.seller_id AND marketplace_sellers.user_id = auth.uid()));
CREATE POLICY "Sellers can update own products" ON public.marketplace_products FOR UPDATE USING (EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_products.seller_id AND marketplace_sellers.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id),
  seller_id uuid NOT NULL REFERENCES public.marketplace_sellers(id),
  buyer_id uuid NOT NULL,
  quantity integer DEFAULT 1,
  total_price integer NOT NULL,
  price_currency text DEFAULT 'KES',
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'mpesa',
  shipping_address text,
  shipping_country text DEFAULT 'Kenya',
  is_international boolean DEFAULT false,
  buyer_notes text,
  seller_notes text,
  is_custom_order boolean DEFAULT false,
  custom_description text,
  tracking_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can view own orders" ON public.marketplace_orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can create orders" ON public.marketplace_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own orders" ON public.marketplace_orders FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view their orders" ON public.marketplace_orders FOR SELECT USING (EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_orders.seller_id AND marketplace_sellers.user_id = auth.uid()));
CREATE POLICY "Sellers can update their orders" ON public.marketplace_orders FOR UPDATE USING (EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_orders.seller_id AND marketplace_sellers.user_id = auth.uid()));

CREATE TRIGGER update_marketplace_sellers_updated_at BEFORE UPDATE ON public.marketplace_sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON public.marketplace_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON public.marketplace_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION 11: Transport
-- ============================================================

CREATE TABLE IF NOT EXISTS public.transport_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  photo_url text,
  phone text,
  bio text,
  languages text[] DEFAULT '{English,Swahili}',
  license_class text DEFAULT 'BCE',
  years_experience integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_available boolean DEFAULT true,
  is_published boolean DEFAULT true,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  total_trips integer DEFAULT 0,
  location text,
  county text,
  specializations text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published drivers" ON public.transport_drivers FOR SELECT USING (is_published = true);
CREATE POLICY "Users can register as driver" ON public.transport_drivers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Drivers can update own profile" ON public.transport_drivers FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.transport_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.transport_drivers(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL DEFAULT 'safari-van',
  name text NOT NULL,
  make text,
  model text,
  year integer,
  plate_number text,
  capacity integer DEFAULT 6,
  features text[] DEFAULT '{}',
  photo_url text,
  price_per_day integer NOT NULL DEFAULT 0,
  price_per_km integer,
  price_currency text DEFAULT 'USD',
  price_display text,
  is_available boolean DEFAULT true,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published vehicles" ON public.transport_vehicles FOR SELECT USING (is_published = true);
CREATE POLICY "Drivers can manage vehicles" ON public.transport_vehicles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_vehicles.driver_id AND transport_drivers.user_id = auth.uid()));
CREATE POLICY "Drivers can update vehicles" ON public.transport_vehicles FOR UPDATE USING (EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_vehicles.driver_id AND transport_drivers.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.transport_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  driver_id uuid REFERENCES public.transport_drivers(id),
  vehicle_id uuid REFERENCES public.transport_vehicles(id),
  booking_type text NOT NULL DEFAULT 'vehicle-hire',
  pickup_location text NOT NULL,
  dropoff_location text,
  pickup_date date NOT NULL,
  pickup_time text,
  return_date date,
  passenger_count integer DEFAULT 1,
  total_price integer,
  price_currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  special_requests text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transport bookings" ON public.transport_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create transport bookings" ON public.transport_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transport bookings" ON public.transport_bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Drivers can view their bookings" ON public.transport_bookings FOR SELECT USING (EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_bookings.driver_id AND transport_drivers.user_id = auth.uid()));
CREATE POLICY "Drivers can update their bookings" ON public.transport_bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_bookings.driver_id AND transport_drivers.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.transport_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_type text NOT NULL DEFAULT 'matatu',
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  origin text NOT NULL,
  destination text NOT NULL,
  stops text[] DEFAULT '{}',
  distance_km numeric,
  duration_minutes integer,
  difficulty text,
  price_display text,
  frequency text,
  operating_hours text,
  vehicle_type text,
  trail_map_url text,
  elevation_gain_m integer,
  highlights text[] DEFAULT '{}',
  warnings text[] DEFAULT '{}',
  fuel_stations text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published routes" ON public.transport_routes FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.road_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  route_name text NOT NULL,
  segment text,
  condition text NOT NULL DEFAULT 'good',
  description text,
  lat double precision,
  lng double precision,
  photo_url text,
  reported_at timestamptz NOT NULL DEFAULT now(),
  is_current boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.road_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view current conditions" ON public.road_conditions FOR SELECT USING (is_current = true);
CREATE POLICY "Auth users can report conditions" ON public.road_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.park_gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  park_name text NOT NULL,
  gate_name text NOT NULL,
  lat double precision,
  lng double precision,
  opening_time text DEFAULT '06:00',
  closing_time text DEFAULT '18:00',
  entry_fee_resident text,
  entry_fee_nonresident text,
  entry_fee_vehicle text,
  requirements text[] DEFAULT '{}',
  notes text,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.park_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published gates" ON public.park_gates FOR SELECT USING (is_published = true);

CREATE TRIGGER update_transport_drivers_updated_at BEFORE UPDATE ON public.transport_drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_bookings_updated_at BEFORE UPDATE ON public.transport_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MIGRATION 12: Food listings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.food_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  listing_type TEXT NOT NULL DEFAULT 'restaurant',
  cuisine TEXT[] DEFAULT '{}'::text[],
  dietary_options TEXT[] DEFAULT '{}'::text[],
  county TEXT,
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  community_id UUID REFERENCES public.communities(id),
  description TEXT,
  short_description TEXT,
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}'::text[],
  price_range TEXT DEFAULT '$$',
  specialties TEXT[] DEFAULT '{}'::text[],
  traditional_dishes TEXT[] DEFAULT '{}'::text[],
  safety_rating INTEGER DEFAULT 3,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_farm_to_table BOOLEAN DEFAULT false,
  is_home_dining BOOLEAN DEFAULT false,
  is_community_kitchen BOOLEAN DEFAULT false,
  host_name TEXT,
  host_photo TEXT,
  host_bio TEXT,
  opening_hours TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  max_guests INTEGER DEFAULT 20,
  price_per_person INTEGER,
  price_currency TEXT DEFAULT 'KES',
  price_display TEXT,
  region TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published food listings" ON public.food_listings FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.food_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.food_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  rating INTEGER NOT NULL,
  dish_recommended TEXT,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.food_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved recommendations" ON public.food_recommendations FOR SELECT USING (is_approved = true);
CREATE POLICY "Auth users can post recommendations" ON public.food_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 13: Safety & emergency
-- ============================================================

CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL DEFAULT 'advisory',
  region TEXT NOT NULL,
  county TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'normal',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  reported_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active alerts" ON public.safety_alerts FOR SELECT USING (is_active = true);
CREATE POLICY "Auth users can report alerts" ON public.safety_alerts FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE TABLE IF NOT EXISTS public.medical_facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL DEFAULT 'hospital',
  county TEXT NOT NULL,
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  emergency_phone TEXT,
  services TEXT[] DEFAULT '{}'::text[],
  has_emergency BOOLEAN DEFAULT true,
  has_pharmacy BOOLEAN DEFAULT false,
  has_ambulance BOOLEAN DEFAULT false,
  operating_hours TEXT DEFAULT '24/7',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published facilities" ON public.medical_facilities FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.lost_found (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'lost',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  location_name TEXT,
  county TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  contact_method TEXT,
  photo_url TEXT,
  is_resolved BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published lost found" ON public.lost_found FOR SELECT USING (is_published = true);
CREATE POLICY "Auth users can post lost found" ON public.lost_found FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.lost_found FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  is_sharing_location BOOLEAN DEFAULT false,
  last_shared_lat DOUBLE PRECISION,
  last_shared_lng DOUBLE PRECISION,
  last_shared_at TIMESTAMPTZ,
  sharing_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contacts" ON public.trusted_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add contacts" ON public.trusted_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.trusted_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.trusted_contacts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 14: Budget packages, group outings, savings, loyalty
-- ============================================================

CREATE TABLE IF NOT EXISTS public.budget_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_sw TEXT,
  slug TEXT NOT NULL UNIQUE,
  budget_tier TEXT NOT NULL DEFAULT 'under_5k',
  price_kes INTEGER NOT NULL DEFAULT 0,
  price_usd numeric,
  duration_days INTEGER DEFAULT 2,
  destination TEXT NOT NULL,
  county TEXT,
  description TEXT,
  description_sw TEXT,
  cover_image TEXT,
  includes TEXT[] DEFAULT '{}'::text[],
  itinerary JSONB DEFAULT '[]'::jsonb,
  group_size_min INTEGER DEFAULT 1,
  group_size_max INTEGER DEFAULT 20,
  suitable_for TEXT[] DEFAULT '{}'::text[],
  transport_included BOOLEAN DEFAULT false,
  meals_included BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published packages" ON public.budget_packages FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.group_outings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  outing_type TEXT NOT NULL DEFAULT 'general',
  destination TEXT,
  county TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  group_size INTEGER DEFAULT 10,
  budget_per_person INTEGER,
  total_budget INTEGER,
  status TEXT DEFAULT 'planning',
  package_id UUID REFERENCES public.budget_packages(id),
  invite_code TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.group_outings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizers can manage outings" ON public.group_outings FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Public outings visible to all" ON public.group_outings FOR SELECT USING (is_public = true);

CREATE TABLE IF NOT EXISTS public.group_outing_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outing_id UUID NOT NULL REFERENCES public.group_outings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT,
  phone TEXT,
  amount_paid INTEGER DEFAULT 0,
  amount_due INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.group_outing_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own membership" ON public.group_outing_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Members can join outings" ON public.group_outing_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can view members" ON public.group_outing_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_outings WHERE group_outings.id = group_outing_members.outing_id AND group_outings.organizer_id = auth.uid()));
CREATE POLICY "Organizers can update members" ON public.group_outing_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.group_outings WHERE group_outings.id = group_outing_members.outing_id AND group_outings.organizer_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_amount INTEGER NOT NULL,
  saved_amount INTEGER DEFAULT 0,
  target_date DATE,
  destination TEXT,
  package_id UUID REFERENCES public.budget_packages(id),
  installment_amount INTEGER,
  installment_frequency TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.savings_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'mpesa',
  mpesa_phone TEXT,
  transaction_ref TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own deposits" ON public.savings_deposits FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'safari-starter',
  total_trips INTEGER DEFAULT 0,
  total_spent_kes INTEGER DEFAULT 0,
  member_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own account" ON public.loyalty_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create account" ON public.loyalty_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own account" ON public.loyalty_accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT DEFAULT 'earn',
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn points" ON public.loyalty_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 15: Digital nomad features
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coworking_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  county TEXT,
  address TEXT,
  description TEXT,
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  internet_speed_mbps INTEGER DEFAULT 50,
  internet_backup BOOLEAN DEFAULT false,
  has_generator BOOLEAN DEFAULT false,
  amenities TEXT[] DEFAULT '{}',
  price_per_day INTEGER DEFAULT 0,
  price_per_week INTEGER,
  price_per_month INTEGER DEFAULT 0,
  price_currency TEXT DEFAULT 'KES',
  opening_hours TEXT DEFAULT '08:00-18:00',
  has_24hr_access BOOLEAN DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coworking_spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published coworking spaces" ON public.coworking_spaces FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.long_stay_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  county TEXT,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  description TEXT,
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  price_per_month INTEGER NOT NULL DEFAULT 0,
  price_currency TEXT DEFAULT 'KES',
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  max_guests INTEGER DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  internet_speed_mbps INTEGER,
  furnished BOOLEAN DEFAULT true,
  has_workspace BOOLEAN DEFAULT false,
  min_stay_months INTEGER DEFAULT 1,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  is_available BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.long_stay_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published long stay listings" ON public.long_stay_listings FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.nomad_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL DEFAULT 'meetup',
  description TEXT,
  cover_image TEXT,
  city TEXT NOT NULL,
  venue TEXT,
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  is_online BOOLEAN DEFAULT false,
  online_link TEXT,
  max_attendees INTEGER DEFAULT 50,
  current_attendees INTEGER DEFAULT 0,
  price TEXT DEFAULT 'Free',
  organizer_name TEXT,
  organizer_id UUID,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nomad_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published nomad events" ON public.nomad_events FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create nomad events" ON public.nomad_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);

CREATE TABLE IF NOT EXISTS public.nomad_forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  user_id UUID NOT NULL,
  author_name TEXT,
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nomad_forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published forum posts" ON public.nomad_forum_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create forum posts" ON public.nomad_forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.nomad_forum_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.nomad_forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.nomad_forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nomad_forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view forum replies" ON public.nomad_forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON public.nomad_forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.internet_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'cafe',
  city TEXT NOT NULL,
  county TEXT,
  address TEXT,
  speed_mbps INTEGER DEFAULT 0,
  reliability_score INTEGER DEFAULT 3,
  provider TEXT,
  is_free BOOLEAN DEFAULT false,
  has_power BOOLEAN DEFAULT true,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  verified_at TIMESTAMPTZ,
  reported_by UUID,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internet_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published internet zones" ON public.internet_zones FOR SELECT USING (is_published = true);
CREATE POLICY "Users can report internet zones" ON public.internet_zones FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);

-- ============================================================
-- MIGRATION 16: Heritage & genealogy
-- ============================================================

CREATE TABLE IF NOT EXISTS public.genealogy_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{English,Swahili}',
  county TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  price_per_session INTEGER DEFAULT 0,
  price_currency TEXT DEFAULT 'KES',
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_elders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  photo_url TEXT,
  bio TEXT,
  expertise TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{Swahili}',
  availability TEXT DEFAULT 'By appointment',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.homecoming_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 7,
  price_amount INTEGER DEFAULT 0,
  price_currency TEXT DEFAULT 'KES',
  cover_image TEXT,
  includes TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  max_guests INTEGER DEFAULT 10,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cultural_programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  description TEXT,
  duration_weeks INTEGER DEFAULT 2,
  price_amount INTEGER DEFAULT 0,
  price_currency TEXT DEFAULT 'KES',
  cover_image TEXT,
  includes TEXT[] DEFAULT '{}',
  learning_outcomes TEXT[] DEFAULT '{}',
  accommodation_included BOOLEAN DEFAULT true,
  meals_included BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 8,
  start_dates TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.heritage_forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  community_tag TEXT,
  upvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.heritage_forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.heritage_forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ancestral_visit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  family_name TEXT,
  region_of_origin TEXT,
  purpose TEXT,
  preferred_dates TEXT,
  group_size INTEGER DEFAULT 1,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.genealogy_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_elders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homecoming_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ancestral_visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published genealogy guides" ON public.genealogy_guides FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published elders" ON public.community_elders FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published homecoming packages" ON public.homecoming_packages FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published programmes" ON public.cultural_programmes FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view forum posts" ON public.heritage_forum_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can view forum replies" ON public.heritage_forum_replies FOR SELECT USING (true);
CREATE POLICY "Auth users can create forum posts" ON public.heritage_forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.heritage_forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth users can reply" ON public.heritage_forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can submit visit requests" ON public.ancestral_visit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.ancestral_visit_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.ancestral_visit_requests FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 17: Impact & sustainability
-- ============================================================

CREATE TABLE IF NOT EXISTS public.community_impact_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_visitors INTEGER DEFAULT 0,
  total_revenue_kes INTEGER DEFAULT 0,
  local_employment_count INTEGER DEFAULT 0,
  local_procurement_percent INTEGER DEFAULT 0,
  conservation_fund_kes INTEGER DEFAULT 0,
  education_fund_kes INTEGER DEFAULT 0,
  infrastructure_fund_kes INTEGER DEFAULT 0,
  hectares_conserved NUMERIC DEFAULT 0,
  trees_planted INTEGER DEFAULT 0,
  schools_supported INTEGER DEFAULT 0,
  summary TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.carbon_offset_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image TEXT,
  project_type TEXT NOT NULL DEFAULT 'reforestation',
  location_name TEXT,
  county TEXT,
  price_per_ton_kes INTEGER DEFAULT 1500,
  tons_offset_total NUMERIC DEFAULT 0,
  tons_available NUMERIC DEFAULT 1000,
  partner_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sponsorship_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image TEXT,
  project_type TEXT NOT NULL DEFAULT 'tree_planting',
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  county TEXT,
  goal_amount_kes INTEGER DEFAULT 0,
  raised_amount_kes INTEGER DEFAULT 0,
  sponsor_count INTEGER DEFAULT 0,
  unit_label TEXT DEFAULT 'trees',
  unit_cost_kes INTEGER DEFAULT 500,
  units_goal INTEGER DEFAULT 100,
  units_completed INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sponsorship_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.sponsorship_projects(id) ON DELETE CASCADE NOT NULL,
  amount_kes INTEGER NOT NULL,
  units INTEGER DEFAULT 1,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operator_impact_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_type TEXT NOT NULL,
  operator_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_label TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.impact_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  certificate_type TEXT NOT NULL DEFAULT 'trip',
  title TEXT NOT NULL,
  stats JSONB DEFAULT '{}',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  share_token TEXT UNIQUE
);

ALTER TABLE public.community_impact_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_offset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_impact_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published impact reports" ON public.community_impact_reports FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published offset projects" ON public.carbon_offset_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published sponsorship projects" ON public.sponsorship_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view active badges" ON public.operator_impact_badges FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view certificates" ON public.impact_certificates FOR SELECT USING (true);
CREATE POLICY "Users can contribute to sponsorships" ON public.sponsorship_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own contributions" ON public.sponsorship_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own certificates" ON public.impact_certificates FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 18: Reviews & flagging
-- ============================================================

CREATE TABLE IF NOT EXISTS public.multi_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reviewable_type TEXT NOT NULL,
  reviewable_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  cultural_authenticity INTEGER CHECK (cultural_authenticity >= 1 AND cultural_authenticity <= 5),
  community_impact INTEGER CHECK (community_impact >= 1 AND community_impact <= 5),
  guide_quality INTEGER CHECK (guide_quality >= 1 AND guide_quality <= 5),
  value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
  safety INTEGER CHECK (safety >= 1 AND safety <= 5),
  title TEXT,
  body TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  is_verified_visit BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  flagged_by UUID,
  operator_response TEXT,
  operator_response_at TIMESTAMPTZ,
  translated_body JSONB DEFAULT '{}',
  language TEXT DEFAULT 'en',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO storage.buckets (id, name, public) VALUES ('review-media', 'review-media', true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.multi_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL DEFAULT 'fake_review',
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.operator_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_type TEXT NOT NULL,
  operator_id UUID NOT NULL,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL DEFAULT 'extractive',
  reason TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.multi_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.multi_reviews FOR SELECT USING (true);
CREATE POLICY "Auth users can create reviews" ON public.multi_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.multi_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth users can flag reviews" ON public.review_flags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own flags" ON public.review_flags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Auth users can flag operators" ON public.operator_flags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own operator flags" ON public.operator_flags FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view review media" ON storage.objects FOR SELECT USING (bucket_id = 'review-media');
CREATE POLICY "Auth users can upload review media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-media' AND auth.role() = 'authenticated');

-- ============================================================
-- MIGRATION 19: Roles, analytics, operator listings
-- ============================================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'community_admin', 'guide', 'operator', 'gov_official', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  county TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and gov officials can view analytics" ON public.platform_analytics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gov_official'));

CREATE TABLE IF NOT EXISTS public.operator_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'experience',
  listing_id UUID NOT NULL,
  listing_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  total_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  impact_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators can view own listings" ON public.operator_listings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Operators can manage own listings" ON public.operator_listings FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_operator_listings_updated_at BEFORE UPDATE ON public.operator_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- MIGRATION 20: Destinations table (seed mock data)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.destinations (
  id text PRIMARY KEY,
  name text NOT NULL,
  county text,
  category text,
  rating numeric,
  reviews integer,
  crowd_level text,
  best_time text,
  price text,
  description text,
  highlights text[],
  safety_rating integer,
  accessibility_rating integer,
  photography_score integer,
  lat double precision,
  lng double precision,
  image text,
  gallery text[],
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.destinations (id, name, county, category, rating, reviews, crowd_level, best_time, price, description, highlights, safety_rating, accessibility_rating, photography_score, lat, lng, image, gallery) VALUES
('maasai-mara', 'Maasai Mara', 'Narok County', 'Wildlife Safari', 4.9, 2340, 'Medium', 'Jul — Oct', 'From $120/day', 'The Maasai Mara National Reserve is Kenya''s most famous wildlife destination, renowned for the annual Great Wildebeest Migration and Big Five sightings.', ARRAY['Great Wildebeest Migration','Big Five sightings','Hot air balloon safaris','Maasai cultural visits','Night game drives','Photography safaris'], 4, 3, 5, -1.4061, 35.0124, 'dest-mara.jpg', ARRAY['dest-mara.jpg','mara-crossing.jpg','mara-camp.jpg','mara-balloon.jpg','mara-cheetah.jpg']),
('amboseli', 'Amboseli National Park', 'Kajiado County', 'Wildlife Safari', 4.8, 1890, 'Low', 'Jun — Oct', 'From $95/day', 'Amboseli is famous for its large elephant herds and iconic views of Mount Kilimanjaro.', ARRAY['Elephant herds','Kilimanjaro views','Swamp wildlife','Birdwatching','Cultural visits'], 4, 3, 4, -2.6441, 37.2536, 'dest-amboseli.jpg', ARRAY['dest-amboseli.jpg']),
('lamu', 'Lamu Old Town', 'Lamu County', 'Culture & Heritage', 4.7, 980, 'Low', 'Nov — Mar', 'From $60/day', 'Lamu Old Town is the oldest continuously inhabited Swahili settlement in East Africa and a UNESCO World Heritage Site.', ARRAY['UNESCO World Heritage Site','Swahili architecture','Dhow sailing trips','Lamu Cultural Festival','Donkey sanctuary','Shela Beach'], 4, 4, 4, -2.2696, 40.9020, 'dest-lamu.jpg', ARRAY['dest-lamu.jpg','community-market.jpg','dest-diani.jpg'])
ON CONFLICT (id) DO NOTHING;

-- Seed communities
INSERT INTO public.communities (name, county, slug, is_published, description, region)
VALUES
  ('Maasai of Narok', 'Narok County', 'maasai-of-narok', true, 'Maasai community known for rich cultural traditions and wildlife stewardship.', 'Rift Valley'),
  ('Lamu Heritage Council', 'Lamu County', 'lamu-heritage-council', true, 'Swahili coastal heritage guardians with deep historical knowledge.', 'Coast'),
  ('Samburu Women''s Cooperative', 'Samburu County', 'samburu-womens-cooperative', true, 'Women-led cooperative preserving Samburu beadwork and storytelling.', 'Northern Kenya')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MIGRATION 21: Chat rooms
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  invite_code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON public.chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_room ON public.chat_room_messages(room_id, created_at);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_chat_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = _room_id AND user_id = _user_id)
$$;

CREATE POLICY "Members can view their rooms" ON public.chat_rooms FOR SELECT USING (public.is_chat_room_member(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Authenticated users can create rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner can update room" ON public.chat_rooms FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Owner can delete room" ON public.chat_rooms FOR DELETE USING (created_by = auth.uid());
CREATE POLICY "Members can view co-members" ON public.chat_room_members FOR SELECT USING (public.is_chat_room_member(room_id, auth.uid()));
CREATE POLICY "Users can join rooms themselves" ON public.chat_room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.chat_room_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Members can read messages" ON public.chat_room_messages FOR SELECT USING (public.is_chat_room_member(room_id, auth.uid()));
CREATE POLICY "Members can post messages" ON public.chat_room_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_chat_room_member(room_id, auth.uid()));
CREATE POLICY "Authors can delete own messages" ON public.chat_room_messages FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.chat_room_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;

-- ============================================================
-- MIGRATION 22: Admin tables (admin_users, admin_audit_logs)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'marketplace_manager', 'moderator')),
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all admin users" ON public.admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE role = 'super_admin' AND is_active = true));

CREATE POLICY "Active admins can view audit logs" ON public.admin_audit_logs FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- STEP 2 (after schema): Create your first admin user
-- ============================================================
-- After the schema runs, go to Supabase Dashboard → Authentication → Users
-- and note the UUID of the user you want to make admin, then run:
--
-- INSERT INTO public.admin_users (user_id, role, is_active)
-- VALUES ('<YOUR-USER-UUID-HERE>', 'super_admin', true);
--
-- ============================================================
