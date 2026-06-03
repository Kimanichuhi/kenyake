
-- Transport drivers
CREATE TABLE public.transport_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  photo_url text,
  phone text,
  bio text,
  languages text[] DEFAULT '{English,Swahili}',
  license_class text DEFAULT 'BCE',
  years_experience integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_available boolean DEFAULT true,
  is_published boolean DEFAULT true,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  total_trips integer DEFAULT 0,
  location text,
  county text,
  specializations text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published drivers" ON public.transport_drivers FOR SELECT USING (is_published = true);
CREATE POLICY "Users can register as driver" ON public.transport_drivers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Drivers can update own profile" ON public.transport_drivers FOR UPDATE USING (auth.uid() = user_id);

-- Transport vehicles
CREATE TABLE public.transport_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.transport_drivers(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL DEFAULT 'safari-van',
  name text NOT NULL,
  make text,
  model text,
  year integer,
  plate_number text,
  capacity integer DEFAULT 6,
  features text[] DEFAULT '{}',
  photo_url text,
  price_per_day integer NOT NULL DEFAULT 0,
  price_per_km integer,
  price_currency text DEFAULT 'USD',
  price_display text,
  is_available boolean DEFAULT true,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published vehicles" ON public.transport_vehicles FOR SELECT USING (is_published = true);
CREATE POLICY "Drivers can manage vehicles" ON public.transport_vehicles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_vehicles.driver_id AND transport_drivers.user_id = auth.uid())
);
CREATE POLICY "Drivers can update vehicles" ON public.transport_vehicles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_vehicles.driver_id AND transport_drivers.user_id = auth.uid())
);

-- Transport bookings
CREATE TABLE public.transport_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  driver_id uuid REFERENCES public.transport_drivers(id),
  vehicle_id uuid REFERENCES public.transport_vehicles(id),
  booking_type text NOT NULL DEFAULT 'vehicle-hire',
  pickup_location text NOT NULL,
  dropoff_location text,
  pickup_date date NOT NULL,
  pickup_time text,
  return_date date,
  passenger_count integer DEFAULT 1,
  total_price integer,
  price_currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  special_requests text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transport bookings" ON public.transport_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create transport bookings" ON public.transport_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transport bookings" ON public.transport_bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Drivers can view their bookings" ON public.transport_bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_bookings.driver_id AND transport_drivers.user_id = auth.uid())
);
CREATE POLICY "Drivers can update their bookings" ON public.transport_bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM transport_drivers WHERE transport_drivers.id = transport_bookings.driver_id AND transport_drivers.user_id = auth.uid())
);

-- Transport routes (matatu, shuttle, walking trails)
CREATE TABLE public.transport_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_type text NOT NULL DEFAULT 'matatu',
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  origin text NOT NULL,
  destination text NOT NULL,
  stops text[] DEFAULT '{}',
  distance_km numeric,
  duration_minutes integer,
  difficulty text,
  price_display text,
  frequency text,
  operating_hours text,
  vehicle_type text,
  trail_map_url text,
  elevation_gain_m integer,
  highlights text[] DEFAULT '{}',
  warnings text[] DEFAULT '{}',
  fuel_stations text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published routes" ON public.transport_routes FOR SELECT USING (is_published = true);

-- Road conditions (crowdsourced)
CREATE TABLE public.road_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  route_name text NOT NULL,
  segment text,
  condition text NOT NULL DEFAULT 'good',
  description text,
  lat double precision,
  lng double precision,
  photo_url text,
  reported_at timestamptz NOT NULL DEFAULT now(),
  is_current boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.road_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view current conditions" ON public.road_conditions FOR SELECT USING (is_current = true);
