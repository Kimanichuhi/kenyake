import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  FileQuestion,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useBusinessStatusHistory } from "../../hooks/useBusinessStatusHistory";
import { MyBusiness } from "../../types/business";

export type BusinessStatus =
  | "draft"
  | "submitted"
  | "pending_review"
  | "documents_requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "archived";

export type StatusTone = "neutral" | "warning" | "success" | "danger";

export interface StatusMeta {
  label: string;
  description: string;
  badgeClassName: string;
  icon: LucideIcon;
  tone: StatusTone;
}

export const STATUS_META: Record<BusinessStatus, StatusMeta> = {
  draft: {
    label: "Draft",
    description: "Finish your application and submit it for review whenever you're ready.",
    badgeClassName: "border-transparent bg-muted text-muted-foreground",
    icon: FileQuestion,
    tone: "neutral",
  },
  submitted: {
    label: "Submitted",
    description: "We've received your application and it's queued for review.",
    badgeClassName: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    icon: Clock,
    tone: "warning",
  },
  pending_review: {
    label: "In Review",
    description: "Our team is reviewing your application. We'll be in touch soon.",
    badgeClassName: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    icon: Clock,
    tone: "warning",
  },
  under_review: {
    label: "In Review",
    description: "Our team is taking a closer look at your application.",
    badgeClassName: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    icon: Clock,
    tone: "warning",
  },
  documents_requested: {
    label: "Action Needed",
    description: "We need a few more documents from you before we can continue reviewing your application.",
    badgeClassName: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    icon: AlertTriangle,
    tone: "warning",
  },
  approved: {
    label: "Live",
    description: "Congratulations — your business is verified and live on Sync Safaris.",
    badgeClassName: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
    icon: ShieldCheck,
    tone: "success",
  },
  rejected: {
    label: "Not Approved",
    description: "Your application wasn't approved this time.",
    badgeClassName: "border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
    icon: XCircle,
    tone: "danger",
  },
  suspended: {
    label: "Suspended",
    description: "Your business listing is currently suspended.",
    badgeClassName: "border-transparent bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
    icon: XCircle,
    tone: "danger",
  },
  archived: {
    label: "Archived",
    description: "This business is archived and no longer active.",
    badgeClassName: "border-transparent bg-muted text-muted-foreground",
    icon: FileQuestion,
    tone: "neutral",
  },
};

export const TONE_DOT_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground/40",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
};

export function getStatusMeta(status: string | undefined | null): StatusMeta {
  return STATUS_META[(status as BusinessStatus) ?? "draft"] ?? STATUS_META.draft;
}

/** Positive-framed labels for an owner — the raw risk_level is an internal
 * admin signal, so once a business is approved we translate it rather than
 * showing "risk" language to the business owner. */
const RISK_LEVEL_LABEL: Record<string, string> = {
  low: "Excellent",
  medium: "Good",
  high: "Fair",
  unrated: "—",
};

const CHECKLIST_KEYS = [
  "email_verified",
  "phone_verified",
  "government_registration_verified",
  "tourism_license_verified",
  "insurance_verified",
  "address_verified",
  "inspection_passed",
  "trusted_referral",
] as const;

const CHECKLIST_LABELS: Record<(typeof CHECKLIST_KEYS)[number], string> = {
  email_verified: "Email verified",
  phone_verified: "Phone verified",
  government_registration_verified: "Government registration",
  tourism_license_verified: "Tourism license",
  insurance_verified: "Insurance",
  address_verified: "Business address",
  inspection_passed: "On-site inspection",
  trusted_referral: "Trusted referral",
};

interface BusinessStatusOverviewProps {
  business: MyBusiness;
}

export function BusinessStatusOverview({ business }: BusinessStatusOverviewProps) {
  const status = business.business_verification?.status ?? "draft";
  const meta = getStatusMeta(status);
  const checklist = business.business_verification_checklist;
  const { data: history } = useBusinessStatusHistory(business.id);

  const completedCount = checklist ? CHECKLIST_KEYS.filter((key) => Boolean(checklist[key])).length : 0;
  const totalChecks = CHECKLIST_KEYS.length;
  const progressPct = Math.round((completedCount / totalChecks) * 100);

  const latestReason = history?.[0]?.reason ?? undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="text-xl">Application Status</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Badge className={cn("gap-1.5 py-1", meta.badgeClassName)}>
          <meta.icon className="h-3.5 w-3.5" /> {meta.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "documents_requested" && (
          <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" />
              <span>We need more documents from you to continue reviewing your application.</span>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link to="/partner/documents">Upload documents</Link>
            </Button>
          </div>
        )}

        {(status === "rejected" || status === "suspended") && latestReason && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <p className="font-medium">Reason</p>
            <p className="mt-1">{latestReason}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Verification checklist</span>
            <span className="text-muted-foreground">
              {completedCount} of {totalChecks} checks complete
            </span>
          </div>
          <Progress value={progressPct} />
          <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {CHECKLIST_KEYS.map((key) => {
              const done = checklist ? Boolean(checklist[key]) : false;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      done ? "bg-emerald-500" : "bg-muted-foreground/30",
                    )}
                  />
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>
                    {CHECKLIST_LABELS[key]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {status === "approved" && business.business_verification && (
          <div className="grid grid-cols-2 gap-4 rounded-md border border-border p-4">
            <div>
              <p className="text-xs text-muted-foreground">Trust Score</p>
              <p className="text-2xl font-semibold text-foreground">
                {Math.round(Number(business.business_verification.confidence_percentage))}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Verification Rating</p>
              <p className="text-2xl font-semibold text-foreground">
                {RISK_LEVEL_LABEL[business.business_verification.risk_level] ?? "—"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
