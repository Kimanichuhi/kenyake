
-- Accommodations table
CREATE TABLE public.accommodations (
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

CREATE POLICY "Anyone can view published accommodations" ON public.accommodations
  FOR SELECT USING (is_published = true);

-- Accommodation bookings
CREATE TABLE public.accommodation_bookings (
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

CREATE POLICY "Users can view own accommodation bookings" ON public.accommodation_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create accommodation bookings" ON public.accommodation_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accommodation bookings" ON public.accommodation_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON public.accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accommodation_bookings_updated_at BEFORE UPDATE ON public.accommodation_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed accommodations
INSERT INTO public.accommodations (name, slug, property_type, tier, description, short_description, is_community_owned, owner_name, location_name, county, price_per_night, price_display, max_guests, rooms_available, rating, review_count, amenities, accessibility_features, wifi_speed_mbps, has_hot_water, has_generator, has_solar, impact_score, local_employment_count, local_procurement_percent, nearby_activities, group_capacity, is_featured) VALUES
('Mara Community Bandas', 'mara-community-bandas', 'banda', 'budget', 'Community-owned bandas on the edge of the Masai Mara. Simple, authentic accommodation run by local Maasai families. Wake to wildlife sounds and savannah sunrise views.', 'Authentic Maasai community bandas overlooking the Mara.', true, 'Mara Community Trust', 'Masai Mara Conservancy', 'Narok', 35, '$35', 3, 8, 4.6, 82, '{Shared bathroom,Mosquito nets,Kerosene lamps,Community meals,Campfire area}', '{Ground floor units}', NULL, false, false, true, 92, 12, 95, '{Walking safari,Beadwork workshop,Elder storytelling,Bush breakfast}', 24, true),

('Diani Backpackers Hub', 'diani-backpackers', 'hostel', 'budget', 'The coast''s friendliest backpacker hostel. Dorms and private rooms steps from Diani Beach. Community kitchen, surf board rental, and a legendary weekly beach BBQ.', 'Beachside backpacker hostel with dorms and privates at Diani.', false, 'Amani Hospitality', 'Diani Beach', 'Kwale', 18, '$18', 2, 20, 4.4, 156, '{Free WiFi,Community kitchen,Surf rental,Beach BBQ,Lockers,Laundry}', '{Wheelchair ramp,Accessible bathroom}', 25, true, true, true, 65, 8, 70, '{Snorkeling,Fishing trip,Kite surfing,Swahili cooking class}', 40, false),

('Lamu Heritage House', 'lamu-heritage-house', 'guesthouse', 'mid-range', 'A restored 18th-century Swahili townhouse in Lamu''s UNESCO World Heritage old town. Each room features traditional carved doors, Lamu beds, and courtyard views.', 'Restored Swahili townhouse in UNESCO Lamu Old Town.', true, 'Lamu Heritage Foundation', 'Lamu Old Town', 'Lamu', 95, '$95', 2, 6, 4.8, 94, '{Rooftop terrace,Traditional breakfast,WiFi,Air conditioning,Courtyard,Library}', '{Ground floor room available}', 15, true, true, true, 88, 10, 85, '{Dhow sailing,Swahili cooking,Old town walking tour,Donkey sanctuary visit}', 12, true),

('Amboseli Elephant Lodge', 'amboseli-elephant-lodge', 'lodge', 'mid-range', 'Mid-range lodge with stunning Kilimanjaro views. Community-managed property where 60% of revenue goes to local conservation and education projects.', 'Kilimanjaro-view lodge supporting local conservation.', true, 'Amboseli Community Conservancy', 'Amboseli National Park', 'Kajiado', 150, '$150', 2, 15, 4.7, 128, '{En-suite bathroom,Restaurant,Pool,WiFi,Game drives,Sundowner deck}', '{Accessible rooms,Wheelchair paths,Grab bars}', 10, true, true, true, 90, 25, 80, '{Game drives,Maasai village visit,Kilimanjaro views,Bird watching}', 30, true),

('Nakuru Flamingo Camp', 'nakuru-flamingo-camp', 'tented-camp', 'mid-range', 'Luxury tented camp on the shores of Lake Nakuru. Fall asleep to hippo calls and wake to flamingo-pink sunrises. Eco-built with 100% solar power.', 'Solar-powered tented camp on Lake Nakuru shores.', false, 'Eco Safari Camps', 'Lake Nakuru National Park', 'Nakuru', 180, '$180', 2, 10, 4.7, 73, '{En-suite tent,Solar power,Bush dinner,Guided walks,Sundowner,WiFi}', '{Accessible tent,Wide pathways}', 8, true, false, true, 78, 18, 75, '{Flamingo viewing,Rhino tracking,Cycling safari,Waterfall hike}', 20, false),

('Laikipia Star Camp', 'laikipia-star-camp', 'luxury-camp', 'luxury', 'Ultra-luxury mobile camp with just 4 tents, set in pristine Laikipia wilderness. Private chef, personal guide, star bed option, and helicopter transfers available.', 'Ultra-exclusive 4-tent camp with star beds in Laikipia.', false, 'Stellar Safaris', 'Laikipia Plateau', 'Laikipia', 650, '$650', 2, 4, 4.9, 41, '{Star bed,Private chef,Personal guide,Solar power,Bush spa,Helicopter pad,Wine cellar,Satellite WiFi}', '{Custom arrangements available}', 20, true, true, true, 72, 15, 65, '{Photography safari,Night game drive,Astro-tourism,Horse riding,Cultural visit}', 8, true),

('Taita Hills Treehouse Lodge', 'taita-treehouse', 'treehouse', 'mid-range', 'Unique treehouse lodges in the ancient Taita Hills cloud forest. Built by local carpenters using sustainable timber. Each treehouse has canopy-level views and resident colobus monkeys.', 'Treehouse lodges in the Taita Hills cloud forest.', true, 'Taita Forest Community', 'Taita Hills', 'Taita-Taveta', 120, '$120', 2, 6, 4.8, 56, '{Canopy walkway,Birding guide,Organic meals,Hot shower,Forest trails}', '{Not wheelchair accessible,Stairs required}', 5, true, false, true, 94, 14, 90, '{Forest walk,Bird watching,Homestay,Farm-to-table meal,Waterfall hike}', 12, true),

('Nyeri Highland Cottage', 'nyeri-highland-cottage', 'cottage', 'mid-range', 'Cozy stone cottages in the Nyeri highlands, surrounded by coffee and tea farms. Fireplaces, farm breakfasts, and Mt. Kenya views. A perfect base for highland exploration.', 'Stone cottages with fireplaces amid Nyeri coffee farms.', false, 'Wambui Family Estate', 'Nyeri Town', 'Nyeri', 85, '$85', 4, 4, 4.6, 67, '{Fireplace,Farm breakfast,Garden,WiFi,Mt Kenya views,Self-catering kitchen}', '{Ground floor cottage,Wide doorways}', 12, true, true, true, 75, 6, 80, '{Coffee farm tour,Mt Kenya hike,Women cooperative visit,Trout fishing}', 16, false),

('Mombasa Beach Resort', 'mombasa-beach-resort', 'resort', 'luxury', 'Full-service beachfront resort on Mombasa''s north coast. Three restaurants, two pools, dive center, and a community partnership program that funds local schools.', 'Beachfront resort with dive center and community partnerships.', false, 'Coastal Luxury Hotels', 'Nyali Beach', 'Mombasa', 280, '$280', 2, 50, 4.5, 203, '{3 Restaurants,2 Pools,Dive center,Spa,Gym,Kids club,WiFi,AC,Beach access}', '{Wheelchair accessible,Pool lift,Accessible rooms,Elevator}', 50, true, true, true, 68, 120, 55, '{Diving,Snorkeling,Old Town tour,Swahili cooking,Glass-bottom boat}', 100, false),

('Kakamega Forest Eco-Lodge', 'kakamega-eco-lodge', 'eco-lodge', 'budget', 'Simple eco-lodge at the edge of Kakamega Forest, Kenya''s last tropical rainforest. Built from local materials, powered by biogas, and staffed entirely by community members.', 'Community eco-lodge at Kenya''s last tropical rainforest.', true, 'Kakamega Forest Community', 'Kakamega Forest', 'Kakamega', 45, '$45', 2, 10, 4.5, 44, '{Biogas power,Organic meals,Guided forest walks,Birding guide,Rain gear rental}', '{Ground floor rooms}', NULL, true, false, false, 96, 8, 98, '{Rainforest walk,Birding,Primate tracking,Community school visit,Craft market}', 20, true);
