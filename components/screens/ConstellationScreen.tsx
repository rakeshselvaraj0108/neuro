"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ConstellationMap } from "@/components/constellation/ConstellationMap";
import { SparkleIcon } from "@/components/icons/SparkleIcon";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { useAppStore } from "@/store/useAppStore";
import type { Fragment } from "@/types/domain";

import { LoadingBloom } from "./LoadingBloom";

/** How long sibling clusters visibly settle into "parked" before the crossfade away. */
const PARK_SETTLE_MS = 400;

export interface ConstellationScreenProps {
  fragments: Fragment[];
}

/**
 * The "aha" moment: a genuine constellation map, not a card grid. Reading
 * an orb is exploration (hover/click previews via selectCluster, never
 * navigates); only "Finish This One" inside the detail panel commits. See
 * lib/constellation/layout.ts for the pure trig behind the positions.
 */
export function ConstellationScreen({ fragments }: ConstellationScreenProps) {
  const clusters = useAppStore((state) => state.clusters);
  const constellationStatus = useAppStore((state) => state.constellationStatus);
  const selectedClusterId = useAppStore((state) => state.selectedClusterId);
  const selectCluster = useAppStore((state) => state.selectCluster);
  const setView = useAppStore((state) => state.setView);

  const [committingClusterId, setCommittingClusterId] = useState<string | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Defensive only: this screen is only reachable via the Flood CTA, which
  // requires >=1 fragment. Nothing to sort if it's somehow empty.
  useEffect(() => {
    if (fragments.length === 0) setView("flood");
  }, [fragments.length, setView]);

  useEffect(
    () => () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    },
    [],
  );

  const handleSelect = useCallback(
    (id: string) => {
      selectCluster(id);
    },
    [selectCluster],
  );

  const handleCommit = useCallback(
    (id: string) => {
      if (committingClusterId) return; // already committing — ignore repeat activations
      selectCluster(id);
      setCommittingClusterId(id);
      commitTimerRef.current = setTimeout(() => {
        setView("momentum");
      }, PARK_SETTLE_MS);
    },
    [committingClusterId, selectCluster, setView],
  );

  const handleBackToFlood = useCallback(() => {
    setView("flood");
  }, [setView]);

  const showPlaceholder = constellationStatus !== "ready" || clusters.length === 0;

  return (
    <div className="app">
      <Header statusLabel="Sorting Your Flood" statusIcon={<SparkleIcon size={13} />} />

      <main className="constellation-screen">
        {showPlaceholder ? (
          <div className="loading-screen">
            <LoadingBloom label="Reading your flood…" />
          </div>
        ) : (
          <>
            <button type="button" className="constellation-back" onClick={handleBackToFlood}>
              <span aria-hidden="true">←</span> Add more to the flood
            </button>

            <ConstellationMap
              clusters={clusters}
              fragments={fragments}
              selectedClusterId={selectedClusterId}
              committingClusterId={committingClusterId}
              onSelect={handleSelect}
              onCommit={handleCommit}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
