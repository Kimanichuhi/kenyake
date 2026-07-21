-- Harden media library storage policies against Storage schema validation
-- errors. Supabase Storage evaluates these policies during upload; keeping the
-- role check text-based avoids enum literal/cast incompatibilities in the
-- storage policy path while still checking the canonical user_roles table.

CREATE OR REPLACE FUNCTION public.has_role_text(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role_text(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_text(uuid, text) TO service_role;

DROP POLICY IF EXISTS "Content managers can manage media library" ON public.media_library;
CREATE POLICY "Content managers can manage media library" ON public.media_library
  FOR ALL
  TO authenticated
  USING (
    public.has_role_text(auth.uid(), 'admin')
    OR public.has_role_text(auth.uid(), 'content_manager')
    OR public.has_role_text(auth.uid(), 'editor')
  )
  WITH CHECK (
    public.has_role_text(auth.uid(), 'admin')
    OR public.has_role_text(auth.uid(), 'content_manager')
    OR public.has_role_text(auth.uid(), 'editor')
  );

DROP POLICY IF EXISTS "Content managers can upload media library files" ON storage.objects;
CREATE POLICY "Content managers can upload media library files" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media-library'
    AND (
      public.has_role_text(auth.uid(), 'admin')
      OR public.has_role_text(auth.uid(), 'content_manager')
      OR public.has_role_text(auth.uid(), 'editor')
    )
  );

DROP POLICY IF EXISTS "Content managers can update media library files" ON storage.objects;
CREATE POLICY "Content managers can update media library files" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media-library'
    AND (
      public.has_role_text(auth.uid(), 'admin')
      OR public.has_role_text(auth.uid(), 'content_manager')
      OR public.has_role_text(auth.uid(), 'editor')
    )
  )
  WITH CHECK (
    bucket_id = 'media-library'
    AND (
      public.has_role_text(auth.uid(), 'admin')
      OR public.has_role_text(auth.uid(), 'content_manager')
      OR public.has_role_text(auth.uid(), 'editor')
    )
  );

DROP POLICY IF EXISTS "Content managers can delete media library files" ON storage.objects;
CREATE POLICY "Content managers can delete media library files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media-library'
    AND (
      public.has_role_text(auth.uid(), 'admin')
      OR public.has_role_text(auth.uid(), 'content_manager')
      OR public.has_role_text(auth.uid(), 'editor')
    )
  );
