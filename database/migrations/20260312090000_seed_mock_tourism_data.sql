-- Seed mock tourism data into internal tables

-- Destinations table for AI queries
create table if not exists destinations (
  id text primary key,
  name text not null,
  county text,
  category text,
  rating numeric,
  reviews integer,
  crowd_level text,
  best_time text,
  price text,
  description text,
  highlights text[],
  safety_rating integer,
  accessibility_rating integer,
  photography_score integer,
  lat double precision,
  lng double precision,
  image text,
  gallery text[],
  created_at timestamptz default now()
);

insert into destinations (
  id, name, county, category, rating, reviews, crowd_level, best_time, price, description, highlights,
  safety_rating, accessibility_rating, photography_score, lat, lng, image, gallery
) values
  (
    'maasai-mara',
    'Maasai Mara',
    'Narok County',
    'Wildlife Safari',
    4.9,
    2340,
    'Medium',
    'Jul — Oct',
    'From $120/day',
    'The Maasai Mara National Reserve is Kenya''s most famous wildlife destination, renowned for the annual Great Wildebeest Migration and Big Five sightings.',
    array['Great Wildebeest Migration','Big Five sightings','Hot air balloon safaris','Maasai cultural visits','Night game drives','Photography safaris'],
    4, 3, 5,
    -1.4061, 35.0124,
    'dest-mara.jpg',
    array['dest-mara.jpg','mara-crossing.jpg','mara-camp.jpg','mara-balloon.jpg','mara-cheetah.jpg']
  ),
  (
    'amboseli',
    'Amboseli National Park',
    'Kajiado County',
    'Wildlife Safari',
    4.8,
    1890,
    'Low',
    'Jun — Oct',
    'From $95/day',
    'Amboseli is famous for its large elephant herds and iconic views of Mount Kilimanjaro.',
    array['Elephant herds','Kilimanjaro views','Swamp wildlife','Birdwatching','Cultural visits'],
    4, 3, 4,
    -2.6441, 37.2536,
    'dest-amboseli.jpg',
    array['dest-amboseli.jpg']
  ),
  (
    'lamu',
    'Lamu Old Town',
    'Lamu County',
    'Culture & Heritage',
    4.7,
    980,
    'Low',
    'Nov — Mar',
    'From $60/day',
    'Lamu Old Town is the oldest continuously inhabited Swahili settlement in East Africa and a UNESCO World Heritage Site.',
    array['UNESCO World Heritage Site','Swahili architecture','Dhow sailing trips','Lamu Cultural Festival','Donkey sanctuary','Shela Beach'],
    4, 4, 4,
    -2.2696, 40.9020,
    'dest-lamu.jpg',
    array['dest-lamu.jpg','community-market.jpg','dest-diani.jpg']
  )
on conflict (id) do nothing;

-- Communities (community profiles)
with community_seed as (
  insert into communities (id, name, county, slug, is_published, description, region, created_at)
  values
    (gen_random_uuid(), 'Maasai of Narok', 'Narok County', 'maasai-of-narok', true, 'Maasai community known for rich cultural traditions and wildlife stewardship.', 'Rift Valley', now()),
    (gen_random_uuid(), 'Lamu Heritage Council', 'Lamu County', 'lamu-heritage-council', true, 'Swahili coastal heritage guardians with deep historical knowledge.', 'Coast', now()),
    (gen_random_uuid(), 'Samburu Women''s Cooperative', 'Samburu County', 'samburu-womens-cooperative', true, 'Women-led cooperative preserving Samburu beadwork and storytelling.', 'Northern Kenya', now())
  on conflict (slug) do nothing
  returning id, name
)
insert into community_events (
  community_id, title, slug, start_date, event_type, description, county, location_name, price,
  is_published, is_past, updated_at
)
select
  c.id,
  v.title,
  v.slug,
  v.start_date,
  v.event_type,
  v.description,
  v.county,
  v.location_name,
  v.price,
  true,
  false,
  now()
