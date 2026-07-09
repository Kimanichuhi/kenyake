-- Admin CMS Phase 1: media library, destinations, blog, pages, audit/version
-- tracking, additive columns on existing content tables, and RBAC-gated RLS.
-- Requires 20260709000000_admin_cms_phase1_roles.sql to already be applied
-- (adds the 'content_manager' / 'editor' app_role values used below).

-- =========================================================================
-- Media library
-- =========================================================================
CREATE TABLE public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_bucket text NOT NULL DEFAULT 'media-library',
  storage_path text NOT NULL,
  public_url text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer,
  width integer,
  height integer,
  alt_text text,
  caption text,
  title text,
  folder text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_library_mime_type ON public.media_library (mime_type);
CREATE INDEX idx_media_library_folder ON public.media_library (folder);
CREATE INDEX idx_media_library_created_at ON public.media_library (created_at DESC);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media library" ON public.media_library
  FOR SELECT USING (true);

CREATE POLICY "Content managers can manage media library" ON public.media_library
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- Destinations (replaces the static frontend data file as source of truth)
-- =========================================================================
CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  county text NOT NULL,
  category text NOT NULL,
  description text,
  highlights text[] DEFAULT '{}',
  cover_image text,
  gallery_images text[] DEFAULT '{}',
  best_time text,
  price_display text,
  crowd_level text,
  safety_rating numeric,
  accessibility_rating numeric,
  photography_score numeric,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  lat double precision,
  lng double precision,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_destinations_status ON public.destinations (status);
CREATE INDEX idx_destinations_county ON public.destinations (county);
CREATE INDEX idx_destinations_category ON public.destinations (category);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published destinations" ON public.destinations
  FOR SELECT USING (status = 'published');

CREATE POLICY "Content managers can manage destinations" ON public.destinations
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- Blog
-- =========================================================================
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL
);

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  cover_image text,
  body_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_post_tags (
  post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_blog_posts_status ON public.blog_posts (status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts (category_id);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view blog tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view blog post tags" ON public.blog_post_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Content managers can manage blog categories" ON public.blog_categories
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage blog tags" ON public.blog_tags
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage blog posts" ON public.blog_posts
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage blog post tags" ON public.blog_post_tags
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- Pages (table only in Phase 1 — no admin UI yet; proves the block schema
-- generalizes beyond blog posts, ready for a Phase 1.5 page builder screen)
-- =========================================================================
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  body_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages" ON public.pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Content managers can manage pages" ON public.pages
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- Audit logs (trigger-populated, admin-only read, no UI in Phase 1)
-- =========================================================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  diff jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_resource ON public.audit_logs (resource_type, resource_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_resource_id uuid;
  v_diff jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_resource_id := NEW.id;
    v_diff := jsonb_build_object('after', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_resource_id := NEW.id;
    v_diff := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));
  ELSE
    v_action := 'delete';
    v_resource_id := OLD.id;
    v_diff := jsonb_build_object('before', to_jsonb(OLD));
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, diff)
  VALUES (auth.uid(), v_action, TG_TABLE_NAME, v_resource_id, v_diff);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_media_library AFTER INSERT OR UPDATE OR DELETE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_destinations AFTER INSERT OR UPDATE OR DELETE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_blog_posts AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_pages AFTER INSERT OR UPDATE OR DELETE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_guides AFTER INSERT OR UPDATE OR DELETE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_experiences AFTER INSERT OR UPDATE OR DELETE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_communities AFTER INSERT OR UPDATE OR DELETE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_wildlife_sightings AFTER INSERT OR UPDATE OR DELETE ON public.wildlife_sightings
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- =========================================================================
-- Content versions (frontend-populated on update, admin-only read)
-- =========================================================================
CREATE TABLE public.content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  snapshot jsonb NOT NULL,
  version_number integer NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_versions_resource ON public.content_versions (resource_type, resource_id, version_number DESC);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view content versions" ON public.content_versions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content managers can record content versions" ON public.content_versions
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

-- =========================================================================
-- Additive columns on existing content tables + admin/content_manager RLS
-- =========================================================================
ALTER TABLE public.wildlife_sightings
  ADD COLUMN status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.communities
  ADD COLUMN meta_title text,
  ADD COLUMN meta_description text;

ALTER TABLE public.guides
  ADD COLUMN meta_title text,
  ADD COLUMN meta_description text;

ALTER TABLE public.experiences
  ADD COLUMN meta_title text,
  ADD COLUMN meta_description text;

CREATE POLICY "Content managers can manage guides" ON public.guides
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage experiences" ON public.experiences
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage communities" ON public.communities
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Content managers can manage wildlife sightings" ON public.wildlife_sightings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));

-- =========================================================================
-- Storage bucket for admin-uploaded media
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media-library', 'media-library', true);

CREATE POLICY "Anyone can view media library files" ON storage.objects
  FOR SELECT USING (bucket_id = 'media-library');

CREATE POLICY "Content managers can upload media library files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media-library'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  );

CREATE POLICY "Content managers can update media library files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media-library'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  );

CREATE POLICY "Content managers can delete media library files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media-library'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'))
  );
