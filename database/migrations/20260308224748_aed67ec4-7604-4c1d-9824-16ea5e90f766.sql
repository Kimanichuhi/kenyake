
-- Food listings table (restaurants, street food, home dining, markets)
CREATE TABLE public.food_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  listing_type TEXT NOT NULL DEFAULT 'restaurant',
  cuisine TEXT[] DEFAULT '{}'::text[],
  dietary_options TEXT[] DEFAULT '{}'::text[],
  county TEXT,
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  community_id UUID REFERENCES public.communities(id),
  description TEXT,
  short_description TEXT,
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}'::text[],
  price_range TEXT DEFAULT '$$',
  specialties TEXT[] DEFAULT '{}'::text[],
  traditional_dishes TEXT[] DEFAULT '{}'::text[],
  safety_rating INTEGER DEFAULT 3,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_farm_to_table BOOLEAN DEFAULT false,
  is_home_dining BOOLEAN DEFAULT false,
  is_community_kitchen BOOLEAN DEFAULT false,
  host_name TEXT,
  host_photo TEXT,
  host_bio TEXT,
  opening_hours TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  max_guests INTEGER DEFAULT 20,
  price_per_person INTEGER,
  price_currency TEXT DEFAULT 'KES',
  price_display TEXT,
  region TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published food listings"
  ON public.food_listings FOR SELECT
  USING (is_published = true);

-- Food recommendations (tourist-to-local sharing)
CREATE TABLE public.food_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.food_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  rating INTEGER NOT NULL,
  dish_recommended TEXT,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.food_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved recommendations"
  ON public.food_recommendations FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Auth users can post recommendations"
  ON public.food_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seed food listings
INSERT INTO public.food_listings (name, slug, listing_type, cuisine, dietary_options, county, location_name, description, short_description, price_range, specialties, traditional_dishes, safety_rating, rating, review_count, is_farm_to_table, is_home_dining, is_community_kitchen, host_name, host_bio, opening_hours, price_per_person, region, is_featured) VALUES
('The Carnivore', 'the-carnivore', 'restaurant', ARRAY['Kenyan','BBQ','Game Meat'], ARRAY['Meat-heavy','Some Vegetarian'], 'Nairobi', 'Langata Road, Nairobi', 'Iconic open-air restaurant famous for its all-you-can-eat charcoal-grilled meats served on Maasai swords. A Nairobi institution since 1980, offering game meats and traditional Kenyan BBQ.', 'Legendary nyama choma and game meat BBQ on Maasai swords.', '$$$', ARRAY['Nyama Choma','Crocodile','Ostrich','Game Platter','Lamb Ribs'], ARRAY['Nyama Choma','Mutura','Mishkaki'], 5, 4.6, 2340, false, false, false, NULL, NULL, '12:00 PM - 11:00 PM', 4500, 'Central', true),

('Mama Oliech', 'mama-oliech', 'restaurant', ARRAY['Kenyan','Luo','Fish'], ARRAY['Fish','Vegetarian Options'], 'Nairobi', 'Marcus Garvey Road, Nairobi', 'The most famous fish restaurant in Nairobi, beloved by locals and politicians alike. Mama Oliech''s tilapia and ugali is a Kenyan culinary pilgrimage.', 'Nairobi''s legendary tilapia and ugali joint.', '$$', ARRAY['Tilapia','Ugali','Sukuma Wiki','Omena','Matumbo'], ARRAY['Ugali na Samaki','Omena','Sukuma Wiki'], 4, 4.7, 1890, false, false, false, NULL, NULL, '10:00 AM - 10:00 PM', 800, 'Central', true),

('Ali Barbour''s Cave Restaurant', 'ali-barbours-cave', 'restaurant', ARRAY['Seafood','International','Swahili'], ARRAY['Seafood','Vegetarian Options','Halal Options'], 'Kwale', 'Diani Beach, South Coast', 'Dine inside a natural coral cave that is over 180,000 years old. This romantic seafood restaurant on Diani Beach serves fresh lobster and prawns under the stars.', 'Seafood fine dining in a 180,000-year-old coral cave.', '$$$', ARRAY['Lobster Thermidor','Tiger Prawns','Crab Claws','Cave Dining Experience'], ARRAY['Biryani','Coconut Fish Curry','Mahamri'], 5, 4.8, 780, false, false, false, NULL, NULL, '6:30 PM - 10:30 PM', 6500, 'Coast', true),