from community_seed c
join (
  values
    ('Maasai of Narok','Maasai Warrior Graduation Ceremony','maasai-warrior-graduation','2026-03-15','ceremony',
     'Witness the sacred eunoto ceremony where junior warriors graduate to senior warrior status.','Narok County','Maasai Mara','150'),
    ('Lamu Heritage Council','Lamu Cultural Festival','lamu-cultural-festival','2026-11-20','festival',
     'East Africa''s largest cultural festival celebrating Swahili heritage through dhow sailing, music, and poetry.','Lamu County','Lamu Old Town','Free Entry'),
    ('Samburu Women''s Cooperative','Samburu Beading Market Day','samburu-beading-market','2026-01-06','market',
     'Weekly market where Samburu women sell handcrafted beadwork and share cultural stories.','Samburu County','Samburu','Free Entry')
) as v(community_name,title,slug,start_date,event_type,description,county,location_name,price)
on c.name = v.community_name
on conflict (slug) do nothing;

-- Heritage (cultural programmes)
insert into cultural_programmes (id, title, slug, description, community_id, is_published, updated_at, created_at)
select
  gen_random_uuid(),
  'Swahili Heritage Immersion',
  'swahili-heritage-immersion',
  'A short cultural programme covering Swahili history, architecture, and traditional crafts in Lamu.',
  c.id,
  true,
  now(),
  now()
from communities c
where c.slug = 'lamu-heritage-council'
on conflict (slug) do nothing;

-- Guides
insert into guides (
  id, name, slug, bio, languages, specializations, certifications, rating, review_count,
  years_experience, location, county, price_per_day, price_currency, is_available, is_published,
  is_verified, updated_at, created_at, user_id
)
values
  (
    gen_random_uuid(), 'David Ole Sankale', 'david-ole-sankale',
    'Born and raised in the Maasai Mara, David has been guiding safaris for over 15 years.',
    array['English','Swahili','Maasai','German'],
    array['Wildlife Safari','Big Five Tracking','Photography','Night Drives'],
    array['KWS Bronze Guide','First Aid Certified','4WD Advanced'],
    4.9, 342, 15, 'Maasai Mara', 'Narok County', 120, 'USD',
    true, true, true, now(), now(), gen_random_uuid()
  ),
  (
    gen_random_uuid(), 'Faith Wanjiku', 'faith-wanjiku',
    'A passionate birder and nature guide specializing in Mount Kenya treks and forest walks.',
    array['English','Swahili','French'],
    array['Birding','Hiking','Forest Ecology','Cultural Heritage'],
    array['KWS Silver Guide','Mountain Rescue','Wilderness First Responder'],
    4.8, 189, 8, 'Mount Kenya Region', 'Nyeri County', 95, 'USD',
    true, true, true, now(), now(), gen_random_uuid()
  ),
  (
    gen_random_uuid(), 'Omar Ali Hassan', 'omar-ali-hassan',
    'A sixth-generation Lamu resident offering Swahili coast experiences including dhow sailing.',
    array['English','Swahili','Arabic','Italian'],
    array['Coastal Heritage','Dhow Sailing','Marine Wildlife','History'],
    array['PADI Divemaster','First Aid','Boat Captain License'],
    4.7, 156, 12, 'Lamu Island', 'Lamu County', 85, 'USD',
    false, true, true, now(), now(), gen_random_uuid()
  )
on conflict (slug) do nothing;

-- Experiences
insert into experiences (
  id, title, slug, category, host_name, price_amount, price_currency, price_display,
  short_description, duration_minutes, location_name, county, is_published, updated_at, created_at
)
values
  (
    gen_random_uuid(), 'Maasai Beadwork Workshop', 'maasai-beadwork-workshop',
    'Culture', 'Maasai Artisans', 45, 'USD', '$45',
    'Learn traditional Maasai beadwork from master artisans in a community-run workshop.',
    120, 'Maasai Mara', 'Narok County', true, now(), now()
  ),
  (
    gen_random_uuid(), 'Swahili Cooking Class', 'swahili-cooking-class',
    'Food', 'Swahili Hosts', 35, 'USD', '$35',
    'Cook coastal Swahili dishes and learn spice blends with local chefs.',
    150, 'Lamu', 'Lamu County', true, now(), now()
  ),
  (
    gen_random_uuid(), 'Walking Safari Experience', 'walking-safari-experience',
    'Wildlife', 'Conservancy Rangers', 60, 'USD', '$60',
    'A guided walking safari with rangers focused on tracking and ecology.',
    180, 'Amboseli', 'Kajiado County', true, now(), now()
  )
