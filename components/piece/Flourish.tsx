import { cn } from "@/lib/cn";

export type FlourishCorner = "tl" | "tr" | "bl" | "br";

interface FlourishProps {
  corner: FlourishCorner;
  size?: number;
  className?: string;
}

/**
 * Corner filigree: a small diamond with two trailing arms that curl inward.
 * Authored once for the top-left and mirrored into the other three corners
 * with a CSS transform, so all four read as one engraved plate.
 */
export function Flourish({ corner, size = 28, className }: FlourishProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flourish", `flourish--${corner}`, className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 2.6L13.4 8 8 13.4 2.6 8z" />
      <path d="M8 5.6L10.4 8 8 10.4 5.6 8z" fill="currentColor" stroke="none" />
      <path d="M14.6 8c3.6 0 5.6-1.2 8-1.2" strokeOpacity="0.85" />
      <path d="M22.6 6.8c2 0 3 1 2.6 2.2-.3 1-1.6 1.2-2.2.4" />
      <path d="M8 14.6c0 3.6-1.2 5.6-1.2 8" strokeOpacity="0.85" />
      <path d="M6.8 22.6c0 2 1 3 2.2 2.6 1-.3 1.2-1.6.4-2.2" />
    </svg>
  );
}
