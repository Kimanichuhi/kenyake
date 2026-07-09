import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, History as HistoryIcon, RotateCcw } from "lucide-react";
import { ResourceConfig } from "../types/resource";
import { useContentVersions, ContentVersionRow } from "../hooks/useContentVersions";
import { useProfileNames } from "../hooks/useProfileNames";
import { useResourceMutations } from "../hooks/useResourceMutation";

interface VersionHistoryDialogProps<TRow extends { id: string }, TFormValues extends Record<string, unknown>> {
  resource: ResourceConfig<TRow, TFormValues>;
  resourceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionHistoryDialog<TRow extends { id: string }, TFormValues extends Record<string, unknown>>({
  resource,
  resourceId,
  open,
  onOpenChange,
}: VersionHistoryDialogProps<TRow, TFormValues>) {
  const { data: versions, isLoading } = useContentVersions(resource.key, resourceId);
  const { data: names } = useProfileNames((versions ?? []).map((v) => v.created_by));
  const { update } = useResourceMutations(resource);
  const [pendingRestore, setPendingRestore] = useState<ContentVersionRow | null>(null);

  const handleRestore = async () => {
    if (!pendingRestore) return;
    const values = resource.toFormValues(pendingRestore.snapshot as unknown as TRow);
    await update.mutateAsync({ id: resourceId, values });
    setPendingRestore(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" /> Version History
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !versions || versions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              History starts after the first edit — versions are only recorded when content is updated, not created.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium text-foreground">v{v.version_number}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {names?.[v.created_by ?? ""] ?? (v.created_by ? "…" : "Unknown user")} ·{" "}
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setPendingRestore(v)}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingRestore} onOpenChange={(o) => !o && setPendingRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore version {pendingRestore?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This overwrites the current content with this older version. The current state is preserved in history
              too — restoring creates a new version rather than deleting anything, so it's safe to undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
