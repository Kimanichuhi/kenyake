import { Check, Sparkles, Users, CreditCard, Smartphone, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SidebarNav from "@/components/SidebarNav";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import CurrencyToggle from "@/components/CurrencyToggle";
import { useCurrency } from "@/contexts/CurrencyContext";

type Plan = {
  name: string;
  priceUsd: number | null; // null = free
  tagline: string;
  features: string[];
  cta: string;
  variant: "outline" | "default";
  highlight?: boolean;
  badge?: string;
  href: string;
  icon?: typeof Users;
};

const plans: Plan[] = [
  {
    name: "Free",
    priceUsd: null,
    tagline: "Explore Kenya with essential SafariSync guidance.",
    features: [
      "20 AI questions per user",
      "Browse destinations, wildlife & community listings",
      "Read multi-dimensional reviews",
      "Offline-first PWA with low-data mode",
    ],
    cta: "Start Free",
    variant: "outline",
    href: "/trip-planner",
  },
  {
    name: "Pro Individual",
    priceUsd: 3,
    tagline: "Unlimited AI planning for solo travellers.",
    features: [
      "Unlimited AI questions",
      "Personalized itinerary recommendations",
      "Priority response speed",
      "Carbon footprint estimator",
      "Safety alerts & 1-tap SOS",
    ],
    cta: "Upgrade to Pro",
    variant: "default",
    highlight: true,
    badge: "Recommended",
    href: "/payments",
  },
  {
    name: "Pro Family of 4",
    priceUsd: 7,
    tagline: "For families travelling together — up to 4 members.",
    features: [
      "Everything in Pro Individual",
      "Up to 4 members on one plan",
      "Shared real-time group chat",
      "Family-friendly itineraries",
      "Priority booking on family packages",
    ],
    cta: "Get Family of 4",
    variant: "default",
    badge: "Family",
    icon: Users,
    href: "/payments",
  },
  {
    name: "Pro Family of 8",
    priceUsd: 12,
    tagline: "For extended families & friend groups — up to 8 members.",
    features: [
      "Everything in Family of 4",
      "Up to 8 members on one plan",
      "Multi-guide coordination support",
      "Group impact & sponsorship tracking",
      "Priority diaspora & heritage bookings",
    ],
    cta: "Get Family of 8",
    variant: "default",
    badge: "Best for groups",
    icon: Users,
    href: "/payments",
  },
];

const paymentMethods = [
  {
    name: "M-Pesa",
    icon: Smartphone,
    description: "Pay via Safaricom STK push — the most popular mobile money option in Kenya.",
  },
  {
    name: "Airtel Money",
    icon: Smartphone,
    description: "Mobile money payments for Airtel Kenya subscribers via USSD prompt.",
  },
  {
    name: "Stripe",
    icon: CreditCard,
    description: "Secure international card processing for Visa, Mastercard and Amex.",
  },
  {
    name: "Card",
    icon: CreditCard,
    description: "Direct credit & debit card payments processed through our secure gateway.",
  },
  {
    name: "PayPal",
    icon: Wallet,
    description: "Familiar wallet checkout for diaspora travellers paying from abroad.",
  },
];

const PackagesPage = () => {
  const { format, currency } = useCurrency();

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
              Start free, upgrade for unlimited AI, or bring the whole family along.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="text-xs text-primary-foreground/80">Show prices in</span>
              <CurrencyToggle dark />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              const priceKes = plan.priceUsd === null ? null : plan.priceUsd * 130;
              const priceLabel = plan.priceUsd === null ? "Free" : `${format(priceKes, plan.priceUsd)} / mo`;
              const altCurrency = plan.priceUsd === null
                ? null
                : currency === "KES"
                  ? `${format(undefined, plan.priceUsd)}`
                  : `${format(priceKes, undefined)}`;
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl border border-border p-6 bg-card shadow-sm flex flex-col ${
                    plan.highlight ? "ring-2 ring-savannah-gold/60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {PlanIcon && <PlanIcon className="h-4 w-4 text-safari-green" />}
                      <h2 className="font-display text-lg font-bold text-foreground">{plan.name}</h2>
                    </div>
                    {plan.badge && (
                      <span className="text-[10px] font-medium bg-savannah-gold/20 text-savannah-gold px-2 py-1 rounded-full whitespace-nowrap">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

                  <div className="mt-4">
                    <div className="text-2xl font-display font-bold text-foreground">{priceLabel}</div>
                    {altCurrency && (
                      <div className="text-xs text-muted-foreground mt-0.5">≈ {altCurrency} / mo</div>
                    )}
                  </div>

                  <div className="mt-5 space-y-2 text-sm flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-safari-green mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant={plan.variant}
                    className={`mt-6 w-full ${plan.highlight ? "gradient-sunset border-0" : ""}`}
                  >
                    <Link to={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12">
          <div className="bg-muted/40 border border-border rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Accepted payment methods
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Safari Sync will support multiple payment options at checkout. These are described here for transparency — implementation is in progress.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.name} className="bg-card rounded-xl border border-border p-4 flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-safari-green/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-safari-green" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{method.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Note: Payment integrations are not yet active. M-Pesa is currently simulated via mock STK push for demo purposes.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12">
          <div className="bg-muted/40 border border-border rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Travelling as a family or with friends?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Plan together in a private real-time group chat — share ideas, split costs, and decide as a team.
            </p>
            <Button asChild className="mt-4 gradient-safari border-0">
              <Link to="/group-chat">Open Group Chat</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12">
          <div className="bg-muted/40 border border-border rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Community Marketplace Commission (10%)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Safari Sync supports community-based tourism by charging a 10% commission on marketplace sales.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Example price</p>
                <p className="text-lg font-semibold text-foreground">{format(2600, 20)}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Platform fee (10%)</p>
                <p className="text-lg font-semibold text-foreground">{format(260, 2)}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">Seller receives</p>
                <p className="text-lg font-semibold text-foreground">{format(2340, 18)}</p>
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
