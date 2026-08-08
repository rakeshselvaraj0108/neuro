import type { IconProps } from "./types";

export function CloseIcon({
  size = 14,
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
      <path d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8" />
    </svg>
  );
}
