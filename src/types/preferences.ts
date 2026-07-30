import type { StablecoinSymbol } from "@/config/tokens";
import type { RiskLevel } from "@/types/yield";

export interface UserPreferences {
  selectedStablecoin: StablecoinSymbol;
  riskTolerance: RiskLevel;
  minApy: number;
  requireInstantWithdrawal: boolean;
  allowLpPositions: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  selectedStablecoin: "USDM",
  riskTolerance: "medium",
  minApy: 0,
  requireInstantWithdrawal: false,
  allowLpPositions: true,
};
