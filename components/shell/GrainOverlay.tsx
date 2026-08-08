/**
 * Page-wide film grain: a single inline SVG feTurbulence noise field, tiled
 * via CSS background-image (see `.grain` in globals.css), fixed, 3% opacity,
 * pointer-events none. Safe Mode and prefers-reduced-motion both zero it out
 * through the same stylesheet rules — no JS branching needed here.
 */
export function GrainOverlay() {
  return <div className="grain" aria-hidden="true" />;
}
