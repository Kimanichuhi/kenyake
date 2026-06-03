import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, MapPin, Languages, Award, DollarSign, Camera,
  CheckCircle2, Loader2, ArrowRight, Shield, BookOpen
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const specializationOptions = [
  "Wildlife Safari", "Big Five Tracking", "Photography", "Birding", "Hiking",
  "Cultural Heritage", "Coastal Heritage", "Marine Wildlife", "Walking Safari",
  "Food Tours", "History", "Night Drives", "Star Gazing", "Snorkeling",
  "Community Tourism", "Urban Tours", "Conservation"
];

const languageOptions = [
  "English", "Swahili", "Maa", "Kikuyu", "Luo", "Kamba", "Samburu",
  "French", "German", "Italian", "Spanish", "Arabic", "Giriama", "Turkana"
];

const certificationOptions = [
  "KWS Bronze Guide", "KWS Silver Guide", "KWS Gold Guide",
  "FGASA Level 1", "FGASA Level 2", "FGASA Level 3",
  "First Aid Certified", "Wilderness First Responder", "Mountain Rescue",
  "PADI Divemaster", "Boat Captain License", "4WD Advanced",
  "Photography Workshop Leader", "Ornithology Diploma",
  "Cultural Tourism Diploma", "Food Safety Certified"
];

const GuideRegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    county: "",
    photoUrl: "",
    pricePerDay: "",
    yearsExperience: "",
    languages: [] as string[],
    specializations: [] as string[],
    certifications: [] as string[],
    certificationLevel: "bronze",
  });

  const toggleArray = (field: "languages" | "specializations" | "certifications", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in first.", variant: "destructive" });
      return;
    }
    if (!form.name || !form.bio || !form.location || !form.pricePerDay) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { error } = await supabase.from("guides").insert({
      user_id: user.id,
      name: form.name,
      slug: slug + "-" + Date.now().toString(36),
      bio: form.bio,
      location: form.location,
      county: form.county || null,
      photo_url: form.photoUrl || null,
      price_per_day: parseInt(form.pricePerDay),
      years_experience: parseInt(form.yearsExperience) || 0,
      languages: form.languages,
      specializations: form.specializations,
      certifications: form.certifications,
      certification_level: form.certificationLevel,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🎉 Welcome aboard!", description: "Your guide profile is now live." });
      navigate("/guide-dashboard");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground font-body mb-6">You need an account to register as a guide.</p>
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
              <BookOpen className="h-3 w-3 mr-1" /> Guide Registration
            </Badge>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Become a Guide</h1>
            <p className="text-muted-foreground font-body mb-8">
              Share your knowledge, set your own prices, and connect with travelers from around the world.
            </p>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-body font-medium ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </div>
                  <span className="text-xs font-body text-muted-foreground hidden sm:block">
                    {s === 1 ? "Profile" : s === 2 ? "Skills" : "Pricing"}
                  </span>
                  {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Profile */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Bio *</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell travelers about your experience, background, and what makes your tours special..."
                    rows={4}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-body font-medium text-foreground mb-1 block">Location *</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Maasai Mara"
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-body font-medium text-foreground mb-1 block">County</label>
                    <input
                      value={form.county}
                      onChange={(e) => setForm((p) => ({ ...p, county: e.target.value }))}
                      placeholder="e.g. Narok"
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Photo URL</label>
                  <input
                    value={form.photoUrl}
                    onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!form.name || !form.bio || !form.location} className="rounded-full">
                    Next: Skills <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-2 block">
                    <Languages className="inline h-4 w-4 mr-1" /> Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggleArray("languages", lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                          form.languages.includes(lang)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-2 block">
                    <Award className="inline h-4 w-4 mr-1" /> Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {specializationOptions.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => toggleArray("specializations", spec)}
                        className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                          form.specializations.includes(spec)
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-2 block">
                    <Shield className="inline h-4 w-4 mr-1" /> Certifications
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {certificationOptions.map((cert) => (
                      <button
                        key={cert}
                        onClick={() => toggleArray("certifications", cert)}
                        className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                          form.certifications.includes(cert)
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">Years of Experience</label>
                  <input
                    type="number"
                    value={form.yearsExperience}
                    onChange={(e) => setForm((p) => ({ ...p, yearsExperience: e.target.value }))}
                    placeholder="e.g. 5"
                    min="0"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground max-w-[120px]"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">Back</Button>
                  <Button onClick={() => setStep(3)} className="rounded-full">
                    Next: Pricing <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Pricing */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1 block">
                    <DollarSign className="inline h-4 w-4 mr-1" /> Daily Rate (USD) *
                  </label>
                  <p className="text-xs text-muted-foreground font-body mb-2">You set your own price. No platform fees.</p>
                  <input
                    type="number"
                    value={form.pricePerDay}
                    onChange={(e) => setForm((p) => ({ ...p, pricePerDay: e.target.value }))}
                    placeholder="e.g. 100"
                    min="10"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-body bg-background text-foreground max-w-[200px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-2 block">Certification Level</label>
                  <div className="flex gap-3">
                    {(["bronze", "silver", "gold"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setForm((p) => ({ ...p, certificationLevel: level }))}
                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium capitalize border transition-colors ${
                          form.certificationLevel === level
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {level === "bronze" ? "🥉" : level === "silver" ? "🥈" : "🥇"} {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-xl p-5 border border-border space-y-3">
                  <h3 className="font-display font-semibold text-foreground">Profile Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm font-body">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{form.name}</span>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground">{form.location}</span>
                    <span className="text-muted-foreground">Languages:</span>
                    <span className="text-foreground">{form.languages.join(", ") || "—"}</span>
                    <span className="text-muted-foreground">Specializations:</span>
                    <span className="text-foreground">{form.specializations.length} selected</span>
                    <span className="text-muted-foreground">Daily rate:</span>
                    <span className="text-foreground font-semibold">${form.pricePerDay}/day</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-full">Back</Button>
                  <Button onClick={handleSubmit} disabled={loading || !form.pricePerDay} className="rounded-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Submit Registration
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default GuideRegisterPage;
