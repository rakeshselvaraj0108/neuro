"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CaptureDock } from "@/components/flood/CaptureDock";
import { FloodCanvas } from "@/components/flood/FloodCanvas";
import { DropletIcon } from "@/components/icons/DropletIcon";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { Portal } from "@/components/ui/Portal";
import { Toast } from "@/components/ui/Toast";
import { useAppStore } from "@/store/useAppStore";

import { LockedFloodBanner } from "@/components/flood/LockedFloodBanner";

const EASE = [0.22, 1, 0.36, 1] as const;
const ENCOURAGEMENT_THRESHOLD = 3;

export function FloodScreen() {
  const fragments = useAppStore((state) => state.fragments);
  const fragmentsHydrated = useAppStore((state) => state.fragmentsHydrated);
  const removeFragment = useAppStore((state) => state.removeFragment);
  const undoRemove = useAppStore((state) => state.undoRemove);
  const clearLastRemoved = useAppStore((state) => state.clearLastRemoved);
  const lastRemovedId = useAppStore((state) => state.lastRemoved?.fragment.id);
  const setView = useAppStore((state) => state.setView);

  const [toastOpen, setToastOpen] = useState(false);
  const encouragementShownRef = useRef(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  useEffect(() => {
    if (
      encouragementShownRef.current ||
      fragments.length === 0 ||
      fragments.length >= ENCOURAGEMENT_THRESHOLD
    ) {
      return;
    }
    encouragementShownRef.current = true;
    setShowEncouragement(true);
  }, [fragments.length]);

  const handleRemove = useCallback(
    (id: string) => {
      removeFragment(id);
      setToastOpen(true);
    },
    [removeFragment],
  );

  const handleUndo = useCallback(() => {
    undoRemove();
    setToastOpen(false);
  }, [undoRemove]);

  const handleToastDismiss = useCallback(() => {
    setToastOpen(false);
    clearLastRemoved();
  }, [clearLastRemoved]);

  const handleCatchFlood = useCallback(() => {
    setView("constellation");
  }, [setView]);

  return (
    <div className="app">
      <Header statusLabel="Capturing Your Flood" statusIcon={<DropletIcon size={13} />} />

      <main className="flood-stage">
        <div className="flood-column">
          <LockedFloodBanner />
          <CaptureDock />
          <FloodCanvas fragments={fragments} onRemove={handleRemove} hydrated={fragmentsHydrated} />
        </div>
      </main>

      <Footer />

      {/* Portal-ed: the orchestrator's screen-crossfade wrapper animates via
          `transform`, which would otherwise silently break `position: fixed`
          on these two (see components/ui/Portal.tsx). */}
      <Portal>
        <AnimatePresence>
          {fragments.length >= 1 ? (
            <motion.div
              key="catch-flood"
              className="catch-flood-wrap"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {showEncouragement ? (
                <p className="catch-flood-hint">
                  Even a few scattered thoughts are enough to start.
                </p>
              ) : null}
              <button type="button" className="catch-flood-cta" onClick={handleCatchFlood}>
                Catch this Flood
                <span className="catch-flood-cta__arrow" aria-hidden="true">
                  →
                </span>
                <span className="catch-flood-cta__badge">{fragments.length}</span>
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Toast
          open={toastOpen}
          message="Fragment removed"
          actionLabel="Undo"
          onAction={handleUndo}
          onDismiss={handleToastDismiss}
          resetKey={lastRemovedId}
        />
      </Portal>
    </div>
  );
}