('K''Osewe Ranalo Foods', 'kosewe-ranalo', 'restaurant', ARRAY['Kenyan','Traditional','Luo'], ARRAY['Meat','Fish','Vegetarian'], 'Nairobi', 'Kimathi Street, Nairobi CBD', 'The people''s restaurant. K''Osewe serves hearty traditional Kenyan dishes at honest prices. Their ugali mayai is legendary among office workers and tourists.', 'Hearty traditional Kenyan dishes at honest prices.', '$', ARRAY['Ugali Mayai','Fish Stew','Matumbo','Pilau','Githeri'], ARRAY['Ugali Mayai','Matumbo','Githeri'], 4, 4.5, 1560, false, false, false, NULL, NULL, '7:00 AM - 9:00 PM', 500, 'Central', false),

('Mama Njeri''s Kitchen', 'mama-njeris-kitchen', 'home-dining', ARRAY['Kikuyu','Traditional','Farm Fresh'], ARRAY['Vegetarian','Vegan Options'], 'Nyeri', 'Tetu, Nyeri County', 'Experience authentic Kikuyu home cooking in Mama Njeri''s highland farm kitchen. She grows all her vegetables organically and cooks over a wood fire using recipes passed down four generations.', 'Authentic Kikuyu farm kitchen with four generations of recipes.', '$', ARRAY['Irio','Mukimo','Matura','Njahi','Githeri'], ARRAY['Irio','Mukimo','Njahi','Githeri','Matura'], 4, 4.9, 67, true, true, false, 'Mama Njeri', 'Fourth-generation cook who believes food connects people to the land. Her highland farm produces all ingredients served at her table.', 'Lunch: 12:00 PM, Dinner: 7:00 PM (by reservation)', 1200, 'Central Highlands', true),

('Swahili Spice Kitchen', 'swahili-spice-kitchen', 'home-dining', ARRAY['Swahili','Coastal','Arab-influenced'], ARRAY['Halal','Seafood','Vegetarian'], 'Mombasa', 'Old Town, Mombasa', 'Step into a traditional Swahili home in Mombasa Old Town and learn to cook pilau, biryani, and coastal delicacies with Bibi Fatma, whose family has been cooking for five generations.', 'Learn Swahili cooking in a traditional Old Town home.', '$$', ARRAY['Pilau','Biryani','Mbaazi wa Nazi','Mahamri','Kashata'], ARRAY['Pilau','Biryani','Wali wa Nazi','Samosa','Mbaazi'], 5, 4.8, 145, false, true, false, 'Bibi Fatma', 'Fifth-generation Swahili cook and spice trader. She teaches the art of coastal cuisine blending African, Arab, and Indian flavors.', 'Classes: 10:00 AM & 5:00 PM (by reservation)', 2500, 'Coast', true),

('Maasai Community Kitchen', 'maasai-community-kitchen', 'community-kitchen', ARRAY['Maasai','Traditional','Pastoral'], ARRAY['Meat','Dairy'], 'Narok', 'Ololaimutia, near Maasai Mara', 'A community-run kitchen where Maasai women prepare traditional pastoral foods. Learn about the significance of milk, blood, and meat in Maasai culture while sharing a communal meal.', 'Community-run Maasai pastoral food experience.', '$', ARRAY['Olpurda (meat soup)','Mursik (fermented milk)','Roast Goat','Nyama Choma'], ARRAY['Olpurda','Mursik','Roast Goat','Blood and Milk'], 3, 4.6, 89, false, false, true, 'Mama Naserian', 'Community elder and keeper of Maasai culinary traditions. She leads the women''s cooperative that runs the kitchen.', '11:00 AM - 4:00 PM (book 24hrs ahead)', 1500, 'Mara', false),

('Gikomba Market Food Court', 'gikomba-market', 'market', ARRAY['Kenyan','Street Food','Multi-ethnic'], ARRAY['Meat','Vegetarian','Vegan','Halal'], 'Nairobi', 'Gikomba, Nairobi', 'Navigate Nairobi''s largest open-air market food section with a local guide. Try mutura (Kenyan sausage), smokie pasua, roasted maize, and dozens of street snacks from every Kenyan community.', 'Nairobi''s ultimate street food adventure in the biggest market.', '$', ARRAY['Mutura','Smokie Pasua','Roasted Maize','Mandazi','Viazi Karai'], ARRAY['Mutura','Smokie Pasua','Viazi Karai','Bhajia'], 3, 4.3, 456, false, false, false, NULL, NULL, '6:00 AM - 6:00 PM', 300, 'Central', false),

