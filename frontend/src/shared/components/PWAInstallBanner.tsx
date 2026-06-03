import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("safarisync_pwa_dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("safarisync_pwa_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[60] rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
        >
          <div className="flex items-start gap-3 p-4">
            <div className="shrink-0">
              <img src="/icon-192.png" alt="SafariSync" className="h-12 w-12 rounded-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Install SafariSync</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Add to your home screen for offline access, faster loading & a native app experience.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="gradient-safari text-primary-foreground rounded-full text-xs px-4 h-8 border-0"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Install App
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="text-xs h-8 px-3 rounded-full"
                >
                  <a href="/install">Learn more</a>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs text-muted-foreground h-8 px-3"
                >
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
