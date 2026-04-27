import { Sparkles } from "lucide-react";

interface ChatEmptyStateProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  compact?: boolean;
}

const ChatEmptyState = ({ prompts, onPromptClick, compact = false }: ChatEmptyStateProps) => {
  return (
    <div className={`text-center ${compact ? "py-4" : "py-12"}`}>
      <div
        className={`${
          compact ? "h-12 w-12" : "h-14 w-14"
        } rounded-2xl gradient-safari flex items-center justify-center mx-auto ${
          compact ? "mb-3" : "mb-4"
        } shadow-md`}
      >
        <Sparkles className={`${compact ? "h-5 w-5" : "h-6 w-6"} text-primary-foreground`} />
      </div>
      <p className={`font-display ${compact ? "text-sm" : "text-xl"} font-semibold text-foreground mb-1.5`}>
        How can I help you explore?
      </p>
      <p className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground max-w-md mx-auto mb-4`}>
        Ask anything about SafariSync listings — destinations, wildlife, culture, food and more.
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center max-w-lg mx-auto">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPromptClick(p)}
            className={`${
              compact ? "text-[11px] px-2.5 py-1" : "text-xs px-3 py-1.5"
            } rounded-full bg-card border border-border text-foreground/80 hover:border-primary hover:text-primary hover:shadow-sm transition-all`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatEmptyState;
