"use client";

import { motion } from "framer-motion";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { MicIcon } from "@/components/icons/MicIcon";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSafeMode } from "@/hooks/useSafeMode";
import type { Fragment } from "@/types/domain";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A small, stable hash of the fragment id mapped into [-2, 2] degrees.
 * Seeded (not Math.random()) so the same card always lands at the same
 * tilt across re-renders — a re-sorted or re-rendered flood shouldn't
 * visibly "shuffle" its cards' rotations.
 */
function seededRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return normalized * 4 - 2;
}

interface FragmentCardProps {
  fragment: Fragment;
  onRemove: (id: string) => void;
}

export function FragmentCard({ fragment, onRemove }: FragmentCardProps) {
  const { isSafe } = useSafeMode();
  const reducedMotion = useReducedMotion();

  const isParked = Boolean(fragment.parkedDuringLock || fragment.clusterId === "__parked__");
  const animateEntry = !isSafe && !reducedMotion;
  const rotation = animateEntry ? seededRotation(fragment.id) : 0;

  return (
    <motion.div
      className={`fragment-card ${isParked ? "fragment-card--parked" : ""}`}
      style={{ breakInside: "avoid" }}
      initial={
        animateEntry
          ? { opacity: 0, y: -8, rotate: 0 }
          : { opacity: 0 }
      }
      animate={
        animateEntry
          ? { opacity: 1, y: 0, rotate: rotation }
          : { opacity: 1 }
      }
      transition={{ duration: 0.34, ease: EASE }}
    >
      <div className="fragment-card__head">
        {fragment.mode === "voice" ? (
          <MicIcon size={11} className="fragment-card__mode" />
        ) : isParked ? (
          <span className="fragment-card__parked-badge">saved for later</span>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="fragment-card__remove"
          aria-label="Remove this fragment"
          onClick={() => onRemove(fragment.id)}
        >
          <CloseIcon size={11} />
        </button>
      </div>

      {isParked && fragment.mode === "voice" ? (
        <span className="fragment-card__parked-badge">saved for later</span>
      ) : null}

      {fragment.abandoned ? (
        <span className="fragment-card__abandoned">caught mid-thought</span>
      ) : null}

      <p className="fragment-card__text">{fragment.text}</p>
    </motion.div>
  );
}
