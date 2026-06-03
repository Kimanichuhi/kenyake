
-- Communities table: core profile data
CREATE TABLE public.communities (
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
  
  -- Cultural details
  traditional_dress text,
  adornment_explanation text,
  
  -- Leadership & contact
  leader_name text,
  leader_title text,
  contact_email text,
  contact_phone text,
  
  -- Visitor capacity
  max_daily_visitors integer DEFAULT 20,
  current_visitor_count integer DEFAULT 0,
  visitor_guidelines text,
  
  -- Ecological knowledge
  ecological_knowledge text,
  
  -- Coordinates for map
  lat double precision,
  lng double precision,
  
  -- Metadata
  is_published boolean DEFAULT false,
  managed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Anyone can view published communities
CREATE POLICY "Anyone can view published communities" ON public.communities
  FOR SELECT USING (is_published = true);

-- Community managers can update their community
CREATE POLICY "Managers can update their community" ON public.communities
  FOR UPDATE USING (auth.uid() = managed_by);

-- Community content: flexible typed content (cultural practices, phrases, sacred sites, dos/donts, stories)
CREATE TABLE public.community_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL, -- 'cultural_practice', 'phrase', 'sacred_site', 'dos_donts', 'oral_history', 'tradition', 'ecological_knowledge'
  title text NOT NULL,
  body text,
  media_url text,
  media_type text, -- 'image', 'video', 'audio'
  metadata jsonb DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community content" ON public.community_content
  FOR SELECT USING (true);

CREATE POLICY "Managers can insert content" ON public.community_content
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

CREATE POLICY "Managers can update content" ON public.community_content
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

CREATE POLICY "Managers can delete content" ON public.community_content
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

-- Community gallery
CREATE TABLE public.community_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image', -- 'image', 'video'
  caption text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved gallery" ON public.community_gallery
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Auth users can upload to gallery" ON public.community_gallery
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Managers can update gallery items" ON public.community_gallery
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

CREATE POLICY "Managers can delete gallery items" ON public.community_gallery
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

-- Community review responses
CREATE TABLE public.community_review_responses (
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

CREATE POLICY "Anyone can view review responses" ON public.community_review_responses
  FOR SELECT USING (true);

CREATE POLICY "Managers can respond to reviews" ON public.community_review_responses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

CREATE POLICY "Managers can insert reviews" ON public.community_review_responses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

-- Storage bucket for community media
INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true);

CREATE POLICY "Anyone can view community media" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-media');

CREATE POLICY "Auth users can upload community media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community-media' AND auth.role() = 'authenticated');
