import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, Heart, User, ChevronDown, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Destinations", href: "/destinations" },
  { label: "Experiences", href: "/experiences" },
  { label: "Wildlife", href: "/wildlife" },
  { label: "Nearby", href: "/nearby" },
  { label: "Community", href: "/community" },
];

const moreLinks = [
  { label: "🤖 Trip Planner", href: "/trip-planner" },
  { label: "🐾 Wildlife Intel", href: "/wildlife-intel" },
  { label: "🧭 Local Guides", href: "/guides" },
  { label: "🎓 Become a Guide", href: "/guide-register" },
  { label: "Cultural Events", href: "/events" },
  { label: "Food & Dining", href: "/food" },
  { label: "Digital Nomads", href: "/nomads" },
  { label: "Safety", href: "/safety" },
  { label: "Your Impact", href: "/impact" },
  { label: "📚 Cultural Prep", href: "/cultural-prep" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card-dark"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-savannah-gold">
            Safari<span className="text-primary-foreground">Kenya</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm font-medium transition-colors ${location.pathname.startsWith(link.href) ? "text-savannah-gold" : "text-primary-foreground/80 hover:text-savannah-gold"}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="text-sm font-medium text-primary-foreground/80 hover:text-savannah-gold transition-colors flex items-center gap-1"
            >
              More <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 glass-card rounded-xl shadow-lg overflow-hidden"
                >
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={`block px-4 py-2.5 text-sm font-body transition-colors ${location.pathname === link.href ? "bg-muted text-foreground" : "text-foreground/80 hover:bg-muted"}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10">
            <Globe className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10">
            <Heart className="h-4 w-4" />
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" className="text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10 rounded-full px-3 text-sm">
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

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-primary-foreground/80">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-card-dark border-t border-primary-foreground/10"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {[...navLinks, ...moreLinks].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 ${location.pathname === link.href ? "text-savannah-gold" : "text-primary-foreground/80"}`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-primary-foreground/80">
                    My Profile
                  </Link>
                  <Button onClick={() => { signOut(); setMobileOpen(false); }} variant="ghost" className="text-primary-foreground/80 justify-start px-0">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="gradient-sunset text-primary-foreground font-medium rounded-full mt-2 border-0 w-full">
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
