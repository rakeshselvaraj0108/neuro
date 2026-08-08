import type { IconProps } from "./types";

export function DownloadIcon({
  size = 14,
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
      <path d="M12 3.6v11.2" />
      <path d="M7.6 10.6l4.4 4.4 4.4-4.4" />
      <path d="M4.4 19.6h15.2" strokeOpacity="0.72" />
    </svg>
  );
}
