import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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

const quickPrompts = [
  "Hidden gems",
  "Wildlife safaris",
  "Cultural events",
  "Community guides",
];

const FloatingTripPlanner = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, clientId: getClientId(), userName: profile?.full_name || user?.email || undefined }),
    });

    if (resp.status === 429) { toast({ title: "Rate limited", description: "Please wait a moment.", variant: "destructive" }); return; }
    if (resp.status === 402) { toast({ title: "Credits depleted", variant: "destructive" }); return; }
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
        } catch { textBuffer = line + "\n" + textBuffer; break; }
      }
    }
  }, [toast]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try { await streamChat(newMessages); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const applyPrompt = (prompt: string) => {
    send(prompt);
  };

  const handleRegenerate = useCallback(async (assistantIndex: number) => {
    if (isLoading) return;
    const trimmed = messages.slice(0, assistantIndex);
    if (trimmed.length === 0 || trimmed[trimmed.length - 1].role !== "user") return;
    setMessages(trimmed);
    setIsLoading(true);
    try { await streamChat(trimmed); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  }, [isLoading, messages, streamChat, toast]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-safari shadow-lg flex items-center justify-center group"
            aria-label="Open SafariSync Assistant"
          >
            <Bot className="h-6 w-6 text-primary-foreground" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/60 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="relative gradient-safari px-4 py-3.5 flex items-center justify-between shrink-0 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent_60%)]" />
              <div className="relative flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center ring-1 ring-primary-foreground/30">
                  <Bot className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-foreground tracking-tight">SafariSync AI</h3>
                  <p className="text-[10px] text-primary-foreground/80 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Grounded in SafariSync listings
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="relative text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full p-1 transition-colors">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 bg-gradient-to-b from-muted/30 to-transparent">
              {messages.length === 0 ? (
                <ChatEmptyState prompts={quickPrompts} onPromptClick={applyPrompt} compact />
              ) : (
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  density="compact"
                  onRegenerate={handleRegenerate}
                />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border/60 p-3 shrink-0 bg-card/80 backdrop-blur">
              <div className="flex items-end gap-2 bg-muted/60 rounded-2xl p-1.5 border border-border/40 focus-within:border-primary/50 focus-within:bg-card transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder="Ask about SafariSync listings…"
                  rows={1}
                  className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-xs outline-none text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  size="icon"
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading}
                  className="gradient-safari h-8 w-8 rounded-xl shrink-0 border-0 shadow-sm"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" /> : <Send className="h-3.5 w-3.5 text-primary-foreground" />}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground/70 text-center mt-1.5">Answers grounded only in SafariSync content</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingTripPlanner;
