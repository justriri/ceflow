import { celo, celoSepolia } from "wagmi/chains";

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function networkName(chainId: number | undefined) {
  if (chainId === celo.id) return "Celo Mainnet";
  if (chainId === celoSepolia.id) return "Celo Sepolia Testnet";
  return "Unsupported Network";
}

export function formatAmount(value: string | undefined) {
  if (value === undefined) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
