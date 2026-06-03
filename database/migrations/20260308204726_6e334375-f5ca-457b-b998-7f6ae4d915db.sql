
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  nationality TEXT,
  traveler_type TEXT DEFAULT 'tourist' CHECK (traveler_type IN ('tourist', 'diaspora', 'nomad', 'corporate')),
  travel_styles TEXT[] DEFAULT '{}',
  budget_range TEXT,
  accessibility_needs TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  first_visit BOOLEAN DEFAULT true,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Saved destinations table
CREATE TABLE public.saved_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, destination_id)
);

ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view saved destinations" ON public.saved_destinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save destinations" ON public.saved_destinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave destinations" ON public.saved_destinations FOR DELETE USING (auth.uid() = user_id);

-- Trip history table
CREATE TABLE public.trip_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their trips" ON public.trip_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add trips" ON public.trip_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update trips" ON public.trip_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete trips" ON public.trip_history FOR DELETE USING (auth.uid() = user_id);
