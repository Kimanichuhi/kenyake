import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, User as UserIcon, Copy, Check, RefreshCw, Pencil, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

export type ChatMsg = { role: "user" | "assistant"; content: string };

type Density = "compact" | "comfortable";

interface ChatMessagesProps {
  messages: ChatMsg[];
  isLoading: boolean;
  density?: Density;
  onRegenerate?: (index: number) => void;
  onEdit?: (index: number, newContent: string) => void;
  onFollowUp?: (text: string) => void;
}

/* Strip the <followups>[...]</followups> block and return the parsed list. */
const extractFollowUps = (text: string): { clean: string; followUps: string[] } => {
  const re = /<followups>\s*(\[[\s\S]*?\])\s*<\/followups>\s*$/i;
  const match = text.match(re);
  if (!match) return { clean: text, followUps: [] };
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return { clean: text.replace(re, "").trimEnd(), followUps: [] };
  }
  const list = Array.isArray(parsed)
    ? (parsed as unknown[])
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
  return { clean: text.replace(re, "").trimEnd(), followUps: list };
};

const ChatMessages = ({
  messages,
  isLoading,
  density = "comfortable",
  onRegenerate,
  onEdit,
  onFollowUp,
}: ChatMessagesProps) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const handleCopy = async (idx: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((v) => (v === idx ? null : v)), 1500);
    } catch {
      /* noop */
    }
  };

  const startEdit = (idx: number, content: string) => {
    setEditingIdx(idx);
    setEditDraft(content);
  };
  const cancelEdit = () => {
    setEditingIdx(null);
    setEditDraft("");
  };
  const submitEdit = (idx: number) => {
    const text = editDraft.trim();
    if (!text || !onEdit) return cancelEdit();
    onEdit(idx, text);
    setEditingIdx(null);
    setEditDraft("");
  };

  const compact = density === "compact";
  const avatarSize = compact ? "h-6 w-6" : "h-7 w-7";
  const avatarIcon = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  const bubbleText = compact ? "text-xs" : "text-sm";
  const bubblePad = compact ? "px-3 py-2" : "px-4 py-2.5";

  const showingTyping =
    isLoading && messages[messages.length - 1]?.role !== "assistant";

  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  return (
    <>
      {messages.map((msg, i) => {
        const isAssistant = msg.role === "assistant";
        const isLastAssistant = isAssistant && i === lastAssistantIdx && !isLoading;
        const isStreaming = isAssistant && i === messages.length - 1 && isLoading;

        const { clean, followUps } = isAssistant
          ? extractFollowUps(msg.content)
          : { clean: msg.content, followUps: [] };
        const showFollowUps =
          isAssistant && !isStreaming && followUps.length > 0 && !!onFollowUp;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
          >
            {isAssistant && (
              <div
                className={`${avatarSize} rounded-lg gradient-safari flex items-center justify-center shrink-0 mt-0.5`}
              >
                <Sparkles className={`${avatarIcon} text-primary-foreground`} />
              </div>
            )}

            <div className={`max-w-[82%] flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
              {/* Bubble or edit form */}
              {!isAssistant && editingIdx === i ? (
                <div className="w-full min-w-[220px] flex flex-col gap-2 bg-card border border-primary/40 rounded-2xl p-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitEdit(i);
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                    rows={2}
                    autoFocus
                    className="w-full resize-none bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[160px] px-2 py-1"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={cancelEdit}>
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs gradient-safari border-0"
                      disabled={!editDraft.trim()}
                      onClick={() => submitEdit(i)}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-2xl ${bubblePad} ${bubbleText} ${
                    isAssistant
                      ? "bg-muted/60 border border-border/60 text-foreground rounded-bl-sm"
                      : "bg-primary text-primary-foreground rounded-br-sm"
                  }`}
                >
                  {isAssistant ? (
                    <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_li]:text-sm [&_p]:text-sm [&_a]:text-primary">
                      <ReactMarkdown>{clean}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              )}

              {/* Action row */}
              {isAssistant && msg.content && editingIdx !== i && (
                <div className="flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(i, clean)}
                  >
                    {copiedIdx === i ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </Button>
                  {onRegenerate && isLastAssistant && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => onRegenerate(i)}
                    >
                      <RefreshCw className="h-3 w-3" /> Regenerate
                    </Button>
                  )}
                </div>
              )}

              {!isAssistant && editingIdx !== i && (
                <div className="flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(i, msg.content)}
                  >
                    {copiedIdx === i ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </Button>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(i, msg.content)}
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  )}
                </div>
              )}

              {/* Follow-up chips */}
              {showFollowUps && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {followUps.map((f) => (
                    <button
                      key={f}
                      onClick={() => onFollowUp?.(f)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-card border border-border text-foreground/80 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isAssistant && editingIdx !== i && (
              <div
                className={`${avatarSize} rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5`}
              >
                <UserIcon className={`${avatarIcon} text-muted-foreground`} />
              </div>
            )}
          </motion.div>
        );
      })}

      {showingTyping && (
        <div className="flex gap-2">
          <div
            className={`${avatarSize} rounded-lg gradient-safari flex items-center justify-center shrink-0`}
          >
            <Sparkles className={`${avatarIcon} text-primary-foreground`} />
          </div>
          <div className="bg-muted/60 border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessages;
