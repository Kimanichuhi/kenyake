
-- Marketplace sellers (community-verified artisans and cooperatives)
CREATE TABLE public.marketplace_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid REFERENCES public.communities(id),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  seller_type text NOT NULL DEFAULT 'individual',
  bio text,
  story text,
  photo_url text,
  location text,
  county text,
  is_cooperative boolean DEFAULT false,
  cooperative_members integer,
  is_verified boolean DEFAULT false,
  is_published boolean DEFAULT true,
  accepts_mpesa boolean DEFAULT true,
  mpesa_phone text,
  accepts_card boolean DEFAULT false,
  ships_internationally boolean DEFAULT false,
  shipping_notes text,
  accepts_commissions boolean DEFAULT false,
  commission_lead_days integer DEFAULT 14,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published sellers" ON public.marketplace_sellers
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can register as seller" ON public.marketplace_sellers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update own profile" ON public.marketplace_sellers
  FOR UPDATE USING (auth.uid() = user_id);

-- Marketplace products
CREATE TABLE public.marketplace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.marketplace_sellers(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'crafts',
  subcategory text,
  description text,
  made_by_story text,
  materials text,
  dimensions text,
  weight_grams integer,
  price_amount integer NOT NULL DEFAULT 0,
  price_currency text DEFAULT 'KES',
  price_display text,
  price_usd integer,
  images text[] DEFAULT '{}',
  cover_image text,
  in_stock boolean DEFAULT true,
  stock_count integer,
  is_preorder boolean DEFAULT false,
  preorder_lead_days integer,
  is_custom_commission boolean DEFAULT false,
  commission_starting_price integer,
  is_authentic_verified boolean DEFAULT false,
  authenticity_notes text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  order_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products" ON public.marketplace_products
  FOR SELECT USING (is_published = true);

CREATE POLICY "Sellers can insert products" ON public.marketplace_products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_products.seller_id AND marketplace_sellers.user_id = auth.uid())
  );

CREATE POLICY "Sellers can update own products" ON public.marketplace_products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_products.seller_id AND marketplace_sellers.user_id = auth.uid())
  );

-- Marketplace orders
CREATE TABLE public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id),
  seller_id uuid NOT NULL REFERENCES public.marketplace_sellers(id),
  buyer_id uuid NOT NULL,
  quantity integer DEFAULT 1,
  total_price integer NOT NULL,
  price_currency text DEFAULT 'KES',
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'mpesa',
  shipping_address text,
  shipping_country text DEFAULT 'Kenya',
  is_international boolean DEFAULT false,
  buyer_notes text,
  seller_notes text,
  is_custom_order boolean DEFAULT false,
  custom_description text,
  tracking_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own orders" ON public.marketplace_orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can create orders" ON public.marketplace_orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own orders" ON public.marketplace_orders
  FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view their orders" ON public.marketplace_orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_orders.seller_id AND marketplace_sellers.user_id = auth.uid())
  );

CREATE POLICY "Sellers can update their orders" ON public.marketplace_orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM marketplace_sellers WHERE marketplace_sellers.id = marketplace_orders.seller_id AND marketplace_sellers.user_id = auth.uid())
  );

