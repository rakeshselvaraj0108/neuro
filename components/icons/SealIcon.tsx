import type { IconProps } from "./types";

/** Finished: scope-locked, sealed, done. */
export function SealIcon({
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
      <path d="M12 2.6l2.4 1.7 2.9-.3 1 2.8 2.5 1.5-.8 2.8.8 2.8-2.5 1.5-1 2.8-2.9-.3L12 21.4l-2.4-1.7-2.9.3-1-2.8-2.5-1.5.8-2.8-.8-2.8 2.5-1.5 1-2.8 2.9.3z" />
      <path d="M9.2 12.1l2 2 3.6-4" strokeOpacity="0.8" />
    </svg>
  );
}
