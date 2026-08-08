import type { IconProps } from "./types";

export function FileTextIcon({
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
      <path d="M13.6 2.8H7a2.2 2.2 0 00-2.2 2.2v14a2.2 2.2 0 002.2 2.2h10a2.2 2.2 0 002.2-2.2V8.4z" />
      <path d="M13.6 2.8v5.6h5.6" />
      <path d="M8.4 13h7.2M8.4 16.6h5" strokeOpacity="0.72" />
    </svg>
  );
}
