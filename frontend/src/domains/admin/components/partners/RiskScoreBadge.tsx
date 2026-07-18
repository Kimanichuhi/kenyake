import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RiskLevel } from "../../hooks/usePartnerApplications";

const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  unrated: "Unrated",
};

const LEVEL_CLASS: Record<RiskLevel, string> = {
  low: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  high: "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/20",
  unrated: "text-muted-foreground",
};

interface RiskScoreBadgeProps {
  riskLevel: string | null | undefined;
  riskScore?: number | null;
  confidencePercentage?: number | null;
  showDetail?: boolean;
  className?: string;
}

export function RiskScoreBadge({
  riskLevel,
  riskScore,
  confidencePercentage,
  showDetail = true,
  className,
}: RiskScoreBadgeProps) {
  const level = ((riskLevel as RiskLevel) in LEVEL_LABEL ? (riskLevel as RiskLevel) : "unrated") as RiskLevel;

  return (
    <Badge variant="outline" className={cn(LEVEL_CLASS[level], className)}>
      {LEVEL_LABEL[level]}
      {showDetail && typeof riskScore === "number" && ` · ${riskScore}`}
      {showDetail && typeof confidencePercentage === "number" && ` · ${Math.round(confidencePercentage)}% conf.`}
    </Badge>
  );
}
