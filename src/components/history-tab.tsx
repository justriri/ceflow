"use client";

import { useAccount } from "wagmi";
import { History as HistoryIcon, ExternalLink } from "lucide-react";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import { EmptyState } from "@/components/empty-state";

const ACTION_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdraw: "Withdraw",
  claimRewards: "Claim rewards",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-surface-2 text-muted",
  confirmed: "bg-success-soft text-success",
  failed: "bg-danger-soft text-danger",
};

export function HistoryTab() {
  const { address } = useAccount();
  const { records } = useTransactionHistory();

  const mine = records
    .filter((r) => address && r.walletAddress.toLowerCase() === address.toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp);

  if (mine.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="No transaction history yet"
        description="Deposits, withdrawals, and claims made through this app will show up here — this device only, not synced from elsewhere."
      />
    );
  }

  return (
    <div className="animate-fade-up flex flex-col gap-3">
      <p className="text-xs text-muted-2">
        Only shows activity made through this app on this device — there&apos;s no indexer, so it
        can&apos;t see deposits made directly on a protocol&apos;s own site or from another device.
      </p>
      <div className="panel overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border-subtle text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Protocol</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tx</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((record) => (
              <tr
                key={record.id}
                className="border-b border-border-subtle transition-colors last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {ACTION_LABELS[record.action] ?? record.action}
                </td>
                <td className="px-4 py-3 text-muted">{record.protocolName}</td>
                <td className="px-4 py-3 text-muted tabular-nums">
                  {record.amount ? `${record.amount} ${record.stablecoinSymbol ?? ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-muted">{new Date(record.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[record.status]}`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {record.txHash ? (
                    <a
                      href={`https://celoscan.io/tx/${record.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-fit items-center gap-1 font-mono text-xs text-muted underline transition-colors hover:text-foreground"
                    >
                      {record.txHash.slice(0, 8)}…{record.txHash.slice(-6)}
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-2">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
