export type MonitorEventType =
  | "apy-change"
  | "new-opportunity"
  | "risk-change"
  | "better-allocation"
  | "market-event";

export interface MonitorEvent {
  type: MonitorEventType;
  headline: string;
  detail: string;
  timestamp: number;
  opportunityId: string | null;
}

/**
 * One detector for one category of change. Each is independent and stateless
 * from the orchestrator's point of view — adding a new detector (e.g. a
 * "risk change" source once protocol risk data has a way to change) means
 * writing a new file implementing this interface and adding it to the
 * registry in monitoring/index.ts, nothing else.
 */
export interface MonitorSource {
  id: string;
  detect(): Promise<MonitorEvent[]>;
}
