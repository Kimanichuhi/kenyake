
-- Multi-dimensional reviews
CREATE TABLE public.multi_reviews (
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

-- Review media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('review-media', 'review-media', true);

-- Review flags (community flagging)
CREATE TABLE public.review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.multi_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL DEFAULT 'fake_review',
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Operator flags (extractive operator flagging)
CREATE TABLE public.operator_flags (
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

-- RLS
ALTER TABLE public.multi_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_flags ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "Anyone can view reviews" ON public.multi_reviews FOR SELECT USING (true);
CREATE POLICY "Auth users can create reviews" ON public.multi_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.multi_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Auth users can flag reviews" ON public.review_flags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own flags" ON public.review_flags FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Auth users can flag operators" ON public.operator_flags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own operator flags" ON public.operator_flags FOR SELECT USING (auth.uid() = user_id);

-- Storage RLS for review-media
CREATE POLICY "Anyone can view review media" ON storage.objects FOR SELECT USING (bucket_id = 'review-media');
CREATE POLICY "Auth users can upload review media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-media' AND auth.role() = 'authenticated');
