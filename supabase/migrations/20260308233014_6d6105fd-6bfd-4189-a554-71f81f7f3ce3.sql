
-- Community impact reports (annual per destination)
CREATE TABLE public.community_impact_reports (
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

-- Carbon offset projects
CREATE TABLE public.carbon_offset_projects (
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

-- Sponsorship projects (trees, schools, community)
CREATE TABLE public.sponsorship_projects (
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

-- User sponsorship contributions
CREATE TABLE public.sponsorship_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.sponsorship_projects(id) ON DELETE CASCADE NOT NULL,
  amount_kes INTEGER NOT NULL,
  units INTEGER DEFAULT 1,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Operator impact badges
CREATE TABLE public.operator_impact_badges (
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

-- User impact certificates
CREATE TABLE public.impact_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  certificate_type TEXT NOT NULL DEFAULT 'trip',
  title TEXT NOT NULL,
  stats JSONB DEFAULT '{}',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  share_token TEXT UNIQUE
);

-- RLS
ALTER TABLE public.community_impact_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_offset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_impact_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_certificates ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "Anyone can view published impact reports" ON public.community_impact_reports FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published offset projects" ON public.carbon_offset_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published sponsorship projects" ON public.sponsorship_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view active badges" ON public.operator_impact_badges FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view certificates" ON public.impact_certificates FOR SELECT USING (true);

-- Auth interactions
CREATE POLICY "Users can contribute to sponsorships" ON public.sponsorship_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own contributions" ON public.sponsorship_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own certificates" ON public.impact_certificates FOR SELECT USING (auth.uid() = user_id);

-- Seed data
INSERT INTO public.carbon_offset_projects (title, slug, description, project_type, location_name, county, price_per_ton_kes, tons_available, partner_name, is_verified) VALUES
('Mau Forest Reforestation', 'mau-forest', 'Support the restoration of Kenya''s largest indigenous forest. Each ton offset plants approximately 8 trees.', 'reforestation', 'Mau Forest Complex', 'Nakuru', 1500, 500, 'Kenya Forest Service', true),
('Tana River Mangrove Restoration', 'tana-mangroves', 'Restore critical mangrove ecosystems along the Tana River delta, protecting coastline and sequestering carbon.', 'mangrove', 'Tana River Delta', 'Tana River', 2000, 300, 'Kenya Marine & Fisheries', true);

INSERT INTO public.sponsorship_projects (title, slug, description, project_type, county, goal_amount_kes, raised_amount_kes, sponsor_count, unit_label, unit_cost_kes, units_goal, units_completed, is_featured) VALUES
('Plant Trees in Mt. Kenya', 'mt-kenya-trees', 'Help reforest the slopes of Mt. Kenya. Each tree costs KES 500 and is planted by local community members.', 'tree_planting', 'Nyeri', 500000, 235000, 47, 'trees', 500, 1000, 470, true),
('Maasai Mara School Library', 'mara-school-library', 'Fund a library for Ololaimutiek Primary School near the Maasai Mara, serving 400 students.', 'school', 'Narok', 800000, 520000, 83, 'books', 200, 4000, 2600, true),
('Samburu Water Well', 'samburu-water', 'Sponsor a solar-powered water well for the Samburu community, providing clean water to 200 families.', 'community', 'Samburu', 1200000, 780000, 62, 'families', 6000, 200, 130, false);

INSERT INTO public.community_impact_reports (community_id, year, total_visitors, total_revenue_kes, local_employment_count, conservation_fund_kes, education_fund_kes, trees_planted, schools_supported, summary)
SELECT id, 2025, 1240, 8500000, 34, 1200000, 600000, 3200, 2, 'A strong year for community tourism. Revenue grew 22% year-over-year with 34 local jobs sustained.'
FROM public.communities LIMIT 1;
