import { cn } from "@/lib/cn";

import { SectionLabel } from "./SectionLabel";

interface PanelProps {
  /** Rendered as the panel's section label and used as its accessible name. */
  label?: string;
  labelId?: string;
  children: React.ReactNode;
  className?: string;
  /** Panels are sections by default; the closing quote is an aside. */
  as?: "section" | "aside" | "div";
  ariaLabel?: string;
}

/**
 * Translucent ink fill, 12px backdrop blur, 1px hairline, layered elevation.
 * Lifts 2px and brightens its hairline on hover.
 */
export function Panel({
  label,
  labelId,
  children,
  className,
  as: Tag = "section",
  ariaLabel,
}: PanelProps) {
  return (
    <Tag
      className={cn("panel", className)}
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : ariaLabel}
    >
      {label ? (
        <SectionLabel id={labelId} className="panel__label">
          {label}
        </SectionLabel>
      ) : null}
      {children}
    </Tag>
  );
}
