
-- Genealogy guides (community-linked)
CREATE TABLE public.genealogy_guides (
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

-- Community elders for heritage visitors
CREATE TABLE public.community_elders (
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

-- Homecoming packages
CREATE TABLE public.homecoming_packages (
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

-- Cultural immersion programmes (multi-week)
CREATE TABLE public.cultural_programmes (
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

-- Heritage forum posts
CREATE TABLE public.heritage_forum_posts (
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

-- Heritage forum replies
CREATE TABLE public.heritage_forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.heritage_forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ancestral visit requests
CREATE TABLE public.ancestral_visit_requests (
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

-- RLS
ALTER TABLE public.genealogy_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_elders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homecoming_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ancestral_visit_requests ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Anyone can view published genealogy guides" ON public.genealogy_guides FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published elders" ON public.community_elders FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published homecoming packages" ON public.homecoming_packages FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published programmes" ON public.cultural_programmes FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view forum posts" ON public.heritage_forum_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can view forum replies" ON public.heritage_forum_replies FOR SELECT USING (true);

-- Auth required for interaction
CREATE POLICY "Auth users can create forum posts" ON public.heritage_forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.heritage_forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth users can reply" ON public.heritage_forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can submit visit requests" ON public.ancestral_visit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.ancestral_visit_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.ancestral_visit_requests FOR UPDATE USING (auth.uid() = user_id);

-- Minimal seed data
INSERT INTO public.genealogy_guides (name, slug, bio, specialties, county, price_per_session) VALUES
('Wanjiku Mwangi', 'wanjiku-mwangi', 'Expert in Kikuyu genealogy and clan histories spanning 8 generations.', ARRAY['Kikuyu lineage','Clan histories','Land records'], 'Kiambu', 5000),
('Odhiambo Otieno', 'odhiambo-otieno', 'Luo heritage specialist connecting diaspora families to their ancestral roots in Siaya.', ARRAY['Luo ancestry','Migration patterns','Naming traditions'], 'Siaya', 4500);

INSERT INTO public.community_elders (community_id, name, title, bio, expertise) VALUES
((SELECT id FROM public.communities LIMIT 1), 'Mzee Kipchoge', 'Council Elder', 'Keeper of oral traditions for over 40 years. Specializes in connecting diaspora visitors with their heritage.', ARRAY['Oral history','Clan genealogy','Traditional ceremonies']);

INSERT INTO public.homecoming_packages (title, slug, description, duration_days, price_amount, includes, highlights) VALUES
('Kikuyu Roots Return', 'kikuyu-roots-return', 'A 7-day journey to reconnect with your Kikuyu heritage. Visit ancestral lands, meet elders, and participate in traditional ceremonies.', 7, 85000, ARRAY['Airport transfer','Accommodation','All meals','Genealogy guide','Elder meetings','Cultural ceremonies'], ARRAY['Visit ancestral village','Meet clan elders','Traditional naming ceremony','Learn Kikuyu cooking']),
('Luo Heritage Journey', 'luo-heritage-journey', 'Trace your Luo roots along the shores of Lake Victoria. Connect with family histories and participate in community life.', 5, 65000, ARRAY['Transport','Accommodation','Meals','Heritage guide','Community visits'], ARRAY['Lake Victoria boat trip','Traditional fishing','Dholuo language lessons','Clan history session']);

INSERT INTO public.cultural_programmes (title, slug, description, duration_weeks, price_amount, includes, learning_outcomes) VALUES
('Deep Roots Immersion', 'deep-roots-immersion', 'A 3-week cultural immersion programme for diaspora Kenyans seeking a profound reconnection with their heritage.', 3, 250000, ARRAY['Homestay accommodation','All meals','Language tutoring','Cultural guide','Certificate of completion'], ARRAY['Conversational mother tongue','Traditional crafts','Community integration','Family history documentation']);
