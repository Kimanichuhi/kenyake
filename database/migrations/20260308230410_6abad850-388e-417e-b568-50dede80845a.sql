
-- Budget trip packages
CREATE TABLE public.budget_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_sw TEXT,
  slug TEXT NOT NULL UNIQUE,
  budget_tier TEXT NOT NULL DEFAULT 'under_5k',
  price_kes INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER DEFAULT 2,
  destination TEXT NOT NULL,
  county TEXT,
  description TEXT,
  description_sw TEXT,
  cover_image TEXT,
  includes TEXT[] DEFAULT '{}'::text[],
  itinerary JSONB DEFAULT '[]'::jsonb,
  group_size_min INTEGER DEFAULT 1,
  group_size_max INTEGER DEFAULT 20,
  suitable_for TEXT[] DEFAULT '{}'::text[],
  transport_included BOOLEAN DEFAULT false,
  meals_included BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published packages"
  ON public.budget_packages FOR SELECT
  USING (is_published = true);

-- Group outings (school trips, corporate retreats, church groups)
CREATE TABLE public.group_outings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  outing_type TEXT NOT NULL DEFAULT 'general',
  destination TEXT,
  county TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  group_size INTEGER DEFAULT 10,
  budget_per_person INTEGER,
  total_budget INTEGER,
  status TEXT DEFAULT 'planning',
  package_id UUID REFERENCES public.budget_packages(id),
  invite_code TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.group_outings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage outings"
  ON public.group_outings FOR ALL
  USING (auth.uid() = organizer_id);

CREATE POLICY "Public outings visible to all"
  ON public.group_outings FOR SELECT
  USING (is_public = true);

-- Group outing members
CREATE TABLE public.group_outing_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outing_id UUID NOT NULL REFERENCES public.group_outings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT,
  phone TEXT,
  amount_paid INTEGER DEFAULT 0,
  amount_due INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.group_outing_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own membership"
  ON public.group_outing_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can join outings"
  ON public.group_outing_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can view members"
  ON public.group_outing_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.group_outings
    WHERE group_outings.id = group_outing_members.outing_id
    AND group_outings.organizer_id = auth.uid()
  ));

CREATE POLICY "Organizers can update members"
  ON public.group_outing_members FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.group_outings
    WHERE group_outings.id = group_outing_members.outing_id
    AND group_outings.organizer_id = auth.uid()
  ));

-- Trip savings goals
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_amount INTEGER NOT NULL,
  saved_amount INTEGER DEFAULT 0,
  target_date DATE,
  destination TEXT,
  package_id UUID REFERENCES public.budget_packages(id),
  installment_amount INTEGER,
  installment_frequency TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id);

-- Savings deposits (installment tracking)
CREATE TABLE public.savings_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'mpesa',
  mpesa_phone TEXT,
  transaction_ref TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deposits"
  ON public.savings_deposits FOR ALL
  USING (auth.uid() = user_id);

-- Loyalty rewards
CREATE TABLE public.loyalty_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'safari-starter',
  total_trips INTEGER DEFAULT 0,
  total_spent_kes INTEGER DEFAULT 0,
  member_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own account"
  ON public.loyalty_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create account"
  ON public.loyalty_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own account"
  ON public.loyalty_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Loyalty transactions
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT DEFAULT 'earn',
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn points"
  ON public.loyalty_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seed budget packages
INSERT INTO public.budget_packages (title, title_sw, slug, budget_tier, price_kes, duration_days, destination, county, description, description_sw, includes, suitable_for, transport_included, meals_included, rating, review_count, is_featured, itinerary) VALUES
('Nairobi Day Explorer', 'Mtafiti wa Siku Nairobi', 'nairobi-day-explorer', 'under_5k', 3500, 1, 'Nairobi National Park & Museum', 'Nairobi', 'Perfect budget day trip: morning game drive in Nairobi National Park followed by the National Museum. Includes park entry and museum ticket.', 'Safari ya siku nzuri: Game drive asubuhi Nairobi National Park kisha Makumbusho ya Taifa.', ARRAY['Park entry fee','Museum ticket','Guided game drive','Packed lunch'], ARRAY['solo','couple','family','students'], false, true, 4.5, 234, true, '[{"day":1,"title":"City Safari","activities":["6:00 AM - Nairobi National Park game drive","11:00 AM - National Museum tour","1:00 PM - Lunch at Carnivore"]}]'::jsonb),

