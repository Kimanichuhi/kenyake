-- Allow the 'editor' role to upload/manage media library files, matching
-- the roles that can already access the /admin/media page in the UI.
-- Previously only 'admin'/'content_manager' had write access, so editors
-- hit a raw RLS-rejection error when using the Dropzone.

DROP POLICY IF EXISTS "Content managers can manage media library" ON public.media_library;
CREATE POLICY "Content managers can manage media library" ON public.media_library
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager') OR public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Content managers can upload media library files" ON storage.objects;
CREATE POLICY "Content managers can upload media library files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media-library'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager') OR public.has_role(auth.uid(), 'editor'))
  );

DROP POLICY IF EXISTS "Content managers can update media library files" ON storage.objects;
CREATE POLICY "Content managers can update media library files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media-library'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager') OR public.has_role(auth.uid(), 'editor'))
  );

DROP POLICY IF EXISTS "Content managers can delete media library files" ON storage.objects;
CREATE POLICY "Content managers can delete media library files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media-library'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_manager') OR public.has_role(auth.uid(), 'editor'))
  );
