import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  Chrome,
  ShieldCheck,
  WifiOff,
  Sparkles,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<"ready" | "installed" | "unavailable">("unavailable");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;

    if (isStandalone) {
      setInstallState("installed");
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallState("ready");
    };

    const installedHandler = () => {
      setInstallState("installed");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallState("installed");
    }
    setDeferredPrompt(null);
  };

  const installCards = useMemo(
    () => [
      {
        title: "Android (Chrome)",
        icon: <Smartphone className="h-5 w-5" />,
        badge: "Recommended",
        steps: [
          "Open SafariSync in Chrome",
          "Tap the menu (three dots)",
          "Choose Install app or Add to Home screen",
          "Confirm to finish",
        ],
      },
      {
        title: "iPhone or iPad (Safari)",
        icon: <Share2 className="h-5 w-5" />,
        badge: "iOS",
        steps: [
          "Open SafariSync in Safari",
          "Tap Share",
          "Select Add to Home Screen",
          "Confirm the name and add",
        ],
      },
      {
        title: "Desktop (Chrome or Edge)",
        icon: <Monitor className="h-5 w-5" />,
        badge: "Desktop",
        steps: [
          "Open SafariSync in your browser",
          "Click the install icon in the address bar",
          "Choose Install",
          "Launch from your desktop or app list",
        ],
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 pt-24 max-w-5xl space-y-10">
        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <Badge className="rounded-full px-3 py-1 text-xs font-semibold">PWA Install</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-4">
              Install SafariSync as an app
            </h1>
            <p className="text-muted-foreground mt-3 text-base">
              Get offline access, faster load times, and a full screen experience on any device.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                onClick={handleInstall}
                disabled={installState !== "ready"}
                className="gradient-safari text-primary-foreground rounded-full px-5"
              >
                <Download className="h-4 w-4 mr-2" />
                {installState === "installed" ? "Already installed" : "Install now"}
              </Button>
              <Button variant="outline" className="rounded-full px-5" asChild>
                <a href="/offline-settings">Offline settings</a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {installState === "ready" && "Install prompt is ready for this device."}
              {installState === "installed" && "SafariSync is already installed on this device."}
              {installState === "unavailable" && "Install prompt not available. Use the steps below."}
            </p>
          </div>
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Why install?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <WifiOff className="h-4 w-4 text-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Offline mode</p>
                  <p>Access saved destinations, maps, and guides without data.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Reliable experience</p>
                  <p>Runs full screen and loads faster than a typical website.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Chrome className="h-4 w-4 text-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">One tap launch</p>
                  <p>Quick access from your home screen or desktop.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-foreground">Install steps</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {installCards.map((card) => (
              <Card key={card.title} className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {card.icon}
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="rounded-full text-[11px] px-2 py-0.5">
                    {card.badge}
                  </Badge>
                  <div className="space-y-1">
                    {card.steps.map((step) => (
                      <p key={step}>- {step}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default PWAInstallPage;
