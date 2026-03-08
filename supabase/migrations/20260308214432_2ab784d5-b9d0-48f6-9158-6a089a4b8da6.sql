
-- Community Events table
CREATE TABLE public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  event_type text NOT NULL DEFAULT 'festival', -- ceremony, festival, market, celebration, naming, harvest, age_set
  description text,
  
  -- Scheduling
  start_date date NOT NULL,
  end_date date,
  start_time text, -- e.g. "09:00"
  end_time text,
  recurrence text, -- 'weekly', 'monthly', 'yearly', 'once', null
  recurrence_detail text, -- e.g. "Every Saturday", "First Monday of month"
  
  -- Location
  location_name text,
  county text,
  lat double precision,
  lng double precision,
  
  -- Capacity & attendance
  max_attendees integer DEFAULT 50,
  current_attendees integer DEFAULT 0,
  invitation_required boolean DEFAULT true,
  price text,
  
  -- Preparation guide
  what_to_bring text,
  what_to_wear text,
  etiquette_notes text,
  preparation_guide text,
  
  -- Media
  cover_image text,
  
  -- Status
  is_published boolean DEFAULT true,
  is_past boolean DEFAULT false,
  
  -- Metadata
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events" ON public.community_events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Community managers can insert events" ON public.community_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

CREATE POLICY "Community managers can update events" ON public.community_events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

CREATE POLICY "Community managers can delete events" ON public.community_events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND managed_by = auth.uid())
  );

-- Event invitation requests
CREATE TABLE public.event_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, declined, waitlisted
  message text, -- visitor's message to community
  group_size integer DEFAULT 1,
  response_message text, -- community's response
  responded_at timestamptz,
  notify_recurring boolean DEFAULT false, -- opt in to recurring event notifications
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations" ON public.event_invitations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request invitations" ON public.event_invitations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invitations" ON public.event_invitations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Community managers can view event invitations" ON public.event_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_events ce
      JOIN public.communities c ON c.id = ce.community_id
      WHERE ce.id = event_id AND c.managed_by = auth.uid()
    )
  );

CREATE POLICY "Community managers can update invitations" ON public.event_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.community_events ce
      JOIN public.communities c ON c.id = ce.community_id
      WHERE ce.id = event_id AND c.managed_by = auth.uid()
    )
  );

-- Post-event photos (community-approved)
CREATE TABLE public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  caption text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved event photos" ON public.event_photos
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Auth users can upload event photos" ON public.event_photos
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Community managers can manage event photos" ON public.event_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.community_events ce
      JOIN public.communities c ON c.id = ce.community_id
      WHERE ce.id = event_id AND c.managed_by = auth.uid()
    )
  );

CREATE POLICY "Community managers can delete event photos" ON public.event_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.community_events ce
      JOIN public.communities c ON c.id = ce.community_id
      WHERE ce.id = event_id AND c.managed_by = auth.uid()
    )
  );
