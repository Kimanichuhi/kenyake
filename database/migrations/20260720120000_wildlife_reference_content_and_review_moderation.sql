-- Wildlife reference content (Big Five facts + migration calendar) as
-- admin-editable tables, replacing hardcoded frontend data.

CREATE TABLE public.wildlife_species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text,
  location_name text,
  population_estimate text,
  conservation_status text,
  best_month text,
  sightings_note text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wildlife_migration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  event_name text NOT NULL,
  intensity integer NOT NULL DEFAULT 3 CHECK (intensity BETWEEN 1 AND 5),
  description text,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wildlife_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wildlife_migration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published wildlife species" ON public.wildlife_species
  FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage wildlife species" ON public.wildlife_species
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Anyone can view published migration events" ON public.wildlife_migration_events
  FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage migration events" ON public.wildlife_migration_events
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

INSERT INTO public.wildlife_species (name, emoji, location_name, population_estimate, conservation_status, best_month, sightings_note, display_order) VALUES
  ('Lion', '🦁', 'Maasai Mara', '~2,000 in Kenya', 'Vulnerable', 'Jul — Oct', '92% sighting rate on 3+ day safaris', 1),
  ('Elephant', '🐘', 'Amboseli', '~35,000 in Kenya', 'Endangered', 'Jun — Sep', '98% sighting rate; large herds at the swamps', 2),
  ('Buffalo', '🐃', 'Lake Nakuru', '~40,000 in Kenya', 'Near Threatened', 'Year-round', '95% sighting rate across all major reserves', 3),
  ('Leopard', '🐆', 'Samburu', '~4,000 in Kenya', 'Vulnerable', 'Jun — Aug', '45% sighting rate; most active at night', 4),
  ('Rhino', '🦏', 'Ol Pejeta', '~1,800 in Kenya', 'Critically Endangered', 'Year-round', '78% sighting rate at protected sanctuaries', 5);

INSERT INTO public.wildlife_migration_events (month, event_name, intensity, description, display_order) VALUES
  ('Jan—Mar', 'Calving season in Serengeti', 2, 'Wildebeest calving in the southern Serengeti plains', 1),
  ('Apr—May', 'Herds move northwest', 3, 'Herds spread out across the greening plains', 2),
  ('Jun', 'Western Serengeti — Grumeti crossings', 4, 'Herds approach the Grumeti River', 3),
  ('Jul—Aug', 'Mara River crossings begin', 5, 'Herds arrive at the Mara River from the Serengeti', 4),
  ('Sep—Oct', 'Peak Mara crossings & dispersal', 5, 'The most dramatic and dangerous river crossings', 5),
  ('Nov—Dec', 'Return south to Serengeti', 3, 'Herds start moving back toward the Serengeti', 6);

-- Fix: admin/content-manager moderation of user-submitted destination &
-- experience reviews. The original multi_reviews policies only let the
-- authoring user update their own row and had no UPDATE/DELETE path for
-- staff, so the admin Reviews CMS screen had no way to moderate content.
CREATE POLICY "Content managers can moderate reviews" ON public.multi_reviews
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can delete reviews" ON public.multi_reviews
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));
