/**
 * The domain model for the whole of Catch the Flood.
 *
 * Phase 1 only *consumes* `Piece`, `PieceSegment` and `JourneyStep` — the rest
 * is declared now so later phases (capture, clustering, fidelity, momentum,
 * scope-lock, export) slot in without a type migration.
 */

/** How a fragment entered the flood. Voice and text are equally valid input. */
export type CaptureMode = "voice" | "text";

/**
 * A single raw thought as the creator left it.
 *
 * `abandoned` is deliberately not a failure flag: a fragment cut off
 * mid-sentence is complete input, and the product never asks the creator to
 * go back and finish it.
 */
export interface Fragment {
  id: string;
  text: string;
  createdAt: number;
  mode: CaptureMode;
  abandoned: boolean;
  /** Assigned by the constellation pass; null until the flood is clustered. */
  clusterId: string | null;
}

/**
 * A boundary the AI drew around fragments that belong to one piece.
 *
 * `readiness` is readiness TO FINISH — not quality, not importance. This is
 * the triage signal the whole product is built around.
 */
export interface Cluster {
  id: string;
  label: string;
  fragmentIds: string[];
  /** 0-100. How close this cluster is to being a finishable piece right now. */
  readiness: number;
  /** One short human sentence explaining the score, in plain language. */
  readinessReason: string;
  suggestedForms: string[];
}

/** Whether a run of words came from the creator or from the model. */
export type SegmentOrigin = "captured" | "invented";

/**
 * A run of text inside a piece, tagged with where it came from.
 *
 * This is what makes the fidelity claim auditable rather than rhetorical:
 * `origin: "captured"` renders in the reserved verbatim colour, so the
 * creator can see their own words in their own finished work.
 */
export interface PieceSegment {
  text: string;
  origin: SegmentOrigin;
  /** Present on captured segments once fidelity tracking lands in Phase 5. */
  sourceFragmentId?: string;
}

/** The five steps of the arc, surfaced in the Your Creative Journey rail. */
export interface JourneyStep {
  key: "flood" | "fidelity" | "momentum" | "chosen" | "finished";
  title: string;
  subtitle: string;
  complete: boolean;
}

/** A finished creative work. */
export interface Piece {
  id: string;
  title: string;
  form: string;
  /** Stanzas of segments. Line breaks live inside segment text as `\n`. */
  stanzas: PieceSegment[][];
  fidelity: { captured: number; invented: number };
  /** Scope-lock timestamp. Once set, the piece refuses additions. */
  lockedAt: number | null;
  journey: JourneyStep[];
}
