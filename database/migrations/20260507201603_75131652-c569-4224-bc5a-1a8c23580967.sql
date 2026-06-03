
CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  invite_code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);

CREATE TABLE public.chat_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_room_members_room ON public.chat_room_members(room_id);
CREATE INDEX idx_chat_room_members_user ON public.chat_room_members(user_id);
CREATE INDEX idx_chat_room_messages_room ON public.chat_room_messages(room_id, created_at);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_messages ENABLE ROW LEVEL SECURITY;

-- Security definer to check membership without recursion
CREATE OR REPLACE FUNCTION public.is_chat_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE room_id = _room_id AND user_id = _user_id
  )
$$;

-- chat_rooms policies
CREATE POLICY "Members can view their rooms"
  ON public.chat_rooms FOR SELECT
  USING (public.is_chat_room_member(id, auth.uid()) OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owner can update room"
  ON public.chat_rooms FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Owner can delete room"
  ON public.chat_rooms FOR DELETE
  USING (created_by = auth.uid());

-- chat_room_members policies
CREATE POLICY "Members can view co-members"
  ON public.chat_room_members FOR SELECT
  USING (public.is_chat_room_member(room_id, auth.uid()));

CREATE POLICY "Users can join rooms themselves"
  ON public.chat_room_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON public.chat_room_members FOR DELETE
  USING (auth.uid() = user_id);

-- chat_room_messages policies
CREATE POLICY "Members can read messages"
  ON public.chat_room_messages FOR SELECT
  USING (public.is_chat_room_member(room_id, auth.uid()));

CREATE POLICY "Members can post messages"
  ON public.chat_room_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_chat_room_member(room_id, auth.uid()));

CREATE POLICY "Authors can delete own messages"
  ON public.chat_room_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Realtime
ALTER TABLE public.chat_room_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;

-- Add price_usd to budget_packages for dual currency
ALTER TABLE public.budget_packages ADD COLUMN IF NOT EXISTS price_usd numeric;

-- Insert family-friendly domestic packages
INSERT INTO public.budget_packages (title, title_sw, slug, budget_tier, price_kes, price_usd, duration_days, destination, county, description, includes, suitable_for, transport_included, meals_included, is_published, is_featured, group_size_min, group_size_max)
VALUES
  ('Family Weekend at Lake Naivasha', 'Wikendi ya Familia Naivasha', 'family-naivasha-weekend', 'under_20k', 18000, 138, 2, 'Lake Naivasha', 'Nakuru', 'Kid-friendly boat ride, Crescent Island walk, family-sized cottage stay with all meals.', ARRAY['Family cottage','Boat ride','Crescent Island','All meals','Transport'], ARRAY['family','friends'], true, true, true, true, 4, 8),
  ('Family Adventure at Hells Gate', 'Safari ya Familia Hells Gate', 'family-hells-gate', 'under_10k', 9500, 73, 1, 'Hells Gate National Park', 'Nakuru', 'Cycle through the gorge as a family. Picnic lunch and ranger-guided walk included.', ARRAY['Bike rental','Park fees','Picnic lunch','Guide'], ARRAY['family','friends'], true, true, true, true, 4, 10);
