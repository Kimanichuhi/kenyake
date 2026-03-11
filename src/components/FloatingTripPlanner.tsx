import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trip-assistant`;

type Msg = { role: "user" | "assistant"; content: string };

const quickPrompts = [
  "Plan a 3-day safari trip",
  "Best budget destinations",
  "What to do in Nairobi today?",
  "Wildlife events this month",
];

const FloatingTripPlanner = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

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
      body: JSON.stringify({ messages: allMessages, tripContext: {} }),
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
            aria-label="Open AI Trip Planner"
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
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-safari px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-foreground">Trip Assistant</h3>
                  <p className="text-[10px] text-primary-foreground/70">AI-powered • SafariSync</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Jambo! How can I help?</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask me anything about traveling in Kenya</p>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                    {quickPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-safari text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown className="prose prose-xs max-w-none [&_p]:mb-1 [&_li]:mb-0.5 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_ul]:pl-3 [&_ol]:pl-3">
                        {msg.content}
                      </ReactMarkdown>
                    ) : msg.content}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder="Ask about Kenya..."
                  rows={1}
                  className="flex-1 resize-none bg-muted rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  size="icon"
                  onClick={() => send(input)}
                  disabled={!input.trim() || isLoading}
                  className="gradient-safari h-8 w-8 rounded-xl shrink-0 border-0"
                >
                  <Send className="h-3.5 w-3.5 text-primary-foreground" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingTripPlanner;