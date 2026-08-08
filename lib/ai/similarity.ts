/**
 * Jaccard token-overlap similarity — the zero-AI clustering signal used by
 * fallbackConstellation. No external NLP library: lowercase, strip
 * punctuation, drop stopwords, compare token sets.
 */

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "for",
  "with", "is", "are", "was", "were", "be", "been", "being", "it", "its",
  "this", "that", "these", "those", "i", "you", "he", "she", "we", "they",
  "my", "your", "his", "her", "our", "their", "at", "by", "from", "as",
  "not", "no", "so", "then", "than", "just", "up", "out", "about", "into",
  "over", "after", "before", "again", "further", "here", "there", "all",
  "any", "both", "each", "few", "more", "most", "other", "some", "such",
  "only", "own", "same", "too", "very", "can", "will", "would", "should",
  "could", "do", "does", "did", "have", "has", "had", "am", "me", "us",
  "them", "what", "which", "who", "whom", "when", "where", "why", "how",
]);

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !STOPWORDS.has(word));
  return new Set(words);
}

/** 0 (no overlap) to 1 (identical token sets). Empty input always scores 0. */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const token of setA) {
    if (setB.has(token)) intersectionSize += 1;
  }
  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}
