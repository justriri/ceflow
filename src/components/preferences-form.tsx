"use client";

import type { RiskLevel } from "@/types/yield";
import type { UserPreferences } from "@/types/preferences";
import type { StablecoinSymbol } from "@/config/tokens";
import { STABLECOINS } from "@/config/tokens";

const RISK_OPTIONS: RiskLevel[] = ["low", "medium", "high"];

const inputClass = "input-field px-3 py-2 text-sm text-foreground";
const labelClass = "text-xs font-medium text-muted";
const checkboxClass = "h-4 w-4 accent-accent";

interface PreferencesFormProps {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}

export function PreferencesForm({ preferences, onChange }: PreferencesFormProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Stablecoin</span>
        <select
          className={inputClass}
          value={preferences.selectedStablecoin}
          onChange={(e) =>
            onChange({
              ...preferences,
              selectedStablecoin: e.target.value as StablecoinSymbol,
            })
          }
        >
          {STABLECOINS.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Risk tolerance</span>
        <select
          className={inputClass}
          value={preferences.riskTolerance}
          onChange={(e) =>
            onChange({ ...preferences, riskTolerance: e.target.value as RiskLevel })
          }
        >
          {RISK_OPTIONS.map((level) => (
            <option key={level} value={level}>
              {level[0].toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Minimum APY (%)</span>
        <input
          type="number"
          min={0}
          step={0.1}
          className={inputClass}
          value={preferences.minApy}
          onChange={(e) =>
            onChange({ ...preferences, minApy: Number(e.target.value) || 0 })
          }
        />
      </label>

      <div className="flex flex-col justify-end gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={preferences.requireInstantWithdrawal}
            onChange={(e) =>
              onChange({ ...preferences, requireInstantWithdrawal: e.target.checked })
            }
          />
          <span className={labelClass}>Require instant withdrawals</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className={checkboxClass}
            checked={preferences.allowLpPositions}
            onChange={(e) =>
              onChange({ ...preferences, allowLpPositions: e.target.checked })
            }
          />
          <span className={labelClass}>LP positions acceptable</span>
        </label>
      </div>
    </div>
  );
}
