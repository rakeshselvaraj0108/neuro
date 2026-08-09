"use client";

import { motion } from "framer-motion";

import { MicIcon } from "@/components/icons/MicIcon";
import type { Cluster, Fragment } from "@/types/domain";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_PREVIEW_ROWS = 4;

interface DetailPanelProps {
  cluster: Cluster;
  members: Fragment[];
  onCommit: () => void;
}

/**
 * The right-side (bottom-sheet on mobile) preview card. Reuses Phase 1's
 * .panel surface treatment. This is the one screen where the whole point is
 * that looking is free — nothing here navigates except the button at the
 * very bottom.
 */
export function DetailPanel({ cluster, members, onCommit }: DetailPanelProps) {
  const preview = members.slice(0, MAX_PREVIEW_ROWS);
  const remaining = members.length - preview.length;

  return (
    <motion.div
      className="panel constellation-detail"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.26, ease: EASE }}
    >
      <h3 className="constellation-detail__title">{cluster.label}</h3>

      <div
        className="constellation-detail__bar-track"
        role="img"
        aria-label={`${cluster.readiness} percent ready to finish`}
      >
        <motion.div
          className="constellation-detail__bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${cluster.readiness}%` }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        />
      </div>

      <p className="constellation-detail__reason">{cluster.readinessReason}</p>

      <ul className="constellation-detail__fragments">
        {preview.map((fragment) => (
          <li key={fragment.id} className="constellation-detail__fragment-row">
            {fragment.mode === "voice" ? (
              <MicIcon size={10} className="constellation-detail__fragment-glyph" />
            ) : (
              <span className="constellation-detail__fragment-glyph" aria-hidden="true" />
            )}
            <span className="constellation-detail__fragment-text">{fragment.text}</span>
          </li>
        ))}
        {remaining > 0 ? (
          <li className="constellation-detail__more">+{remaining} more</li>
        ) : null}
      </ul>

      {cluster.suggestedForms.length > 0 ? (
        <div className="constellation-detail__forms">
          {cluster.suggestedForms.map((form) => (
            <span key={form} className="constellation-detail__form-pill">
              {form}
            </span>
          ))}
        </div>
      ) : null}

      <button type="button" className="constellation-detail__commit" onClick={onCommit}>
        Finish This One
        <span aria-hidden="true">→</span>
      </button>
    </motion.div>
  );
}
