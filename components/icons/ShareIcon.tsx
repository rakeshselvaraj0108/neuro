import type { IconProps } from "./types";

export function ShareIcon({
  size = 16,
  className,
  strokeWidth = 1.5,
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
      <path d="M10.4 4.6H6.2A2.2 2.2 0 004 6.8v11A2.2 2.2 0 006.2 20h11a2.2 2.2 0 002.2-2.2v-4.2" />
      <path d="M13.4 3.6h6.6v6.6" />
      <path d="M20 3.6l-8.6 8.6" />
    </svg>
  );
}
