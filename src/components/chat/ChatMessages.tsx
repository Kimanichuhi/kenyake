import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, User as UserIcon, Copy, Check, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

export type ChatMsg = { role: "user" | "assistant"; content: string };

type Density = "compact" | "comfortable";

interface ChatMessagesProps {
  messages: ChatMsg[];
  isLoading: boolean;
  density?: Density;
  onRegenerate?: (index: number) => void;
}

const ChatMessages = ({
  messages,
  isLoading,
  density = "comfortable",
  onRegenerate,
}: ChatMessagesProps) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (idx: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((v) => (v === idx ? null : v)), 1500);
    } catch {
      /* noop */
    }
  };

  const compact = density === "compact";
  const avatarSize = compact ? "h-6 w-6" : "h-7 w-7";
  const avatarIcon = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  const bubbleText = compact ? "text-xs" : "text-sm";
  const bubblePad = compact ? "px-3 py-2" : "px-4 py-2.5";

  const showingTyping =
    isLoading && messages[messages.length - 1]?.role !== "assistant";

  return (
    <>
      {messages.map((msg, i) => {
        const isAssistant = msg.role === "assistant";
        const isLastAssistant =
          isAssistant && i === messages.length - 1 && !isLoading;

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
              <div
                className={`rounded-2xl ${bubblePad} ${bubbleText} ${
                  isAssistant
                    ? "bg-muted/60 border border-border/60 text-foreground rounded-bl-sm"
                    : "bg-primary text-primary-foreground rounded-br-sm"
                }`}
              >
                {isAssistant ? (
                  <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_li]:text-sm [&_p]:text-sm [&_a]:text-primary">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {isAssistant && msg.content && (
                <div className="flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCopy(i, msg.content)}
                  >
                    {copiedIdx === i ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
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
            </div>

            {!isAssistant && (
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
