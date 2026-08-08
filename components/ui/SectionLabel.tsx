import { cn } from "@/lib/cn";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "h2" | "h3" | "p" | "span";
}

/** Inter 11px, uppercase, tracked wide, --paper-faint. The app's quiet voice. */
export function SectionLabel({
  children,
  className,
  id,
  as: Tag = "h2",
}: SectionLabelProps) {
  return (
    <Tag id={id} className={cn("t-label", className)}>
      {children}
    </Tag>
  );
}
