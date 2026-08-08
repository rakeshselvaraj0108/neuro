"use client";

import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Maximum tilt on either axis. Any more and the canvas reads as a gimmick. */
const MAX_DEG = 6;

/** Below this width the canvas is full-bleed and tilting it only hurts. */
const MIN_WIDTH = 600;

const SPRING = { stiffness: 88, damping: 22, mass: 0.7 } as const;

interface Parallax {
  ref: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

/**
 * Pointer-follow parallax for the piece canvas.
 *
 * The frame and the text layer translate on different Z planes (set in CSS),
 * so the tilt reads as a physical object catching the light rather than as an
 * image being rotated.
 */
export function usePointerParallax(enabled: boolean): Parallax {
  const ref = useRef<HTMLDivElement | null>(null);

  // Normalised pointer position within the element, 0..1 on both axes.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [0, 1], [-MAX_DEG, MAX_DEG]);
  const rotateX = useTransform(sy, [0, 1], [MAX_DEG, -MAX_DEG]);

  useEffect(() => {
    const node = ref.current;

    const recentre = (): void => {
      px.set(0.5);
      py.set(0.5);
    };

    if (!enabled || !node) {
      recentre();
      return;
    }

    // A coarse pointer means a finger: there is no hover to follow.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      recentre();
      return;
    }

    let frame = 0;

    const onPointerMove = (event: PointerEvent): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (window.innerWidth < MIN_WIDTH) {
          recentre();
          return;
        }
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        px.set((event.clientX - rect.left) / rect.width);
        py.set((event.clientY - rect.top) / rect.height);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    node.addEventListener("pointerleave", recentre);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerleave", recentre);
      recentre();
    };
  }, [enabled, px, py]);

  return { ref, rotateX, rotateY };
}
