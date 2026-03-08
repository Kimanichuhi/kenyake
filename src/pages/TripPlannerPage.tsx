import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User as UserIcon, Settings2, Sparkles, MapPin, Clock,
  DollarSign, Users, Dumbbell, UtensilsCrossed, Compass, Mountain,
  Camera, Tent, Palette, Heart, Baby, Loader2, ChevronDown, X, Sun,
  Cloud, TreePine, Binoculars
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trip-assistant`;

type Msg = { role: "user" | "assistant"; content: string };

interface TripContext {
  tripType: string;
  groupSize: string;
  budget: string;
  fitnessLevel: string;
  dietaryPrefs: string[];
  interests: string[];
  isFirstVisit: boolean;
  travelDates: string;
  currentLocation: string;
  timeLeft: string;
}

const defaultContext: TripContext = {
  tripType: "leisure",
  groupSize: "solo",
  budget: "mid-range",
  fitnessLevel: "moderate",
  dietaryPrefs: [],
  interests: [],
  isFirstVisit: true,
  travelDates: "",
  currentLocation: "",
  timeLeft: "",
};

const quickActions = [
  { label: "Plan my trip", prompt: "I want to plan a trip to Kenya. Help me build an itinerary!", icon: <Compass className="h-3.5 w-3.5" /> },
  { label: "I have 4 hours", prompt: "I have 4 hours left today. What's the best use of my time?", icon: <Clock className="h-3.5 w-3.5" /> },
  { label: "What should I do today?", prompt: "What should I do today? Give me day-of suggestions based on the current time.", icon: <Sun className="h-3.5 w-3.5" /> },
  { label: "Pre-arrival briefing", prompt: "I'm arriving in Kenya in 7 days. Give me a pre-arrival intelligence briefing.", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { label: "Avoid crowds", prompt: "How can I avoid the tourist crowds and see the best of Kenya?", icon: <Users className="h-3.5 w-3.5" /> },
  { label: "Wildlife calendar", prompt: "What wildlife events are happening this month in Kenya?", icon: <Binoculars className="h-3.5 w-3.5" /> },
  { label: "Budget tips", prompt: "Give me the best budget tips for traveling in Kenya on a tight budget.", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { label: "Weather update", prompt: "What's the weather like across Kenya right now and how should I plan around it?", icon: <Cloud className="h-3.5 w-3.5" /> },
];

const tripTypes = ["leisure", "adventure", "cultural", "honeymoon", "business+leisure"];
const groupSizes = ["solo", "couple", "friends (3-6)", "family with kids", "large group (7+)"];
const budgets = ["budget (<$50/day)", "mid-range ($50-200/day)", "luxury ($200-500/day)", "ultra-luxury ($500+/day)"];
const fitnessLevels = ["low (gentle walks only)", "moderate (some hiking ok)", "high (strenuous treks welcome)"];
const dietaryOptions = ["vegetarian", "vegan", "halal", "kosher", "gluten-free", "no restrictions"];
const interestOptions = [
  { label: "Wildlife Safari", icon: <Binoculars className="h-3 w-3" /> },
  { label: "Photography", icon: <Camera className="h-3 w-3" /> },
  { label: "Beach", icon: <Sun className="h-3 w-3" /> },
  { label: "Hiking", icon: <Mountain className="h-3 w-3" /> },
  { label: "Culture", icon: <Palette className="h-3 w-3" /> },
  { label: "Food", icon: <UtensilsCrossed className="h-3 w-3" /> },
  { label: "Camping", icon: <Tent className="h-3 w-3" /> },
  { label: "Birdwatching", icon: <TreePine className="h-3 w-3" /> },
  { label: "Romance", icon: <Heart className="h-3 w-3" /> },
  { label: "Family Fun", icon: <Baby className="h-3 w-3" /> },
];

const TripPlannerPage = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tripContext, setTripContext] = useState<TripContext>(defaultContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, tripContext }),
    });

    if (resp.status === 429) {
      toast({ title: "Rate limited", description: "Please wait a moment and try again.", variant: "destructive" });
      return;
    }
    if (resp.status === 402) {
      toast({ title: "Credits depleted", description: "AI credits need topping up.", variant: "destructive" });
      return;
    }
    if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const snapshot = assistantSoFar;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
        }
        return [...prev, { role: "assistant", content: snapshot }];
      });
    };

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, idx);
        textBuffer = textBuffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(json);
          const c = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (c) upsert(c);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Flush remaining
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const json = raw.slice(6).trim();
        if (json === "[DONE]") continue;
        try {
          const parsed = JSON.parse(json);
          const c = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (c) upsert(c);
        } catch { /* ignore */ }
      }
    }
  }, [tripContext, toast]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      await streamChat(newMessages);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const toggleInterest = (label: string) => {
    setTripContext((prev) => ({
      ...prev,
      interests: prev.interests.includes(label) ? prev.interests.filter((i) => i !== label) : [...prev.interests, label],
    }));
  };

  const toggleDiet = (d: string) => {
    setTripContext((prev) => ({
      ...prev,
      dietaryPrefs: prev.dietaryPrefs.includes(d) ? prev.dietaryPrefs.filter((i) => i !== d) : [...prev.dietaryPrefs, d],
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 flex flex-col">
        {/* Header */}
        <div className="gradient-safari px-4 py-6">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-5 w-5 text-primary-foreground" />
                <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">AI Trip Intelligence</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
                Your Kenya Trip <span className="text-savannah-gold">Assistant</span>
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="border-primary-foreground/30 text-primary-foreground/80 hover:bg-primary-foreground/10"
            >
              <Settings2 className="h-4 w-4 mr-1" /> Trip Profile
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row container mx-auto">
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="lg:w-80 border-r border-border overflow-hidden shrink-0"
              >
                <div className="p-4 space-y-4 w-80">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-sm">Trip Profile</h3>
                    <button onClick={() => setShowSettings(false)} className="lg:hidden"><X className="h-4 w-4" /></button>
                  </div>

                  {/* First visit toggle */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Visitor status</label>
                    <div className="flex gap-2 mt-1">
                      {[true, false].map((v) => (
                        <button
                          key={String(v)}
                          onClick={() => setTripContext((p) => ({ ...p, isFirstVisit: v }))}
                          className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${tripContext.isFirstVisit === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          {v ? "First time" : "Returning"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trip type */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Trip type</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {tripTypes.map((t) => (
                        <button key={t} onClick={() => setTripContext((p) => ({ ...p, tripType: t }))}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-colors capitalize ${tripContext.tripType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Group */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Group</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {groupSizes.map((g) => (
                        <button key={g} onClick={() => setTripContext((p) => ({ ...p, groupSize: g }))}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${tripContext.groupSize === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >{g}</button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Budget</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {budgets.map((b) => (
                        <button key={b} onClick={() => setTripContext((p) => ({ ...p, budget: b }))}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${tripContext.budget === b ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}
                        >{b}</button>
                      ))}
                    </div>
                  </div>

                  {/* Fitness */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Fitness level</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {fitnessLevels.map((f) => (
                        <button key={f} onClick={() => setTripContext((p) => ({ ...p, fitnessLevel: f }))}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${tripContext.fitnessLevel === f ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                        >{f}</button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Dietary preferences</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {dietaryOptions.map((d) => (
                        <button key={d} onClick={() => toggleDiet(d)}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-colors capitalize ${tripContext.dietaryPrefs.includes(d) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                        >{d}</button>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Interests</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {interestOptions.map((i) => (
                        <button key={i.label} onClick={() => toggleInterest(i.label)}
                          className={`text-[11px] px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${tripContext.interests.includes(i.label) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >{i.icon} {i.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Travel dates */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Travel dates (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. March 15-22"
                      value={tripContext.travelDates}
                      onChange={(e) => setTripContext((p) => ({ ...p, travelDates: e.target.value }))}
                      className="mt-1 w-full text-xs bg-muted rounded-lg px-3 py-2 border-0 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  {/* Time left */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Time remaining (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 4 hours, 2 days"
                      value={tripContext.timeLeft}
                      onChange={(e) => setTripContext((p) => ({ ...p, timeLeft: e.target.value }))}
                      className="mt-1 w-full text-xs bg-muted rounded-lg px-3 py-2 border-0 focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl gradient-safari flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">Jambo! I'm your Kenya Trip Assistant</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    I can plan itineraries, suggest activities, optimize your time, and give insider tips — all personalized to your trip profile.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => send(action.prompt)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
                      >
                        {action.icon} {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl gradient-safari flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "gradient-sunset text-primary-foreground"
                        : "glass-card"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_li]:text-sm [&_p]:text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-1">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-safari flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="glass-card rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions when in conversation */}
            {messages.length > 0 && !isLoading && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto">
                {quickActions.slice(0, 4).map((a) => (
                  <button
                    key={a.label}
                    onClick={() => send(a.prompt)}
                    className="whitespace-nowrap flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors shrink-0"
                  >
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border bg-card px-4 py-3">
              <div className="container mx-auto flex gap-2 items-end max-w-3xl">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about itineraries, activities, budget tips, wildlife, food..."
                  rows={1}
                  className="flex-1 resize-none bg-muted rounded-xl px-4 py-2.5 text-sm border-0 focus:ring-1 focus:ring-primary outline-none max-h-32"
                  style={{ minHeight: "40px" }}
                />
                <Button
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="gradient-safari border-0 rounded-xl h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4 text-primary-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripPlannerPage;