-- Triggers
CREATE TRIGGER update_marketplace_sellers_updated_at BEFORE UPDATE ON public.marketplace_sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON public.marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed sellers
INSERT INTO public.marketplace_sellers (name, slug, seller_type, bio, story, location, county, is_cooperative, cooperative_members, is_verified, accepts_mpesa, ships_internationally, accepts_commissions, commission_lead_days, rating, review_count, total_sales) VALUES
('Naserian Beadwork Collective', 'naserian-beadwork', 'cooperative', 'A women''s cooperative of 24 Maasai beadwork artisans from the Mara region.', 'Founded in 2012 by Mama Naserian after she realized that tourist middlemen were taking 80% of the value of their beadwork. Today, every shilling goes directly to the artisans. Each piece takes 3-7 days and tells a story through color and pattern.', 'Masai Mara', 'Narok', true, 24, true, true, true, true, 14, 4.9, 156, 1240),
('Kazuri Pottery Studio', 'kazuri-pottery', 'cooperative', 'Hand-painted ceramic beads and pottery made by single mothers in Karen, Nairobi.', 'Kazuri means "small and beautiful" in Swahili. Started as a project to employ two single mothers, now supporting over 340 women. Each bead is hand-shaped and hand-painted — no two are exactly alike.', 'Karen', 'Nairobi', true, 340, true, true, true, false, 0, 4.8, 203, 3800),
('Kamba Woodcarvers Guild', 'kamba-woodcarvers', 'cooperative', 'Master woodcarvers from the Kamba community creating sculptures from sustainable local timber.', 'The Akamba people have been carving wood for centuries. Our guild trains young carvers in traditional techniques while innovating with contemporary designs. We only use ethically sourced wood from managed forests.', 'Wamunyu', 'Machakos', true, 18, true, true, true, true, 21, 4.7, 89, 620),
('Lamu Dhow Crafts', 'lamu-dhow-crafts', 'individual', 'Master craftsman creating miniature dhow models and Swahili furniture from reclaimed boat wood.', 'Hassan''s family has built dhows in Lamu for five generations. When old boats retire, he transforms their wood into beautiful furniture and intricate ship models — preserving maritime heritage one piece at a time.', 'Lamu Old Town', 'Lamu', false, NULL, true, true, true, true, 30, 4.9, 67, 280),
('Mt. Kenya Honey Cooperative', 'mt-kenya-honey', 'cooperative', 'Organic honey and beeswax products from community apiaries on Mt. Kenya slopes.', 'Our beekeepers place hives in the indigenous forests of Mt. Kenya, producing some of the purest honey in East Africa. Every jar supports forest conservation — healthy bees need healthy forests.', 'Meru', 'Meru', true, 45, true, true, true, false, 0, 4.8, 112, 890),
('Turkana Basket Weavers', 'turkana-baskets', 'cooperative', 'Intricate palm leaf baskets woven by Turkana women, each taking days to complete.', 'In Turkana tradition, basket weaving is both practical and artistic. These baskets carry water, store grain, and tell stories. Our cooperative ensures fair pay for the incredible skill and time each piece demands.', 'Lodwar', 'Turkana', true, 32, true, true, true, true, 10, 4.7, 74, 510),
('Kitenge Studio Nairobi', 'kitenge-studio', 'individual', 'Contemporary fashion and home decor using traditional East African kitenge fabrics.', 'Amara turns bold African textiles into modern accessories and home pieces. Every product starts with hand-selected vintage or new kitenge fabric sourced from markets across Kenya and Tanzania.', 'Westlands', 'Nairobi', false, NULL, true, true, true, true, 7, 4.6, 95, 440),
('Samburu Herbalist Collective', 'samburu-herbs', 'cooperative', 'Sustainably harvested traditional herbs, teas, and botanical products from Samburu County.', 'Our herbalists have passed knowledge of the land''s healing plants through generations. We now package this wisdom into teas, balms, and dried herbs — always harvested sustainably with respect for the ecosystem.', 'Maralal', 'Samburu', true, 15, true, true, true, false, 0, 4.8, 58, 370);

-- Seed products
INSERT INTO public.marketplace_products (seller_id, title, slug, category, subcategory, description, made_by_story, materials, price_amount, price_currency, price_display, price_usd, in_stock, stock_count, is_authentic_verified, tags, is_featured) VALUES
-- Naserian Beadwork
((SELECT id FROM marketplace_sellers WHERE slug = 'naserian-beadwork'), 'Maasai Wedding Necklace', 'maasai-wedding-necklace', 'beadwork', 'necklace', 'A stunning multi-layered beaded necklace traditionally worn by Maasai brides. Each color represents a blessing — white for purity, blue for water, red for bravery.', 'Handcrafted by Mama Naserian herself over 5 days. The pattern is unique to her family lineage and carries blessings for the wearer.', 'Glass beads, leather backing, copper wire', 8500, 'KES', 'KES 8,500', 65, true, 5, true, '{beadwork,wedding,traditional,gift}', true),
((SELECT id FROM marketplace_sellers WHERE slug = 'naserian-beadwork'), 'Beaded Bracelet Set (5 pieces)', 'beaded-bracelet-set', 'beadwork', 'bracelet', 'Set of 5 colorful Maasai beaded bracelets. Each bracelet tells a different story through its pattern and color combination.', 'Made by young women in the cooperative learning from master beaders. Your purchase funds their training.', 'Glass seed beads, elastic cord', 2500, 'KES', 'KES 2,500', 20, true, 30, true, '{beadwork,bracelet,colorful,gift}', true),
((SELECT id FROM marketplace_sellers WHERE slug = 'naserian-beadwork'), 'Custom Beadwork Commission', 'custom-beadwork', 'beadwork', 'custom', 'Commission a custom beadwork piece — necklace, belt, or decorative panel — with your choice of colors and patterns. Includes a consultation with the artisan.', 'The artisan will work with you to create something truly personal, incorporating traditional patterns with your preferences.', 'Glass beads, your choice of backing', 5000, 'KES', 'From KES 5,000', 38, true, NULL, true, '{custom,commission,beadwork,personalized}', false),

