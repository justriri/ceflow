import type { AccessGate } from "@/lib/payments/types";

/**
 * Default gate — always grants access. This is what's active today: the
 * whole app behaves as if every resource is free, because it is. No
 * network calls, no wallet interaction, resolves immediately.
 */
export const freeAccessGate: AccessGate = {
  id: "free",
  async checkAccess() {
    return { status: "granted" };
  },
};
