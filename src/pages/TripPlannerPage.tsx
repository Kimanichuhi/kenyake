import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, History, Plus, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ChatMessages, { type ChatMsg } from "@/components/chat/ChatMessages";
import ChatEmptyState from "@/components/chat/ChatEmptyState";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trip-assistant`;
const CLIENT_ID_KEY = "safarisync_client_id";
const getClientId = () => {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
};

type Msg = ChatMsg;
type ChatSession = { id: string; title: string; updatedAt: number; messages: Msg[] };

const CHAT_HISTORY_KEY = "safarisync_trip_chat_history";
const MAX_CHAT_HISTORY = 20;

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","to","for","from","of","in","on","at","with","by","about","as","is","are",
  "was","were","be","been","being","it","this","that","these","those","i","me","my","we","our","you","your",
  "what","which","who","when","where","why","how","can","could","should","would","will","do","does","did",
  "have","has","had","please","tell","show","find","get",
]);

const getSessionTitle = (msgs: Msg[]) => {
  const lastUser = [...msgs].reverse().find((m) => m.role === "user");
  if (!lastUser) return "New chat";
  const words = lastUser.content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
    .slice(0, 4)
    .join(" ");
  if (words) return words.charAt(0).toUpperCase() + words.slice(1);
  const trimmed = lastUser.content.trim();
  return trimmed.length <= 48 ? trimmed : `${trimmed.slice(0, 48)}…`;
};

const quickPrompts = [
  "Hidden gems 💎",
  "Wildlife safaris 🦁",
  "Cultural events 🪘",
  "Community guides 🧭",
];

const TripPlannerPage = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // Load history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatSession[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setChatSessions(parsed);
      setActiveChatId(parsed[0].id);
      setMessages(parsed[0].messages || []);
    } catch { /* noop */ }
  }, []);

  // One-time upgrade nudge
  useEffect(() => {
    const key = "safarisync_trip_planner_upgrade_banner";
    try {
      if (sessionStorage.getItem(key)) return;
      toast({
        title: "Upgrade to Pro",
        description: "Get premium insights and recommendations.",
        action: (
          <ToastAction altText="Upgrade to Pro" onClick={() => navigate("/payments")}>
            Upgrade
          </ToastAction>
        ),
      });
      sessionStorage.setItem(key, "1");
    } catch { /* noop */ }
  }, [toast, navigate]);

  // Persist sessions
  useEffect(() => {
    if (!activeChatId) return;
    setChatSessions((prev) => {
      const nextSession: ChatSession = {
        id: activeChatId,
        title: getSessionTitle(messages),
        updatedAt: Date.now(),
        messages,
      };
      const exists = prev.some((s) => s.id === activeChatId);
      const next = exists
        ? prev.map((s) => (s.id === activeChatId ? nextSession : s))
        : [nextSession, ...prev];
      return next.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_CHAT_HISTORY);
    });
  }, [messages, activeChatId]);

  useEffect(() => {
    try {
      if (chatSessions.length === 0) return;
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatSessions));
    } catch { /* noop */ }
  }, [chatSessions]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages,
        clientId: getClientId(),
        userName: profile?.full_name || user?.email || undefined,
      }),
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
  }, [toast, user, profile]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const startNewChat = () => {
    const id = crypto.randomUUID();
    setActiveChatId(id);
    setMessages([]);
    setInput("");
  };

  const openChat = (id: string) => {
    const session = chatSessions.find((s) => s.id === id);
    if (!session) return;
    setActiveChatId(id);
    setMessages(session.messages || []);
    setShowHistory(false);
  };

  const applyPrompt = (prompt: string) => {
    send(prompt);
  };

  const handleRegenerate = useCallback(async (assistantIndex: number) => {
    if (isLoading) return;
    // Strip the assistant message we want to regenerate, keep history up to it.
    const trimmed = messages.slice(0, assistantIndex);
    if (trimmed.length === 0 || trimmed[trimmed.length - 1].role !== "user") return;
    setMessages(trimmed);
    setIsLoading(true);
    try {
      await streamChat(trimmed);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, streamChat, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <SidebarNav />
      <main className="flex-1 pt-16 flex flex-col">
        {/* Compact header */}
        <div className="border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl gradient-safari flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
                  SafariSync Assistant
                </h1>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Grounded in SafariSync listings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={startNewChat} className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline text-xs">New</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory((v) => !v)} className="h-8 gap-1.5">
                <History className="h-3.5 w-3.5" /> <span className="hidden sm:inline text-xs">History</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex container mx-auto min-h-0 w-full">
          {/* History drawer */}
          <AnimatePresence>
            {showHistory && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-r border-border overflow-hidden shrink-0"
              >
                <div className="w-[260px] p-3 space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Recent chats
                  </h4>
                  {chatSessions.length === 0 && (
                    <p className="text-xs text-muted-foreground px-1">No chats yet.</p>
                  )}
                  {chatSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openChat(s.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                        s.id === activeChatId
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <div className="text-xs font-medium truncate">{s.title || "New chat"}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {new Date(s.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.length === 0 ? (
                  <ChatEmptyState prompts={quickPrompts} onPromptClick={applyPrompt} />
                ) : (
                  <ChatMessages
                    messages={messages}
                    isLoading={isLoading}
                    density="comfortable"
                    onRegenerate={handleRegenerate}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2 bg-muted/60 rounded-2xl p-1.5 border border-border/60 focus-within:border-primary/50 focus-within:bg-card transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about destinations, wildlife, culture…"
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[200px]"
                  />
                  <Button
                    size="icon"
                    onClick={() => send(input)}
                    disabled={!input.trim() || isLoading}
                    className="gradient-safari h-9 w-9 rounded-xl shrink-0 border-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 text-primary-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/70 text-center mt-1.5">
                  Answers grounded only in SafariSync content
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripPlannerPage;
