import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Compass,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: MapPin, label: "Communities", path: "/admin/communities" },
    { icon: Compass, label: "Experiences", path: "/admin/experiences" },
    { icon: Users, label: "Guides", path: "/admin/guides" },
    { icon: Calendar, label: "Events", path: "/admin/events" },
    { icon: BarChart3, label: "Bookings", path: "/admin/bookings" },
    { icon: MessageCircle, label: "Reviews", path: "/admin/reviews" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg">SafariSync Admin</span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-emerald-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Platform Manager</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full"></div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Toggle Sidebar Button (Mobile) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
