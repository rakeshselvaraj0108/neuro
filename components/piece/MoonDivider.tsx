import { CrescentIcon } from "@/components/icons/CrescentIcon";
import type { BackdropKind } from "@/lib/presentation/themes";

interface MoonDividerProps {
  kind?: BackdropKind;
}

export function MoonDivider({ kind = "moon" }: MoonDividerProps) {
  const renderGlyph = () => {
    if (kind === "sun") {
      return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="moon-divider__glyph">
          <circle cx="8" cy="8" r="4" fill="currentColor" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }
    if (kind === "wave") {
      return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="moon-divider__glyph">
          <path d="M2 9C4 7 6 7 8 9C10 11 12 11 14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }
    if (kind === "none") {
      return (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="moon-divider__glyph">
          <circle cx="8" cy="8" r="2.5" fill="currentColor" />
        </svg>
      );
    }
    return <CrescentIcon size={13} className="moon-divider__glyph" />;
  };

  return (
    <div className="moon-divider" aria-hidden="true">
      <span className="moon-divider__rule" />
      {renderGlyph()}
      <span className="moon-divider__rule moon-divider__rule--short" />
    </div>
  );
}
