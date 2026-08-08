import type { IconProps } from "./types";

/** The flood: many small captures arriving faster than they can be sorted. */
export function DropletIcon({
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
      <path d="M12 3.2l5 6.4a6.3 6.3 0 11-10 0z" />
      <path d="M9.4 14.2a2.9 2.9 0 002.3 2.6" strokeOpacity="0.65" />
    </svg>
  );
}
