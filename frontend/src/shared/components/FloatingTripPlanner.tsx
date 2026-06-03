import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const FloatingTripPlanner = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the floating button when already on the trip planner page
  if (location.pathname.startsWith("/trip-planner")) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/trip-planner")}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-safari shadow-lg flex items-center justify-center group"
        aria-label="Open Sync Safaris Trip Planner"
      >
        <Bot className="h-6 w-6 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-pulse" />
      </motion.button>
    </AnimatePresence>
  );
};

export default FloatingTripPlanner;
