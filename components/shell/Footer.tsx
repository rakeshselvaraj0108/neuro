import { FlameIcon } from "@/components/icons/FlameIcon";

import { SafeModePopover } from "./SafeModePopover";

/** 40px app footer: brand mark on the left, motto and Safe Mode on the right. */
export function Footer() {
  return (
    <footer className="footbar">
      <div className="footbar__group">
        <FlameIcon size={12} className="footbar__flame" />
        <span className="footbar__brand">Catch the Flood</span>
        <span className="rule-v" aria-hidden="true" />
        <span className="footbar__text footbar__group--tagline">
          Turning idea floods into finished creations.
        </span>
      </div>

      <div className="footbar__group">
        <span className="footbar__text">You create. We catch. You finish.</span>
        <SafeModePopover />
      </div>
    </footer>
  );
}
