import type { IconProps } from "./types";

export function MicIcon({ size = 20, className, strokeWidth = 1.7 }: IconProps) {
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
      <rect x="9" y="2.6" width="6" height="11.2" rx="3" />
      <path d="M5.4 11.2a6.6 6.6 0 0013.2 0" />
      <path d="M12 17.8v3.6" />
      <path d="M8.4 21.4h7.2" />
    </svg>
  );
}
