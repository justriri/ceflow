import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, celoSepolia } from "wagmi/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

if (!walletConnectProjectId && process.env.NODE_ENV !== "production") {
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not work until you add one from https://cloud.reown.com. Injected wallets (e.g. MetaMask) still work without it.",
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "Ceflow",
  projectId: walletConnectProjectId,
  chains: [celo, celoSepolia],
  ssr: true,
});
