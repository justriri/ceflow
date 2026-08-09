import { NextResponse } from "next/server";
import { YIELD_OPPORTUNITIES } from "@/lib/protocols";

export interface LiveDataResponse {
  poolApys: Record<string, number>;
  celoUsdPrice: number | null;
  forexRates: { eurUsd: number; brlUsd: number; ngnUsd: number } | null;
  fetchedAt: string;
}

const POOL_IDS = Array.from(
  new Set(
    YIELD_OPPORTUNITIES.map((o) => o.defiLlamaPoolId).filter(
      (id): id is string => Boolean(id),
    ),
  ),
);

async function fetchPoolApy(poolId: string): Promise<[string, number] | null> {
  const res = await fetch(`https://yields.llama.fi/chart/${poolId}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const points = json?.data;
  const latest = Array.isArray(points) ? points[points.length - 1] : null;
  if (!latest || typeof latest.apy !== "number") return null;
  return [poolId, latest.apy];
}

async function fetchPoolApys(): Promise<Record<string, number>> {
  const results = await Promise.allSettled(POOL_IDS.map(fetchPoolApy));
  const map: Record<string, number> = {};
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      const [poolId, apy] = result.value;
      map[poolId] = apy;
    }
  }
  return map;
}

async function fetchCeloPrice(): Promise<number | null> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd",
    { next: { revalidate: 300 } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  const price = data?.celo?.usd;
  return typeof price === "number" ? price : null;
}

async function fetchForexRates(): Promise<{ eurUsd: number; brlUsd: number; ngnUsd: number } | null> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const eur = data?.rates?.EUR;
  const brl = data?.rates?.BRL;
  const ngn = data?.rates?.NGN;
  if (
    typeof eur !== "number" ||
    typeof brl !== "number" ||
    typeof ngn !== "number" ||
    eur === 0 ||
    brl === 0 ||
    ngn === 0
  ) {
    return null;
  }
  return { eurUsd: 1 / eur, brlUsd: 1 / brl, ngnUsd: 1 / ngn };
}

export async function GET() {
  const [poolApys, celoUsdPrice, forexRates] = await Promise.all([
    fetchPoolApys(),
    fetchCeloPrice(),
    fetchForexRates(),
  ]);

  const body: LiveDataResponse = {
    poolApys,
    celoUsdPrice,
    forexRates,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(body);
}
