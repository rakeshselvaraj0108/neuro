import type { IconProps } from "./types";

/** The choice: the creator picks the form, never the model. */
export function QuillIcon({
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
      <path d="M20.4 3.6c-6.4.5-10.8 3-12.8 7.2-1 2.1-1.2 4.2-.9 6.2 3.9-5.1 7.4-7.5 10.4-8.4-2.6 1.9-5.4 4.7-7.8 9.1" />
      <path d="M3.6 20.4l3.1-3.1" />
    </svg>
  );
}
