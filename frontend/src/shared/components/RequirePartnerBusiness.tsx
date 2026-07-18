import { createContext, ReactNode, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBusiness } from "@/domains/partners/hooks/useMyBusiness";
import { MyBusiness } from "@/domains/partners/types/business";

interface PartnerBusinessContextValue {
  business: MyBusiness;
  refetch: () => void;
}

const PartnerBusinessContext = createContext<PartnerBusinessContextValue | undefined>(undefined);

export function usePartnerBusiness() {
  const context = useContext(PartnerBusinessContext);
  if (!context) throw new Error("usePartnerBusiness must be used within RequirePartnerBusiness");
  return context;
}

interface RequirePartnerBusinessProps {
  children: ReactNode;
}

const RequirePartnerBusiness = ({ children }: RequirePartnerBusinessProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: business, isLoading, refetch } = useMyBusiness();
  const location = useLocation();

  if (authLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!business) {
    return <Navigate to="/partner/register" replace />;
  }

  return (
    <PartnerBusinessContext.Provider value={{ business, refetch }}>{children}</PartnerBusinessContext.Provider>
  );
};

export default RequirePartnerBusiness;
