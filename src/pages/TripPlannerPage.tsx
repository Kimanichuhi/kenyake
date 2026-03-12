import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User as UserIcon, Settings2, UtensilsCrossed,
  Mountain, Camera, Tent, Palette, Heart, Baby, X, Sun, TreePine,
  Binoculars
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trip-assistant`;
const CLIENT_ID_KEY = "safarisync_client_id";
const getClientId = () => {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
};

type Msg = { role: "user" | "assistant"; content: string };
type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Msg[];
};

const CHAT_HISTORY_KEY = "safarisync_trip_chat_history";
const MAX_CHAT_HISTORY = 20;

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","to","for","from","of","in","on","at","with","by","about","as","is","are",
  "was","were","be","been","being","it","this","that","these","those","i","me","my","we","our","you","your",
  "he","she","they","them","their","us","what","which","who","whom","when","where","why","how","can","could",
  "should","would","will","shall","do","does","did","have","has","had","please","tell","show","find","get"
]);

const extractKeywords = (text: string) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([w]) => w);
};

const getSessionTitle = (msgs: Msg[]) => {
  const lastUser = [...msgs].reverse().find((m) => m.role === "user");
  if (!lastUser) return "New chat";
  const keywords = extractKeywords(lastUser.content);
  if (keywords.length > 0) return keywords.join(" • ");
  const trimmed = lastUser.content.trim();
  if (trimmed.length <= 48) return trimmed || "New chat";
  return `${trimmed.slice(0, 48)}…`;
};

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
  const [showHistory, setShowHistory] = useState(false);
  const [tripContext, setTripContext] = useState<TripContext>(defaultContext);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatSession[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setChatSessions(parsed);
      setActiveChatId(parsed[0].id);
      setMessages(parsed[0].messages || []);
    } catch {
      // ignore malformed history
    }
  }, []);

  useEffect(() => {
    const key = "safarisync_trip_planner_upgrade_banner";
    try {
      const shown = sessionStorage.getItem(key);
      if (shown) return;
      toast({
        title: "Upgrade to Pro",
        description: "Upgrade to Pro to get premium insights and recommendations.",
        action: (
          <ToastAction altText="Upgrade to Pro" onClick={() => navigate("/payments")}>
            Upgrade
          </ToastAction>
        ),
      });
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore storage issues
    }
  }, [toast, navigate]);

  useEffect(() => {
    if (!activeChatId) return;
    setChatSessions((prev) => {
      const title = getSessionTitle(messages);
      const updatedAt = Date.now();
      const existing = prev.find((s) => s.id === activeChatId);
      const nextSession: ChatSession = {
        id: activeChatId,
        title,
        updatedAt,
        messages,
      };
      let next = existing
        ? prev.map((s) => (s.id === activeChatId ? nextSession : s))
        : [nextSession, ...prev];
      next = next.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_CHAT_HISTORY);
      return next;
    });
  }, [messages, activeChatId]);

  useEffect(() => {
    try {
      if (chatSessions.length === 0) return;
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatSessions));
    } catch {
      // ignore storage issues
    }
  }, [chatSessions]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, clientId: getClientId(), userName: profile?.full_name || user?.email || undefined }),
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

  const isContextComplete = () => true;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleUserPrompt(input); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 660)}px`;
  };

  const handleUserPrompt = (prompt: string) => {
    send(prompt);
  };

  const startNewChat = () => {
    const id = crypto.randomUUID();
    setActiveChatId(id);
    setMessages([]);
    setInput("");
    setChatSessions((prev) => {
      const nextSession: ChatSession = {
        id,
        title: "New chat",
        updatedAt: Date.now(),
        messages: [],
      };
      const next = [nextSession, ...prev].slice(0, MAX_CHAT_HISTORY);
      return next;
    });
  };

  const openChat = (id: string) => {
    const session = chatSessions.find((s) => s.id === id);
    if (!session) return;
    setActiveChatId(id);
    setMessages(session.messages || []);
  };

  const applyPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
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
      <SidebarNav />
      <main className="flex-1 pt-16 flex flex-col">
        {/* Header */}
        <div className="gradient-safari px-4 py-6">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src="/icon-192.png" alt="SafariSync" className="h-5 w-5 rounded-md" />
                <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">SafariSync Assistant</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
                SafariSync <span className="text-savannah-gold">Assistant</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings((v) => !v)}
                className="border-primary-foreground/30 text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                <Settings2 className="h-4 w-4 mr-1" /> Visitor Context
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory((v) => !v)}
                className="border-primary-foreground/30 text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                Chat History
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row container mx-auto">
          {/* Settings Panel */}
          <AnimatePresence>
            {(showSettings || showHistory) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="lg:w-80 border-r border-border overflow-hidden shrink-0"
              >
                <div className="p-4 space-y-4 w-80">
                  {showHistory && (
                    <div className="rounded-xl border border-border bg-card/60 p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chat History</h4>
                        <button
                          onClick={startNewChat}
                          className="text-[11px] px-2 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        >
                          New
                        </button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {chatSessions.length === 0 && (
                          <p className="text-[11px] text-muted-foreground">No chats yet.</p>
                        )}
                        {chatSessions.slice(0, 6).map((s) => (
                          <button
                            key={s.id}
                            onClick={() => openChat(s.id)}
                            className={`w-full text-left rounded-lg px-2.5 py-2 border transition-colors ${
                              s.id === activeChatId
                                ? "border-primary/40 bg-primary/10 text-foreground"
                                : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <div className="text-[11px] font-medium truncate">{s.title || "New chat"}</div>
                            <div className="text-[10px] text-muted-foreground/80">
                              {new Date(s.updatedAt).toLocaleString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {showSettings && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-semibold text-sm">Visitor Context</h3>
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
                    <label className="text-xs font-medium text-muted-foreground">Travel style</label>
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

                  {/* Current location */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Current location (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi, Mombasa, Maasai Mara"
                      value={tripContext.currentLocation}
                      onChange={(e) => setTripContext((p) => ({ ...p, currentLocation: e.target.value }))}
                      className="mt-1 w-full text-xs bg-muted rounded-lg px-3 py-2 border-0 focus:ring-1 focus:ring-primary outline-none"
                    />
                    {!tripContext.currentLocation && (
                      <p className="text-[11px] text-muted-foreground mt-1">Optional.</p>
                    )}
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="px-4 pt-4">
              <div className="glass-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Visitor Context</h3>
                  <p className="text-xs text-muted-foreground">
                    Fill in your visitor context to start chatting with SafariSync Assistant.
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Visitor context is optional. You can chat anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl gradient-safari flex items-center justify-center mx-auto mb-4">
                    <img src="/icon-192.png" alt="SafariSync" className="h-10 w-10 rounded-lg" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">Jambo! I'm your SafariSync Assistant</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    I’m multilingual — ask in any language. I’ll respond in the same language and tailor the feedback to your question.
                  </p>
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
                      <img src="/icon-192.png" alt="SafariSync" className="h-4 w-4 rounded-sm" />
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
                    <img src="/icon-192.png" alt="SafariSync" className="h-4 w-4 rounded-sm" />
                  </div>
                  <div className="glass-card rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            {/* Quick links */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Quick Links</span>
                <span className="text-[11px] text-muted-foreground">Click to populate</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "Communities (Culture & People) 🪘",
                    prompt:
                      "I am planning to visit Kenya from overseas and I am very interested in experiencing authentic local cultures.\n\nCan you tell me which Kenyan communities or tribes offer the most interesting cultural experiences for tourists?\n\nPlease explain their traditions, clothing, food, music, and daily lifestyle. Also tell me where visitors can meet them respectfully and participate in cultural activities like village visits, storytelling, dances, or craft making.\n\nIf possible, recommend specific places where these cultural experiences happen and explain what makes each community unique for international travelers.\n\nPlease answer in my language.",
                  },
                  {
                    label: "Entry Requirements ✈️",
                    prompt:
                      "I am an international traveler planning a trip to Kenya.\n\nCould you explain the entry requirements for visiting Kenya, including visas, passports, vaccinations, and any travel documents that tourists usually need?\n\nAlso explain the process of arriving at the main airport, what travelers should expect at immigration, and any important travel tips for first-time visitors coming from overseas.\n\nPlease explain everything in simple terms and respond in my language.",
                  },
                  {
                    label: "Safety for Tourists 🛡️",
                    prompt:
                      "I am planning my first trip to Kenya and I want to understand how safe it is for international tourists.\n\nCould you explain the general safety situation for visitors, including cities, national parks, and beaches?\n\nPlease provide practical travel safety tips such as transportation safety, areas tourists usually visit, and how travelers can stay safe during safaris, city tours, and cultural visits.\n\nAlso explain whether solo travelers and families usually feel comfortable traveling in Kenya.\n\nPlease answer in my language so I can understand clearly.",
                  },
                  {
                    label: "Activities & Experiences 🎯",
                    prompt:
                      "I am planning a vacation to Kenya and I want to know the most exciting activities tourists can experience there.\n\nPlease suggest a variety of activities such as wildlife safaris, cultural experiences, beach activities, nature adventures, photography tours, and unique experiences that visitors cannot find in other countries.\n\nExplain what makes each activity special and where tourists can experience them.\n\nPlease respond in my language.",
                  },
                  {
                    label: "Food & Dining 🍲",
                    prompt:
                      "I will be visiting Kenya soon and I would love to try traditional Kenyan food.\n\nCould you recommend popular Kenyan dishes that tourists should try and explain what they are made from and how they are usually eaten?\n\nPlease also suggest places where visitors can experience authentic Kenyan dining, such as local restaurants, cultural food experiences, or street food markets.\n\nExplain the flavors and cultural meaning of the dishes so that an international visitor can understand them.\n\nPlease answer in my language.",
                  },
                  {
                    label: "Transportation 🚐",
                    prompt:
                      "I am an international tourist planning a trip across Kenya and I would like to understand how transportation works for visitors.\n\nPlease explain the different ways tourists usually travel between cities, national parks, and coastal destinations in Kenya.\n\nFor example, explain whether tourists usually use domestic flights, safari vehicles, tour buses, or trains, and what you recommend for someone visiting Kenya for the first time.\n\nAlso explain how easy it is to travel between major destinations and how long trips usually take.\n\nPlease answer in my language.",
                  },
                  {
                    label: "Destinations 🗺️",
                    prompt:
                      "I am visiting Kenya for the first time and I would like to discover the most beautiful and famous places that international tourists should see.\n\nPlease recommend the top destinations in Kenya including national parks, cities, beaches, and natural landmarks.\n\nExplain what makes each destination special, what visitors can do there, and why travelers from around the world love visiting these places.\n\nIf possible, suggest a few destinations suitable for a 5–7 day trip.\n\nPlease respond in my language.",
                  },
                  {
                    label: "Wildlife Safaris 🦁",
                    prompt:
                      "One of the main reasons I want to visit Kenya is to experience a wildlife safari.\n\nCould you explain which national parks or reserves are best for seeing wildlife such as lions, elephants, giraffes, and other animals?\n\nPlease also describe what a typical safari experience is like, how long safaris usually last, and what time of year is best for wildlife viewing.\n\nI would also love to know about famous wildlife events such as animal migrations if they happen in Kenya.\n\nPlease answer in my language.",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => applyPrompt(item.prompt)}
                    className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border bg-card px-4 pt-3 pb-6">
              <div className="container mx-auto flex gap-2 items-end max-w-3xl">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask in any language about wildlife, destinations, culture, guides, transport, or experiences in Kenya."
                  rows={1}
                  className="flex-1 resize-none bg-muted rounded-xl px-4 py-2.5 text-sm border-0 focus:ring-1 focus:ring-primary outline-none max-h-96 disabled:opacity-60"
                  style={{ minHeight: "120px" }}
                />
                <Button
                  onClick={() => handleUserPrompt(input)}
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


