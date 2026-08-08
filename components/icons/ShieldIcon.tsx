import type { IconProps } from "./types";

/** Fidelity: the creator's own words, kept intact. */
export function ShieldIcon({
  size = 12,
  className,
  strokeWidth = 1.6,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2.9l7 2.6v5.9c0 4.3-2.9 7.9-7 9.7-4.1-1.8-7-5.4-7-9.7V5.5z" />
      <path d="M9 11.9l2.2 2.2 4-4.4" strokeOpacity="0.8" />
    </svg>
  );
}