('Lamu Seafood Market', 'lamu-seafood-market', 'market', ARRAY['Seafood','Swahili','Street Food'], ARRAY['Halal','Seafood','Pescatarian'], 'Lamu', 'Lamu Town Waterfront', 'Fresh-off-the-dhow seafood cooked right at the waterfront. Watch fishermen bring in the day''s catch and have it grilled with Swahili spices while sitting by the Indian Ocean.', 'Fresh dhow-caught seafood grilled waterfront with Swahili spices.', '$', ARRAY['Grilled Lobster','Octopus','King Fish','Coconut Crab','Pweza wa Nazi'], ARRAY['Pweza wa Nazi','Samaki wa Kupaka','Kamba wa Nazi'], 4, 4.7, 234, true, false, false, NULL, NULL, '10:00 AM - Sunset', 800, 'Coast', true),

('Nyama Villa', 'nyama-villa', 'restaurant', ARRAY['Kenyan','BBQ','Grill'], ARRAY['Meat-heavy','Halal'], 'Nairobi', 'Hurlingham, Nairobi', 'The go-to spot for serious nyama choma enthusiasts. Nyama Villa serves perfectly seasoned, slow-grilled goat and beef ribs in a lively outdoor setting with live Kenyan music.', 'Serious nyama choma with live Kenyan music.', '$$', ARRAY['Goat Ribs','Beef Ribs','Mutura','Kachumbari','Ugali'], ARRAY['Nyama Choma','Mutura','Kachumbari'], 4, 4.4, 890, false, false, false, NULL, NULL, '12:00 PM - 11:00 PM', 1200, 'Central', false),

('Highlands Organic Farm Table', 'highlands-farm-table', 'farm-to-table', ARRAY['Organic','Kikuyu','International Fusion'], ARRAY['Vegetarian','Vegan','Gluten-Free Options'], 'Nyandarua', 'Ol Kalou, Nyandarua County', 'A farm-to-fork dining experience in the lush Kenyan highlands. Everything on your plate was harvested that morning from the surrounding organic farm, prepared with both traditional and modern techniques.', 'Morning-harvested organic Highland produce, farm-to-fork.', '$$$', ARRAY['Highland Trout','Organic Salads','Irio Reimagined','Farm Cheese Board','Herb Garden Soup'], ARRAY['Irio','Mukimo','Nduma'], 5, 4.9, 112, true, false, false, 'Chef James Kamau', 'Former Nairobi restaurateur who returned to his family farm to pioneer organic farm-to-table dining in the Highlands.', 'Lunch: 12:30 PM, Dinner: 7:30 PM (reservation required)', 3500, 'Central Highlands', true),

('Tamarind Dhow', 'tamarind-dhow', 'restaurant', ARRAY['Seafood','Swahili','International'], ARRAY['Seafood','Vegetarian','Halal Options'], 'Mombasa', 'Nyali, Mombasa', 'Dine aboard a traditional dhow sailing through Tudor Creek. The Tamarind Dhow combines world-class seafood with a sunset sailing experience along the Mombasa coastline.', 'World-class seafood on a sailing dhow through Tudor Creek.', '$$$', ARRAY['Crab Claws','Grilled Prawns','Lobster','Dhow Cruise','Sunset Dinner'], ARRAY['Biryani ya Samaki','Kamba wa Nazi','Coconut Soup'], 5, 4.7, 567, false, false, false, NULL, NULL, 'Sunset Cruises: 5:30 PM & 8:30 PM', 7500, 'Coast', true),

('Samburu Bush Kitchen', 'samburu-bush-kitchen', 'community-kitchen', ARRAY['Samburu','Traditional','Bush Cooking'], ARRAY['Meat','Dairy','Limited Vegetarian'], 'Samburu', 'Archer''s Post, Samburu County', 'Learn bush cooking techniques from Samburu warriors. Cook over open fire in the semi-arid landscape, try nyirinyiri (dried meat) and traditional herbal teas from desert plants.', 'Bush cooking with Samburu warriors in the wild north.', '$', ARRAY['Nyirinyiri','Bush Tea','Roast Goat','Camel Milk','Wild Honey'], ARRAY['Nyirinyiri','Camel Milk','Bush Herbs Tea'], 3, 4.5, 34, false, false, true, 'Lekishon', 'Samburu warrior and bush survival expert who teaches traditional food preparation and preservation techniques.', 'Morning sessions: 8:00 AM (book 48hrs ahead)', 2000, 'Northern', false),

