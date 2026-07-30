import { freeAccessGate } from "@/lib/payments/gates/free-access-gate";
import type { AccessGate } from "@/lib/payments/types";

export type { AccessCheckResult, AccessGate, PaymentRequirement } from "@/lib/payments/types";

/**
 * The single seam for activating x402 metering later: swap this export for
 * an x402AccessGate instance (see gates/x402-access-gate.ts for what that
 * requires) and every caller — useAccessGate, AccessGateBoundary — picks it
 * up automatically. Nothing else in the app imports a concrete gate.
 */
export const activeAccessGate: AccessGate = freeAccessGate;
