import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Loader2,
  Smartphone,
  Wallet,
  Globe,
  CheckCircle2,
  Clock,
  Download,
  Repeat,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SidebarNav from "@/components/SidebarNav";
import FooterSection from "@/components/FooterSection";
import CurrencyToggle from "@/components/CurrencyToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";

type Status = "live" | "pending" | "simulated";

type Method = {
  id: "mpesa" | "airtel" | "card" | "stripe" | "paypal";
  name: string;
  icon: typeof CreditCard;
  blurb: string;
  regions: string;
  status: Status;
  note: string;
};

const METHODS: Method[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    icon: Smartphone,
    blurb: "Safaricom STK push to your phone. Approve with your M-Pesa PIN.",
    regions: "Kenya, Tanzania",
    status: "simulated",
    note: "Daraja API integration is pending. Demo flow simulates the STK prompt.",
  },
  {
    id: "airtel",
    name: "Airtel Money",
    icon: Wallet,
    blurb: "USSD-based mobile money confirmation on your Airtel line.",
    regions: "Kenya, Uganda, Tanzania, Rwanda",
    status: "pending",
    note: "Airtel Open API connection is pending merchant onboarding.",
  },
  {
    id: "card",
    name: "Card",
    icon: CreditCard,
    blurb: "Visa, Mastercard or Amex via secure tokenised checkout.",
    regions: "Worldwide",
    status: "pending",
    note: "Card vault provider selection in progress. Form below is demo only.",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: Globe,
    blurb: "Hosted Stripe checkout for cards, Apple Pay and Google Pay.",
    regions: "46+ countries (incl. US, EU, UK, AU)",
    status: "pending",
    note: "Stripe account linking will be enabled before public launch.",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: Globe,
    blurb: "Recommended for diaspora travellers paying from abroad.",
    regions: "200+ markets",
    status: "pending",
    note: "PayPal Business onboarding scheduled alongside Stripe.",
  },
];

const STATUS_META: Record<Status, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  live: {
    label: "Live",
    className: "bg-safari-green/15 text-safari-green border-safari-green/30",
    icon: CheckCircle2,
  },
  simulated: {
    label: "Demo",
    className: "bg-savannah-gold/20 text-foreground border-savannah-gold/40",
    icon: Clock,
  },
  pending: {
    label: "Coming soon",
    className: "bg-muted text-muted-foreground border-border",
    icon: AlertCircle,
  },
};

type Invoice = {
  id: string;
  date: string;
  plan: string;
  amountUsd: number;
  amountKes: number;
  method: string;
  status: "paid" | "pending";
};

const STORAGE_INVOICES = "safarisync.invoices";
const STORAGE_AUTORENEW = "safarisync.autorenew";

const seedInvoices = (): Invoice[] => [
  {
    id: "INV-2604",
    date: "2026-04-12",
    plan: "Pro Family of 4",
    amountUsd: 7,
    amountKes: 910,
    method: "M-Pesa",
    status: "paid",
  },
  {
    id: "INV-2503",
    date: "2026-03-12",
    plan: "Pro Family of 4",
    amountUsd: 7,
    amountKes: 910,
    method: "M-Pesa",
    status: "paid",
  },
  {
    id: "INV-2402",
    date: "2026-02-12",
    plan: "Pro Individual",
    amountUsd: 3,
    amountKes: 390,
    method: "Card",
    status: "paid",
  },
];

