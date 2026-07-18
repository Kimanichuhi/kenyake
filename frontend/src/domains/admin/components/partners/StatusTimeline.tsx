import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { useBusinessStatusHistory } from "../../hooks/usePartnerApplicationDetail";
import { useProfileNames } from "../../hooks/useProfileNames";
import { BUSINESS_STATUS_LABELS, BusinessStatus } from "../../hooks/usePartnerApplications";

function statusLabel(status: BusinessStatus | null) {
  if (!status) return "—";
  return BUSINESS_STATUS_LABELS[status] ?? status;
}

interface StatusTimelineProps {
  businessId: string;
}

export function StatusTimeline({ businessId }: StatusTimelineProps) {
  const { data: history, isLoading } = useBusinessStatusHistory(businessId);
  const { data: names } = useProfileNames((history ?? []).map((h) => h.changed_by));

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>;
  }

  return (
    <ol className="space-y-0">
      {history.map((entry, i) => (
        <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < history.length - 1 && (
            <span className="absolute left-[5px] top-3 h-full w-px bg-border" aria-hidden />
          )}
          <span className="relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-primary bg-background" />
          <div className="flex-1 space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {statusLabel(entry.from_status)} <span className="text-muted-foreground">&rarr;</span>{" "}
              {statusLabel(entry.to_status)}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.changed_by ? names?.[entry.changed_by] ?? "…" : "System"} ·{" "}
              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
            </p>
            {entry.reason && <p className="text-sm text-foreground">{entry.reason}</p>}
            {entry.notes && <p className="text-xs text-muted-foreground">{entry.notes}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
