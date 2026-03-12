import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SidebarNav from "@/components/SidebarNav";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "Free",
    tagline: "Explore Kenya with essential guidance.",
    features: [
      "20 AI questions per user",
      "Basic tourism recommendations",
      "Access to the discovery platform",
    ],
    cta: "Start Free",
    variant: "outline" as const,
  },
  {
    name: "Safari Sync Pro",
    price: "Monthly Subscription",
    tagline: "Unlimited planning and deeper insights.",
    features: [
      "Unlimited AI questions",
      "Advanced travel planning",
      "Personalized itinerary recommendations",
      "Deeper tourism insights",
      "Priority response speed",
    ],
    cta: "Upgrade to Pro",
    variant: "default" as const,
    highlight: true,
  },
];

const PackagesPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <SidebarNav />

      <main className="flex-1 pt-16">
        <section className="gradient-safari px-4 py-12">
          <div className="container mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Safari Sync Packages
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold">
              Choose a plan that fits your journey
            </h1>
            <p className="mt-3 text-sm md:text-base text-primary-foreground/80 max-w-2xl mx-auto">
              Start free, then upgrade when you want unlimited AI assistance and deeper travel intelligence.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild className="gradient-sunset border-0">
                <Link to="/trip-planner">Try the Assistant</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link to="/marketplace">Visit Marketplace</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border border-border p-6 bg-card shadow-sm ${
                  plan.highlight ? "ring-2 ring-savannah-gold/60" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </div>
                  {plan.highlight && (
                    <span className="text-xs font-medium bg-savannah-gold/20 text-savannah-gold px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="mt-4 text-2xl font-display font-bold text-foreground">{plan.price}</div>

                <div className="mt-5 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-safari-green mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  variant={plan.variant}
                  className={`mt-6 w-full ${plan.highlight ? "gradient-sunset border-0" : ""}`}
                >
                  <Link to={plan.highlight ? "/payments" : "/trip-planner"}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12">
          <div className="bg-muted/40 border border-border rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Community Marketplace Commission (10%)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Safari Sync supports community-based tourism by charging a 10% commission on marketplace sales.
              The buyer pays the listed price, and the platform fee is deducted from the seller payout.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Example price</p>
                <p className="text-lg font-semibold text-foreground">$20</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Platform fee (10%)</p>
                <p className="text-lg font-semibold text-foreground">$2</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Seller receives</p>
                <p className="text-lg font-semibold text-foreground">$18</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default PackagesPage;
