/**
 * Tracks consecutive AI-call failures in a module-level sliding window, so
 * the gateway can stop burning the demo's remaining rate-limit budget
 * retrying a provider that is already down. Persists for the server
 * process lifetime — no DB needed.
 */

const FAILURE_THRESHOLD = 3;
const WINDOW_MS = 60_000;

let failureTimestamps: number[] = [];

function pruneExpired(now: number): void {
  failureTimestamps = failureTimestamps.filter((t) => now - t <= WINDOW_MS);
}

/** Call after a network error, timeout, or unrecoverable validation failure. */
export function recordFailure(): void {
  const now = Date.now();
  pruneExpired(now);
  failureTimestamps.push(now);
}

/** Call after a fully successful, schema-valid model response. */
export function recordSuccess(): void {
  failureTimestamps = [];
}

/** True once 3+ failures have landed within the trailing 60 seconds. */
export function isOpen(): boolean {
  pruneExpired(Date.now());
  return failureTimestamps.length >= FAILURE_THRESHOLD;
}

export function getRecentFailureCount(): number {
  pruneExpired(Date.now());
  return failureTimestamps.length;
}

export function reset(): void {
  failureTimestamps = [];
}
