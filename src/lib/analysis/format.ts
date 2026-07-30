export function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}
