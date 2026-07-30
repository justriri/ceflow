"use client";

import { useAccount } from "wagmi";
import { useTransactionHistory } from "@/hooks/use-transaction-history";

const ACTION_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdraw: "Withdraw",
  claimRewards: "Claim rewards",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function HistoryTab() {
  const { address } = useAccount();
  const { records } = useTransactionHistory();

  const mine = records
    .filter((r) => address && r.walletAddress.toLowerCase() === address.toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp);

  if (mine.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No transaction history yet. Deposits, withdrawals, and claims made through this app will
        show up here — this device only, not synced from elsewhere.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Only shows activity made through this app on this device — there&apos;s no indexer, so it
        can&apos;t see deposits made directly on a protocol&apos;s own site or from another device.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/10 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
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
                className="border-b border-black/5 last:border-0 dark:border-white/5"
              >
                <td className="px-4 py-3 font-medium text-black dark:text-zinc-50">
                  {ACTION_LABELS[record.action] ?? record.action}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {record.protocolName}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {record.amount ? `${record.amount} ${record.stablecoinSymbol ?? ""}` : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {new Date(record.timestamp).toLocaleString()}
                </td>
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
                      className="font-mono text-xs text-zinc-500 underline dark:text-zinc-400"
                    >
                      {record.txHash.slice(0, 8)}…{record.txHash.slice(-6)}
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>
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
