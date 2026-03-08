
-- Experiences table
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'cultural',
  subcategory text,
  description text,
  short_description text,
  host_name text NOT NULL,
  host_bio text,
  host_photo text,
  community_id uuid REFERENCES public.communities(id),
  location_name text,
  county text,
  lat double precision,
  lng double precision,
  duration_minutes integer DEFAULT 120,
  price_amount integer NOT NULL DEFAULT 0,
  price_currency text DEFAULT 'USD',
  price_display text,
  max_guests integer DEFAULT 10,
  min_guests integer DEFAULT 1,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  cover_image text,
  gallery_images text[] DEFAULT '{}',
  what_to_bring text,
  what_to_wear text,
  skill_level text DEFAULT 'beginner',
  languages text[] DEFAULT '{English}',
  includes text[] DEFAULT '{}',
  accessibility_notes text,
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  available_days text[] DEFAULT '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}',
  start_times text[] DEFAULT '{09:00,14:00}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published experiences" ON public.experiences
  FOR SELECT USING (is_published = true);

CREATE POLICY "Community managers can insert experiences" ON public.experiences
  FOR INSERT WITH CHECK (
    community_id IS NULL OR EXISTS (
      SELECT 1 FROM communities WHERE communities.id = experiences.community_id AND communities.managed_by = auth.uid()
    )
  );

CREATE POLICY "Community managers can update experiences" ON public.experiences
  FOR UPDATE USING (
    community_id IS NULL OR EXISTS (
      SELECT 1 FROM communities WHERE communities.id = experiences.community_id AND communities.managed_by = auth.uid()
    )
  );

-- Experience bookings table
CREATE TABLE public.experience_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  booking_date date NOT NULL,
  start_time text,
  guest_count integer DEFAULT 1,
  total_price integer,
  status text DEFAULT 'pending',
  special_requests text,
  contact_phone text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.experience_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.experience_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.experience_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Experience reviews