('Talisman Restaurant', 'talisman', 'restaurant', ARRAY['International','Fusion','African-European'], ARRAY['Vegetarian','Vegan','Gluten-Free','Kosher Options'], 'Nairobi', 'Karen, Nairobi', 'Hidden in a lush Karen garden, Talisman blends African ingredients with international techniques. Their ever-changing menu reflects seasonal produce and creative culinary fusion.', 'African-fusion fine dining hidden in a Karen garden.', '$$$', ARRAY['Duck Confit','African Risotto','Garden Salads','Craft Cocktails','Seasonal Tasting Menu'], ARRAY['Fusion dishes with Kenyan ingredients'], 5, 4.8, 1230, true, false, false, NULL, NULL, '12:00 PM - 10:30 PM (Closed Mondays)', 4000, 'Central', true),

('City Market Food Stalls', 'city-market-nairobi', 'market', ARRAY['Multi-ethnic','Kenyan','Indian','Somali'], ARRAY['Halal','Vegetarian','Vegan'], 'Nairobi', 'Muindi Mbingu Street, CBD', 'Nairobi''s historic City Market houses a vibrant food court with stalls serving cuisine from every Kenyan community. Try samosas, bhajias, pilau, and fresh tropical juices all under one roof.', 'Historic market food court with every Kenyan cuisine under one roof.', '$', ARRAY['Fresh Juice','Samosas','Bhajia','Pilau','Chapati'], ARRAY['Samosa','Bhajia','Pilau','Chapati','Madafu'], 4, 4.2, 678, false, false, false, NULL, NULL, '7:00 AM - 6:00 PM', 400, 'Central', false),

('Mijikenda Roots Kitchen', 'mijikenda-roots', 'home-dining', ARRAY['Mijikenda','Coastal Traditional','Giriama'], ARRAY['Vegetarian','Vegan','Halal'], 'Kilifi', 'Watamu, Kilifi County', 'A Giriama grandmother opens her kitchen to share centuries-old coastal recipes. Cook with coconut, cassava, and spices in a traditional makuti-roofed kitchen surrounded by palm trees.', 'Giriama grandmother''s centuries-old coastal recipes.', '$', ARRAY['Wali wa Nazi','Cassava Crisps','Coconut Beans','Palm Wine','Mkate wa Sinia'], ARRAY['Wali wa Nazi','Uji wa Wimbi','Mahamri','Mkate wa Sinia'], 4, 4.7, 56, true, true, false, 'Bibi Kadzo', 'Keeper of Giriama culinary heritage, Bibi Kadzo has been cooking these recipes for 60 years and loves sharing her knowledge with curious visitors.', 'By reservation only (book 48hrs ahead)', 1000, 'Coast', false);

-- Seed recommendations
INSERT INTO public.food_recommendations (listing_id, user_id, title, body, rating, dish_recommended) VALUES
((SELECT id FROM public.food_listings WHERE slug = 'mama-oliech'), '00000000-0000-0000-0000-000000000001', 'Best Fish in Kenya!', 'The tilapia here is absolutely incredible. Get the fried tilapia with ugali and kachumbari - it''s the authentic Kenyan experience. Come early as it gets packed by noon.', 5, 'Fried Tilapia with Ugali'),
((SELECT id FROM public.food_listings WHERE slug = 'the-carnivore'), '00000000-0000-0000-0000-000000000001', 'A Must-Visit for Meat Lovers', 'The all-you-can-eat experience is unforgettable. They bring meat on Maasai swords to your table until you surrender. Try the crocodile and ostrich - unique!', 5, 'Game Meat Platter'),
((SELECT id FROM public.food_listings WHERE slug = 'swahili-spice-kitchen'), '00000000-0000-0000-0000-000000000001', 'Life-Changing Cooking Class', 'Bibi Fatma is an incredible teacher. We learned to make pilau from scratch and the flavors were out of this world. Best food experience of my Kenya trip.', 5, 'Pilau'),
((SELECT id FROM public.food_listings WHERE slug = 'mama-njeris-kitchen'), '00000000-0000-0000-0000-000000000001', 'Authentic Highland Experience', 'Eating Mama Njeri''s irio while overlooking Mount Kenya is a spiritual experience. Everything is from her garden. Book in advance!', 5, 'Irio'),
((SELECT id FROM public.food_listings WHERE slug = 'lamu-seafood-market'), '00000000-0000-0000-0000-000000000001', 'Fresh Seafood Paradise', 'The octopus in coconut sauce (pweza wa nazi) here is the best I''ve ever had. Sit by the water and watch the dhows come in. Pure magic.', 4, 'Pweza wa Nazi');