CREATE POLICY "Auth users can report conditions" ON public.road_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Park gates
CREATE TABLE public.park_gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  park_name text NOT NULL,
  gate_name text NOT NULL,
  lat double precision,
  lng double precision,
  opening_time text DEFAULT '06:00',
  closing_time text DEFAULT '18:00',
  entry_fee_resident text,
  entry_fee_nonresident text,
  entry_fee_vehicle text,
  requirements text[] DEFAULT '{}',
  notes text,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.park_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published gates" ON public.park_gates FOR SELECT USING (is_published = true);

-- Triggers
CREATE TRIGGER update_transport_drivers_updated_at BEFORE UPDATE ON public.transport_drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_bookings_updated_at BEFORE UPDATE ON public.transport_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed drivers
INSERT INTO public.transport_drivers (name, slug, bio, languages, years_experience, is_verified, rating, review_count, total_trips, location, county, specializations) VALUES
('James Kipchirchir', 'james-kipchirchir', 'Professional safari driver with encyclopedic wildlife knowledge. James can spot a leopard in a tree from 200 meters.', '{English,Swahili,Kalenjin}', 15, true, 4.9, 187, 420, 'Nairobi', 'Nairobi', '{Big Five tracking,Photography safaris,Long-distance transfers}'),
('Mercy Wangari', 'mercy-wangari', 'One of Kenya''s first female safari drivers. Mercy combines expert driving with deep cultural knowledge of every region she passes through.', '{English,Swahili,Kikuyu}', 8, true, 4.8, 134, 310, 'Nairobi', 'Nairobi', '{Cultural tours,Family safaris,Airport transfers}'),
('Hassan Omar', 'hassan-omar', 'Coastal specialist covering Mombasa, Lamu, Malindi, and Watamu. Hassan knows every shortcut and hidden beach.', '{English,Swahili,Arabic}', 12, true, 4.7, 98, 280, 'Mombasa', 'Mombasa', '{Coastal routes,Airport transfers,Dhow excursions}'),
('David Lekishon', 'david-lekishon', 'Born in Samburu, David combines off-road expertise with deep bush knowledge. He''s also a trained mechanic.', '{English,Swahili,Samburu,Maasai}', 10, true, 4.9, 76, 190, 'Nanyuki', 'Laikipia', '{Off-road specialist,Bush mechanic,Northern Kenya,Remote destinations}'),
('Grace Otieno', 'grace-otieno', 'Western Kenya specialist covering Kisumu, Kakamega, and Lake Victoria circuit. Grace is also a certified birding guide.', '{English,Swahili,Luo}', 6, true, 4.6, 52, 140, 'Kisumu', 'Kisumu', '{Western Kenya,Birding tours,Lake Victoria circuit}'),
('Peter Mutua', 'peter-mutua', 'Luxury safari specialist with VIP transport experience. Peter drives immaculately maintained Land Cruisers and provides premium service.', '{English,Swahili,Kamba,French}', 18, true, 4.9, 210, 520, 'Nairobi', 'Nairobi', '{VIP transfers,Luxury safaris,Multi-day expeditions,Helicopter coordination}');

