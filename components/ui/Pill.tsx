import { cn } from "@/lib/cn";

interface PillProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** 32px status pill: hairline border, ink-panel fill, fully rounded. */
export function Pill({ icon, children, className }: PillProps) {
  return (
    <span className={cn("pill", className)}>
      {icon ? <span className="pill__icon">{icon}</span> : null}
      <span className="pill__label">{children}</span>
    </span>
  );
}
