import { NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { celo } from "thirdweb/chains";
import { settlePayment, facilitator } from "thirdweb/x402";
import { analyzePortfolio } from "@/lib/analysis/analyze-portfolio";
import type { PortfolioSnapshot } from "@/lib/analysis/types";

/**
 * The paid resource behind x402: given an already-built PortfolioSnapshot
 * (computed client-side from live wallet/position/APY data, since this app
 * has no server-side wallet-reading infra), settles payment and returns the
 * full analysis. Reuses analyzePortfolio() verbatim — no duplicated logic
 * between the free client-side path and this paid server-side path.
 *
 * Inactive unless THIRDWEB_SECRET_KEY, X402_PAYOUT_ADDRESS, and
 * X402_PRICE_USD are all set — see .env.local.example. Not reachable while
 * `activeAccessGate` (src/lib/payments/index.ts) stays the free gate.
 */
export async function POST(request: Request) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const payoutAddress = process.env.X402_PAYOUT_ADDRESS;
  const priceUsd = process.env.X402_PRICE_USD;

  if (!secretKey || !payoutAddress || !priceUsd) {
    return NextResponse.json(
      {
        error:
          "x402 payment collection is not configured on this deployment (THIRDWEB_SECRET_KEY / X402_PAYOUT_ADDRESS / X402_PRICE_USD missing).",
      },
      { status: 501 },
    );
  }

  const snapshot = (await request.json()) as PortfolioSnapshot;

  const client = createThirdwebClient({ secretKey });
  const thirdwebFacilitator = facilitator({ client, serverWalletAddress: payoutAddress });

  const paymentData = request.headers.get("X-PAYMENT") ?? request.headers.get("PAYMENT-SIGNATURE");

  const result = await settlePayment({
    resourceUrl: request.url,
    method: "POST",
    paymentData,
    payTo: payoutAddress,
    network: celo,
    price: `$${priceUsd}`,
    facilitator: thirdwebFacilitator,
    routeConfig: {
      description: "AI portfolio analysis",
      mimeType: "application/json",
    },
  });

  if (result.status !== 200) {
    return NextResponse.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }

  const analysis = analyzePortfolio(snapshot);
  return NextResponse.json(analysis, { headers: result.responseHeaders });
}
