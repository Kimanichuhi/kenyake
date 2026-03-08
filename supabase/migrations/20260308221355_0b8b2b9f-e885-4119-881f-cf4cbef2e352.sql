
-- Group trips for multi-guide coordination
CREATE TABLE public.group_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  group_size integer DEFAULT 1,
  status text DEFAULT 'planning',
  total_price integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Junction: which guides are part of a group trip
CREATE TABLE public.group_trip_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  role text DEFAULT 'guide',
  status text DEFAULT 'pending',
  price_agreed integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trip_id, guide_id)
);

-- Guide-to-guide messages within a group trip
CREATE TABLE public.guide_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.group_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trip_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_messages ENABLE ROW LEVEL SECURITY;

-- Group trips: tourist can CRUD own, guides can view trips they're part of
CREATE POLICY "Tourists can manage own trips" ON public.group_trips FOR ALL USING (auth.uid() = tourist_id);
CREATE POLICY "Guides can view assigned trips" ON public.group_trips FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_trip_guides gtg JOIN public.guides g ON g.id = gtg.guide_id WHERE gtg.trip_id = group_trips.id AND g.user_id = auth.uid())
);

-- Group trip guides: tourist who owns trip can manage, guides can view/update own
CREATE POLICY "Trip owners can manage guides" ON public.group_trip_guides FOR ALL USING (
  EXISTS (SELECT 1 FROM public.group_trips WHERE group_trips.id = group_trip_guides.trip_id AND group_trips.tourist_id = auth.uid())
);
CREATE POLICY "Guides can view own assignments" ON public.group_trip_guides FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = group_trip_guides.guide_id AND guides.user_id = auth.uid())
);
CREATE POLICY "Guides can update own assignment" ON public.group_trip_guides FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.guides WHERE guides.id = group_trip_guides.guide_id AND guides.user_id = auth.uid())
);

-- Messages: trip participants can read/write
CREATE POLICY "Trip participants can view messages" ON public.guide_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_trips WHERE group_trips.id = guide_messages.trip_id AND group_trips.tourist_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.group_trip_guides gtg JOIN public.guides g ON g.id = gtg.guide_id WHERE gtg.trip_id = guide_messages.trip_id AND g.user_id = auth.uid())
);
CREATE POLICY "Trip participants can send messages" ON public.guide_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (SELECT 1 FROM public.group_trips WHERE group_trips.id = guide_messages.trip_id AND group_trips.tourist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.group_trip_guides gtg JOIN public.guides g ON g.id = gtg.guide_id WHERE gtg.trip_id = guide_messages.trip_id AND g.user_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.guide_messages;

-- Trigger for updated_at
CREATE TRIGGER update_group_trips_updated_at BEFORE UPDATE ON public.group_trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
