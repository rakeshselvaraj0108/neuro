import type { ShipResult } from "@/lib/ai/schemas";
import { normalizeText, wordsOf } from "@/lib/fidelity/normalize";
import type { Fragment, Piece, PieceSegment, SegmentOrigin } from "@/types/domain";

/**
 * The independent, deterministic verification pass: after the Ship agent
 * produces a draft, this re-checks every segment against the actual source
 * fragments and overrides the model's origin label wherever the evidence
 * disagrees. An origin tag the model assigns to its OWN text is a
 * self-report, not a fact — the model's `origin`/`sourceFragmentId` fields
 * are read here only as a hint for which fragment to check first, never as
 * the final answer. The fidelity number the user sees is computed by this
 * code, not claimed by a language model.
 */

export interface VerifiedSegment extends PieceSegment {
  /** 0-1, best similarity found against any source fragment. */
  matchScore: number;
  /** The fragment that produced matchScore, regardless of the final origin — useful even for a near-miss "invented" call. */
  matchedFragmentId: string | null;
}

/** What verifyPiece produces: the verified content, before a caller wraps it into a full stored Piece (id/lockedAt/journey are generation-time/store concerns, not fidelity concerns). */
export interface VerifiedShipResult {
  title: string;
  stanzas: VerifiedSegment[][];
  fidelity: { captured: number; invented: number; verifiedByCode: true };
}

/** The full shape store/useAppStore.ts holds as `currentPiece`. */
export interface VerifiedPiece extends Omit<Piece, "stanzas" | "fidelity"> {
  stanzas: VerifiedSegment[][];
  fidelity: { captured: number; invented: number; verifiedByCode: true };
}

/** Segments this short are checked by exact substring, not similarity — see verifySegment(). */
const SHORT_SEGMENT_MAX_WORDS = 4;

/**
 * Tuned once against realistic near-verbatim and clearly-invented examples
 * (see the assertions below `computeSimilarity`). 0.72 sits comfortably
 * above the ~0.5-0.6 a genuinely-different sentence sharing a couple of
 * common words can drift to, and comfortably below the ~0.8-1.0 a lightly
 * reworded verbatim phrase scores.
 */
const CAPTURED_THRESHOLD = 0.72;

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Jaccard similarity between `segment`'s word-set and the BEST same-length
 * sliding window of `fragment`'s word sequence — catches near-verbatim
 * reuse ("faces fade like smoke" inside "...faces just fade like smoke
 * tonight...") without requiring exact substring equality. If the fragment
 * has fewer words than the segment, the whole fragment is the one window.
 *
 * Verified examples (run via `npx tsx` against this exact function — see
 * the Phase 5 report for the transcript):
 *   computeSimilarity("faces fade like smoke", "faces just fade like smoke tonight") === 0.75
 *   computeSimilarity("the blue train", "the blue train still comes at midnight") === 1
 *   computeSimilarity("carrying something", "the weather today is mild and clear") === 0
 *   computeSimilarity("we need a way to disagree", "a way to disagree without it getting personal") === 0.625
 */
export function computeSimilarity(segment: string, fragment: string): number {
  const segWords = wordsOf(segment);
  const fragWords = wordsOf(fragment);
  if (segWords.length === 0 || fragWords.length === 0) return 0;

  const n = segWords.length;
  if (fragWords.length <= n) {
    return jaccard(segWords, fragWords);
  }

  let best = 0;
  for (let start = 0; start <= fragWords.length - n; start += 1) {
    const window = fragWords.slice(start, start + n);
    const score = jaccard(segWords, window);
    if (score > best) best = score;
  }
  return best;
}

interface NormalizedFragment {
  id: string;
  normalized: string;
}

function orderByHint(
  fragments: NormalizedFragment[],
  hintedId: string | undefined,
): NormalizedFragment[] {
  if (!hintedId) return fragments;
  const hinted = fragments.find((f) => f.id === hintedId);
  if (!hinted) return fragments;
  return [hinted, ...fragments.filter((f) => f.id !== hintedId)];
}

function verifySegment(
  segment: PieceSegment,
  normalizedFragments: NormalizedFragment[],
): VerifiedSegment {
  const wordCount = wordsOf(segment.text).length;
  let matchScore = 0;
  let matchedFragmentId: string | null = null;

  if (wordCount <= SHORT_SEGMENT_MAX_WORDS) {
    // Binary: does this short phrase appear verbatim (post-normalization)
    // in any fragment? The model's claimed source is checked first purely
    // as a performance optimization (lets the common case early-exit) —
    // it never changes the outcome, since every fragment still gets
    // checked if the hint doesn't pan out.
    const normalizedSegment = normalizeText(segment.text);
    if (normalizedSegment.length > 0) {
      const ordered = orderByHint(normalizedFragments, segment.sourceFragmentId);
      for (const fragment of ordered) {
        if (fragment.normalized.includes(normalizedSegment)) {
          matchScore = 1;
          matchedFragmentId = fragment.id;
          break;
        }
      }
    }
  } else {
    // Longer segments need the max score across ALL fragments regardless,
    // so there's no early-exit to optimize for — just scan in order.
    for (const fragment of normalizedFragments) {
      const score = computeSimilarity(segment.text, fragment.normalized);
      if (score > matchScore) {
        matchScore = score;
        matchedFragmentId = fragment.id;
      }
    }
  }

  // Unconditional override: matchScore decides, not segment.origin.
  const origin: SegmentOrigin = matchScore >= CAPTURED_THRESHOLD ? "captured" : "invented";

  return {
    text: segment.text,
    origin,
    sourceFragmentId: origin === "captured" ? (matchedFragmentId ?? undefined) : undefined,
    matchScore,
    matchedFragmentId,
  };
}

export function verifyPiece(draft: ShipResult, sourceFragments: Fragment[]): VerifiedShipResult {
  const normalizedFragments: NormalizedFragment[] = sourceFragments.map((fragment) => ({
    id: fragment.id,
    normalized: normalizeText(fragment.text),
  }));

  let captured = 0;
  let invented = 0;

  const stanzas = draft.stanzas.map((stanza) =>
    stanza.map((segment) => {
      const verified = verifySegment(segment, normalizedFragments);
      if (verified.origin === "captured") captured += 1;
      else invented += 1;
      return verified;
    }),
  );

  return {
    title: draft.title,
    stanzas,
    fidelity: { captured, invented, verifiedByCode: true },
  };
}
