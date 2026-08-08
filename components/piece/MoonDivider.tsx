import { CrescentIcon } from "@/components/icons/CrescentIcon";

/** A hairline rule broken by a crescent, set beneath the piece title. */
export function MoonDivider() {
  return (
    <div className="moon-divider" aria-hidden="true">
      <span className="moon-divider__rule" />
      <CrescentIcon size={13} className="moon-divider__glyph" />
      <span className="moon-divider__rule moon-divider__rule--short" />
    </div>
  );
}
