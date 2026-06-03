
-- Wildlife sightings table for crowdsourced live feed
CREATE TABLE public.wildlife_sightings (
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

-- Anyone can read sightings (public feed)
CREATE POLICY "Anyone can view sightings" ON public.wildlife_sightings
  FOR SELECT USING (true);

-- Authenticated users can post sightings
CREATE POLICY "Auth users can post sightings" ON public.wildlife_sightings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sightings
CREATE POLICY "Users can delete own sightings" ON public.wildlife_sightings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.wildlife_sightings;
