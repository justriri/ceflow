import type { ProtocolAdapter } from "@/lib/transactions/types";
import { aaveAdapter } from "@/lib/transactions/adapters/aave";
import { moolaAdapter } from "@/lib/transactions/adapters/moola";

const ADAPTERS: Record<string, ProtocolAdapter> = {
  [aaveAdapter.id]: aaveAdapter,
  [moolaAdapter.id]: moolaAdapter,
};

/** Null means this opportunity doesn't support on-chain execution yet. */
export function getAdapter(opportunityId: string): ProtocolAdapter | null {
  return ADAPTERS[opportunityId] ?? null;
}
