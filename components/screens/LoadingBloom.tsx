interface LoadingBloomProps {
  label: string;
}

/**
 * The calm, ambient "something is happening" visual shared by the
 * Constellation / Momentum / Ship placeholders — reuses Phase 1's
 * moon-bloom motion pattern so the mood stays consistent across screens.
 * Constellation's is not a stub: it's the real loading state a user sees
 * the instant they tap "Catch this Flood," even after Phase 4 exists.
 */
export function LoadingBloom({ label }: LoadingBloomProps) {
  return (
    <div className="loading-screen__stage">
      <div className="loading-screen__bloom" aria-hidden="true" />
      <p className="loading-screen__label">{label}</p>
    </div>
  );
}