-- Seed vehicles
INSERT INTO public.transport_vehicles (driver_id, vehicle_type, name, make, model, year, capacity, features, price_per_day, price_display, is_available) VALUES
((SELECT id FROM transport_drivers WHERE slug='james-kipchirchir'), 'safari-van', 'Safari Cruiser', 'Toyota', 'Land Cruiser 70', 2022, 6, '{Pop-up roof,Fridge,Charging ports,First aid kit,Radio comms}', 180, '$180/day', true),
((SELECT id FROM transport_drivers WHERE slug='james-kipchirchir'), 'safari-van', 'Mara Runner', 'Toyota', 'Hiace Safari', 2021, 8, '{Extended roof hatch,Cooler box,USB charging,Binocular mount}', 150, '$150/day', true),
((SELECT id FROM transport_drivers WHERE slug='mercy-wangari'), 'suv', 'Family Explorer', 'Toyota', 'Prado TX', 2023, 5, '{Air conditioning,WiFi hotspot,Child seats available,USB charging}', 160, '$160/day', true),
((SELECT id FROM transport_drivers WHERE slug='hassan-omar'), 'minivan', 'Coastal Cruiser', 'Toyota', 'Noah', 2022, 7, '{Air conditioning,WiFi,Cooler box,Beach gear storage}', 120, '$120/day', true),
((SELECT id FROM transport_drivers WHERE slug='david-lekishon'), '4x4', 'Bush Master', 'Land Rover', 'Defender 110', 2020, 4, '{Snorkel,Winch,Roof tent,Long-range fuel tank,Sand plates,Satellite phone}', 220, '$220/day', true),
((SELECT id FROM transport_drivers WHERE slug='grace-otieno'), 'suv', 'Lakeside Rider', 'Toyota', 'RAV4', 2023, 4, '{Air conditioning,Bird guide books,Binoculars,USB charging}', 100, '$100/day', true),
((SELECT id FROM transport_drivers WHERE slug='peter-mutua'), 'luxury', 'VIP Land Cruiser', 'Toyota', 'Land Cruiser 300 GR-S', 2024, 4, '{Leather interior,Mini bar,WiFi,Tinted windows,Premium sound,Charging stations}', 350, '$350/day', true),
((SELECT id FROM transport_drivers WHERE slug='peter-mutua'), 'airport-shuttle', 'Airport Express', 'Mercedes', 'V-Class', 2023, 6, '{Airport meet & greet,Luggage handling,WiFi,Water,Air conditioning}', 80, '$80/transfer', true);

