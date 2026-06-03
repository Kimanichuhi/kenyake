
-- Coworking spaces directory
CREATE TABLE public.coworking_spaces (
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

-- Long-stay accommodation listings
CREATE TABLE public.long_stay_listings (
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

-- Nomad community events
CREATE TABLE public.nomad_events (
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

-- Nomad forum posts
CREATE TABLE public.nomad_forum_posts (
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

-- Nomad forum replies
CREATE TABLE public.nomad_forum_replies (
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

-- Internet zones mapping
CREATE TABLE public.internet_zones (
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

-- Seed coworking spaces
INSERT INTO public.coworking_spaces (name, slug, city, county, description, internet_speed_mbps, internet_backup, has_generator, amenities, price_per_day, price_per_month, has_24hr_access, rating, review_count, is_verified, lat, lng) VALUES
('Nairobi Garage', 'nairobi-garage', 'Nairobi', 'Nairobi', 'Premium coworking space in Westlands with fast fiber internet, meeting rooms, and a vibrant tech community.', 100, true, true, ARRAY['Meeting Rooms','Phone Booths','Café','Printing','Locker Storage','Showers'], 1500, 25000, true, 4.7, 89, true, -1.2635, 36.8043),
('iHub', 'ihub', 'Nairobi', 'Nairobi', 'Africa''s leading innovation hub and coworking space. Home to tech startups and digital nomads.', 80, true, true, ARRAY['Event Space','Mentorship','Café','Meeting Rooms','Fast WiFi'], 1200, 20000, false, 4.5, 156, true, -1.2891, 36.7829),
('Swahilipot Hub', 'swahilipot-hub', 'Mombasa', 'Mombasa', 'Creative tech hub on the coast with ocean breeze and reliable connectivity.', 60, true, true, ARRAY['Event Space','Studio','Café','Garden','Meeting Rooms'], 800, 12000, false, 4.4, 42, true, -4.0435, 39.6682),
('Diani Beach Workspace', 'diani-beach-workspace', 'Diani', 'Kwale', 'Beachside coworking with stunning ocean views. Work with your toes in the sand.', 50, true, true, ARRAY['Ocean View','Café','Lounge','Pool Access','Surfboard Storage'], 1200, 18000, false, 4.6, 28, true, -4.3477, 39.5682),
('The Alchemist Workspace', 'alchemist-workspace', 'Nairobi', 'Nairobi', 'Trendy coworking in Westlands with great food, craft beer, and networking events.', 80, true, true, ARRAY['Restaurant','Bar','Events','Outdoor Space','Meeting Rooms'], 1000, 18000, false, 4.3, 67, true, -1.2617, 36.8027),
('Nailab', 'nailab', 'Nairobi', 'Nairobi', 'Tech incubator and coworking space supporting startups with mentorship and resources.', 100, true, true, ARRAY['Incubation','Mentorship','Events','Meeting Rooms','Printing'], 1000, 15000, false, 4.4, 53, true, -1.2734, 36.8115),
('Lamu Nomad House', 'lamu-nomad-house', 'Lamu', 'Lamu', 'Unique nomad-focused workspace in historic Lamu Old Town with Swahili architecture.', 30, false, true, ARRAY['Rooftop','Café','Cultural Tours','Yoga','Dhow Trips'], 600, 8000, false, 4.2, 19, false, -2.2717, 40.9020),
('Kericho Tea Hub', 'kericho-tea-hub', 'Kericho', 'Kericho', 'Work surrounded by tea plantations in the highlands. Fresh air and peaceful environment.', 40, false, true, ARRAY['Tea Lounge','Garden','Meeting Room','Kitchen'], 500, 7000, false, 4.1, 12, false, -0.3692, 35.2863);

-- Seed long-stay listings
INSERT INTO public.long_stay_listings (name, slug, city, county, property_type, description, price_per_month, bedrooms, bathrooms, amenities, internet_speed_mbps, furnished, has_workspace, min_stay_months, rating, review_count, lat, lng) VALUES
('Kilimani Studio Apartment', 'kilimani-studio', 'Nairobi', 'Nairobi', 'studio', 'Modern furnished studio in Kilimani with dedicated workspace and fiber internet. Walking distance to restaurants and cafés.', 45000, 0, 1, ARRAY['WiFi','Workspace','Kitchen','Gym','Pool','Security','Parking'], 100, true, true, 1, 4.5, 23, -1.2921, 36.7858),
('Westlands 1BR Digital Nomad Flat', 'westlands-1br', 'Nairobi', 'Nairobi', 'apartment', 'Spacious 1-bedroom apartment with standing desk and ergonomic chair. Near Sarit Centre.', 65000, 1, 1, ARRAY['WiFi','Standing Desk','Washer','Balcony','Security','Backup Power'], 100, true, true, 1, 4.7, 31, -1.2635, 36.8043),
('Nyali Beachside Villa', 'nyali-beachside', 'Mombasa', 'Mombasa', 'villa', 'Beautiful 2-bedroom villa minutes from the beach with garden workspace and pool.', 80000, 2, 2, ARRAY['WiFi','Pool','Garden','Workspace','Parking','Security','Generator'], 60, true, true, 3, 4.6, 15, -4.0311, 39.7041),
('Diani Beach House', 'diani-beach-house', 'Diani', 'Kwale', 'house', 'Charming beach house with ocean views. Perfect for digital nomads seeking paradise.', 70000, 2, 1, ARRAY['WiFi','Ocean View','Kitchen','Garden','Hammock','Bicycle'], 40, true, true, 1, 4.8, 19, -4.3477, 39.5682),
('Karen Cottage Retreat', 'karen-cottage', 'Nairobi', 'Nairobi', 'cottage', 'Quiet cottage in leafy Karen with large garden and dedicated home office space.', 55000, 1, 1, ARRAY['WiFi','Home Office','Garden','Parking','Security','Fireplace'], 80, true, true, 2, 4.4, 11, -1.3187, 36.7115),
('Lamu Old Town Apartment', 'lamu-old-town', 'Lamu', 'Lamu', 'apartment', 'Authentic Swahili apartment with rooftop terrace in UNESCO World Heritage site.', 35000, 1, 1, ARRAY['Rooftop','Kitchen','Cultural Experience','Ocean Breeze'], 25, true, false, 1, 4.3, 8, -2.2717, 40.9020);

-- Seed nomad events
INSERT INTO public.nomad_events (title, slug, event_type, description, city, venue, event_date, start_time, end_time, price, organizer_name, tags) VALUES
('Nairobi Nomad Meetup', 'nairobi-nomad-meetup', 'meetup', 'Monthly gathering of digital nomads in Nairobi. Share stories, tips, and connections.', 'Nairobi', 'Nairobi Garage, Westlands', '2026-03-22', '18:00', '21:00', 'Free', 'Kenya Nomads Community', ARRAY['networking','social','nomads']),
('Mombasa Co-working Day', 'mombasa-coworking-day', 'meetup', 'Work alongside fellow nomads at Swahilipot Hub and explore the coast together.', 'Mombasa', 'Swahilipot Hub', '2026-03-29', '09:00', '17:00', 'KES 500', 'Coast Nomads', ARRAY['coworking','networking','coast']),
('Safari & Sprint Weekend', 'safari-sprint-weekend', 'retreat', 'Combine a Maasai Mara safari with a weekend coding sprint. Work hard, explore harder.', 'Nairobi', 'Maasai Mara (departure from Nairobi)', '2026-04-05', '06:00', '18:00', 'KES 35,000', 'NomadSafari KE', ARRAY['safari','coding','adventure']),
('Kenya Startup Pitch Night', 'startup-pitch-night', 'networking', 'Watch local startups pitch to investors. Great networking for freelancers and entrepreneurs.', 'Nairobi', 'iHub, Kilimani', '2026-04-10', '18:00', '21:00', 'KES 1,000', 'iHub Events', ARRAY['startup','pitch','tech']),
('Diani Yoga & Work Retreat', 'diani-yoga-work-retreat', 'retreat', '5-day retreat combining morning yoga, focused work sessions, and beach time.', 'Diani', 'Diani Beach Workspace', '2026-04-15', '07:00', '17:00', 'KES 25,000', 'Diani Wellness', ARRAY['yoga','retreat','wellness','work']),
('Freelancer Tax Workshop', 'freelancer-tax-workshop', 'workshop', 'Learn about Kenya''s tax requirements for remote workers and freelancers. KRA compliance made easy.', 'Nairobi', 'Online + Nairobi Garage', '2026-03-25', '14:00', '16:00', 'Free', 'Kenya Nomads Community', ARRAY['tax','legal','workshop']);

-- Seed internet zones
INSERT INTO public.internet_zones (name, zone_type, city, county, address, speed_mbps, reliability_score, provider, is_free, has_power, lat, lng, verified_at) VALUES
('Java House Westlands', 'cafe', 'Nairobi', 'Nairobi', 'Woodvale Grove, Westlands', 30, 4, 'Safaricom Fiber', true, true, -1.2617, 36.8027, now()),
('Artcaffé Hub', 'cafe', 'Nairobi', 'Nairobi', 'Village Market', 40, 4, 'Safaricom Fiber', true, true, -1.2297, 36.7976, now()),
('Nairobi Garage', 'coworking', 'Nairobi', 'Nairobi', 'Piedmont Plaza, Westlands', 100, 5, 'Safaricom + Zuku', false, true, -1.2635, 36.8043, now()),
('iHub', 'coworking', 'Nairobi', 'Nairobi', '6th Floor, Senteu Plaza', 80, 5, 'Safaricom Fiber', false, true, -1.2891, 36.7829, now()),
('Voyager Beach Resort', 'hotel', 'Mombasa', 'Mombasa', 'Nyali Beach', 40, 3, 'JTL Fiber', false, true, -4.0153, 39.7193, now()),
('Swahilipot Hub', 'coworking', 'Mombasa', 'Mombasa', 'Old Town', 60, 4, 'Safaricom Fiber', false, true, -4.0435, 39.6682, now()),
('Tribe Hotel', 'hotel', 'Nairobi', 'Nairobi', 'Gigiri', 80, 5, 'Safaricom Enterprise', false, true, -1.2308, 36.7985, now()),
('Diani Beach Workspace', 'coworking', 'Diani', 'Kwale', 'Diani Beach Road', 50, 4, 'Liquid Telecom', false, true, -4.3477, 39.5682, now()),
('Karen Blixen Coffee Garden', 'cafe', 'Nairobi', 'Nairobi', 'Karen Road', 25, 3, 'Safaricom', true, true, -1.3187, 36.7115, now()),
('Lamu Palace Hotel', 'hotel', 'Lamu', 'Lamu', 'Lamu Waterfront', 15, 2, 'Safaricom 4G', false, true, -2.2717, 40.9020, now());

-- Seed forum posts
INSERT INTO public.nomad_forum_posts (title, body, category, user_id, author_name, tags, upvotes, reply_count) VALUES
('Best areas in Nairobi for digital nomads?', 'Just arrived in Nairobi. Looking for recommendations on neighborhoods with good internet, safety, and walkability. Kilimani vs Westlands vs Karen?', 'housing', '00000000-0000-0000-0000-000000000000', 'NomadSarah', ARRAY['nairobi','housing','neighborhoods'], 24, 12),
('M-Pesa setup guide for foreigners', 'Here''s my step-by-step guide to getting M-Pesa working as a foreigner. You''ll need your passport and a Safaricom SIM...', 'guides', '00000000-0000-0000-0000-000000000000', 'TechTraveler', ARRAY['mpesa','banking','guide'], 42, 8),
('Reliable internet in Diani Beach?', 'Planning to work from Diani for 2 months. How reliable is the internet there? Any backup recommendations?', 'internet', '00000000-0000-0000-0000-000000000000', 'BeachCoder', ARRAY['diani','internet','coast'], 15, 6),
('Kenya digital nomad visa experience', 'Just got my Kenya digital nomad visa approved! Took 3 days. Happy to answer questions about the process.', 'visa', '00000000-0000-0000-0000-000000000000', 'GlobalWorker', ARRAY['visa','legal','experience'], 38, 15),
('Weekend trips from Nairobi under $200', 'Compiled a list of amazing weekend escapes from Nairobi that won''t break the bank. Hell''s Gate, Lake Naivasha, Amboseli...', 'travel', '00000000-0000-0000-0000-000000000000', 'BudgetNomad', ARRAY['travel','budget','weekends'], 31, 9);
