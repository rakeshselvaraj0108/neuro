"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const DEFAULT_DURATION_MS = 5000;

export interface ToastProps {
  open: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  durationMs?: number;
  /** Change this (e.g. a fragment id) to restart the timer for a new instance while already open. */
  resetKey?: string | number;
}

/**
 * A single reusable toast — bottom-center, auto-dismissing, Escape-dismissible,
 * with a slim progress hairline. Built generic on purpose: today it's the
 * fragment-removal undo, later phases can reuse it for anything ephemeral.
 */
export function Toast({
  open,
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = DEFAULT_DURATION_MS,
  resetKey,
}: ToastProps) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onDismissRef.current(), durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetKey is the intentional restart trigger
  }, [open, durationMs, resetKey]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onDismissRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <span className="toast__message">{message}</span>
          {actionLabel && onAction ? (
            <button type="button" className="toast__action" onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
          <span
            key={resetKey ?? message}
            className="toast__progress"
            style={{ animationDuration: `${durationMs}ms` }}
            aria-hidden="true"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
