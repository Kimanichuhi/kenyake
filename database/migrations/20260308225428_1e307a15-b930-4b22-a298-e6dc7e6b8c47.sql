
-- Safety alerts (region-based advisories, weather, animal breach)
CREATE TABLE public.safety_alerts (
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

CREATE POLICY "Anyone can view active alerts"
  ON public.safety_alerts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Auth users can report alerts"
  ON public.safety_alerts FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Medical facilities
CREATE TABLE public.medical_facilities (
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

CREATE POLICY "Anyone can view published facilities"
  ON public.medical_facilities FOR SELECT
  USING (is_published = true);

-- Lost and found board
CREATE TABLE public.lost_found (
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

CREATE POLICY "Anyone can view published lost found"
  ON public.lost_found FOR SELECT
  USING (is_published = true);

CREATE POLICY "Auth users can post lost found"
  ON public.lost_found FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.lost_found FOR UPDATE
  USING (auth.uid() = user_id);

-- Trusted contacts (live location sharing)
CREATE TABLE public.trusted_contacts (
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

CREATE POLICY "Users can view own contacts"
  ON public.trusted_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add contacts"
  ON public.trusted_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.trusted_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON public.trusted_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Seed safety alerts
INSERT INTO public.safety_alerts (alert_type, region, county, title, message, severity) VALUES
('advisory', 'Nairobi', 'Nairobi', 'Standard Urban Precautions', 'Standard precautions advised. Avoid walking alone at night in unfamiliar areas. Use registered taxis or ride-hailing apps.', 'normal'),
('advisory', 'Maasai Mara', 'Narok', 'Safe for Tourism', 'Safe for tourism. Follow park rules and guide instructions at all times. Do not exit vehicles during game drives.', 'low'),
('advisory', 'Coastal Region', 'Mombasa', 'Beach Safety Advisory', 'Safe for tourism. Be aware of ocean conditions and tidal changes. Swim in designated areas only.', 'normal'),
('advisory', 'Northern Kenya', 'Marsabit', 'Permit Required Zone', 'Some areas require permits. Travel with reputable operators only. Inform authorities of travel plans.', 'caution'),
('weather', 'Central Highlands', 'Nyeri', 'Rainy Season Alert', 'Heavy rains expected through April. Mountain trails may be slippery. Check conditions before hiking.', 'caution'),
('animal', 'Amboseli', 'Kajiado', 'Elephant Migration Corridor', 'Elephant herds moving through community areas near Amboseli. Maintain distance and follow ranger guidance.', 'caution'),
('road', 'Rift Valley', 'Nakuru', 'Road Works on A104', 'Road construction between Nakuru and Naivasha. Expect delays of 30-60 minutes. Use alternative routes when possible.', 'normal');

-- Seed medical facilities
INSERT INTO public.medical_facilities (name, facility_type, county, location_name, phone, emergency_phone, services, has_emergency, has_pharmacy, has_ambulance, operating_hours) VALUES
('Nairobi Hospital', 'hospital', 'Nairobi', 'Argwings Kodhek Road, Nairobi', '+254 20 2845000', '+254 20 2845000', ARRAY['Emergency','Surgery','ICU','Pharmacy','Lab','X-Ray','Dental','Pediatrics'], true, true, true, '24/7'),
('Aga Khan University Hospital', 'hospital', 'Nairobi', '3rd Parklands Avenue, Nairobi', '+254 20 3662000', '+254 20 3662000', ARRAY['Emergency','Surgery','ICU','Pharmacy','Lab','Imaging','Cardiology','Oncology'], true, true, true, '24/7'),
('Mombasa Hospital', 'hospital', 'Mombasa', 'Mama Ngina Drive, Mombasa', '+254 41 2312191', '+254 41 2312191', ARRAY['Emergency','Surgery','Pharmacy','Lab','Maternity','Pediatrics'], true, true, false, '24/7'),
('Diani Beach Hospital', 'hospital', 'Kwale', 'Diani Beach Road', '+254 40 3202053', '+254 40 3202053', ARRAY['Emergency','Pharmacy','Lab','Dive Medicine','Tropical Disease'], true, true, false, '24/7'),
('Narok County Hospital', 'hospital', 'Narok', 'Narok Town', '+254 50 2222222', '+254 50 2222222', ARRAY['Emergency','Pharmacy','Lab','Maternity'], true, true, false, '24/7'),
('AMREF Flying Doctors', 'air-ambulance', 'Nairobi', 'Wilson Airport, Nairobi', '+254 20 6992000', '+254 20 6992000', ARRAY['Air Evacuation','Emergency Transport','Remote Area Rescue'], true, false, true, '24/7'),
('Malindi District Hospital', 'hospital', 'Kilifi', 'Malindi Town', '+254 42 2120536', '+254 42 2120536', ARRAY['Emergency','Pharmacy','Lab','Maternity','Tropical Disease'], true, true, false, '24/7'),
('Nanyuki Cottage Hospital', 'hospital', 'Laikipia', 'Nanyuki Town', '+254 62 2031461', '+254 62 2031461', ARRAY['Emergency','Pharmacy','Lab','Surgery','Mount Kenya Rescue Coordination'], true, true, false, '24/7'),
('Lamu District Hospital', 'hospital', 'Lamu', 'Lamu Town', '+254 42 2633012', '+254 42 2633012', ARRAY['Emergency','Pharmacy','Basic Lab','Maternity'], true, true, false, '24/7'),
('Kenyatta National Hospital', 'hospital', 'Nairobi', 'Hospital Road, Upper Hill', '+254 20 2726300', '+254 20 2726300', ARRAY['Emergency','Surgery','ICU','Pharmacy','Lab','All Specialties','Burns Unit','Trauma'], true, true, true, '24/7');