-- Seed routes
INSERT INTO public.transport_routes (route_type, name, slug, description, origin, destination, stops, distance_km, duration_minutes, difficulty, price_display, frequency, operating_hours, vehicle_type, highlights, warnings, fuel_stations) VALUES
('matatu', 'Nairobi → Naivasha Express', 'nbi-naivasha', 'Fast matatu route along the Nairobi-Nakuru highway. Scenic views of the Rift Valley escarpment.', 'Nairobi (Accra Road)', 'Naivasha Town', '{Limuru,Kinungi,Mai Mahiu}', 90, 120, NULL, 'KES 400-600', 'Every 30min', '05:00-21:00', 'Matatu/Bus', '{Rift Valley viewpoint at Mai Mahiu,Great Rift Valley escarpment}', '{Sharp corners at escarpment,Heavy traffic Friday evenings}', '{Shell Limuru,Total Kinungi,Rubis Naivasha}'),
('matatu', 'Nairobi → Mombasa SGR', 'nbi-msa-sgr', 'The Madaraka Express SGR train — Kenya''s modern high-speed rail connecting Nairobi to Mombasa in under 5 hours.', 'Nairobi Terminus (Syokimau)', 'Mombasa Terminus (Miritini)', '{Athi River,Emali,Kibwezi,Voi,Mariakani}', 472, 280, NULL, 'KES 1,000-3,000', '2 departures daily', 'Dep: 08:00, 15:00', 'SGR Train', '{Tsavo landscape views,Cross the Athi River bridge,Comfortable reclining seats}', '{Book early — seats sell out,Arrive 1hr before departure}', '{}'),
('matatu', 'Mombasa → Lamu via Malindi', 'msa-lamu', 'Coastal route from Mombasa through Malindi to Lamu jetty. The last section crosses the Tana River delta.', 'Mombasa (Buxton)', 'Lamu (Mokowe Jetty)', '{Kilifi,Watamu,Malindi,Garsen,Hindi}', 340, 420, NULL, 'KES 1,200-1,800', '3 daily', '06:00-14:00', 'Bus/Matatu', '{Kilifi Bridge views,Arabuko-Sokoke Forest,Tana River delta}', '{Long journey — carry water and snacks,Security checkpoint at Hindi}', '{Shell Kilifi,Total Malindi,Kenol Garsen}'),
('shuttle', 'JKIA Airport → Nairobi CBD', 'jkia-cbd', 'Shared airport shuttle from Jomo Kenyatta International Airport to major Nairobi hotels and CBD.', 'JKIA Terminal 1/2', 'Nairobi CBD Hotels', '{Syokimau,South B,Upper Hill}', 18, 45, NULL, '$15-25', 'On demand', '24/7', 'Shuttle Van', '{Convenient hotel drop-off,Meet & greet available}', '{Traffic heavy 07:00-09:00 and 17:00-19:00}', '{}'),
('shuttle', 'Moi Airport → Diani Beach', 'moi-diani', 'Airport transfer from Mombasa Moi International Airport to Diani Beach hotels via Likoni Ferry.', 'Moi International Airport', 'Diani Beach Hotels', '{Likoni Ferry,Ukunda}', 40, 90, NULL, '$25-40', 'On demand', '24/7', 'Shuttle/Taxi', '{Likoni Ferry crossing — scenic!,Coastal road through palm trees}', '{Ferry queues can add 30-60min,Avoid Friday evening}', '{Total Likoni,Shell Ukunda}'),
('walking-trail', 'Karura Forest Loop Trail', 'karura-forest-loop', 'A beautiful 7km loop through Nairobi''s urban forest. Waterfalls, caves, bamboo groves, and abundant birdlife right in the city.', 'Karura Forest Main Gate', 'Karura Forest Main Gate (loop)', '{Waterfall viewpoint,WWII Caves,Bamboo Forest,River Crossing}', 7, 120, 'easy', 'KES 600 entry', 'Self-guided, open daily', '06:00-18:00', 'Walking', '{Waterfall,Colobus monkeys,50+ bird species,Peaceful escape from city}', '{Stay on marked trails,Don''t walk alone after 16:00}', '{}'),
('walking-trail', 'Hell''s Gate Gorge Walk', 'hells-gate-gorge', 'Walk through the dramatic gorge of Hell''s Gate — towering red cliffs, hot springs, and steam vents. The landscape that inspired Disney''s Lion King.', 'Hell''s Gate Main Gate (Elsa)', 'Fischer''s Tower (and back)', '{Obsidian Caves,Central Tower,Fischer''s Tower,Hot Springs}', 12, 240, 'moderate', 'KES 350 entry + $26 park fee', 'Guide required for gorge', '06:30-18:00', 'Walking', '{Volcanic rock formations,Hot springs,Rock climbing walls,Buffalo and giraffe}', '{Flash flood risk in gorge — check weather,Guide mandatory for lower gorge,Carry 2L+ water}', '{}'),
('walking-trail', 'Mt. Longonot Crater Trail', 'mt-longonot', 'A steep but rewarding hike to the crater rim of Mt. Longonot, an extinct volcano. Circumnavigate the crater for stunning Rift Valley views.', 'Mt. Longonot Main Gate', 'Crater Rim (and back)', '{Forest section,Crater viewpoint,Full rim circuit}', 14, 300, 'challenging', 'KES 350 entry + $26 park fee', 'Best start before 07:00', '06:00-16:00 (last entry)', 'Walking/Hiking', '{360° Rift Valley panorama,Crater floor forest,Steam vents,Unique volcanic landscape}', '{Very steep ascent,No shade — carry 3L water minimum,Start early to avoid heat,No facilities on trail}', '{}'),
('bicycle', 'Lake Naivasha Cycling Circuit', 'naivasha-cycling', 'A flat, scenic cycling route around the shores of Lake Naivasha. Pass hippo pools, flower farms, and Crescent Island.', 'Naivasha Town', 'Naivasha Town (circuit)', '{South Lake Road,Crescent Island viewpoint,Fisherman''s Camp,Kongoni}', 35, 180, 'easy', 'KES 500-1,000 bike hire', 'Self-guided', 'Daylight hours', 'Bicycle', '{Hippo spotting,Pelican flocks,Crescent Island views,Flower farm scenery}', '{Watch for hippos near road at dusk,Carry puncture kit}', '{}'),
('bicycle', 'Diani Beach Coastal Ride', 'diani-cycling', 'A relaxed beach road cycling route along Diani''s palm-lined coast. Stop at beach bars, art galleries, and the Colobus Conservation center.', 'Diani Beach Road (North)', 'Diani Beach Road (South)', '{Colobus Conservation,Art galleries,Beach bars,Kongo Mosque ruins}', 15, 90, 'easy', 'KES 800 bike hire', 'Hotels arrange hire', 'Daylight hours', 'Bicycle', '{Beach views,Colobus monkeys,Coral rag forest,Swahili ruins}', '{Sandy patches on road,Sun protection essential}', '{}');

