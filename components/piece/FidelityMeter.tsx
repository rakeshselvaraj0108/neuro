"use client";

import type { CSSProperties } from "react";

export interface FidelityMeterProps {
  captured: number;
  invented: number;
  className?: string;
}

/**
 * Visual and accessible display of the independent verbatim fidelity pass.
 *
 * Separates captured (user's own words) from invented text with exact counts,
 * percentage ratio, and dual-segment visual bar. Never relies on color alone —
 * text ratio and percentages are explicitly rendered for screen readers and high contrast mode.
 */
export function FidelityMeter({ captured, invented, className = "" }: FidelityMeterProps) {
  const total = captured + invented;
  const percent = total > 0 ? Math.round((captured / total) * 100) : 100;
  const accessibleLabel = `${captured} of ${total} words are yours (${percent}% verbatim fidelity)`;

  return (
    <div
      className={`fidelity-meter ${className}`}
      role="region"
      aria-label="Fidelity provenance meter"
    >
      <div className="fidelity-meter__header">
        <span className="t-label fidelity-meter__tag">CODE-VERIFIED FIDELITY</span>
        <span className="fidelity-meter__counts" aria-label={accessibleLabel}>
          <strong className="fidelity-meter__captured">{captured} captured</strong>
          <span className="fidelity-meter__slash">/</span>
          <span className="fidelity-meter__invented">{invented} invented</span>
          <span className="fidelity-meter__percent">({percent}% yours)</span>
        </span>
      </div>

      <div
        className="fidelity-meter__bar"
        aria-hidden="true"
        title={accessibleLabel}
      >
        <div
          className="fidelity-meter__segment fidelity-meter__segment--captured"
          style={{ "--fill-percent": `${percent}%` } as CSSProperties}
        />
        <div
          className="fidelity-meter__segment fidelity-meter__segment--invented"
          style={{ "--fill-percent": `${100 - percent}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
