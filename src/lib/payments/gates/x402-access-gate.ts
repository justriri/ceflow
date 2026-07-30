import type { AccessGate, AccessCheckResult, X402SettlementAsset } from "@/lib/payments/types";

export interface X402AccessGateConfig {
  /** The paid resource endpoint this gate protects, e.g. "/api/analysis". */
  resourceUrl: string;
  priceUsd: string;
  asset: X402SettlementAsset;
  payToAddress: `0x${string}`;
  description: string;
}

/**
 * Real x402 gate, built against thirdweb's facilitator (the one that
 * actually supports USDM — see lib/payments/types.ts for why Celo's own
 * native facilitator can't be used for this asset). Probes the protected
 * resource without a payment header; a 402 response means payment is
 * required, anything else means it's already accessible.
 *
 * NOT active by default — src/lib/payments/index.ts still exports
 * freeAccessGate. Activating this requires:
 *   1. THIRDWEB_SECRET_KEY, X402_PAYOUT_ADDRESS, X402_PRICE_USD set on the
 *      server (see .env.local.example) — a real thirdweb account and a
 *      real wallet that will receive user funds, both business decisions.
 *   2. Swapping the export in payments/index.ts to createX402AccessGate(...).
 * The actual "pay and retry" flow (signing the payment, not just detecting
 * that one is required) still needs to be built into AccessGateBoundary
 * when this is activated — checkAccess only answers "is this granted."
 */
export function createX402AccessGate(config: X402AccessGateConfig): AccessGate {
  return {
    id: "x402",
    async checkAccess(): Promise<AccessCheckResult> {
      let response: Response;
      try {
        response = await fetch(config.resourceUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } catch {
        // A real paywall should fail closed on a network error, not
        // silently let everyone through.
        return {
          status: "payment-required",
          requirement: {
            priceUsd: config.priceUsd,
            asset: config.asset,
            payToAddress: config.payToAddress,
            network: "celo",
            description: `${config.description} (payment check unavailable — try again)`,
          },
        };
      }

      if (response.status === 402) {
        return {
          status: "payment-required",
          requirement: {
            priceUsd: config.priceUsd,
            asset: config.asset,
            payToAddress: config.payToAddress,
            network: "celo",
            description: config.description,
          },
        };
      }

      return { status: "granted" };
    },
  };
}
