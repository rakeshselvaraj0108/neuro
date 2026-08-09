/**
 * Shared text normalization for fidelity matching — lowercase, strip
 * punctuation, collapse whitespace. Kept separate from verify.ts so both
 * the short-segment substring check and the long-segment n-gram check use
 * exactly the same normalization (a mismatch here would silently skew
 * matchScore in one path but not the other).
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordsOf(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.length > 0 ? normalized.split(" ") : [];
}
