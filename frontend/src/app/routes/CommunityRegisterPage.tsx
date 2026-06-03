import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, Shield, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CommunityRegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    county: "",
    region: "",
    description: "",
    leaderName: "",
    leaderTitle: "",
    contactEmail: "",
    contactPhone: "",
    maxDailyVisitors: "",
    visitorGuidelines: "",
  });

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in first.", variant: "destructive" });
      return;
    }
    if (!form.name || !form.county || !form.description) {
      toast({ title: "Missing fields", description: "Name, county, and description are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const maxDaily = form.maxDailyVisitors ? parseInt(form.maxDailyVisitors, 10) : null;

    const { error } = await supabase.from("communities").insert({
      name: form.name,
      county: form.county,
      region: form.region || null,
      description: form.description,
      leader_name: form.leaderName || null,
      leader_title: form.leaderTitle || null,
      contact_email: form.contactEmail || null,
      contact_phone: form.contactPhone || null,
      max_daily_visitors: Number.isNaN(maxDaily as number) ? null : maxDaily,
      visitor_guidelines: form.visitorGuidelines || null,
      managed_by: user.id,
      current_visitor_count: 0,
      is_published: false,
      slug: `${slug}-${Date.now().toString(36)}`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Community submitted", description: "Your community is now pending review." });
    navigate("/community-dashboard");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground font-body mb-6">You need an account to add a community.</p>
          <Button asChild className="rounded-full"><a href="/auth">Sign In</a></Button>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/25 font-body">
              <Building2 className="h-3 w-3 mr-1" /> Community Registration
            </Badge>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Add Your Community</h1>
            <p className="text-muted-foreground font-body mb-8">
              Share your story, protect your culture, and welcome visitors in a way that benefits your people.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Community Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Maasai of Narok"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">County *</label>
                  <input
                    value={form.county}
                    onChange={(e) => setForm((p) => ({ ...p, county: e.target.value }))}
                    placeholder="e.g. Narok"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Region</label>
                  <input
                    value={form.region}
                    onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                    placeholder="e.g. Rift Valley"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Tell visitors about your community, traditions, and what makes your culture special."
                  rows={4}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Leader Name</label>
                  <input
                    value={form.leaderName}
                    onChange={(e) => setForm((p) => ({ ...p, leaderName: e.target.value }))}
                    placeholder="Community representative"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Leader Title</label>
                  <input
                    value={form.leaderTitle}
                    onChange={(e) => setForm((p) => ({ ...p, leaderTitle: e.target.value }))}
                    placeholder="e.g. Chairperson"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Contact Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                    placeholder="community@example.com"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Contact Phone</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="+254..."
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Max Daily Visitors</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxDailyVisitors}
                    onChange={(e) => setForm((p) => ({ ...p, maxDailyVisitors: e.target.value }))}
                    placeholder="e.g. 120"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1 block">Visitor Guidelines</label>
                <textarea
                  value={form.visitorGuidelines}
                  onChange={(e) => setForm((p) => ({ ...p, visitorGuidelines: e.target.value }))}
                  placeholder="Share respectful visiting guidelines for your community."
                  rows={3}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground resize-none"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading} className="rounded-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  Submit Community
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default CommunityRegisterPage;