on conflict (slug) do nothing;

-- Food listings
insert into food_listings (
  id, name, slug, listing_type, county, cuisine, dietary_options, price_range,
  specialties, safety_rating, is_published, created_at
)
values
  (
    gen_random_uuid(), 'The Carnivore', 'the-carnivore', 'restaurant', 'Nairobi',
    array['Kenyan','BBQ','Game Meat'], array['Meat-heavy','Some Vegetarian'], '$$$',
    array['Nyama Choma','Crocodile','Ostrich','Game Platter'], 5, true, now()
  ),
  (
    gen_random_uuid(), 'Mama Oliech', 'mama-oliech', 'restaurant', 'Nairobi',
    array['Kenyan','Luo','Fish'], array['Fish','Some Vegetarian'], '$$',
    array['Tilapia','Ugali','Sukuma Wiki','Omena'], 4, true, now()
  ),
  (
    gen_random_uuid(), 'Ali Barbour''s Cave Restaurant', 'ali-barbour-cave', 'restaurant', 'Kwale',
    array['Seafood','International','Swahili'], array['Seafood','Vegetarian Options'], '$$$',
    array['Lobster','Prawns','Cave Dining Experience'], 5, true, now()
  ),
  (
    gen_random_uuid(), 'K''Osewe Ranalo Foods', 'kosewe-ranalo', 'restaurant', 'Nairobi',
    array['Kenyan','Traditional'], array['Meat','Fish','Vegetarian'], '$',
    array['Ugali Mayai','Fish Stew','Matumbo'], 4, true, now()
  )
on conflict (slug) do nothing;

-- Transport (routes + vehicles)
insert into transport_routes (
  id, name, slug, route_type, origin, destination, is_published, created_at
)
values
  (gen_random_uuid(), 'Nairobi to Maasai Mara Route', 'nairobi-maasai-mara', 'road', 'Nairobi', 'Maasai Mara', true, now()),
  (gen_random_uuid(), 'Mombasa to Diani Beach Route', 'mombasa-diani', 'road', 'Mombasa', 'Diani Beach', true, now())
on conflict (slug) do nothing;

insert into transport_vehicles (
  id, name, vehicle_type, price_per_day, price_currency, is_published, is_available, created_at
)
values
  (gen_random_uuid(), 'Safari 4x4 Land Cruiser', '4x4', 180, 'USD', true, true, now()),
  (gen_random_uuid(), 'Safari Minivan', 'safari-van', 120, 'USD', true, true, now())
on conflict do nothing;

-- Marketplace (seller + products)
with seller as (
  insert into marketplace_sellers (id, name, slug, seller_type, is_published, updated_at, created_at)
  values (gen_random_uuid(), 'Kenyan Artisan Cooperative', 'kenyan-artisan-cooperative', 'cooperative', true, now(), now())
  on conflict (slug) do nothing
  returning id
)
insert into marketplace_products (
  id, title, slug, category, price_amount, price_currency, price_display, seller_id, is_published
)
select
  gen_random_uuid(), 'Handmade Maasai Beadwork', 'maasai-beadwork', 'Crafts', 25, 'USD', '$25', seller.id, true
from seller
on conflict (slug) do nothing;

-- Safety alerts (from mock advisories)
insert into safety_alerts (
  id, title, region, message, severity, alert_type, is_active, updated_at, created_at
)
values
  (gen_random_uuid(), 'Nairobi Advisory', 'Nairobi', 'Standard precautions advised. Avoid walking alone at night in unfamiliar areas.', 'low', 'advisory', true, now(), now()),
  (gen_random_uuid(), 'Maasai Mara Advisory', 'Maasai Mara', 'Safe for tourism. Follow park rules and guide instructions.', 'low', 'advisory', true, now(), now()),
  (gen_random_uuid(), 'Coastal Region Advisory', 'Coastal Region', 'Safe for tourism. Be aware of ocean conditions.', 'low', 'advisory', true, now(), now()),
  (gen_random_uuid(), 'Northern Kenya Advisory', 'Northern Kenya', 'Some areas require permits. Travel with reputable operators.', 'medium', 'advisory', true, now(), now())
on conflict do nothing;
