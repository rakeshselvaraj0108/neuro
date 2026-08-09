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
import { useAppStore } from "@/store/useAppStore";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AppOrchestrator() {
  const view = useAppStore((state) => state.view);
  const fragments = useAppStore((state) => state.fragments);
  const selectedCluster = useAppStore((state) => state.selectedCluster);
  const chosenForm = useAppStore((state) => state.chosenForm);
  const generatedPiece = useAppStore((state) => state.generatedPiece);
  useReducedMotion();

  useEffect(() => {
    if (view === "constellation") void useAppStore.getState().runConstellation();
  }, [view]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28, ease: EASE }}>
          {view === "flood" && <FloodScreen />}
          {view === "constellation" && <ConstellationScreen fragments={fragments} />}
          {view === "momentum" && <MomentumScreen />}
          {view === "ship" && <ShipScreen cluster={selectedCluster} fragments={fragments} form={chosenForm} />}
          {view === "finished" && <FinishedPieceScreen piece={generatedPiece ?? undefined} />}
        </motion.div>
      </AnimatePresence>
      <GrainOverlay />
    </MotionConfig>
  );
}
