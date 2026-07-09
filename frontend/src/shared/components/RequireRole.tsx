import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { Loader2 } from "lucide-react";

interface RequireRoleProps {
  anyOf: AppRole[];
  children: ReactNode;
  redirectTo?: string;
}

const RequireRole = ({ anyOf, children, redirectTo = "/auth" }: RequireRoleProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAnyRole, loading: rolesLoading } = useUserRoles();
  const location = useLocation();

  if (authLoading || (user && rolesLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!hasAnyRole(anyOf)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
