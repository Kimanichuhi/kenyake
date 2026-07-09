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
  { label: "Communities", path: "/admin/communities", icon: Users },
  { label: "Guides", path: "/admin/guides", icon: UserSquare2 },
  { label: "Experiences", path: "/admin/experiences", icon: Sparkles },
  { label: "Blog", path: "/admin/blog", icon: Newspaper },
  { label: "Pages", path: "/admin/pages", icon: FileText },
  { label: "Media Library", path: "/admin/media", icon: Image },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: History, roles: ["admin"] },
];
