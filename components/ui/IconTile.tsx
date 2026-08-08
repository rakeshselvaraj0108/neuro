import { cn } from "@/lib/cn";

interface IconTileProps {
  children: React.ReactNode;
  className?: string;
}

/** 32px raised tile holding a --blood-bright glyph. */
export function IconTile({ children, className }: IconTileProps) {
  return <span className={cn("icon-tile", className)}>{children}</span>;
}
