import { NavLink, Outlet } from "react-router-dom";
import { usePartnerBusiness } from "@/components/RequirePartnerBusiness";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusMeta } from "./BusinessStatusOverview";

const TABS: { to: string; label: string; end?: boolean }[] = [
  { to: "/partner", label: "Overview", end: true },
  { to: "/partner/profile", label: "Profile" },
  { to: "/partner/documents", label: "Documents" },
  { to: "/partner/media", label: "Media" },
];

const PartnerDashboardLayout = () => {
  const { business } = usePartnerBusiness();
  const meta = getStatusMeta(business.business_verification?.status);
  const initials = (business.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {initials}
              </div>
            )}
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">{business.name}</h1>
              <p className="text-sm text-muted-foreground">Partner Dashboard</p>
            </div>
          </div>
          <Badge className={cn("w-fit gap-1.5 py-1", meta.badgeClassName)}>
            <meta.icon className="h-3.5 w-3.5" /> {meta.label}
          </Badge>
        </div>
        <nav className="container mx-auto flex gap-1 overflow-x-auto px-4">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PartnerDashboardLayout;
