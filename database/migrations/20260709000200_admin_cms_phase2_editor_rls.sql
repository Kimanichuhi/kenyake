-- Admin CMS Phase 2: real, DB-enforced access for the 'editor' role.
-- Editors can view all content (incl. drafts), create/edit drafts, but
-- cannot publish or delete. Purely additive except one deliberate widening
-- of content_versions read access (see bottom).

-- =========================================================================
-- Text-status tables: destinations, wildlife_sightings, blog_posts, pages
-- (status is NOT NULL, so plain <> is safe/NULL-proof)
-- =========================================================================

CREATE POLICY "Editors can view all destinations" ON public.destinations
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create draft destinations" ON public.destinations
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');
CREATE POLICY "Editors can update destinations without publishing" ON public.destinations
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');

CREATE POLICY "Editors can view all wildlife_sightings" ON public.wildlife_sightings
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create draft wildlife_sightings" ON public.wildlife_sightings
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');
CREATE POLICY "Editors can update wildlife_sightings without publishing" ON public.wildlife_sightings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');

CREATE POLICY "Editors can view all blog_posts" ON public.blog_posts
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create draft blog_posts" ON public.blog_posts
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');
CREATE POLICY "Editors can update blog_posts without publishing" ON public.blog_posts
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');

CREATE POLICY "Editors can view all pages" ON public.pages
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create draft pages" ON public.pages
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');
CREATE POLICY "Editors can update pages without publishing" ON public.pages
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') AND status <> 'published');

-- =========================================================================
-- Boolean-status tables: communities, guides, experiences
-- (is_published is nullable; IS NOT TRUE treats NULL as "not published")
-- =========================================================================

CREATE POLICY "Editors can view all communities" ON public.communities
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create draft communities" ON public.communities
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'editor') AND is_published IS NOT TRUE);
CREATE POLICY "Editors can update communities without publishing" ON public.communities
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') AND is_published IS NOT TRUE);

CREATE POLICY "Editors can view all guides" ON public.guides
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create draft guides" ON public.guides
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'editor') AND is_published IS NOT TRUE);
CREATE POLICY "Editors can update guides without publishing" ON public.guides
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') AND is_published IS NOT TRUE);

CREATE POLICY "Editors can view all experiences" ON public.experiences
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create draft experiences" ON public.experiences
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'editor') AND is_published IS NOT TRUE);
CREATE POLICY "Editors can update experiences without publishing" ON public.experiences
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'editor') AND is_published IS NOT TRUE);

-- No DELETE policy is granted to 'editor' on any of the above tables.
-- RLS is default-deny, so editors simply cannot delete content.

-- =========================================================================
-- content_versions: widen SELECT to content_manager too (it already has
-- INSERT rights there from Phase 1 but couldn't read them back — an
-- oversight, not intentional).
-- =========================================================================
DROP POLICY "Admins can view content versions" ON public.content_versions;
CREATE POLICY "Staff can view content versions" ON public.content_versions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager'));
