-- Seed kimanichuhi254@gmail.com as the first super admin, if the account
-- already exists. Safe no-op otherwise; re-run manually once they sign up.
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'kimanichuhi254@gmail.com' LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin') ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'super_admin') ON CONFLICT DO NOTHING;
  END IF;
END $$;
