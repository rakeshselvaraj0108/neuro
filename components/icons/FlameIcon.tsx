import type { IconProps } from "./types";

export function FlameIcon({
  size = 12,
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
      <path d="M12 2.8c2.6 3.2 4.2 5.5 4.2 7.6 0 1.3-.6 2.4-1.6 3.1.5-1.6.1-3-1.2-4.3.2 2.6-1 4-2.6 5.2-1.2.9-1.9 1.9-1.9 3.1 0 2 1.9 3.7 4.6 3.7 3.2 0 5.6-2.3 5.6-5.6C19.1 10.9 16.4 6.6 12 2.8z" />
      <path d="M11.5 21.2c-2.9-.3-4.9-2.4-4.9-5 0-1.3.5-2.5 1.4-3.6" />
    </svg>
  );
}
