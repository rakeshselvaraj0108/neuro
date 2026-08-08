import type { ReactNode } from "react";

import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { Pill } from "@/components/ui/Pill";

interface HeaderProps {
  /** Defaults match Phase 1's Finished Piece screen exactly — every other screen passes its own. */
  statusLabel?: string;
  statusIcon?: ReactNode;
}

/**
 * 56px app header: wordmark + tagline on the left, status pill on the right.
 * The wordmark and layout stay identical across every screen; the pill is
 * the one thing that changes, since "Finished Creative Piece" would be
 * actively wrong to show while a creator is still mid-flood.
 */
export function Header({
  statusLabel = "Finished Creative Piece",
  statusIcon = <CheckCircleIcon size={14} />,
}: HeaderProps) {
  return (
    <header className="appbar">
      <div className="appbar__left">
        <span className="wordmark">Catch the Flood</span>
        <span className="rule-v" aria-hidden="true" />
        <span className="tagline">Your ideas. Your voice. Finished.</span>
      </div>

      <Pill icon={statusIcon}>{statusLabel}</Pill>
    </header>
  );
}