('Hell''s Gate Cycling Weekend', 'Wikendi wa Baiskeli Hell''s Gate', 'hells-gate-cycling', 'under_5k', 4800, 2, 'Hell''s Gate National Park', 'Nakuru', 'Cycle through gorges alongside zebras and giraffes. Includes camping, bike hire, and park fees. One of Kenya''s most affordable national park experiences.', 'Endesha baiskeli kupitia mabonde kando ya punda milia na twiga. Kambi, kukodisha baiskeli, na ada za hifadhi.', ARRAY['Park entry','Bike hire','Campsite','Gorge walk guide','Cooking gear'], ARRAY['solo','couple','friends','students'], false, false, 4.7, 189, true, '[{"day":1,"title":"Cycling & Gorge Walk","activities":["7:00 AM - Cycle through park","12:00 PM - Gorge walk","4:00 PM - Set up camp","7:00 PM - Campfire dinner"]},{"day":2,"title":"Sunrise & Explore","activities":["6:00 AM - Sunrise ride","9:00 AM - Hot springs visit","12:00 PM - Depart"]}]'::jsonb),

('Lake Nakuru Safari', 'Safari ya Ziwa Nakuru', 'lake-nakuru-safari', 'under_10k', 8500, 2, 'Lake Nakuru National Park', 'Nakuru', 'See flamingos, rhinos, and lions at Lake Nakuru. Budget-friendly lodge accommodation with full board. Transport from Nairobi included.', 'Tazama flamingo, faru, na simba Ziwa Nakuru. Malazi ya bei nafuu na chakula. Usafiri kutoka Nairobi.', ARRAY['Return transport from Nairobi','Park entry','Lodge accommodation','All meals','Game drives'], ARRAY['family','couple','friends','corporate','church'], true, true, 4.6, 567, true, '[{"day":1,"title":"Journey & Afternoon Drive","activities":["7:00 AM - Depart Nairobi","10:00 AM - Arrive Nakuru","11:00 AM - Check in","3:00 PM - Afternoon game drive","7:00 PM - Dinner"]},{"day":2,"title":"Full Day Safari","activities":["6:00 AM - Early morning drive","8:00 AM - Breakfast","10:00 AM - Lake viewpoint","12:00 PM - Lunch & depart"]}]'::jsonb),

('Diani Beach Getaway', 'Mapumziko ya Pwani Diani', 'diani-beach-getaway', 'under_10k', 9800, 3, 'Diani Beach', 'Kwale', 'Three days of sun, sand, and Swahili culture on Kenya''s most beautiful beach. Budget beachside accommodation with breakfast.', 'Siku tatu za jua, mchanga, na utamaduni wa Kiswahili pwani nzuri zaidi ya Kenya.', ARRAY['Beachside accommodation','Daily breakfast','Snorkeling trip','Swahili cooking class'], ARRAY['couple','family','friends','honeymoon'], false, true, 4.8, 412, true, '[{"day":1,"title":"Arrival & Beach","activities":["Arrive Diani","Check in beachside","Afternoon beach & swimming","Sunset walk"]},{"day":2,"title":"Ocean Adventures","activities":["Morning snorkeling trip","Lunch at beach restaurant","Swahili cooking class","Evening bonfire"]},{"day":3,"title":"Culture & Departure","activities":["Visit Kaya forest","Shopping at local market","Depart"]}]'::jsonb),

