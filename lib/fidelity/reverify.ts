import { normalizeText, wordsOf } from "@/lib/fidelity/normalize";
import { computeSimilarity, type VerifiedPiece, type VerifiedSegment } from "@/lib/fidelity/verify";
import type { Fragment, PieceSegment, SegmentOrigin } from "@/types/domain";

const SHORT_SEGMENT_MAX_WORDS = 4;
const CAPTURED_THRESHOLD = 0.72;

interface NormalizedFragment {
  id: string;
  normalized: string;
}

function verifySegmentWithUserEditGuard(
  segment: PieceSegment & { sourceFragmentId?: string; matchScore?: number; matchedFragmentId?: string | null },
  normalizedFragments: NormalizedFragment[],
): VerifiedSegment {
  // Honesty rule: user edits in their own hand are captured by definition (sourceFragmentId === "__user_edit__")
  if (segment.sourceFragmentId === "__user_edit__") {
    return {
      text: segment.text,
      origin: "captured",
      sourceFragmentId: "__user_edit__",
      matchScore: 1.0,
      matchedFragmentId: null,
    };
  }

  const wordCount = wordsOf(segment.text).length;
  let matchScore = 0;
  let matchedFragmentId: string | null = null;

  if (wordCount <= SHORT_SEGMENT_MAX_WORDS) {
    const normalizedSegment = normalizeText(segment.text);
    if (normalizedSegment.length > 0) {
      for (const fragment of normalizedFragments) {
        if (fragment.normalized.includes(normalizedSegment)) {
          matchScore = 1;
          matchedFragmentId = fragment.id;
          break;
        }
      }
    }
  } else {
    for (const fragment of normalizedFragments) {
      const score = computeSimilarity(segment.text, fragment.normalized);
      if (score > matchScore) {
        matchScore = score;
        matchedFragmentId = fragment.id;
      }
    }
  }

  const origin: SegmentOrigin = matchScore >= CAPTURED_THRESHOLD ? "captured" : "invented";

  return {
    text: segment.text,
    origin,
    sourceFragmentId: origin === "captured" ? (matchedFragmentId ?? segment.sourceFragmentId) : undefined,
    matchScore,
    matchedFragmentId,
  };
}

export function reverifyEditedPiece(
  piece: VerifiedPiece,
  sourceFragments: Fragment[],
): VerifiedPiece {
  const normalizedFragments: NormalizedFragment[] = sourceFragments.map((fragment) => ({
    id: fragment.id,
    normalized: normalizeText(fragment.text),
  }));

  let captured = 0;
  let invented = 0;

  const stanzas: VerifiedSegment[][] = piece.stanzas.map((stanza) =>
    stanza.map((segment) => {
      const verified = verifySegmentWithUserEditGuard(segment, normalizedFragments);
      if (verified.origin === "captured") captured += 1;
      else invented += 1;
      return verified;
    }),
  );

  return {
    ...piece,
    stanzas,
    fidelity: {
      captured,
      invented,
      verifiedByCode: true,
    },
  };
}
