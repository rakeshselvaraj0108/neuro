/** Thin wrapper so every id in the app comes from one place. */
export function uuid(): string {
  return crypto.randomUUID();
}
