-- Move cross-table Storage RLS checks into SECURITY DEFINER helpers.
-- Storage uploads evaluate policies on storage.objects; policies that query
-- RLS-protected public tables directly can surface as 503
-- DatabaseInvalidObjectDefinition errors from the Storage API.

CREATE OR REPLACE FUNCTION public.can_manage_business_storage(_user_id uuid, _business_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = _business_id
      AND b.user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_business_storage_while_editable(_user_id uuid, _business_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.businesses b
    JOIN public.business_verification bv ON bv.business_id = b.id
    WHERE b.id::text = _business_id
      AND b.user_id = _user_id
      AND bv.status IN ('draft', 'documents_requested')
  )
$$;

GRANT EXECUTE ON FUNCTION public.can_manage_business_storage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_business_storage_while_editable(uuid, text) TO authenticated;

DROP POLICY IF EXISTS "Owners can view own business documents" ON storage.objects;
CREATE POLICY "Owners can view own business documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'business-documents'
    AND public.can_manage_business_storage(auth.uid(), (storage.foldername(name))[1])
  );

DROP POLICY IF EXISTS "Owners can upload own business documents" ON storage.objects;
CREATE POLICY "Owners can upload own business documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-documents'
    AND public.can_manage_business_storage_while_editable(auth.uid(), (storage.foldername(name))[1])
  );

DROP POLICY IF EXISTS "Owners can delete own business documents while editable" ON storage.objects;
CREATE POLICY "Owners can delete own business documents while editable" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-documents'
    AND public.can_manage_business_storage_while_editable(auth.uid(), (storage.foldername(name))[1])
  );

DROP POLICY IF EXISTS "Owners can upload own business media" ON storage.objects;
CREATE POLICY "Owners can upload own business media" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-media'
    AND public.can_manage_business_storage(auth.uid(), (storage.foldername(name))[1])
  );

DROP POLICY IF EXISTS "Owners can update own business media" ON storage.objects;
CREATE POLICY "Owners can update own business media" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-media'
    AND public.can_manage_business_storage(auth.uid(), (storage.foldername(name))[1])
  )
  WITH CHECK (
    bucket_id = 'business-media'
    AND public.can_manage_business_storage(auth.uid(), (storage.foldername(name))[1])
  );

DROP POLICY IF EXISTS "Owners can delete own business media" ON storage.objects;
CREATE POLICY "Owners can delete own business media" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-media'
    AND public.can_manage_business_storage(auth.uid(), (storage.foldername(name))[1])
  );
