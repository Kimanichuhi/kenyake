-- Lock down user_roles writes to super_admin only, and expose the
-- admin-management operations through SECURITY DEFINER RPCs so the
-- frontend can look up users by email (auth.users is not otherwise
-- queryable from the client).

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Search users by email/name to grant admin access.
CREATE OR REPLACE FUNCTION public.admin_search_users(p_search text)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN,
  is_super_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only super admins may search users';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    p.full_name,
    public.has_role(u.id, 'admin'),
    public.has_role(u.id, 'super_admin')
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE p_search IS NULL OR p_search = ''
     OR u.email ILIKE '%' || p_search || '%'
     OR p.full_name ILIKE '%' || p_search || '%'
  ORDER BY u.email
  LIMIT 25;
END;
$$;

-- List everyone currently holding the admin role.
CREATE OR REPLACE FUNCTION public.admin_list_admins()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  is_super_admin BOOLEAN,
  granted_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only super admins may list admins';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    p.full_name,
    public.has_role(u.id, 'super_admin'),
    ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at;
END;
$$;

-- Grant admin dashboard access to a user.
CREATE OR REPLACE FUNCTION public.admin_grant_admin_role(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only super admins may grant admin access';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Revoke admin dashboard access from a user.
CREATE OR REPLACE FUNCTION public.admin_revoke_admin_role(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only super admins may revoke admin access';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot revoke your own admin access';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin';
END;
$$;
