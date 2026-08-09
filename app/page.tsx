"use client";

import { useEffect } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

import { ConstellationScreen } from "@/components/screens/ConstellationScreen";
import { FinishedPieceScreen } from "@/components/screens/FinishedPieceScreen";
import { FloodScreen } from "@/components/screens/FloodScreen";
import { MomentumScreen } from "@/components/screens/MomentumScreen";
import { ShipScreen } from "@/components/screens/ShipScreen";
import { GrainOverlay } from "@/components/shell/GrainOverlay";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { samplePiece } from "@/lib/samplePiece";
import { useAppStore } from "@/store/useAppStore";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The whole product is one page driven by `view` — no Next.js route changes,
 * so transitions stay fluid and the demo can never 404 on a bad deploy path.
 * Each screen owns its own full chrome (Header/main/Footer); this component
 * only ever decides which one is mounted.
 */
export default function AppOrchestrator() {
  const view = useAppStore((state) => state.view);
  const fragments = useAppStore((state) => state.fragments);
  const selectedCluster = useAppStore((state) => state.selectedCluster);
  const chosenForm = useAppStore((state) => state.chosenForm);
  const generatedPiece = useAppStore((state) => state.generatedPiece);

  // Established once, here, at the top of the tree — so it's already correct
  // in the store before any screen-specific content (e.g. a fragment card
  // deciding whether to animate its entrance) ever gets a chance to mount
  // and read a stale default first.
  useReducedMotion();

  // The Constellation trigger lives at the orchestrator level, not inside
  // the screen: runConstellation() already guards against duplicate runs
  // (loading state + a fragment-set hash check), so calling it on every
  // transition into this view is safe and is what makes revisiting the
  // screen without new fragments free of a second network call.
  useEffect(() => {
    if (view === "constellation") {
      void useAppStore.getState().runConstellation();
    }
  }, [view]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {view === "flood" ? <FloodScreen /> : null}
          {view === "constellation" ? <ConstellationScreen fragments={fragments} /> : null}
          {view === "momentum" ? (
            <MomentumScreen cluster={selectedCluster} fragments={fragments} />
          ) : null}
          {view === "ship" ? (
            <ShipScreen cluster={selectedCluster} fragments={fragments} form={chosenForm} />
          ) : null}
          {view === "finished" ? <FinishedPieceScreen piece={generatedPiece ?? samplePiece} /> : null}
        </motion.div>
      </AnimatePresence>

      <GrainOverlay />
    </MotionConfig>
  );
}
