import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Narrowed to just what's rendered (id/title), not the full WizardStepConfig
// shape, so other short-lived flows (e.g. the booking engine's BookingFlow)
// can reuse this purely presentational component without adopting the rest
// of the Wizard engine's save/resume contract.
interface WizardProgressProps {
  steps: { id: string; title: string }[];
  currentIndex: number;
  furthestIndex: number;
  onStepClick: (index: number) => void;
}

export function WizardProgress({ steps, currentIndex, furthestIndex, onStepClick }: WizardProgressProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <ol className="flex min-w-max items-center gap-1">
        {steps.map((step, i) => {
          const isComplete = i < furthestIndex;
          const isCurrent = i === currentIndex;
          const isReachable = i <= furthestIndex;
          return (
            <li key={step.id} className="flex items-center gap-1">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCurrent && isComplete && "bg-primary/10 text-primary hover:bg-primary/20",
                  !isCurrent && !isComplete && isReachable && "bg-muted text-muted-foreground hover:bg-muted/80",
                  !isReachable && "cursor-not-allowed bg-muted/50 text-muted-foreground/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                    isCurrent && "bg-primary-foreground text-primary",
                    !isCurrent && isComplete && "bg-primary text-primary-foreground",
                    !isCurrent && !isComplete && "border border-current",
                  )}
                >
                  {isComplete ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {i < steps.length - 1 && <div className="h-px w-3 shrink-0 bg-border sm:w-6" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
