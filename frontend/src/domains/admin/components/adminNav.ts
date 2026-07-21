import {
  LayoutDashboard,
  Map,
  PawPrint,
  Users,
  UserSquare2,
  Sparkles,
  Newspaper,
  Image,
  FileText,
  History,
  Building2,
  CalendarCheck,
  ShieldCheck,
  Star,
  CalendarDays,
  Menu as MenuIcon,
  PanelBottom,
  LayoutTemplate,
  Settings,
} from "lucide-react";
import { AppRole } from "@/hooks/useUserRoles";

export interface AdminNavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  /** Omit to show to everyone with /admin access; set to restrict further. */
  roles?: AppRole[];
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Destinations", path: "/admin/destinations", icon: Map },
  { label: "Wildlife", path: "/admin/wildlife", icon: PawPrint },
  { label: "Big Five Species", path: "/admin/wildlife-species", icon: PawPrint },
  { label: "Migration Calendar", path: "/admin/migration-calendar", icon: CalendarDays },
  { label: "Communities", path: "/admin/communities", icon: Users },
  { label: "Guides", path: "/admin/guides", icon: UserSquare2 },
  { label: "Experiences", path: "/admin/experiences", icon: Sparkles },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Blog", path: "/admin/blog", icon: Newspaper },
  { label: "Pages", path: "/admin/pages", icon: FileText },
  { label: "Homepage", path: "/admin/homepage", icon: LayoutTemplate },
  { label: "Navigation", path: "/admin/navigation", icon: MenuIcon },
  { label: "Footer Links", path: "/admin/footer-links", icon: PanelBottom },
  { label: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
  { label: "Media Library", path: "/admin/media", icon: Image },
  { label: "Partner Applications", path: "/admin/partners", icon: Building2, roles: ["admin"] },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: History, roles: ["admin"] },
  { label: "Website Settings", path: "/admin/settings", icon: Settings, roles: ["admin"] },
  { label: "Manage Admins", path: "/admin/admins", icon: ShieldCheck, roles: ["super_admin"] },
];
