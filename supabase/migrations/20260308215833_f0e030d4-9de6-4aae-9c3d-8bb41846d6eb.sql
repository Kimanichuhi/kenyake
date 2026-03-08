
-- Education modules table
CREATE TABLE public.education_modules (
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

-- Education lessons within modules
CREATE TABLE public.education_lessons (
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

-- User progress and certifications
CREATE TABLE public.user_education_progress (
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

-- Certification badges
CREATE TABLE public.user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  certification_type text NOT NULL,
  title text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  modules_completed uuid[] DEFAULT '{}'::uuid[],
  UNIQUE(user_id, certification_type)
);

-- RLS
ALTER TABLE public.education_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;

-- Modules: public read
CREATE POLICY "Anyone can view published modules" ON public.education_modules FOR SELECT USING (is_published = true);

-- Lessons: public read
CREATE POLICY "Anyone can view lessons" ON public.education_lessons FOR SELECT USING (true);

-- Progress: user-scoped
CREATE POLICY "Users can view own progress" ON public.user_education_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_education_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_education_progress FOR UPDATE USING (auth.uid() = user_id);

-- Certifications: user can read own, public can view for "preparation status"
CREATE POLICY "Users can view own certs" ON public.user_certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view certs" ON public.user_certifications FOR SELECT USING (true);
CREATE POLICY "Users can earn certs" ON public.user_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
