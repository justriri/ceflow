import type { RiskLevel } from "@/types/yield";

const RISK_STYLES: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_STYLES[level]}`}
    >
      {RISK_LABELS[level]}
    </span>
  );
}
