import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessStatusHistory } from "../../hooks/useBusinessStatusHistory";
import { getStatusMeta, TONE_DOT_CLASS } from "./BusinessStatusOverview";

interface BusinessStatusTimelineProps {
  businessId: string;
}

function humanizeStatus(status: string | null) {
  if (!status) return null;
  return status.replace(/_/g, " ");
}

export function BusinessStatusTimeline({ businessId }: BusinessStatusTimelineProps) {
  const { data: history, isLoading } = useBusinessStatusHistory(businessId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>;
  }

  return (
    <div>
      {history.map((entry, index) => {
        const toMeta = getStatusMeta(entry.to_status);
        const fromLabel = humanizeStatus(entry.from_status);
        const isLast = index === history.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && <span className="absolute left-[5px] top-4 h-full w-px bg-border" />}
            <span
              className={cn(
                "relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background",
                TONE_DOT_CLASS[toMeta.tone],
              )}
            />
            <div className="flex-1 space-y-1 pb-1">
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                {fromLabel && (
                  <>
                    <span className="capitalize text-muted-foreground">{fromLabel}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <span className="font-medium text-foreground">{toMeta.label}</span>
              </div>
              {entry.reason && <p className="text-sm text-muted-foreground">{entry.reason}</p>}
              {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