CREATE TABLE public.experience_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  booking_id uuid REFERENCES public.experience_bookings(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.experience_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can post reviews" ON public.experience_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed experiences data
INSERT INTO public.experiences (title, slug, category, subcategory, description, short_description, host_name, host_bio, location_name, county, duration_minutes, price_amount, price_display, max_guests, rating, review_count, cover_image, what_to_bring, what_to_wear, skill_level, includes, is_featured, available_days, start_times) VALUES
-- Cultural
('Maasai Beadwork Workshop', 'maasai-beadwork', 'cultural', 'craft', 'Learn the ancient art of Maasai beadwork from skilled artisans. Each color and pattern carries deep cultural significance — you''ll create your own piece while understanding the stories woven into every bead.', 'Create your own Maasai beadwork while learning the stories behind each pattern.', 'Mama Naserian', 'Master beadwork artisan with 30+ years of experience, teaching traditional Maasai beading techniques.', 'Maasai Mara Conservancy', 'Narok', 180, 45, '$45', 8, 4.9, 47, NULL, 'Sunscreen, water bottle, reading glasses if needed', 'Comfortable clothing', 'beginner', '{Materials provided,Tea and snacks,Your finished beadwork to keep}', true, '{Monday,Wednesday,Friday,Saturday}', '{09:00,14:00}'),

('Elder Storytelling Session', 'elder-storytelling', 'cultural', 'oral-history', 'Sit by the fire with community elders and listen to centuries-old stories of migration, survival, and wisdom. These oral histories have been passed down through generations and offer a profound window into Kenyan heritage.', 'Hear ancient stories from community elders around the evening fire.', 'Mzee Kamau', 'A respected Kikuyu elder and keeper of oral traditions spanning five generations.', 'Nyeri Highlands', 'Nyeri', 120, 30, '$30', 12, 4.8, 32, NULL, 'Notebook if you wish, warm layer for evenings', 'Respectful modest clothing', 'beginner', '{Translation provided,Evening tea,Storytelling circle seating}', true, '{Tuesday,Thursday,Saturday}', '{17:00}'),

('Traditional Music & Dance Participation', 'music-dance-participation', 'cultural', 'music', 'This is not a performance — you ARE the participant. Join community members in traditional dances, learn drumming rhythms, and feel the heartbeat of Kenyan culture through movement and music.', 'Join in traditional dance and drumming — participate, don''t just watch.', 'Joseph Ochieng', 'Community music teacher and cultural ambassador from Luo Nyanza.', 'Kisumu Lakeside', 'Kisumu', 150, 35, '$35', 15, 4.7, 28, NULL, 'Water bottle, energy!', 'Loose comfortable clothing, closed shoes', 'beginner', '{Drum provided,Refreshments,Cultural context explanation}', true, '{Wednesday,Friday,Sunday}', '{10:00,16:00}'),

('Samburu Traditional Medicine Garden Tour', 'medicine-garden-tour', 'cultural', 'traditional-medicine', 'Walk through a curated garden of traditional medicinal plants with a Samburu healer. Learn about indigenous botanical knowledge, sustainable harvesting, and the role of traditional medicine in modern Kenya.', 'Explore indigenous medicinal plants with a traditional Samburu healer.', 'Lekishon Lemarti', 'Third-generation Samburu herbalist preserving traditional botanical knowledge.', 'Samburu Reserve', 'Samburu', 120, 40, '$40', 6, 4.9, 19, NULL, 'Walking shoes, notebook, camera', 'Long pants (bush walking)', 'beginner', '{Herbal tea tasting,Plant identification guide,Guided nature walk}', false, '{Monday,Tuesday,Thursday,Saturday}', '{08:00,15:00}'),

-- Food & Farm
('Swahili Cooking Masterclass', 'swahili-cooking', 'food', 'cooking', 'Visit a local Mombasa market to source fresh ingredients, then learn to prepare authentic Swahili dishes — biryani, mahamri, and coconut fish curry — in a traditional coastal kitchen.', 'Market visit and hands-on Swahili cooking in a traditional coastal kitchen.', 'Bi Fatma', 'Renowned Swahili cook featured in Kenya''s culinary heritage project.', 'Old Town Mombasa', 'Mombasa', 240, 55, '$55', 8, 4.9, 63, NULL, 'Appetite! Camera optional', 'Comfortable clothes that can get messy', 'beginner', '{Market tour,All ingredients,Full meal,Recipe booklet}', true, '{Tuesday,Thursday,Saturday,Sunday}', '{09:00}'),

('Farm-to-Table Community Meal', 'farm-to-table', 'food', 'farm-visit', 'Harvest vegetables from a community organic farm, then prepare and share a traditional meal with local families. This is food as it should be — fresh, communal, and deeply connected to the land.', 'Harvest, cook, and share a meal with a farming community.', 'Grace Wambui', 'Organic farmer and community food sovereignty advocate.', 'Kiambu Highlands', 'Kiambu', 300, 50, '$50', 10, 4.8, 41, NULL, 'Sun hat, gardening shoes', 'Clothes you don''t mind getting dirty', 'beginner', '{Farm tour,Harvesting experience,Cooking session,Full communal meal}', true, '{Wednesday,Saturday,Sunday}', '{08:30}'),

('Fishing Trip with Local Fishermen', 'fishing-lamu', 'food', 'fishing', 'Join Lamu dhow fishermen at dawn for a traditional fishing trip. Learn centuries-old techniques, sail on a hand-built wooden dhow, and cook your catch on a secluded beach.', 'Dawn fishing on a traditional dhow with beach cookout.', 'Hassan Bakari', 'Fourth-generation dhow fisherman from Lamu Island.', 'Lamu Archipelago', 'Lamu', 360, 65, '$65', 6, 4.7, 22, NULL, 'Sunscreen, hat, swimwear', 'Quick-dry clothing, water shoes', 'beginner', '{Dhow sail,Fishing equipment,Beach BBQ lunch,Fresh coconut water}', false, '{Monday,Tuesday,Thursday,Friday,Saturday}', '{05:30}'),

-- Nature & Wildlife
('Guided Forest Walk — Kakamega', 'kakamega-forest-walk', 'nature', 'forest-walk', 'Explore Kenya''s last tropical rainforest with a local botanist. Spot rare primates, hundreds of bird species, and ancient trees in this biodiversity hotspot.', 'Explore Kenya''s last rainforest with a local botanist guide.', 'Dr. Wekesa Simiyu', 'PhD in tropical ecology, 15 years guiding in Kakamega Forest.', 'Kakamega Forest', 'Kakamega', 240, 40, '$40', 8, 4.8, 55, NULL, 'Binoculars, rain jacket, sturdy boots', 'Long sleeves and pants, earth tones', 'moderate', '{Expert guide,Bird checklist,Packed lunch,Park entry}', true, '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{06:30,13:00}'),

('Night Sky Astro-Tourism Experience', 'astro-tourism', 'nature', 'astro', 'Far from city lights, the Laikipia Plateau offers some of Africa''s clearest night skies. Learn constellation stories from both indigenous and astronomical perspectives with telescopes and Samburu star lore.', 'Stargaze with telescopes and indigenous star stories on the Laikipia Plateau.', 'Dr. Amina Hassan', 'Astrophysicist and indigenous knowledge researcher.', 'Laikipia Plateau', 'Laikipia', 180, 55, '$55', 10, 4.9, 17, NULL, 'Very warm layers, thermos with hot drink', 'Warm clothing — it gets cold at altitude!', 'beginner', '{Telescope viewing,Star map,Hot beverages,Blankets provided}', true, '{Friday,Saturday}', '{19:30}'),

('Birdwatching at Lake Baringo', 'baringo-birding', 'nature', 'birding', 'Lake Baringo is home to over 470 bird species. With an expert local birder, explore lakeside trails and boat routes to spot fish eagles, hornbills, and rare migrants.', 'Spot 470+ bird species with an expert local birder at Lake Baringo.', 'Kiprop Cheruiyot', 'Certified birding guide recognized by Kenya Bird Map project.', 'Lake Baringo', 'Baringo', 300, 45, '$45', 6, 4.8, 34, NULL, 'Binoculars essential, field guide, camera', 'Neutral earth-tone clothing', 'moderate', '{Expert birder guide,Boat trip,Bird checklist,Breakfast pack}', false, '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{06:00}'),

-- Adventure
('Mt. Kenya Day Hike — Naro Moru Route', 'mt-kenya-hike', 'adventure', 'hiking', 'A challenging but rewarding day hike through montane forest to the moorlands of Mt. Kenya. Professional mountain guides ensure safety while sharing knowledge of the mountain''s ecology.', 'Day hike through forest and moorlands on Africa''s second-highest peak.', 'Peter Mwangi', 'UIAA certified mountain guide with 200+ Mt. Kenya summits.', 'Naro Moru Gate', 'Nyeri', 480, 80, '$80', 8, 4.7, 48, NULL, 'Hiking boots, rain gear, water (3L), snacks, trekking poles', 'Layered system — base, insulation, waterproof', 'challenging', '{Certified guide,Park entry,Packed lunch,Emergency kit}', true, '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{06:00}'),

('Hell''s Gate Rock Climbing', 'hells-gate-climbing', 'adventure', 'rock-climbing', 'Scale the dramatic volcanic cliffs of Hell''s Gate with professional climbing instructors. Routes range from beginner to advanced on spectacular red rock towers.', 'Climb volcanic cliffs with professional instructors at Hell''s Gate.', 'Wanjiru Kamau', 'Professional climbing instructor and adventure tourism pioneer.', 'Hell''s Gate National Park', 'Nakuru', 300, 70, '$70', 6, 4.6, 29, NULL, 'Water, snacks, closed-toe shoes', 'Athletic clothing, nothing loose', 'moderate', '{All climbing gear,Professional instruction,Park entry,Snack break}', false, '{Tuesday,Thursday,Saturday,Sunday}', '{07:30}'),

('Kayaking on Lake Naivasha', 'naivasha-kayaking', 'adventure', 'kayaking', 'Paddle through papyrus channels and hippo territory on beautiful Lake Naivasha. An unforgettable wildlife encounter from water level with expert safety guides.', 'Paddle among hippos and birdlife on scenic Lake Naivasha.', 'James Otieno', 'Licensed water sports instructor and Lake Naivasha conservation guide.', 'Lake Naivasha', 'Nakuru', 180, 50, '$50', 8, 4.7, 36, NULL, 'Sunscreen, hat, dry bag for phone', 'Quick-dry clothing, water shoes, swimwear underneath', 'moderate', '{Kayak and paddle,Life jacket,Safety briefing,Guide}', false, '{Monday,Wednesday,Friday,Saturday,Sunday}', '{07:00,14:00}'),

-- Homestay & Community
('Cultural Homestay — Taita Hills', 'taita-homestay', 'homestay', 'homestay', 'Spend a night with a Taita family in the misty hills. Participate in daily life — cooking, farming, evening stories. Wake to mountain views and birdsong.', 'Overnight stay with a Taita family — cook, farm, and share stories.', 'The Mwadime Family', 'A welcoming multi-generational Taita household in the scenic hills.', 'Taita Hills', 'Taita-Taveta', 1440, 85, '$85', 4, 4.9, 26, NULL, 'Torch/headlamp, warm layer, open mind', 'Modest clothing out of respect', 'beginner', '{Dinner and breakfast,Accommodation,Farm tour,Evening storytelling}', true, '{Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday}', '{14:00}'),

('Women''s Cooperative Visit', 'womens-cooperative', 'community', 'cooperative', 'Visit a thriving women''s cooperative, learn about their craft enterprises, micro-finance success stories, and purchase directly from the artisans. Your visit funds education scholarships.', 'Meet artisans at a women''s cooperative — every purchase funds scholarships.', 'Margaret Nyokabi', 'Cooperative chairperson and women''s empowerment advocate.', 'Nyeri Town', 'Nyeri', 150, 25, '$25', 12, 4.8, 38, NULL, 'Cash for purchases (crafts available)', 'Comfortable walking shoes', 'beginner', '{Guided cooperative tour,Tea and snacks,Craft demonstration,Meet the artisans}', false, '{Monday,Tuesday,Wednesday,Thursday,Friday}', '{09:00,14:00}'),

('Community School Visit', 'school-visit', 'community', 'education', 'Coordinate a respectful visit to a rural community school. Engage with students, share skills, and understand Kenya''s education landscape. All visits are pre-arranged with teachers.', 'Pre-arranged school visit — share skills and learn alongside students.', 'Teacher Alice Akinyi', 'Headteacher passionate about cultural exchange in education.', 'Siaya County', 'Siaya', 180, 20, '$20', 8, 4.7, 21, NULL, 'Small gifts (books/stationery welcome), notebook', 'Smart casual, modest', 'beginner', '{School tour,Classroom interaction,Lunch with students,Cultural exchange}', false, '{Monday,Tuesday,Wednesday,Thursday,Friday}', '{08:30}'),

-- Photography & Volunteer
('Photography-Guided Safari Walk', 'photo-safari-walk', 'photography', 'photo-tour', 'A walking safari designed for photographers with a professional wildlife photographer guide. Learn composition, wildlife behavior anticipation, and ethical wildlife photography.', 'Walking safari with a pro photographer — learn to capture wildlife ethically.', 'Nick Odhiambo', 'Award-winning wildlife photographer published in National Geographic.', 'Ol Pejeta Conservancy', 'Laikipia', 300, 90, '$90', 6, 4.9, 44, NULL, 'Camera gear, tripod, extra batteries/cards', 'Earth-tone clothing, comfortable walking boots', 'moderate', '{Professional photo guide,Conservancy entry,Photo review session,Light refreshments}', true, '{Tuesday,Thursday,Saturday,Sunday}', '{06:00,15:00}'),

('Volunteer & Community Contribution', 'volunteer-experience', 'volunteer', 'contribution', 'Meaningful half-day volunteer experiences — tree planting, beach cleanups, school painting, or wildlife monitoring. All projects are community-designed and community-led.', 'Community-designed volunteer projects — from tree planting to wildlife monitoring.', 'Safaricom Foundation Local', 'Community-led volunteer coordination network.', 'Various Locations', 'Nairobi', 240, 15, '$15', 20, 4.6, 52, NULL, 'Work gloves, water bottle, sunscreen', 'Clothes you can work in, closed shoes', 'beginner', '{Project materials,Lunch,Certificate of contribution,Community impact report}', false, '{Monday,Wednesday,Friday,Saturday}', '{08:00}');

-- Add updated_at triggers
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_bookings_updated_at BEFORE UPDATE ON public.experience_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
