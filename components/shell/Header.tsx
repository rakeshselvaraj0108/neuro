"use client";

import type { ReactNode } from "react";

import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { LockIndicator } from "@/components/scopelock/LockIndicator";
import { Pill } from "@/components/ui/Pill";
import { useAppStore } from "@/store/useAppStore";

interface HeaderProps {
  /** Defaults match Phase 1's Finished Piece screen exactly — every other screen passes its own. */
  statusLabel?: string;
  statusIcon?: ReactNode;
}

/**
 * 56px app header: wordmark + tagline on the left, status pill on the right.
 * Clickable wordmark allows navigation back to flood screen at any time.
 */
export function Header({
  statusLabel = "Finished Creative Piece",
  statusIcon = <CheckCircleIcon size={14} />,
}: HeaderProps) {
  const setView = useAppStore((state) => state.setView);

  return (
    <header className="appbar">
      <div className="appbar__left">
        <button
          type="button"
          className="wordmark-btn"
          onClick={() => setView("flood")}
          title="Return to Flood view"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            font: "inherit",
            color: "inherit",
            textAlign: "left",
          }}
        >
          <span className="wordmark">Catch the Flood</span>
        </button>
        <span className="rule-v" aria-hidden="true" />
        <span className="tagline">Your ideas. Your voice. Finished.</span>
      </div>

      <div className="appbar__right">
        <LockIndicator />
        <Pill icon={statusIcon}>{statusLabel}</Pill>
      </div>
    </header>
  );
}
