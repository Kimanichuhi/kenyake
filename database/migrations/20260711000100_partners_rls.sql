-- Partner Onboarding & Verification Portal: RLS.
-- Owner gets SELECT-only on all verification/scoring/audit tables (no
-- write policy exists on any of them for non-admins) — RLS default-deny
-- permanently blocks self-approval, self-scoring, and self-verification.

-- =========================================================================
-- businesses
-- =========================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own business" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view approved businesses" ON public.businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.business_verification bv
      WHERE bv.business_id = businesses.id AND bv.status = 'approved'
    )
  );

CREATE POLICY "Admins can view all businesses" ON public.businesses
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can create own business" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own business while editable" ON public.businesses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM public.business_verification bv
      WHERE bv.business_id = businesses.id AND bv.status IN ('draft', 'documents_requested')
    )
  );

CREATE POLICY "Admins can manage all businesses" ON public.businesses
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- business_verification / business_verification_checklist /
-- business_status_history: identical shape — owner SELECT-only via join,
-- admin FOR ALL, no owner write policy anywhere.
-- =========================================================================
ALTER TABLE public.business_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own verification state" ON public.business_verification
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_verification.business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage verification state" ON public.business_verification
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.business_verification_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own verification checklist" ON public.business_verification_checklist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_verification_checklist.business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage verification checklist" ON public.business_verification_checklist
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.business_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own status history" ON public.business_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_status_history.business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all status history" ON public.business_status_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
-- No INSERT policy for anyone — rows are written only inside the
-- SECURITY DEFINER transition_business_status()/submit_business_application().

-- =========================================================================
-- business_inspections: admin-only end to end in this phase (no owner
-- SELECT — see plan's "decisions accepted" section).
-- =========================================================================
ALTER TABLE public.business_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inspections" ON public.business_inspections
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- business_contacts: owner-writable while editable.
-- =========================================================================
ALTER TABLE public.business_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own contacts" ON public.business_contacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_contacts.business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Owners can manage own contacts while editable" ON public.business_contacts
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_contacts.business_id AND b.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      JOIN public.business_verification bv ON bv.business_id = b.id
      WHERE b.id = business_contacts.business_id AND b.user_id = auth.uid()
        AND bv.status IN ('draft', 'documents_requested')
    )
  );

CREATE POLICY "Admins can manage all contacts" ON public.business_contacts
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- business_documents: owner has NO update policy at all — is_verified/
-- verified_by/rejection_reason are structurally admin-only.
-- =========================================================================
ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own documents" ON public.business_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_documents.business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Owners can upload own documents while editable" ON public.business_documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.businesses b
      JOIN public.business_verification bv ON bv.business_id = b.id
      WHERE b.id = business_documents.business_id AND b.user_id = auth.uid()
        AND bv.status IN ('draft', 'documents_requested')
    )
  );

CREATE POLICY "Owners can delete own unverified documents while editable" ON public.business_documents
  FOR DELETE USING (
    is_verified = false AND EXISTS (
      SELECT 1 FROM public.businesses b
      JOIN public.business_verification bv ON bv.business_id = b.id
      WHERE b.id = business_documents.business_id AND b.user_id = auth.uid()
        AND bv.status IN ('draft', 'documents_requested')
    )
  );

CREATE POLICY "Admins can manage all documents" ON public.business_documents
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- business_notifications
-- =========================================================================
ALTER TABLE public.business_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own notifications" ON public.business_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners can mark own notifications read" ON public.business_notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
-- No client INSERT policy — rows are written only inside transition_business_status().
