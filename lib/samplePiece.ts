import type { Piece, PieceSegment } from "@/types/domain";

/**
 * A stanza whose only content is this marker renders as an ornamental rule
 * rather than as text. Keeping it in the data (instead of hardcoding a divider
 * into the JSX) means the piece body stays fully data-driven — every visible
 * word on the Finished Piece screen comes from this file.
 */
export const STANZA_RULE = "———";

export function isRuleStanza(stanza: readonly PieceSegment[]): boolean {
  return stanza.length === 1 && stanza[0]?.text.trim() === STANZA_RULE;
}

/** Shorthand for a run of words the model supplied. */
const inv = (text: string): PieceSegment => ({ text, origin: "invented" });

/**
 * Shorthand for a run of words the creator actually said or typed.
 * `sourceFragmentId` points back into the flood so Phase 5 can show the
 * original capture behind any highlighted span.
 */
const cap = (text: string, sourceFragmentId: string): PieceSegment => ({
  text,
  origin: "captured",
  sourceFragmentId,
});

export const samplePiece: Piece = {
  id: "piece_midnight_forgetting",
  title: "Midnight Forgetting",
  form: "Poem",
  stanzas: [
    [inv("At midnight,\nthe city "), cap("forgets", "frag_04"), inv(" a name.")],
    [
      inv("Doors close.\nWindows dim.\nOne by one,\nfaces "),
      cap("fade", "frag_09"),
      inv(" like smoke."),
    ],
    [
      inv("I write "),
      cap("yours", "frag_11"),
      inv("\non every wall\nbefore the clock\nreaches twelve."),
    ],
    [
      inv("But the "),
      cap("blue train", "frag_02"),
      inv("\nstill comes—\ncarrying something\nI'm not ready to lose."),
    ],
    [inv(STANZA_RULE)],
    [inv("I "), cap("remember", "frag_17"), inv(".\nThat's my rebellion.")],
  ],
  /**
   * Phase 1 renders the counts the journey panel specifies. Real fidelity
   * numbers — counted from the captured/invented segments against the actual
   * flood — arrive in Phase 5, when the Fidelity Agent is wired to NVIDIA NIM.
   */
  fidelity: { captured: 17, invented: 0 },
  /** Scope-lock: this piece is closed. New ideas park back in the flood. */
  lockedAt: Date.UTC(2026, 1, 14, 23, 47),
  journey: [
    {
      key: "flood",
      title: "Flood captured",
      subtitle: "17 ideas",
      complete: true,
    },
    {
      key: "fidelity",
      title: "Fidelity agent",
      subtitle: "17 captured / 0 invented",
      complete: true,
    },
    {
      key: "momentum",
      title: "Momentum agent",
      subtitle: "3 paths suggested",
      complete: true,
    },
    {
      key: "chosen",
      title: "You chose",
      subtitle: "Poem",
      complete: true,
    },
    {
      key: "finished",
      title: "Piece finished",
      subtitle: "100% yours",
      complete: true,
    },
  ],
};
