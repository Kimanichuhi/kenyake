-- Expiring, single-use invite links for onboarding new admins who don't
-- have an account yet. No RLS policies on purpose: only reachable via the
-- SECURITY DEFINER RPCs below and the admin-accept-invite edge function
-- (service role).
CREATE TABLE public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Create an invite link. Super admins only.
CREATE OR REPLACE FUNCTION public.admin_create_invite(p_email TEXT)
RETURNS TABLE (token TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only super admins may create admin invites';
  END IF;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  v_expires_at := now() + interval '10 minutes';

  INSERT INTO public.admin_invites (email, token, created_by, expires_at)
  VALUES (p_email, v_token, auth.uid(), v_expires_at);

  RETURN QUERY SELECT v_token, v_expires_at;
END;
$$;

-- Validate a token from the (unauthenticated) admin-signup page.
-- Deliberately not gated on any role — the caller has no session yet.
CREATE OR REPLACE FUNCTION public.admin_validate_invite(p_token TEXT)
RETURNS TABLE (email TEXT, valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ai.email, (ai.used_at IS NULL AND ai.expires_at > now())
  FROM public.admin_invites ai
  WHERE ai.token = p_token;
END;
$$;
