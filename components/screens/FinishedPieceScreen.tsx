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
import type { Piece } from "@/types/domain";

export interface FinishedPieceScreenProps {
  piece?: Piece;
}

export function FinishedPieceScreen({ piece = samplePiece }: FinishedPieceScreenProps) {
  const { isSafe } = useSafeMode();
  const reducedMotion = useReducedMotion();
  const titleId = useId();

  const parallaxEnabled = !isSafe && !reducedMotion;

  return (
    <div className="app">
      <Header />

      <main className="stage">
        <div className="stage__piece">
          <PieceCanvas
            piece={piece}
            parallaxEnabled={parallaxEnabled}
            titleId={titleId}
          />
        </div>

        <aside className="rail" aria-label="Piece details">
          <JourneyPanel steps={piece.journey} />
          <ExportPanel piece={piece} />
          <QuotePanel />
        </aside>
      </main>

      <Footer />
    </div>
  );
}
