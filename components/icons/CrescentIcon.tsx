import type { IconProps } from "./types";

/** The crescent that breaks the rule beneath a piece title. */
export function CrescentIcon({
  size = 14,
  className,
  strokeWidth = 1.2,
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
      <path
        d="M16.6 3.6a9 9 0 100 16.8 9.6 9.6 0 010-16.8z"
        fill="currentColor"
        fillOpacity="0.28"
      />
      <path d="M16.6 3.6a9 9 0 100 16.8 9.6 9.6 0 010-16.8z" />
    </svg>
  );
}
