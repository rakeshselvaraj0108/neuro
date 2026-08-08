import type { IconProps } from "./types";

/** Momentum: one flood, several possible finished forms. */
export function BranchIcon({
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
      <path d="M6 20V9.4A3.4 3.4 0 019.4 6h8.2" />
      <path d="M14.6 3.2L17.8 6l-3.2 2.8" />
      <path d="M6 13.2h4.4A3.4 3.4 0 0013.8 9.8" strokeOpacity="0.6" />
      <circle cx="6" cy="20.4" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
