/**
 * Every glyph in this app is an inline SVG authored here. No icon library is
 * installed, and none will be.
 *
 * Icons are decorative by contract: they always render `aria-hidden`, and any
 * icon-only control carries its own `aria-label`.
 */
export interface IconProps {
  /** Rendered square size in px. */
  size?: number;
  className?: string;
  strokeWidth?: number;
}
