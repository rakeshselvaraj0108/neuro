/**
 * Structured, content-free logging for every agent call.
 *
 * Deliberately logs only task name, source, latency and success — never the
 * prompt or response text, which may carry the creator's own words. One
 * JSON line per call, so this could feed a debug panel later without any
 * format change.
 */

export type AgentSource = "model" | "cache" | "fallback";

export interface TelemetryEvent {
  task: string;
  source: AgentSource;
  latencyMs: number;
  success: boolean;
}

export function logAgentCall(event: TelemetryEvent): void {
  const line = JSON.stringify({
    type: "ai_agent_call",
    task: event.task,
    source: event.source,
    latencyMs: event.latencyMs,
    success: event.success,
    ts: Date.now(),
  });
  // eslint-disable-next-line no-console -- this file's one job is structured, content-free telemetry
  console.log(line);
}
