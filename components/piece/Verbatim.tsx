interface VerbatimProps {
  children: React.ReactNode;
}

/**
 * A run of words that is verbatim the creator's.
 *
 * Rendered in --blood-glow, the one colour reserved for this and nothing else
 * in the entire app. No background fill: the words are lit, not stickered.
 *
 * `<mark>` carries the "marked for reference" semantics through to assistive
 * technology, and Safe Mode adds weight and an underline so the distinction
 * never rests on colour alone.
 */
export function Verbatim({ children }: VerbatimProps) {
  return <mark className="verbatim">{children}</mark>;
}
