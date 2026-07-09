import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../components/DataTable";
import { useAuditLogs, AuditLogRow, AUDITED_TABLES, AUDIT_ACTIONS } from "../../hooks/useAuditLogs";
import { useProfileNames } from "../../hooks/useProfileNames";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const actionVariant: Record<string, "default" | "secondary" | "destructive"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
};

type DiffShape = { before?: Record<string, unknown>; after?: Record<string, unknown> };

function recordLabel(obj: Record<string, unknown> | undefined) {
  if (!obj) return "record";
  return (obj.title ?? obj.name ?? obj.slug ?? obj.species ?? obj.file_name ?? obj.id ?? "record") as string;
}

function changedFields(before: Record<string, unknown>, after: Record<string, unknown>) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  keys.delete("updated_at");
  const changed: { key: string; before: unknown; after: unknown }[] = [];
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed.push({ key, before: before[key], after: after[key] });
    }
  }
  return changed;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  return str.length > 80 ? str.slice(0, 80) + "…" : str;
}

const AuditLogsPage = () => {
  const [page, setPage] = useState(0);
  const [resourceType, setResourceType] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [detailRow, setDetailRow] = useState<AuditLogRow | null>(null);

  const { data, isLoading } = useAuditLogs({ page, resourceType, action });
  const { data: names } = useProfileNames((data?.rows ?? []).map((r) => r.actor_id));

  const columns = useMemo<ColumnDef<AuditLogRow, unknown>[]>(
    () => [
      {
        id: "resource_type",
        header: "Resource",
        cell: ({ row }) => <Badge variant="outline">{row.original.resource_type}</Badge>,
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <Badge variant={actionVariant[row.original.action] ?? "outline"} className="capitalize">
            {row.original.action}
          </Badge>
        ),
      },
      {
        id: "actor",
        header: "Actor",
        cell: ({ row }) =>
          row.original.actor_id ? names?.[row.original.actor_id] ?? "…" : "System",
      },
      {
        id: "summary",
        header: "Change",
        cell: ({ row }) => {
          const diff = (row.original.diff ?? {}) as DiffShape;
          if (row.original.action === "create") return `Created "${recordLabel(diff.after)}"`;
          if (row.original.action === "delete") return `Deleted "${recordLabel(diff.before)}"`;
          const fields = changedFields(diff.before ?? {}, diff.after ?? {});
          if (fields.length === 0) return "No field changes";
          return (
            <button
              type="button"
              onClick={() => setDetailRow(row.original)}
              className="text-primary underline-offset-2 hover:underline"
            >
              {fields.length} field{fields.length > 1 ? "s" : ""} changed: {fields.map((f) => f.key).join(", ")}
            </button>
          );
        },
      },
      {
        id: "created_at",
        header: "When",
        cell: ({ row }) => formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true }),
      },
    ],
    [names],
  );

  const detailFields = detailRow
    ? changedFields(
        ((detailRow.diff ?? {}) as DiffShape).before ?? {},
        ((detailRow.diff ?? {}) as DiffShape).after ?? {},
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Every create, update, and delete across managed content.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={resourceType || "__all"}
          onValueChange={(v) => {
            setResourceType(v === "__all" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All resources</SelectItem>
            {AUDITED_TABLES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={action || "__all"}
          onValueChange={(v) => {
            setAction(v === "__all" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All actions</SelectItem>
            {AUDIT_ACTIONS.map((a) => (
              <SelectItem key={a} value={a} className="capitalize">
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        isLoading={isLoading}
        page={page}
        pageSize={data?.pageSize ?? 25}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        emptyMessage="No activity recorded yet."
      />

      <Dialog open={!!detailRow} onOpenChange={(o) => !o && setDetailRow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Changed fields</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 space-y-3 overflow-y-auto text-sm">
            {detailFields.map((f) => (
              <div key={f.key} className="rounded-md border border-border p-2">
                <p className="font-medium text-foreground">{f.key}</p>
                <p className="text-muted-foreground">
                  <span className="line-through">{formatValue(f.before)}</span>
                </p>
                <p className="text-foreground">{formatValue(f.after)}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogsPage;