('Maasai Mara Budget Safari', 'Safari ya Bei Nafuu Maasai Mara', 'mara-budget-safari', 'under_20k', 18500, 3, 'Maasai Mara', 'Narok', 'The classic Mara experience without the luxury price tag. Budget camp with shared facilities, all game drives, and transport from Nairobi.', 'Uzoefu wa Mara bila bei ya anasa. Kambi ya bajeti, game drive zote, na usafiri kutoka Nairobi.', ARRAY['Return transport','Park entry fees','Budget camp accommodation','All meals','3 game drives','Maasai village visit'], ARRAY['solo','couple','family','friends','corporate','church','school'], true, true, 4.7, 891, true, '[{"day":1,"title":"Journey to Mara","activities":["6:00 AM - Depart Nairobi","11:00 AM - Great Rift Valley viewpoint","1:00 PM - Arrive Mara","3:00 PM - Afternoon game drive","7:00 PM - Campfire dinner"]},{"day":2,"title":"Full Day Safari","activities":["6:00 AM - Morning game drive","9:00 AM - Breakfast","10:00 AM - Maasai village visit","3:00 PM - Afternoon drive","6:00 PM - Sunset at hippo pool"]},{"day":3,"title":"Final Drive & Return","activities":["6:00 AM - Sunrise game drive","9:00 AM - Breakfast & pack","10:00 AM - Depart for Nairobi","3:00 PM - Arrive Nairobi"]}]'::jsonb),

('Mount Kenya Day Hike', 'Kupanda Mlima Kenya Siku Moja', 'mt-kenya-day-hike', 'under_5k', 4500, 1, 'Mount Kenya - Sirimon Gate', 'Meru', 'Day hike through montane forest to the moorland zone. See unique Afro-alpine vegetation, colobus monkeys, and stunning views. Includes guide and park fees.', 'Kupanda msitu wa mlimani hadi eneo la uwanda. Tazama mimea ya kipekee, tumbili, na mandhari nzuri.', ARRAY['Park entry','Certified guide','Packed lunch','Water','First aid support'], ARRAY['solo','friends','students','fitness'], false, true, 4.6, 156, false, '[{"day":1,"title":"Highland Hike","activities":["6:00 AM - Arrive Sirimon Gate","7:00 AM - Begin hike through forest","10:00 AM - Reach moorland zone","12:00 PM - Lunch at viewpoint","2:00 PM - Descend","5:00 PM - Return to gate"]}]'::jsonb),

('Lamu Island Cultural Escape', 'Mapumziko ya Utamaduni Lamu', 'lamu-cultural-escape', 'under_20k', 16000, 3, 'Lamu Island', 'Lamu', 'Explore the UNESCO World Heritage Swahili town. Dhow sailing, Swahili cuisine, and no cars — just donkeys and narrow stone streets.', 'Gundua mji wa Kiswahili wa Urithi wa Dunia wa UNESCO. Safari ya dhau, vyakula vya Kiswahili.', ARRAY['Boat transfer to Lamu','Guesthouse accommodation','All meals','Dhow sunset cruise','Walking tour','Museum entry'], ARRAY['couple','solo','cultural','honeymoon'], true, true, 4.9, 234, true, '[{"day":1,"title":"Arrival in Lamu","activities":["Boat transfer from mainland","Check in to Swahili guesthouse","Walking tour of Old Town","Sunset dhow cruise"]},{"day":2,"title":"Culture & Cuisine","activities":["Morning cooking class","Lamu Museum visit","Shela Beach afternoon","Traditional dinner"]},{"day":3,"title":"Island Life","activities":["Sunrise at fort","Shopping at waterfront","Depart Lamu"]}]'::jsonb),

('Amboseli School Trip', 'Safari ya Shule Amboseli', 'amboseli-school-trip', 'under_10k', 7500, 2, 'Amboseli National Park', 'Kajiado', 'Educational safari perfect for school groups. Learn about elephants, Mt. Kilimanjaro ecosystems, and Maasai culture. Includes activity worksheets and guided educational talks.', 'Safari ya elimu kamili kwa vikundi vya shule. Jifunze kuhusu tembo, mifumo ya Kilimanjaro, na utamaduni wa Kimaasai.', ARRAY['Transport','Park entry','Camp accommodation','Meals','Educational guide','Activity worksheets','Certificate'], ARRAY['school','students','educational'], true, true, 4.8, 78, false, '[{"day":1,"title":"Learning Safari","activities":["6:00 AM - Depart","10:00 AM - Arrive Amboseli","11:00 AM - Elephant ecology talk","2:00 PM - Game drive with worksheet","6:00 PM - Campfire Q&A"]},{"day":2,"title":"Culture & Return","activities":["6:00 AM - Bird walk","8:00 AM - Maasai community visit","11:00 AM - Certificates & depart"]}]'::jsonb);
