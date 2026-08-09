import type { Point } from "@/lib/constellation/layout";

interface FragmentDotProps {
  position: Point;
  orbCenter: Point;
  /** Thicker + brighter when the parent orb is hovered/focused/selected. */
  emphasized: boolean;
}

/**
 * One captured fragment, drawn as a small point of light with a thin line
 * back to its cluster's orb — literally the "constellation line" that makes
 * the metaphor read as designed, not decorative.
 */
export function FragmentDot({ position, orbCenter, emphasized }: FragmentDotProps) {
  return (
    <g aria-hidden="true">
      <line
        x1={orbCenter.x}
        y1={orbCenter.y}
        x2={position.x}
        y2={position.y}
        stroke="var(--blood-deep)"
        strokeOpacity={emphasized ? 0.55 : 0.3}
        strokeWidth={emphasized ? 2 : 1}
      />
      <circle
        cx={position.x}
        cy={position.y}
        r={3}
        fill="var(--paper)"
        fillOpacity={0.7}
      />
    </g>
  );
}
