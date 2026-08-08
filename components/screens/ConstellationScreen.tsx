"use client";

import { SparkleIcon } from "@/components/icons/SparkleIcon";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import type { Fragment } from "@/types/domain";

import { LoadingBloom } from "./LoadingBloom";

export interface ConstellationScreenProps {
  /** The flood being clustered. Ignored for now — Phase 4 reads this to call the AI gateway. */
  fragments: Fragment[];
}

/**
 * Placeholder for Phase 4's clustering view. This is not a lorem-ipsum
 * stub — it's genuinely the loading state a user sees for a moment even
 * once Phase 4 exists, so it's built with the same craft as any other
 * screen: same chrome, same calm mood, same motion law.
 */
export function ConstellationScreen(_props: ConstellationScreenProps) {
  return (
    <div className="app">
      <Header statusLabel="Sorting Your Flood" statusIcon={<SparkleIcon size={13} />} />
      <main className="loading-screen">
        <LoadingBloom label="Reading your flood…" />
      </main>
      <Footer />
    </div>
  );
}
