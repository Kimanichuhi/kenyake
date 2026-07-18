-- Partner Onboarding & Verification Portal: storage buckets.
-- business-documents is PRIVATE (certificates/ID/insurance/tax docs) —
-- both owner and admin must use createSignedUrl(), not getPublicUrl().
-- business-media is PUBLIC (logo/cover/gallery/video), separate from the
-- existing staff-only media-library bucket since regular partner users
-- need to upload their own media without an admin/content_manager role.

INSERT INTO storage.buckets (id, name, public) VALUES ('business-documents', 'business-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('business-media', 'business-media', true);

-- Path convention for both buckets: {business_id}/{...}/{uuid}.{ext}

-- =========================================================================
-- business-documents (private)
-- =========================================================================
CREATE POLICY "Owners can view own business documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-documents' AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1] AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can upload own business documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-documents' AND EXISTS (
      SELECT 1 FROM public.businesses b
      JOIN public.business_verification bv ON bv.business_id = b.id
      WHERE b.id::text = (storage.foldername(name))[1] AND b.user_id = auth.uid()
        AND bv.status IN ('draft', 'documents_requested')
    )
  );

CREATE POLICY "Owners can delete own business documents while editable" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-documents' AND EXISTS (
      SELECT 1 FROM public.businesses b
      JOIN public.business_verification bv ON bv.business_id = b.id
      WHERE b.id::text = (storage.foldername(name))[1] AND b.user_id = auth.uid()
        AND bv.status IN ('draft', 'documents_requested')
    )
  );

CREATE POLICY "Admins can manage all business documents" ON storage.objects
  FOR ALL
  USING (bucket_id = 'business-documents' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'business-documents' AND public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- business-media (public)
-- =========================================================================
CREATE POLICY "Anyone can view business media" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-media');

CREATE POLICY "Owners can upload own business media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-media' AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1] AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own business media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-media' AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1] AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own business media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-media' AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[1] AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all business media" ON storage.objects
  FOR ALL
  USING (bucket_id = 'business-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'business-media' AND public.has_role(auth.uid(), 'admin'));
