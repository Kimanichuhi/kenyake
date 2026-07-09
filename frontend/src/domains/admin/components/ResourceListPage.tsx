import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { ResourceConfig } from "../types/resource";
import { useResourceList } from "../hooks/useResourceQuery";
import { useResourceMutations } from "../hooks/useResourceMutation";
import { DataTable } from "./DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Search, Trash2 } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

function isPublished(row: Record<string, unknown>, statusColumn: string) {
  if (statusColumn === "is_published") return row.is_published === true;
  return row.status === "published";
}

interface ResourceListPageProps<TRow extends { id: string }, TFormValues extends Record<string, unknown>> {
  resource: ResourceConfig<TRow, TFormValues>;
  title?: string;
  description?: string;
}

export function ResourceListPage<TRow extends { id: string }, TFormValues extends Record<string, unknown>>({
  resource,
  title,
  description,
}: ResourceListPageProps<TRow, TFormValues>) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useResourceList(resource, { page, search, filters });
  const { remove } = useResourceMutations(resource);
  const { hasRole, hasAnyRole } = useUserRoles();
  const isEditorOnly = hasRole("editor") && !hasAnyRole(["admin", "content_manager"]);

  const columns = useMemo<ColumnDef<TRow, unknown>[]>(() => {
    const base: ColumnDef<TRow, unknown>[] = resource.listColumns.map((col) => ({
      id: col.key,
      header: col.header,
      cell: ({ row }) => (col.cell ? col.cell(row.original) : String((row.original as Record<string, unknown>)[col.key] ?? "—")),
    }));

    if (resource.statusColumn) {
      base.push({
        id: "__status",
        header: "Status",
        cell: ({ row }) => {
          const published = isPublished(row.original as Record<string, unknown>, resource.statusColumn!);
          return (
            <Badge variant={published ? "default" : "secondary"}>{published ? "Published" : "Draft"}</Badge>
          );
        },
      });
    }

    if (!isEditorOnly) {
      base.push({
        id: "__actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setPendingDeleteId(row.original.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        ),
      });
    }

    return base;
  }, [resource, isEditorOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">{title ?? resource.labelPlural}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={() => navigate(`${resource.basePath}/new`)}>
          <Plus className="mr-1.5 h-4 w-4" /> New {resource.label}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {resource.searchColumn && (
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${resource.labelPlural.toLowerCase()}...`}
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
        )}
        {resource.filters?.map((filter) => (
          <Select
            key={filter.key}
            value={filters[filter.key] ?? "__all"}
            onValueChange={(value) => {
              setFilters((prev) => ({ ...prev, [filter.key]: value === "__all" ? "" : value }));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All {filter.label}</SelectItem>
              {filter.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        isLoading={isLoading}
        page={page}
        pageSize={data?.pageSize ?? 20}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`${resource.basePath}/${row.id}`)}
        emptyMessage={`No ${resource.labelPlural.toLowerCase()} yet. Create the first one.`}
      />

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {resource.label.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this {resource.label.toLowerCase()} from the site. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDeleteId) remove.mutate(pendingDeleteId);
                setPendingDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
