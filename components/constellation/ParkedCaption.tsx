"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ParkedCaptionProps {
  otherCount: number;
}

/**
 * The first visible instance of the product's core emotional promise:
 * nothing is ever lost, only set aside. Shown for a brief beat while
 * sibling clusters settle into their parked state, right before the
 * crossfade to Momentum.
 */
export function ParkedCaption({ otherCount }: ParkedCaptionProps) {
  if (otherCount <= 0) return null;

  return (
    <motion.p
      className="constellation-parked-caption"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE, delay: 0.08 }}
    >
      Your other {otherCount} {otherCount === 1 ? "idea is" : "ideas are"} saved. They&rsquo;ll
      be here when you&rsquo;re ready.
    </motion.p>
  );
}
