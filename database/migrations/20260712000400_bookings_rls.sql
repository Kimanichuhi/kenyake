-- Booking Engine Phase 1: RLS.
--
-- This is a real, intentional TIGHTENING on the 4 existing booking tables,
-- not purely additive: the blanket "customer/owner can UPDATE own booking"
-- policies are removed entirely. After this migration there is NO client
-- UPDATE policy on any of the 4 booking tables — every status change goes
-- through transition_booking_status(), which enforces who may transition
-- what. This closes a real bug: today a customer can directly
-- `UPDATE guide_bookings SET status = 'confirmed'` on their own pending
-- booking, with nothing stopping self-approval.
--
-- This MUST ship together with the frontend refactor of
-- GuideDashboardPage.tsx's updateBookingStatus() (which currently does a
-- raw .update({status})) — removing the old policy without that refactor
-- landing in the same release breaks the guide dashboard.

-- =========================================================================
-- guide_bookings: existing SELECT policies (tourist + guide) are already
-- correct and untouched. Remove the two blanket UPDATE policies.
-- =========================================================================
DROP POLICY "Tourists can update own bookings" ON public.guide_bookings;
DROP POLICY "Guides can update bookings" ON public.guide_bookings;

-- =========================================================================
-- experience_bookings: add the missing owner-side SELECT policy (community
-- managers currently have zero visibility into bookings against their own
-- experiences), remove the blanket UPDATE policy.
-- =========================================================================
CREATE POLICY "Community managers can view their experience bookings" ON public.experience_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.experiences e
      JOIN public.communities c ON c.id = e.community_id
      WHERE e.id = experience_bookings.experience_id AND c.managed_by = auth.uid()
    )
  );

DROP POLICY "Users can update own bookings" ON public.experience_bookings;

-- =========================================================================
-- accommodation_bookings: add owner-side SELECT keyed off the new
-- accommodations.managed_by (will match zero rows until an admin sets it —
-- structurally ready, operationally punted, per the migration plan), plus
-- an explicit admin-visibility policy since managed_by will be null for
-- effectively every row in this phase. Remove the blanket UPDATE policy.
-- =========================================================================
CREATE POLICY "Accommodation managers can view their bookings" ON public.accommodation_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.accommodations a
      WHERE a.id = accommodation_bookings.accommodation_id AND a.managed_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all accommodation bookings" ON public.accommodation_bookings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY "Users can update own accommodation bookings" ON public.accommodation_bookings;

-- =========================================================================
-- transport_bookings: existing SELECT policies (customer + driver) are
-- already correct and untouched. Remove both blanket UPDATE policies.
-- =========================================================================
DROP POLICY "Users can update own transport bookings" ON public.transport_bookings;
DROP POLICY "Drivers can update their bookings" ON public.transport_bookings;

-- =========================================================================
-- booking_payments
-- =========================================================================
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own submitted payments" ON public.booking_payments
  FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Resource owners can view payments for their bookings" ON public.booking_payments
  FOR SELECT USING (
    (resource_type = 'guide' AND EXISTS (
      SELECT 1 FROM public.guide_bookings gb JOIN public.guides g ON g.id = gb.guide_id
      WHERE gb.id = booking_payments.booking_id AND g.user_id = auth.uid()))
    OR (resource_type = 'experience' AND EXISTS (
      SELECT 1 FROM public.experience_bookings eb
      JOIN public.experiences e ON e.id = eb.experience_id
      JOIN public.communities c ON c.id = e.community_id
      WHERE eb.id = booking_payments.booking_id AND c.managed_by = auth.uid()))
    OR (resource_type = 'accommodation' AND EXISTS (
      SELECT 1 FROM public.accommodation_bookings ab JOIN public.accommodations a ON a.id = ab.accommodation_id
      WHERE ab.id = booking_payments.booking_id AND a.managed_by = auth.uid()))
    OR (resource_type = 'transport' AND EXISTS (
      SELECT 1 FROM public.transport_bookings tb JOIN public.transport_drivers d ON d.id = tb.driver_id
      WHERE tb.id = booking_payments.booking_id AND d.user_id = auth.uid()))
  );

CREATE POLICY "Admins can view all payments" ON public.booking_payments
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
-- No client INSERT/UPDATE policy — written only inside submit_booking_payment()/verify_booking_payment().

-- =========================================================================
-- booking_status_history
-- =========================================================================
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own booking history" ON public.booking_status_history
  FOR SELECT USING (
    (resource_type = 'guide' AND EXISTS (SELECT 1 FROM public.guide_bookings gb WHERE gb.id = booking_id AND gb.tourist_id = auth.uid()))
    OR (resource_type = 'experience' AND EXISTS (SELECT 1 FROM public.experience_bookings eb WHERE eb.id = booking_id AND eb.user_id = auth.uid()))
    OR (resource_type = 'accommodation' AND EXISTS (SELECT 1 FROM public.accommodation_bookings ab WHERE ab.id = booking_id AND ab.user_id = auth.uid()))
    OR (resource_type = 'transport' AND EXISTS (SELECT 1 FROM public.transport_bookings tb WHERE tb.id = booking_id AND tb.user_id = auth.uid()))
  );

CREATE POLICY "Resource owners can view booking history for their bookings" ON public.booking_status_history
  FOR SELECT USING (
    (resource_type = 'guide' AND EXISTS (
      SELECT 1 FROM public.guide_bookings gb JOIN public.guides g ON g.id = gb.guide_id
      WHERE gb.id = booking_status_history.booking_id AND g.user_id = auth.uid()))
    OR (resource_type = 'experience' AND EXISTS (
      SELECT 1 FROM public.experience_bookings eb
      JOIN public.experiences e ON e.id = eb.experience_id
      JOIN public.communities c ON c.id = e.community_id
      WHERE eb.id = booking_status_history.booking_id AND c.managed_by = auth.uid()))
    OR (resource_type = 'accommodation' AND EXISTS (
      SELECT 1 FROM public.accommodation_bookings ab JOIN public.accommodations a ON a.id = ab.accommodation_id
      WHERE ab.id = booking_status_history.booking_id AND a.managed_by = auth.uid()))
    OR (resource_type = 'transport' AND EXISTS (
      SELECT 1 FROM public.transport_bookings tb JOIN public.transport_drivers d ON d.id = tb.driver_id
      WHERE tb.id = booking_status_history.booking_id AND d.user_id = auth.uid()))
  );

CREATE POLICY "Admins can view all booking history" ON public.booking_status_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
-- No INSERT policy for anyone — written only inside transition_booking_status().

-- =========================================================================
-- notifications
-- =========================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can mark own notifications read" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- No client INSERT policy — written only inside transition_booking_status()/submit_booking_payment()/verify_booking_payment().
