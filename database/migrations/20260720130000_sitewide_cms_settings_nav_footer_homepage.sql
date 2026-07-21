-- Sitewide CMS: settings singleton, navigation menu, footer links, and
-- homepage section composition (enable/disable + reorder), replacing
-- hardcoded content in Navbar.tsx, FooterSection.tsx, HeroSection.tsx and
-- index.html.

-- ============================================================
-- site_settings — exactly one row, enforced structurally: RLS only
-- allows UPDATE (no INSERT/DELETE), and this migration seeds the row.
-- ============================================================
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Sync Safaris',
  logo_url text,
  dark_logo_url text,
  favicon_url text,
  brand_primary_color text,
  brand_secondary_color text,
  contact_email text,
  contact_phone text,
  contact_address text,
  google_maps_url text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  linkedin_url text,
  youtube_url text,
  default_meta_title text,
  default_meta_description text,
  default_og_image text,
  google_analytics_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_site_settings AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

INSERT INTO public.site_settings (
  company_name, contact_email, contact_phone, contact_address,
  default_meta_title, default_meta_description, default_og_image
) VALUES (
  'Sync Safaris', 'hello@syncsafaris.africa', '+254 700 000 000', 'Nairobi, Kenya',
  'Sync Safaris — Explore Kenya''s Hidden Wonders',
  'AI-powered, community-centric tourism intelligence platform. Discover destinations across all 47 counties, book experiences, track wildlife.',
  NULL
);

