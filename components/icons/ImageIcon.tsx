import type { IconProps } from "./types";

export function ImageIcon({
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
      <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2.2" />
      <circle cx="8.6" cy="9.8" r="1.6" />
      <path d="M3.6 16.4l4.4-4.2 3.4 3.2 3.2-3 5.8 5.4" />
    </svg>
  );
}