const PaymentsPage = () => {
  const { toast } = useToast();
  const { currency, format } = useCurrency();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const planParam = params.get("plan") || "Pro Individual";
  const amountUsdParam = Number(params.get("usd")) || 3;
  const amountKesParam = Number(params.get("kes")) || amountUsdParam * 130;

  const [selected, setSelected] = useState<Method["id"]>("mpesa");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [processing, setProcessing] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window === "undefined") return seedInvoices();
    try {
      const raw = localStorage.getItem(STORAGE_INVOICES);
      return raw ? (JSON.parse(raw) as Invoice[]) : seedInvoices();
    } catch {
      return seedInvoices();
    }
  });
  const [autoRenew, setAutoRenew] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_AUTORENEW) !== "false";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_INVOICES, JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem(STORAGE_AUTORENEW, String(autoRenew));
  }, [autoRenew]);

  const activeMethod = useMemo(() => METHODS.find((m) => m.id === selected)!, [selected]);

  const handlePay = () => {
    if ((selected === "mpesa" || selected === "airtel") && !phone.trim()) {
      toast({ title: "Phone required", description: "Enter the mobile number to receive the prompt.", variant: "destructive" });
      return;
    }
    if (selected === "card" && (!cardNumber.trim() || !expiry.trim() || !cvc.trim() || !cardholder.trim())) {
      toast({ title: "Missing details", description: "Please fill all card fields.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      const newInvoice: Invoice = {
        id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date().toISOString().slice(0, 10),
        plan: planParam,
        amountUsd: amountUsdParam,
        amountKes: amountKesParam,
        method: activeMethod.name,
        status: activeMethod.status === "pending" ? "pending" : "paid",
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      toast({
        title: activeMethod.status === "pending" ? "Recorded as pending" : "Payment confirmed",
        description: `${activeMethod.name} • ${planParam} • ${format(amountKesParam, amountUsdParam)}`,
      });
    }, 1200);
  };

  const downloadReceipt = (inv: Invoice) => {
    const lines = [
      "SafariSync — Receipt",
      "----------------------------",
      `Invoice: ${inv.id}`,
      `Date: ${inv.date}`,
      `Plan: ${inv.plan}`,
      `Method: ${inv.method}`,
      `Status: ${inv.status.toUpperCase()}`,
      `Amount: ${currency === "USD" ? `$${inv.amountUsd}` : `KSh ${inv.amountKes.toLocaleString()}`}`,
      "",
      "Thank you for travelling with SafariSync.",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <SidebarNav />

      <main className="flex-1 pt-16">
        <section className="gradient-safari px-4 py-10">
          <div className="container mx-auto text-primary-foreground">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  <CreditCard className="h-3.5 w-3.5" /> Payments &amp; Billing
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold">
                  Pay your way
                </h1>
                <p className="mt-3 text-sm md:text-base text-primary-foreground/80 max-w-2xl">
                  Mobile money, cards or international wallets — pick the option that suits you.
                  Your KSh / USD preference stays the same across every session.
                </p>
              </div>
              <CurrencyToggle dark />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <Tabs defaultValue="checkout" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="checkout">Checkout</TabsTrigger>
              <TabsTrigger value="methods">Methods</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Checkout */}
            <TabsContent value="checkout" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">{planParam}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed monthly • Cancel anytime from this page.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-foreground">
                        {format(amountKesParam, amountUsdParam)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currency === "KES" ? `≈ $${amountUsdParam}` : `≈ KSh ${amountKesParam.toLocaleString()}`} / month
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Choose a payment method
                  </p>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    {METHODS.map((m) => {
                      const Icon = m.icon;
                      const StatusIcon = STATUS_META[m.status].icon;
                      const isSelected = selected === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelected(m.id)}
                          className={`text-left border rounded-xl p-3 transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-foreground" />
                              <span className="font-medium text-sm text-foreground">{m.name}</span>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${STATUS_META[m.status].className}`}>
                              <StatusIcon className="h-2.5 w-2.5 mr-1" />
                              {STATUS_META[m.status].label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">{m.regions}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 grid gap-4">
                    {(selected === "mpesa" || selected === "airtel") && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {selected === "mpesa" ? "Safaricom" : "Airtel"} number
                        </label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="2547XXXXXXXX"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {selected === "card" && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Card number</label>
                          <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" className="mt-1" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Expiry</label>
                            <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">CVC</label>
                            <Input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Cardholder name</label>
                          <Input value={cardholder} onChange={(e) => setCardholder(e.target.value)} placeholder="Name on card" className="mt-1" />
                        </div>
                      </>
                    )}

                    {(selected === "stripe" || selected === "paypal") && (
                      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        You'll be redirected to {activeMethod.name} to complete the payment securely.
                      </div>
                    )}

                    {activeMethod.status !== "live" && (
                      <div className="flex gap-2 rounded-xl bg-muted/40 border border-border p-3 text-xs text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{activeMethod.note}</span>
                      </div>
                    )}
                  </div>

                  <Button className="mt-6 w-full gradient-sunset border-0" onClick={handlePay} disabled={processing}>
                    {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {processing ? "Processing..." : `Pay ${format(amountKesParam, amountUsdParam)} via ${activeMethod.name}`}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/30 border border-border rounded-2xl p-6">
                    <h3 className="font-display text-lg font-semibold text-foreground">What's included</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>• Unlimited AI trip planning</li>
                      <li>• Shared family group chat</li>
                      <li>• Priority diaspora bookings</li>
                      <li>• Offline trip packs</li>
                    </ul>
                    <Separator className="my-4" />
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-safari-green" /> PCI-aware checkout</div>
                      <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-safari-green" /> TLS-encrypted session</div>
                    </div>
                    <Button asChild variant="outline" className="mt-5 w-full">
                      <Link to="/packages">Change plan</Link>
                    </Button>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground flex items-center gap-2">
                          <Repeat className="h-4 w-4" /> Auto-renew
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Renews monthly using your last successful method.</p>
                      </div>
                      <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Methods */}
            <TabsContent value="methods" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  const StatusIcon = STATUS_META[m.status].icon;
                  return (
                    <div key={m.id} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5 text-foreground" />
                          </div>
                          <h3 className="font-display text-lg font-semibold text-foreground">{m.name}</h3>
                        </div>
                        <Badge variant="outline" className={STATUS_META[m.status].className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_META[m.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">{m.blurb}</p>
                      <Separator className="my-4" />
                      <dl className="grid grid-cols-3 gap-2 text-xs">
                        <div className="col-span-1 text-muted-foreground">Regions</div>
                        <div className="col-span-2 text-foreground">{m.regions}</div>
                        <div className="col-span-1 text-muted-foreground">Status</div>
                        <div className="col-span-2 text-foreground">{m.note}</div>
                      </dl>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Billing */}
            <TabsContent value="billing" className="mt-6">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-foreground" />
                    <h3 className="font-display text-lg font-semibold text-foreground">Billing history</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing in {currency === "KES" ? "Kenyan Shillings" : "US Dollars"}
                  </p>
                </div>
                {invoices.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No invoices yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between gap-4 p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {inv.plan} · <span className="text-muted-foreground">{inv.id}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {inv.date} • {inv.method}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {format(inv.amountKes, inv.amountUsd)}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                inv.status === "paid"
                                  ? "bg-safari-green/15 text-safari-green border-safari-green/30 text-[10px]"
                                  : "bg-savannah-gold/20 text-foreground border-savannah-gold/40 text-[10px]"
                              }
                            >
                              {inv.status}
                            </Badge>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => downloadReceipt(inv)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!user && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Sign in to sync billing history across devices.{" "}
                  <Link to="/auth" className="underline">Sign in</Link>
                </p>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default PaymentsPage;
