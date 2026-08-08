"use client";

import { motion } from "framer-motion";

import type { Piece } from "@/types/domain";
import { usePointerParallax } from "@/hooks/usePointerParallax";

import { Flourish } from "./Flourish";
import { MoonBackdrop } from "./MoonBackdrop";
import { MoonDivider } from "./MoonDivider";
import { PieceBody } from "./PieceBody";
import { PieceTitle } from "./PieceTitle";
import { WaxSeal } from "./WaxSeal";

interface PieceCanvasProps {
  piece: Piece;
  parallaxEnabled: boolean;
  titleId: string;
}

/**
 * The museum wall label. A double-framed, ornamented canvas holding the
 * poem over an atmospheric backdrop, with gentle pointer-follow parallax.
 *
 * The frame (this component's motion wrapper) and the text layer
 * (`.canvas__content`, translated on its own Z plane in CSS) tilt together
 * but not identically, which is what reads as a physical object rather than
 * a tilting picture.
 */
export function PieceCanvas({ piece, parallaxEnabled, titleId }: PieceCanvasProps) {
  const { ref, rotateX, rotateY } = usePointerParallax(parallaxEnabled);

  return (
    <div className="canvas-mount">
      <motion.div
        ref={ref}
        className="canvas"
        style={{ rotateX, rotateY }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <MoonBackdrop />

        <Flourish corner="tl" />
        <Flourish corner="tr" />
        <Flourish corner="bl" />
        <Flourish corner="br" />

        <div className="canvas__content">
          <article className="piece" aria-labelledby={titleId}>
            <PieceTitle title={piece.title} id={titleId} />
            <MoonDivider />
            <PieceBody stanzas={piece.stanzas} />
          </article>
        </div>

        <WaxSeal />
        <div className="canvas__inset" />
      </motion.div>
    </div>
  );
}
