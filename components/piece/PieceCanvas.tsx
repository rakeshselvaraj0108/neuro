"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Piece } from "@/types/domain";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { useEffectiveTheme } from "@/hooks/useEffectiveTheme";

import { Flourish } from "./Flourish";
import { BackdropRenderer } from "./BackdropRenderer";
import { MoonDivider } from "./MoonDivider";
import { PieceBody } from "./PieceBody";
import { PieceTitle } from "./PieceTitle";
import { WaxSeal } from "./WaxSeal";

interface PieceCanvasProps {
  piece: Piece;
  parallaxEnabled: boolean;
  titleId: string;
}

export function PieceCanvas({ piece, parallaxEnabled, titleId }: PieceCanvasProps) {
  const { ref, rotateX, rotateY } = usePointerParallax(parallaxEnabled);
  const { effectiveTheme } = useEffectiveTheme();

  const totalLines = piece.stanzas.reduce(
    (acc, stanza) => acc + stanza.reduce((lAcc, seg) => lAcc + seg.text.split("\n").length, 0),
    0,
  );

  const isShortPiece = totalLines <= 4;
  const isLongPiece = totalLines >= 25;

  const themeStyle: CSSProperties = {
    "--theme-ground": effectiveTheme.ground,
    "--theme-canvas": effectiveTheme.canvas,
    "--theme-panel": effectiveTheme.panel,
    "--theme-accent": effectiveTheme.accent,
    "--theme-accent-bright": effectiveTheme.accentBright,
    "--theme-verbatim-glow": effectiveTheme.verbatimGlow,
    "--theme-text-primary": effectiveTheme.textPrimary,
    "--theme-text-dim": effectiveTheme.textDim,
    "--theme-text-faint": effectiveTheme.textFaint,
    rotateX,
    rotateY,
  } as CSSProperties;

  return (
    <div className="canvas-mount" style={{ color: effectiveTheme.textPrimary }}>
      <motion.div
        ref={ref}
        className={`canvas ${isShortPiece ? "canvas--short" : ""} ${
          isLongPiece ? "canvas--scrollable" : ""
        }`}
        style={themeStyle}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Cross-dissolves the backdrop itself, not just the flat canvas
            color, on a theme switch — BackdropRenderer swaps to an entirely
            different DOM/SVG tree per kind, so a plain CSS color transition
            on .canvas alone can't fade between them; this can, and respects
            reduced-motion automatically via the app-wide MotionConfig. */}
        <AnimatePresence>
          <motion.div
            key={effectiveTheme.backdropKind}
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <BackdropRenderer kind={effectiveTheme.backdropKind} />
          </motion.div>
        </AnimatePresence>

        <Flourish corner="tl" />
        <Flourish corner="tr" />
        <Flourish corner="bl" />
        <Flourish corner="br" />

        <div className="canvas__content" tabIndex={isLongPiece ? 0 : undefined} aria-label={isLongPiece ? "Poem text scrollable area" : undefined}>
          <article className="piece" aria-labelledby={titleId}>
            <PieceTitle title={piece.title} id={titleId} />
            <MoonDivider kind={effectiveTheme.backdropKind} />
            <PieceBody stanzas={piece.stanzas} />
          </article>
        </div>

        <WaxSeal />
        <div className="canvas__inset" />
      </motion.div>
    </div>
  );
}
