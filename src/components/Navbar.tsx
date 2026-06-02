import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, User, ChevronDown, LogOut, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useAuth } from "@/contexts/AuthContext";
import { destinations } from "@/data/destinations";

type NavChild = { label: string; href: string };
type NavGroup = { label: string; href?: string; children?: NavChild[] };

const navGroups: NavGroup[] = [
  {
    label: "Destinations",
    children: [
      { label: "All Destinations", href: "/destinations" },
      { label: "Nearby", href: "/nearby" },
      { label: "Tembea Kenya", href: "/domestic" },
    ],
  },
  {
    label: "Experiences",
    children: [
      { label: "Experiences", href: "/experiences" },
      { label: "Cultural Events", href: "/events" },
      { label: "Food & Dining", href: "/food" },
      { label: "Cultural Prep", href: "/cultural-prep" },
    ],
  },
  {
    label: "Stay & Travel",
    children: [
      { label: "Accommodation", href: "/accommodation" },
      { label: "Transport", href: "/transport" },
      { label: "Digital Nomads", href: "/nomads" },
      { label: "Safety", href: "/safety" },
    ],
  },
  {
    label: "Wildlife",
    children: [
      { label: "Wildlife", href: "/wildlife" },
      { label: "Wildlife Intel", href: "/wildlife-intel" },
    ],
  },
  {
    label: "Community",
    children: [
      { label: "Community", href: "/community" },
      { label: "Local Guides", href: "/guides" },
      { label: "Become a Guide", href: "/guide-register" },
      { label: "Group Chat", href: "/group-chat" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Heritage & Diaspora", href: "/heritage" },
      { label: "Your Impact", href: "/impact" },
    ],
  },
  {
    label: "Plan",
    children: [
      { label: "Trip Planner", href: "/trip-planner" },
      { label: "Packages", href: "/packages" },
      { label: "Payments", href: "/payments" },
    ],
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const pageItems = [
    { label: "Home", href: "/" },
    ...navGroups.flatMap((g) => g.children ?? []),
  ];

  const destinationItems = destinations.map((d) => ({
    label: d.name,
    href: `/destinations/${d.id}`,
    meta: d.county,
  }));

  const handleSearchSelect = (href: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(href);
  };

  const isGroupActive = (group: NavGroup) =>
    group.children?.some((c) => location.pathname === c.href || location.pathname.startsWith(c.href + "/")) ?? false;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card-dark"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/icon-192.png" alt="Sync Safaris" className="h-8 w-8 rounded-lg" />
          <span className="text-xl font-bold text-savannah-gold tracking-tight">
            Sync<span className="text-primary-foreground"> Safaris</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "text-savannah-gold"
                : "text-primary-foreground/80 hover:text-savannah-gold"
            }`}
          >
            Home
          </Link>
          {navGroups.map((group) => {
            const active = isGroupActive(group);
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup((g) => (g === group.label ? null : g))}
              >
                <button
                  onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    active
                      ? "text-savannah-gold"
                      : "text-primary-foreground/80 hover:text-savannah-gold"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      openGroup === group.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openGroup === group.label && group.children && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 glass-card rounded-xl shadow-lg overflow-hidden py-1.5"
                    >
                      {group.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setOpenGroup(null)}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            location.pathname === child.href
                              ? "bg-muted text-foreground"
                              : "text-foreground/80 hover:bg-muted"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Link to="/profile?tab=saved">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center gap-1">
              <Link to="/profile">
                <Button
                  variant="ghost"
                  className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10 rounded-full px-3 text-sm"
                >
                  <User className="h-4 w-4 mr-1" />
                  {profile?.full_name || "Profile"}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button className="gradient-sunset text-primary-foreground font-medium rounded-full px-5 text-sm border-0">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-primary-foreground/80"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search pages and destinations..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pageItems.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.href}`}
                onSelect={() => handleSearchSelect(item.href)}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Destinations">
            {destinationItems.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.meta ?? ""}`}
                onSelect={() => handleSearchSelect(item.href)}
              >
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {item.meta && (
                    <span className="text-xs text-muted-foreground">{item.meta}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-card-dark border-t border-primary-foreground/10"
          >
            <div className="px-4 py-4 flex flex-col gap-3 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-2 ${
                  location.pathname === "/"
                    ? "text-savannah-gold"
                    : "text-primary-foreground/80"
                }`}
              >
                Home
              </Link>
              {navGroups.map((group) => (
                <div key={group.label} className="pt-1">
                  <div className="text-[11px] uppercase tracking-wide text-primary-foreground/50 px-1 mb-1">
                    {group.label}
                  </div>
                  <div className="flex flex-col">
                    {group.children?.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`text-sm py-2 px-1 ${
                          location.pathname === child.href
                            ? "text-savannah-gold"
                            : "text-primary-foreground/80"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="h-px bg-primary-foreground/10 my-2" />
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10 justify-start w-full px-0"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {profile?.full_name || "My Profile"}
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    variant="ghost"
                    className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10 justify-start px-0 w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="gradient-sunset text-primary-foreground font-medium rounded-full mt-2 border-0 w-full">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