-- Kazuri Pottery
((SELECT id FROM marketplace_sellers WHERE slug = 'kazuri-pottery'), 'Hand-Painted Ceramic Necklace', 'kazuri-ceramic-necklace', 'pottery', 'necklace', 'Vibrant hand-painted ceramic bead necklace. Each bead is individually shaped and painted by the artisans of Kazuri.', 'Made by Grace, who has been with Kazuri for 12 years. She paints each bead while her daughter naps — each one carries a mother''s love.', 'Kiln-fired ceramic, cotton cord', 3200, 'KES', 'KES 3,200', 25, true, 20, true, '{ceramic,handpainted,necklace,colorful}', true),
((SELECT id FROM marketplace_sellers WHERE slug = 'kazuri-pottery'), 'Ceramic Serving Bowl (Large)', 'kazuri-serving-bowl', 'pottery', 'bowl', 'Large hand-painted serving bowl with traditional Kenyan motifs. Food-safe glaze, microwave and dishwasher safe.', 'Each bowl is coil-built by hand — a technique that takes years to master. The geometric patterns are inspired by Kikuyu basket weaving.', 'Kiln-fired ceramic, food-safe glaze', 4500, 'KES', 'KES 4,500', 35, true, 8, true, '{pottery,bowl,kitchen,handmade}', false),

-- Kamba Woodcarvers
((SELECT id FROM marketplace_sellers WHERE slug = 'kamba-woodcarvers'), 'Carved Ebony Elephant (Medium)', 'ebony-elephant', 'woodcarving', 'sculpture', 'Beautifully detailed elephant sculpture carved from sustainable ebony. Every grain of the wood is visible, giving each piece a unique character.', 'Carved by Muthoka, a third-generation carver who learned from his grandfather. He can feel the animal hiding in the wood before he begins carving.', 'Sustainable ebony wood', 6000, 'KES', 'KES 6,000', 46, true, 12, true, '{woodcarving,elephant,ebony,sculpture}', true),
((SELECT id FROM marketplace_sellers WHERE slug = 'kamba-woodcarvers'), 'Wooden Chess Set — African Wildlife', 'wildlife-chess-set', 'woodcarving', 'game', 'Hand-carved chess set featuring Kenya''s Big Five and other wildlife. Each piece is a miniature sculpture. Board included.', 'A collaborative work — each piece carved by a different guild member, then assembled. It takes the whole village to make a chess set!', 'Mpingo wood, rosewood board', 15000, 'KES', 'KES 15,000', 115, true, 3, true, '{chess,woodcarving,wildlife,gift,luxury}', true),

-- Lamu Dhow Crafts
((SELECT id FROM marketplace_sellers WHERE slug = 'lamu-dhow-crafts'), 'Miniature Dhow Model (40cm)', 'dhow-model-40cm', 'woodcarving', 'model', 'Detailed miniature of a traditional Lamu dhow, complete with cotton sails and brass fittings. Made from reclaimed boat wood.', 'Built by Hassan using wood from a 60-year-old fishing dhow that sailed the Lamu archipelago. The wood carries decades of sea salt and stories.', 'Reclaimed teak, cotton, brass', 12000, 'KES', 'KES 12,000', 92, true, 4, true, '{dhow,model,maritime,lamu,nautical}', true),

