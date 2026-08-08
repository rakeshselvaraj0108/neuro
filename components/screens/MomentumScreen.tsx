"use client";

import { BranchIcon } from "@/components/icons/BranchIcon";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import type { Cluster, Fragment } from "@/types/domain";

import { LoadingBloom } from "./LoadingBloom";

export interface MomentumScreenProps {
  /** The cluster the creator is about to see form options for. */
  cluster: Cluster | null;
  fragments: Fragment[];
}

/** Placeholder for Phase 6's momentum/form-picker view. */
export function MomentumScreen(_props: MomentumScreenProps) {
  return (
    <div className="app">
      <Header statusLabel="Shaping Your Options" statusIcon={<BranchIcon size={13} />} />
      <main className="loading-screen">
        <LoadingBloom label="Shaping your options…" />
      </main>
      <Footer />
    </div>
  );
}
