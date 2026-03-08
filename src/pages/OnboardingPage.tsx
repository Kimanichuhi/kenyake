import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, User, MapPin, Heart, Wallet, Accessibility, Globe, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const travelStyles = [
  { id: "wildlife", label: "Wildlife Safari", emoji: "🦁" },
  { id: "cultural", label: "Cultural Immersion", emoji: "🎭" },
  { id: "adventure", label: "Adventure", emoji: "🏔️" },
  { id: "beach", label: "Beach & Marine", emoji: "🏖️" },
  { id: "luxury", label: "Luxury", emoji: "✨" },
  { id: "budget", label: "Budget Travel", emoji: "💰" },
  { id: "family", label: "Family Friendly", emoji: "👨‍👩‍👧‍👦" },
  { id: "photography", label: "Photography", emoji: "📷" },
];

const budgetRanges = [
  { id: "budget", label: "Under $50/day", desc: "Hostels, local transport, street food" },
  { id: "mid", label: "$50 — $150/day", desc: "Mid-range lodges, guided tours" },
  { id: "comfort", label: "$150 — $300/day", desc: "Comfortable lodges, private guides" },
  { id: "luxury", label: "$300+/day", desc: "Luxury camps, exclusive experiences" },
];

const accessibilityNeeds = [
  { id: "none", label: "No special needs" },
  { id: "wheelchair", label: "Wheelchair accessible" },
  { id: "mobility", label: "Limited mobility" },
  { id: "visual", label: "Visual impairment" },
  { id: "hearing", label: "Hearing impairment" },
  { id: "elderly", label: "Elderly-friendly" },
  { id: "children", label: "Young children" },
];