-- ============================================================
-- nav_items — primary site navigation menu
-- ============================================================
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_label text NOT NULL,
  group_order integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  href text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible nav items" ON public.nav_items
  FOR SELECT USING (visible = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage nav items" ON public.nav_items
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE TRIGGER update_nav_items_updated_at BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_nav_items AFTER INSERT OR UPDATE OR DELETE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

INSERT INTO public.nav_items (group_label, group_order, label, href, display_order) VALUES
  ('Destinations', 1, 'All Destinations', '/destinations', 1),
  ('Destinations', 1, 'Nearby', '/nearby', 2),
  ('Destinations', 1, 'Tembea Kenya', '/domestic', 3),
  ('Experiences', 2, 'Experiences', '/experiences', 1),
  ('Experiences', 2, 'Cultural Events', '/events', 2),
  ('Experiences', 2, 'Food & Dining', '/food', 3),
  ('Experiences', 2, 'Cultural Prep', '/cultural-prep', 4),
  ('Stay & Travel', 3, 'Accommodation', '/accommodation', 1),
  ('Stay & Travel', 3, 'Transport', '/transport', 2),
  ('Stay & Travel', 3, 'Digital Nomads', '/nomads', 3),
  ('Stay & Travel', 3, 'Safety', '/safety', 4),
  ('Wildlife', 4, 'Wildlife', '/wildlife', 1),
  ('Wildlife', 4, 'Wildlife Intel', '/wildlife-intel', 2),
  ('Community', 5, 'Community', '/community', 1),
  ('Community', 5, 'Local Guides', '/guides', 2),
  ('Community', 5, 'Become a Guide', '/guide-register', 3),
  ('Community', 5, 'Group Chat', '/group-chat', 4),
  ('Community', 5, 'Marketplace', '/marketplace', 5),
  ('Community', 5, 'Heritage & Diaspora', '/heritage', 6),
  ('Community', 5, 'Your Impact', '/impact', 7),
  ('Plan', 6, 'Trip Planner', '/trip-planner', 1),
  ('Plan', 6, 'Packages', '/packages', 2),
  ('Plan', 6, 'Payments', '/payments', 3);

-- ============================================================
-- footer_links — footer link columns
-- ============================================================
CREATE TABLE public.footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_label text NOT NULL,
  column_order integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  href text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible footer links" ON public.footer_links
  FOR SELECT USING (visible = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage footer links" ON public.footer_links
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE TRIGGER update_footer_links_updated_at BEFORE UPDATE ON public.footer_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_footer_links AFTER INSERT OR UPDATE OR DELETE ON public.footer_links
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

INSERT INTO public.footer_links (column_label, column_order, label, href, display_order) VALUES
  ('Explore', 1, 'Destinations', '/destinations', 1),
  ('Explore', 1, 'Experiences', '/experiences', 2),
  ('Explore', 1, 'Wildlife Tracker', '/wildlife', 3),
  ('Explore', 1, 'Food & Dining', '/food', 4),
  ('Connect', 2, 'Local Guides', '/guides', 1),
  ('Connect', 2, 'Communities', '/community', 2),
  ('Connect', 2, 'Cultural Events', '/events', 3),
  ('Connect', 2, 'Your Impact', '/impact', 4),
  ('Resources', 3, 'Digital Nomads', '/nomads', 1),
  ('Resources', 3, 'Safety', '/safety', 2),
  ('Resources', 3, 'Install App', '/install', 3),
  ('Resources', 3, 'Create Profile', '/onboard', 4),
  ('Resources', 3, 'About Us', '/about', 5);

-- ============================================================
-- homepage_sections — enable/disable + reorder the fixed set of
-- homepage sections, plus per-section copy/image/CTA overrides.
-- ============================================================
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE CHECK (section_key IN ('hero', 'destinations', 'experiences', 'wildlife', 'community', 'cta')),
  enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  eyebrow_text text,
  heading_line1 text,
  heading_line2 text,
  subheading text,
  image_url text,
  cta_label text,
  cta_href text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled homepage sections" ON public.homepage_sections
  FOR SELECT USING (enabled = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage homepage sections" ON public.homepage_sections
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_homepage_sections AFTER INSERT OR UPDATE OR DELETE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

INSERT INTO public.homepage_sections (section_key, display_order, eyebrow_text, heading_line1, heading_line2, subheading, cta_label, cta_href) VALUES
  ('hero', 1, 'Discover the Heart of Africa', 'Explore Kenya''s', 'Hidden Wonders', 'From the great migration to ancient Swahili towns — plan your journey across all 47 counties with AI-powered travel intelligence.', 'Start Tourism Chat About Kenya', '/trip-planner'),
  ('destinations', 2, 'Top Destinations', 'Iconic Places to Explore', NULL, 'From legendary safari parks to pristine beaches and ancient towns — discover Kenya''s most breathtaking destinations.', NULL, NULL),
  ('experiences', 3, 'Local Experiences', 'Immerse in Kenyan Culture', NULL, 'Hands-on experiences hosted by local communities. Every booking directly supports the artisans, guides, and families who make Kenya unforgettable.', NULL, NULL),
  ('wildlife', 4, 'Wildlife Intelligence', 'Track the Big Five', NULL, 'Real-time sighting data from our network of guides across Kenya''s national parks.', NULL, NULL),
  ('community', 5, 'Community Impact', 'Tourism That Gives Back', NULL, 'Every booking directly supports local communities, funds conservation, and preserves cultural heritage.', NULL, NULL),
  ('cta', 6, NULL, 'Ready to Explore Kenya?', NULL, 'Create your profile to get personalized recommendations, save destinations, and track your travel impact.', 'Start Your Journey', '/onboard');

-- ============================================================
-- Seed an "about" page on the existing generic Pages CMS so the
-- new /about footer link isn't immediately a 404. Draft status —
-- an admin should review and publish via /admin/pages.
-- ============================================================
INSERT INTO public.pages (slug, title, body_blocks, status, meta_title, meta_description) VALUES (
  'about',
  'About Sync Safaris',
  '[{"id":"about-hero","type":"hero","heading":"About Sync Safaris","subheading":"An AI-powered, community-centric tourism intelligence platform for Kenya."},{"id":"about-body","type":"rich_text","html":"<p>Sync Safaris helps travelers discover Kenya beyond the usual handful of destinations, while making sure the communities behind every experience share directly in the value it creates.</p>"}]'::jsonb,
  'draft',
  'About Sync Safaris',
  'Learn about Sync Safaris, an AI-powered, community-first tourism intelligence platform for Kenya.'
);
