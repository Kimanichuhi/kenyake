import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole =
  | 'admin'
  | 'community_admin'
  | 'guide'
  | 'operator'
  | 'gov_official'
  | 'user'
  | 'content_manager'
  | 'editor'
  | 'super_admin';

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('get_user_roles', { _user_id: user.id });
    if (!error && data) {
      setRoles(data as AppRole[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasAnyRole = useCallback((allowed: AppRole[]) => allowed.some((role) => roles.includes(role)), [roles]);
  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);
  const isAdmin = roles.includes('admin');
  const isCommunityAdmin = roles.includes('community_admin');
  const isGuide = roles.includes('guide');
  const isOperator = roles.includes('operator');
  const isGovOfficial = roles.includes('gov_official');
  const isContentManager = roles.includes('content_manager');
  const isEditor = roles.includes('editor');
  const isSuperAdmin = roles.includes('super_admin');

  return {
    roles,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isCommunityAdmin,
    isGuide,
    isOperator,
    isGovOfficial,
    isContentManager,
    isEditor,
    isSuperAdmin,
    refreshRoles: fetchRoles,
  };
}
