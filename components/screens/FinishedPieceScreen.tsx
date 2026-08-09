"use client";

import { useId } from "react";

import { FidelityMeter } from "@/components/piece/FidelityMeter";
import { PieceCanvas } from "@/components/piece/PieceCanvas";
import { ExportPanel } from "@/components/rail/ExportPanel";
import { JourneyPanel } from "@/components/rail/JourneyPanel";
import { QuotePanel } from "@/components/rail/QuotePanel";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSafeMode } from "@/hooks/useSafeMode";
import { samplePiece } from "@/lib/samplePiece";
import { useAppStore } from "@/store/useAppStore";
import type { Piece } from "@/types/domain";

export interface FinishedPieceScreenProps {
  piece?: Piece;
}

export function FinishedPieceScreen({ piece: propPiece }: FinishedPieceScreenProps) {
  const { isSafe } = useSafeMode();
  const reducedMotion = useReducedMotion();
  const titleId = useId();

  const currentPiece = useAppStore((state) => state.currentPiece);
  const activePiece: Piece = (currentPiece as unknown as Piece) ?? propPiece ?? samplePiece;
  const isFallbackExample = !currentPiece;

  const parallaxEnabled = !isSafe && !reducedMotion;

  return (
    <div className="app">
      <Header />

      <main className="stage">
        <div className="stage__piece" style={{ flexDirection: "column", gap: "12px" }}>
          {isFallbackExample ? (
            <div className="example-note" role="note">
              <span>Showing an example — finish your own piece to replace this.</span>
            </div>
          ) : null}

          <FidelityMeter
            captured={activePiece.fidelity.captured}
            invented={activePiece.fidelity.invented}
          />

          <PieceCanvas
            piece={activePiece}
            parallaxEnabled={parallaxEnabled}
            titleId={titleId}
          />
        </div>

        <aside className="rail" aria-label="Piece details">
          <JourneyPanel steps={activePiece.journey} />
          <ExportPanel piece={activePiece} />
          <QuotePanel />
        </aside>
      </main>

      <Footer />
    </div>
  );
}
