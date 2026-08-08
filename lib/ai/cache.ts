/**
 * In-memory cache for agent results, keyed by `${task}:${sha1(userPrompt)}`.
 *
 * Deliberately not Redis or a database — for a 17-hour hackathon build this
 * is correct and sufficient. A serverless cold start losing the cache is an
 * acceptable, explicitly-chosen tradeoff, not an oversight.
 */

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const TTL_MS = 30 * 60 * 1000;

const store = new Map<string, CacheEntry>();

/** Calls made this process lifetime — surfaced by /api/ai/health. */
let requestCount = 0;

export function get(key: string): unknown | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.data;
}

export function set(key: string, data: unknown): void {
  store.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

/** Clears cached entries only — the lifetime request counter deliberately
 *  survives this, since it tracks total credits spent this process. */
export function clear(): void {
  store.clear();
}

/** Call once per actual network attempt to NVIDIA — credits are scarce. */
export function recordRequest(): void {
  requestCount += 1;
}

export function getRequestCount(): number {
  return requestCount;
}

export function getCacheSize(): number {
  return store.size;
}
