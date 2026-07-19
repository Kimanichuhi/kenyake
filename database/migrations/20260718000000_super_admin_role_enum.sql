-- Add super_admin role, kept in its own migration since a new enum value
-- cannot be used in the same transaction it is added in.
ALTER TYPE public.app_role ADD VALUE 'super_admin';
