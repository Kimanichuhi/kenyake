import { useState } from "react";
import { CreditCard, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SidebarNav from "@/components/SidebarNav";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PaymentsPage = () => {
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleProceed = () => {
    if (!cardNumber.trim() || !expiry.trim() || !cvc.trim() || !cardholder.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in all card fields to proceed.",
        variant: "destructive",
      });
      return;
    }
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Payment initiated",
        description: "Your card payment session has started.",
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <SidebarNav />

      <main className="flex-1 pt-16">
        <section className="gradient-safari px-4 py-10">
          <div className="container mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
              <CreditCard className="h-3.5 w-3.5" /> Secure Card Payments
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-display font-bold">
              Upgrade to Safari Sync Pro
            </h1>
            <p className="mt-3 text-sm md:text-base text-primary-foreground/80 max-w-2xl mx-auto">
              Pay securely with your card to unlock unlimited AI assistance and premium travel intelligence.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-xl font-bold text-foreground">Card Payment</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Use any major debit or credit card. Payments are processed securely.
              </p>

              <div className="mt-6 grid gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Card number</label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Expiry</label>
                    <Input
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">CVC</label>
                    <Input
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Cardholder name</label>
                  <Input
                    value={cardholder}
                    onChange={(e) => setCardholder(e.target.value)}
                    placeholder="Name on card"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button className="mt-6 w-full gradient-sunset border-0" onClick={handleProceed} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {processing ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground">What you get</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Unlimited AI questions</li>
                <li>Advanced itinerary planning</li>
                <li>Priority response speed</li>
              </ul>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-safari-green" />
                  <span>PCI-compliant card handling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-safari-green" />
                  <span>Encrypted checkout session</span>
                </div>
              </div>

              <Button asChild variant="outline" className="mt-6 w-full">
                <Link to="/packages">Back to Packages</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default PaymentsPage;