-- Seed park gates
INSERT INTO public.park_gates (park_name, gate_name, opening_time, closing_time, entry_fee_resident, entry_fee_nonresident, entry_fee_vehicle, requirements, notes) VALUES
('Masai Mara National Reserve', 'Sekenani Gate', '06:00', '18:30', 'KES 1,500', '$80', '$10/vehicle', '{Valid ID or passport,Booking confirmation,Park smart card}', 'Main gate — busiest during migration season (Jul-Oct). Arrive early.'),
('Masai Mara National Reserve', 'Talek Gate', '06:00', '18:30', 'KES 1,500', '$80', '$10/vehicle', '{Valid ID or passport,Booking confirmation}', 'Less crowded alternative. Closer to Talek town.'),
('Amboseli National Park', 'Meshanani Gate', '06:00', '18:00', 'KES 1,000', '$60', '$5/vehicle', '{Valid ID or passport,KWS smart card}', 'Main gate with Kilimanjaro views on clear mornings.'),
('Lake Nakuru National Park', 'Main Gate', '06:00', '18:00', 'KES 860', '$60', '$5/vehicle', '{Valid ID or passport,Vehicle registration}', 'Only gate. Can queue at peak times. Buy smart card in Nakuru town to save time.'),
('Hell''s Gate National Park', 'Elsa Gate', '06:30', '18:00', 'KES 350', '$26', '$5/vehicle', '{Valid ID or passport}', 'Named after Elsa the lioness. Walking and cycling allowed inside the park.'),
('Hell''s Gate National Park', 'Olkaria Gate', '06:30', '18:00', 'KES 350', '$26', '$5/vehicle', '{Valid ID or passport}', 'Western entrance. Closer to the geothermal spa.'),
('Mt. Kenya National Park', 'Naro Moru Gate', '06:00', '18:00', 'KES 860', '$52', '$5/vehicle', '{Valid ID or passport,Climbing registration,Guide mandatory above 3500m}', 'Most popular climbing route. Register with KWS rangers.'),
('Mt. Kenya National Park', 'Sirimon Gate', '06:00', '18:00', 'KES 860', '$52', '$5/vehicle', '{Valid ID or passport,Climbing registration}', 'Drier route, better views. Less crowded than Naro Moru.'),
('Tsavo East National Park', 'Voi Gate', '06:00', '18:00', 'KES 860', '$52', '$5/vehicle', '{Valid ID or passport}', 'Main gate off Nairobi-Mombasa highway. Near Voi town for supplies.'),
('Tsavo West National Park', 'Mtito Andei Gate', '06:00', '18:00', 'KES 860', '$52', '$5/vehicle', '{Valid ID or passport}', 'Strategic midpoint between Nairobi and Mombasa.'),
('Nairobi National Park', 'Main Gate (Langata)', '06:00', '18:00', 'KES 430', '$43', '$3/vehicle', '{Valid ID or passport}', 'The only national park bordering a capital city. KWS headquarters adjacent.'),
('Aberdare National Park', 'Ruhuruini Gate', '06:00', '18:00', 'KES 860', '$52', '$5/vehicle', '{Valid ID or passport,4x4 recommended}', 'Salient area gate. Roads can be muddy in rainy season.');