-- Mt. Kenya Honey
((SELECT id FROM marketplace_sellers WHERE slug = 'mt-kenya-honey'), 'Wild Forest Honey (500g)', 'wild-forest-honey-500g', 'food', 'honey', 'Pure, unprocessed wild honey from beehives in the indigenous forests of Mt. Kenya. Rich amber color with complex floral notes.', 'Harvested by our experienced beekeepers using traditional low-smoke methods that don''t disturb the colonies. Each jar is batch-numbered to its source hive.', 'Pure wild honey', 1200, 'KES', 'KES 1,200', 9, true, 50, true, '{honey,organic,food,mtkenya}', true),
((SELECT id FROM marketplace_sellers WHERE slug = 'mt-kenya-honey'), 'Beeswax Candle Set (3 pieces)', 'beeswax-candles-3pk', 'food', 'candles', 'Hand-rolled pure beeswax candles with a natural honey scent. Burns clean and long.', 'Made from the wax of the same hives that produce our honey. Nothing is wasted — the bees'' entire gift is honored.', 'Pure beeswax, cotton wick', 800, 'KES', 'KES 800', 6, true, 25, true, '{candles,beeswax,natural,home}', false),

-- Turkana Baskets
((SELECT id FROM marketplace_sellers WHERE slug = 'turkana-baskets'), 'Woven Palm Basket (Large)', 'turkana-palm-basket-large', 'textiles', 'basket', 'Large hand-woven palm leaf basket with intricate geometric patterns. Takes approximately 4 days to complete.', 'Woven by Akiru, who learned from her grandmother. The pattern in this basket tells the story of the seasonal rains — essential to Turkana life.', 'Doum palm leaves, sisal fiber', 4000, 'KES', 'KES 4,000', 31, true, 8, true, '{basket,woven,palm,traditional}', true),

-- Kitenge Studio
((SELECT id FROM marketplace_sellers WHERE slug = 'kitenge-studio'), 'Kitenge Tote Bag', 'kitenge-tote-bag', 'textiles', 'bag', 'Vibrant tote bag made from genuine East African kitenge fabric with leather handles. Fully lined with interior pocket.', 'Amara selects each kitenge personally from Nairobi''s Gikomba market. No two bags use the same fabric — yours is one of a kind.', 'Kitenge cotton fabric, leather handles, cotton lining', 3500, 'KES', 'KES 3,500', 27, true, 15, true, '{kitenge,bag,fashion,african-print}', true),
((SELECT id FROM marketplace_sellers WHERE slug = 'kitenge-studio'), 'Kitenge Cushion Cover Set (2)', 'kitenge-cushion-covers', 'textiles', 'home-decor', 'Set of 2 cushion covers in complementary kitenge prints. Zip closure, fits standard 45x45cm cushions.', 'These prints are from a vintage collection Amara found in a Mombasa market — the fabric is no longer produced, making each set truly unique.', 'Kitenge cotton, zip closure', 2800, 'KES', 'KES 2,800', 22, true, 10, true, '{kitenge,cushion,home,decor}', false),

-- Samburu Herbs
((SELECT id FROM marketplace_sellers WHERE slug = 'samburu-herbs'), 'Samburu Wellness Tea Blend', 'samburu-wellness-tea', 'food', 'tea', 'A soothing herbal tea blend using traditional Samburu medicinal plants. Caffeine-free, hand-dried and blended.', 'Each herb is wildcrafted by our collectors who follow the seasons. The blend recipe comes from a healer''s formula passed down three generations.', 'Dried herbs: lemon grass, African basil, wild mint, rosemary', 600, 'KES', 'KES 600', 5, true, 40, true, '{tea,herbal,wellness,samburu}', true),
((SELECT id FROM marketplace_sellers WHERE slug = 'samburu-herbs'), 'Traditional Healing Balm', 'healing-balm', 'food', 'balm', 'All-natural skin balm made with shea butter and traditional Samburu medicinal plant extracts. Soothes dry skin, insect bites, and minor irritations.', 'Our herbalist Lekishon personally prepares each batch, infusing the shea butter with plants he''s identified and harvested from the Samburu landscape.', 'Shea butter, beeswax, plant extracts', 900, 'KES', 'KES 900', 7, true, 20, true, '{balm,natural,skincare,traditional}', false);
