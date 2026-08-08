"use client";

import { useId } from "react";

import { PieceCanvas } from "@/components/piece/PieceCanvas";
import { ExportPanel } from "@/components/rail/ExportPanel";
import { JourneyPanel } from "@/components/rail/JourneyPanel";
import { QuotePanel } from "@/components/rail/QuotePanel";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSafeMode } from "@/hooks/useSafeMode";
import { samplePiece } from "@/lib/samplePiece";

/**
 * The destination, not the entry — moved unchanged from Phase 1's
 * app/page.tsx now that the app is a view-state-machine of screens.
 */
export function FinishedPieceScreen() {
  const { isSafe } = useSafeMode();
  const reducedMotion = useReducedMotion();
  const titleId = useId();

  // Safe Mode and the OS-level reduced-motion preference each independently
  // switch parallax off — either one is enough.
  const parallaxEnabled = !isSafe && !reducedMotion;

  return (
    <div className="app">
      <Header />

      <main className="stage">
        <div className="stage__piece">
          <PieceCanvas
            piece={samplePiece}
            parallaxEnabled={parallaxEnabled}
            titleId={titleId}
          />
        </div>

        <aside className="rail" aria-label="Piece details">
          <JourneyPanel steps={samplePiece.journey} />
          <ExportPanel />
          <QuotePanel />
        </aside>
      </main>

      <Footer />
    </div>
  );
}