const languages = ["English", "Swahili", "German", "French", "Spanish", "Italian", "Mandarin", "Japanese"];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    nationality: "",
    traveler_type: "tourist" as "tourist" | "diaspora" | "nomad" | "corporate",
    travel_styles: [] as string[],
    budget_range: "",
    accessibility_needs: [] as string[],
    languages: [] as string[],
    first_visit: true,
  });

  // Pre-fill from existing profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        nationality: profile.nationality || "",
        traveler_type: (profile.traveler_type as any) || "tourist",
        travel_styles: profile.travel_styles || [],
        budget_range: profile.budget_range || "",
        accessibility_needs: profile.accessibility_needs || [],
        languages: profile.languages || [],
        first_visit: profile.first_visit ?? true,
      });
    }
  }, [profile]);

  const steps = [
    { title: "Welcome", icon: User },
    { title: "Travel Style", icon: Heart },
    { title: "Budget", icon: Wallet },
    { title: "Accessibility", icon: Accessibility },
    { title: "Languages", icon: Globe },
    { title: "Ready!", icon: Plane },
  ];

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const completeOnboarding = async () => {
    if (user) {
      setSaving(true);
      const { error } = await updateProfile({
        ...formData,
        onboarding_completed: true,
      });
      setSaving(false);
      if (error) {
        toast({ title: "Error saving preferences", description: String(error), variant: "destructive" });
        return;
      }
      await refreshProfile();
      toast({ title: "Preferences saved!", description: "Your profile has been updated." });
    } else {
      // For non-authenticated users, store in localStorage
      localStorage.setItem("safarikenya_profile", JSON.stringify(formData));
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-foreground text-primary-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-all ${i <= step ? "gradient-sunset text-primary-foreground" : "bg-primary-foreground/10 text-primary-foreground/40"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 mx-1 ${i < step ? "bg-savannah-gold" : "bg-primary-foreground/10"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card-dark p-8 md:p-10 rounded-2xl"
          >
            {step === 0 && (
              <div className="text-center">
                <div className="text-5xl mb-4">🦒</div>
                <h1 className="font-display text-3xl font-bold mb-3">
                  {user ? `Welcome back, ${formData.full_name || "Explorer"}!` : "Welcome to SafariKenya"}
                </h1>
                <p className="text-primary-foreground/60 font-body mb-8">
                  {user ? "Update your travel preferences" : "Let's personalize your experience. This takes about 1 minute."}
                </p>
                <div className="space-y-4 max-w-sm mx-auto">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body outline-none focus:border-savannah-gold"
                  />
                  <input
                    type="text"
                    placeholder="Your nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body outline-none focus:border-savannah-gold"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {(["tourist", "diaspora", "nomad", "corporate"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, traveler_type: type })}
                        className={`px-4 py-3 rounded-xl text-sm font-body font-medium transition-all ${formData.traveler_type === type ? "gradient-sunset text-primary-foreground" : "bg-primary-foreground/10 text-primary-foreground/60 hover:bg-primary-foreground/20"}`}
                      >
                        {type === "tourist" && "Tourist"}
                        {type === "diaspora" && "Diaspora/Heritage"}
                        {type === "nomad" && "Digital Nomad"}
                        {type === "corporate" && "Business/Corporate"}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <label className="text-sm font-body text-primary-foreground/60">First time visiting Kenya?</label>
                    <button onClick={() => setFormData({ ...formData, first_visit: !formData.first_visit })} className={`w-12 h-6 rounded-full relative transition-colors ${formData.first_visit ? "bg-savannah-gold" : "bg-primary-foreground/20"}`}>
                      <div className={`absolute top-1 h-4 w-4 rounded-full bg-primary-foreground transition-all ${formData.first_visit ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-center mb-2">What excites you most?</h2>
                <p className="text-primary-foreground/60 font-body text-center mb-8">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {travelStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setFormData({ ...formData, travel_styles: toggleArrayItem(formData.travel_styles, style.id) })}
                      className={`p-4 rounded-xl text-center transition-all ${formData.travel_styles.includes(style.id) ? "gradient-sunset text-primary-foreground" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"}`}
                    >
                      <div className="text-2xl mb-2">{style.emoji}</div>
                      <div className="text-xs font-body font-medium">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-center mb-2">What's your budget?</h2>
                <p className="text-primary-foreground/60 font-body text-center mb-8">Per person, per day</p>
                <div className="space-y-3 max-w-md mx-auto">
                  {budgetRanges.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setFormData({ ...formData, budget_range: b.id })}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${formData.budget_range === b.id ? "gradient-sunset text-primary-foreground" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"}`}
                    >
                      <div>
                        <div className="font-body font-semibold">{b.label}</div>
                        <div className="text-xs opacity-70">{b.desc}</div>
                      </div>
                      {formData.budget_range === b.id && <Check className="h-5 w-5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-center mb-2">Any accessibility needs?</h2>
                <p className="text-primary-foreground/60 font-body text-center mb-8">We'll prioritize suitable destinations</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {accessibilityNeeds.map((need) => (
                    <button
                      key={need.id}
                      onClick={() => setFormData({ ...formData, accessibility_needs: toggleArrayItem(formData.accessibility_needs, need.id) })}
                      className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${formData.accessibility_needs.includes(need.id) ? "gradient-safari text-primary-foreground" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"}`}
                    >
                      {need.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-center mb-2">Languages you speak?</h2>
                <p className="text-primary-foreground/60 font-body text-center mb-8">We'll match you with suitable guides</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setFormData({ ...formData, languages: toggleArrayItem(formData.languages, lang) })}
                      className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${formData.languages.includes(lang) ? "gradient-sunset text-primary-foreground" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="font-display text-2xl font-bold mb-2">You're all set, {formData.full_name || "Explorer"}!</h2>
                <p className="text-primary-foreground/60 font-body mb-8">Your personalized Kenya adventure awaits. We'll recommend experiences based on your preferences.</p>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {formData.travel_styles.map((s) => {
                    const style = travelStyles.find((ts) => ts.id === s);
                    return style ? (
                      <span key={s} className="px-3 py-1 rounded-full bg-savannah-gold/20 text-savannah-gold text-xs font-body">{style.emoji} {style.label}</span>
                    ) : null;
                  })}
                </div>
                {!user && (
                  <p className="text-primary-foreground/40 text-sm font-body">
                    <button onClick={() => navigate("/auth")} className="text-savannah-gold hover:underline">Sign in</button> to save your preferences permanently
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10">
              {step > 0 ? (
                <Button variant="ghost" onClick={prevStep} className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              ) : (
                <div />
              )}
              {step < steps.length - 1 ? (
                <Button onClick={nextStep} className="gradient-sunset text-primary-foreground border-0">
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={completeOnboarding} disabled={saving} className="gradient-sunset text-primary-foreground border-0">
                  {saving ? "Saving..." : "Start Exploring"} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center mt-6 text-primary-foreground/40 text-xs font-body">
          <button onClick={() => navigate("/")} className="hover:text-savannah-gold transition-colors">Skip for now →</button>
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
