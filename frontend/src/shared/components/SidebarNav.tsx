import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Map,
  Binoculars,
  Calendar,
  UtensilsCrossed,
  Users,
  Compass,
  Store,
  Bus,
  Route,
  Laptop,
  MapPin,
  Shield,
  Leaf,
  Star,
  BookOpen,
  User,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  CreditCard,
} from "lucide-react";

const navItems = [
  { label: "Dashboard / Home", href: "/", icon: Home, description: "Main dashboard and overview" },
  { label: "Discover Destinations", href: "/destinations", icon: Map, description: "Find counties and top destinations" },
  { label: "Wildlife Intelligence", href: "/wildlife-intel", icon: Binoculars, description: "AI-driven wildlife insights" },
  { label: "Community Cultural Events", href: "/events", icon: Calendar, description: "Community events and festivals" },
  { label: "Food & Dining", href: "/food", icon: UtensilsCrossed, description: "Local food experiences" },
  { label: "Local Guides Marketplace", href: "/guides", icon: Users, description: "Verified local guides and experts" },
  { label: "Experiences & Activities", href: "/experiences", icon: Compass, description: "Experiences and activities" },
  { label: "Community Marketplace", href: "/marketplace", icon: Store, description: "Local products and markets" },
  { label: "Packages & Pricing", href: "/packages", icon: CreditCard, description: "Plans and subscription options" },
  { label: "Transport & Logistics", href: "/transport", icon: Bus, description: "Transport services and logistics" },
  { label: "Routes & Trails", href: "/transport", icon: Route, description: "Trails, routes, and navigation" },
  { label: "Digital Nomad Kenya", href: "/nomads", icon: Laptop, description: "Remote work and nomad hubs" },
  { label: "Tembea Kenya (Domestic Tourism)", href: "/domestic", icon: MapPin, description: "Domestic tourism routes" },
  { label: "Diaspora & Heritage Tourism", href: "/heritage", icon: BookOpen, description: "Heritage and diaspora journeys" },
  { label: "Safety & Emergency", href: "/safety", icon: Shield, description: "Safety alerts and contacts" },
  { label: "Impact & Sustainability", href: "/impact", icon: Leaf, description: "Impact and sustainability" },
  { label: "Reviews & Trust System", href: "/community", icon: Star, description: "Trust, reviews, and community signals" },
  { label: "Tourist Education", href: "/cultural-prep", icon: BookOpen, description: "Cultural preparation and guidance" },
  { label: "Profile & Preferences", href: "/profile", icon: User, description: "Your profile and preferences" },
  { label: "Settings", href: "/offline-settings", icon: Settings, description: "Offline and app settings" },
];

const SidebarNav = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.classList.add("has-sidebar");
    return () => {
      document.body.classList.remove("has-sidebar");
      document.body.classList.remove("sidebar-collapsed");
    };
  }, []);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setMobileOpen((prev) => !prev);
        } else {
          setCollapsed((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-20 left-4 z-50 rounded-xl bg-card border border-border shadow-md h-10 w-10 flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <PanelLeftOpen className="h-5 w-5 text-foreground" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-card border-r border-border shadow-lg transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className={`flex h-full flex-col ${collapsed ? "w-20" : "w-72"} transition-[width] duration-300`}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <div className={`text-sm font-semibold text-foreground ${collapsed ? "sr-only" : ""}`}>
              Navigation
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="h-8 w-8 rounded-lg border border-border bg-muted/60 hover:bg-muted flex items-center justify-center"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <div className={`px-3 py-3 ${collapsed ? "hidden" : ""}`}>
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full rounded-xl bg-muted px-9 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            <div className="space-y-1">
              {filteredItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={item.description}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className={`${collapsed ? "hidden" : "block"}`}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className={`px-3 py-3 border-t border-border text-[11px] text-muted-foreground ${collapsed ? "hidden" : "block"}`}>
            Tip: Press Ctrl+B to toggle the sidebar
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
