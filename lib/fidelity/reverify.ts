import {
  buildNormalizedFragments,
  verifySegment,
  type NormalizedFragment,
  type VerifiedPiece,
  type VerifiedSegment,
} from "@/lib/fidelity/verify";
import type { Fragment, PieceSegment } from "@/types/domain";

/**
 * Re-runs Phase 5's verification on an edited piece, with one addition:
 * segments the user directly typed carry sourceFragmentId "__user_edit__"
 * and are treated as captured unconditionally, matchScore 1.0, never
 * re-scored against the old fragments — a live edit in the creator's own
 * hand is a new source of truth, not something to pattern-match against
 * stale capture data. User edits monotonically increase fidelity toward
 * the creator; they can never make the piece "less yours."
 *
 * Every other segment goes through the exact same verifySegment() Phase 5
 * uses for initial generation — no separate copy of the threshold or the
 * short/long branching lives here.
 */
function verifySegmentWithUserEditGuard(
  segment: PieceSegment,
  normalizedFragments: NormalizedFragment[],
): VerifiedSegment {
  if (segment.sourceFragmentId === "__user_edit__") {
    return {
      text: segment.text,
      origin: "captured",
      sourceFragmentId: "__user_edit__",
      matchScore: 1,
      matchedFragmentId: null,
    };
  }
  return verifySegment(segment, normalizedFragments);
}

export function reverifyEditedPiece(piece: VerifiedPiece, sourceFragments: Fragment[]): VerifiedPiece {
  const normalizedFragments = buildNormalizedFragments(sourceFragments);

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
    fidelity: { captured, invented, verifiedByCode: true },
  };
}
