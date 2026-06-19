
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'community_admin', 'guide', 'operator', 'gov_official', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Platform analytics table for tracking metrics
CREATE TABLE public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  county TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and gov officials can view analytics"
ON public.platform_analytics FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'gov_official')
);

-- Operator listings table
CREATE TABLE public.operator_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'experience',
  listing_id UUID NOT NULL,
  listing_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  total_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  impact_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view own listings"
ON public.operator_listings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Operators can manage own listings"
ON public.operator_listings FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Add update trigger
CREATE TRIGGER update_operator_listings_updated_at
BEFORE UPDATE ON public.operator_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
