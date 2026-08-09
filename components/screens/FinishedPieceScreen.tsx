"use client";

import { useId, useEffect, useRef, useState } from "react";

import { FidelityMeter } from "@/components/piece/FidelityMeter";
import { PieceCanvas } from "@/components/piece/PieceCanvas";
import { EditModeToggle } from "@/components/piece/EditModeToggle";
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
  const undoLastPieceChange = useAppStore((state) => state.undoLastPieceChange);
  const undoSnapshot = useAppStore((state) => state.undoSnapshot);

  const activePiece: Piece = (currentPiece as unknown as Piece) ?? propPiece ?? samplePiece;
  const isFallbackExample = !currentPiece;

  const parallaxEnabled = !isSafe && !reducedMotion;

  const [fidelityPulsing, setFidelityPulsing] = useState(false);
  const prevCapturedRef = useRef(activePiece.fidelity.captured);

  // Pulse fidelity meter when captured word count increases
  useEffect(() => {
    if (activePiece.fidelity.captured > prevCapturedRef.current) {
      if (!isSafe && !reducedMotion) {
        setFidelityPulsing(true);
        const t = setTimeout(() => setFidelityPulsing(false), 1200);
        return () => clearTimeout(t);
      }
    }
    prevCapturedRef.current = activePiece.fidelity.captured;
  }, [activePiece.fidelity.captured, isSafe, reducedMotion]);

  // Ctrl/Cmd+Z keyboard listener for single-level undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (undoSnapshot) {
          e.preventDefault();
          undoLastPieceChange();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoSnapshot, undoLastPieceChange]);

  const totalSegments = activePiece.fidelity.captured + activePiece.fidelity.invented;

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

          <div
            className="piece-header-bar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div className={`fidelity-meter-wrapper ${fidelityPulsing ? "fidelity-meter--pulse" : ""}`}>
              <FidelityMeter
                captured={activePiece.fidelity.captured}
                invented={activePiece.fidelity.invented}
              />
            </div>
            {!isFallbackExample ? <EditModeToggle /> : null}
          </div>

          <div className="sr-only" role="status" aria-live="polite">
            {`Fidelity updated: ${activePiece.fidelity.captured} of ${totalSegments} segments are yours.`}
          </div>

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
