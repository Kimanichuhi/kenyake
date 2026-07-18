import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../components/DataTable";
import { RiskScoreBadge } from "../../components/partners/RiskScoreBadge";
import {
  BUSINESS_STATUSES,
  BUSINESS_STATUS_LABELS,
  PartnerApplicationRow,
  RISK_LEVELS,
  useBusinessCategoryOptions,
  usePartnerApplications,
} from "../../hooks/usePartnerApplications";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const RISK_LABEL: Record<string, string> = {
  unrated: "Unrated",
  low: "Low",
  medium: "Medium",
  high: "High",
};

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  submitted: "secondary",
  pending_review: "secondary",
  documents_requested: "secondary",
  under_review: "secondary",
  approved: "default",
  rejected: "destructive",
  suspended: "destructive",
  archived: "outline",
};

const PartnerApplicationsQueue = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");

  const { data, isLoading } = usePartnerApplications({ page, search, status, riskLevel, businessTypeId });
  const { data: categories } = useBusinessCategoryOptions();

  const columns = useMemo<ColumnDef<PartnerApplicationRow, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Business",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.businesses?.name ?? "—"}</span>
        ),
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => row.original.businesses?.business_categories?.label ?? "—",
      },
      {
        id: "county",
        header: "County",
        cell: ({ row }) => row.original.businesses?.county ?? "—",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANT[row.original.status] ?? "outline"}>
            {BUSINESS_STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "risk",
        header: "Risk",
        cell: ({ row }) => (
          <RiskScoreBadge
            riskLevel={row.original.risk_level}
            riskScore={row.original.risk_score}
            confidencePercentage={row.original.confidence_percentage}
          />
        ),
      },
      {
        id: "submitted",
        header: "Submitted",
        cell: ({ row }) => {
          const submittedAt = row.original.businesses?.submitted_at;
          return submittedAt ? formatDistanceToNow(new Date(submittedAt), { addSuffix: true }) : "Not submitted";
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Partner Applications</h1>
        <p className="text-sm text-muted-foreground">
          Review submitted business applications, verify documents, and manage the approval pipeline.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search business name..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <Select
          value={status || "__all"}
          onValueChange={(v) => {
            setStatus(v === "__all" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All statuses</SelectItem>
            {BUSINESS_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {BUSINESS_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={riskLevel || "__all"}
          onValueChange={(v) => {
            setRiskLevel(v === "__all" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Risk level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All risk levels</SelectItem>
            {RISK_LEVELS.map((r) => (
              <SelectItem key={r} value={r}>
                {RISK_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={businessTypeId || "__all"}
          onValueChange={(v) => {
            setBusinessTypeId(v === "__all" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
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
        pageSize={data?.pageSize ?? 20}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => row.businesses?.id && navigate(`/admin/partners/${row.businesses.id}`)}
        emptyMessage="No applications match these filters."
      />
    </div>
  );
};

export default PartnerApplicationsQueue;
