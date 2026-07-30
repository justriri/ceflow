import type { RiskLevel } from "@/types/yield";

const RISK_STYLES: Record<RiskLevel, string> = {
  low: "bg-success-soft text-success",
  medium: "bg-risk-soft text-risk",
  high: "bg-danger-soft text-danger",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_STYLES[level]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {RISK_LABELS[level]}
    </span>
  );
}
