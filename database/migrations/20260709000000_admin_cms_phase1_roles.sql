-- Admin CMS Phase 1: extend the role enum with CMS-relevant roles.
-- Split into its own migration/transaction because a newly added enum value
-- cannot be referenced (e.g. in a policy expression) within the same
-- transaction that adds it.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';
