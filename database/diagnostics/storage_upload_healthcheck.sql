-- Run this in Supabase SQL Editor when Storage uploads return:
-- { statusCode: "503", error: "DatabaseInvalidObjectDefinition" }

-- 1) Confirm Storage schema version and expected tables exist.
select
  'storage tables' as section,
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'storage'
  and table_name in ('buckets', 'objects', 'migrations')
order by table_name;

select
  'storage migrations' as section,
  *
from storage.migrations
order by id desc
limit 10;

-- 2) Confirm the target bucket exists and is public.
select
  'media bucket' as section,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'media-library';

-- 3) Show every policy on storage.objects. A broken policy on another bucket
-- can still break uploads because all policies live on the same table.
select
  'storage.objects policies' as section,
  pol.polname,
  case pol.polcmd
    when 'r' then 'select'
    when 'a' then 'insert'
    when 'w' then 'update'
    when 'd' then 'delete'
    when '*' then 'all'
  end as command,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as check_expression,
  pol.polroles::regrole[] as roles
from pg_policy pol
join pg_class cls on cls.oid = pol.polrelid
join pg_namespace nsp on nsp.oid = cls.relnamespace
where nsp.nspname = 'storage'
  and cls.relname = 'objects'
order by pol.polname;

-- 4) Confirm helper functions are SECURITY DEFINER and owned by a privileged
-- role. If prosecdef is false, RLS recursion can happen.
select
  'role helper functions' as section,
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  r.rolname as owner,
  p.provolatile as volatility
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_roles r on r.oid = p.proowner
where n.nspname = 'public'
  and p.proname in (
    'has_role',
    'has_role_text',
    'can_manage_business_storage',
    'can_manage_business_storage_while_editable'
  )
order by p.proname, arguments;

-- 5) Confirm enum values exist. Missing enum values make role-based policies
-- fail during creation or later evaluation.
select
  'app_role enum' as section,
  enumlabel
from pg_enum
where enumtypid = 'public.app_role'::regtype
order by enumsortorder;

-- 6) Look for invalid normal views/materialized views. Policies and functions
-- are often the cause, but this catches obvious invalid relations.
select
  'dependent objects' as section,
  n.nspname as schema,
  c.relname as object_name,
  c.relkind as object_kind
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'storage')
  and c.relkind in ('v', 'm')
order by n.nspname, c.relname;
