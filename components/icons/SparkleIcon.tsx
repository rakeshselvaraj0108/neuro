import type { IconProps } from "./types";

/** Opens the Safe Mode controls. */
export function SparkleIcon({
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
      <path d="M13 2.8l1.9 5.3 5.3 1.9-5.3 1.9L13 17.2l-1.9-5.3-5.3-1.9 5.3-1.9z" />
      <path d="M5.6 16.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </svg>
  );
}
