"use client";

import { SealIcon } from "@/components/icons/SealIcon";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import type { Cluster, Fragment } from "@/types/domain";

import { LoadingBloom } from "./LoadingBloom";

export interface ShipScreenProps {
  cluster: Cluster | null;
  fragments: Fragment[];
  /** The form the creator chose on the Momentum screen. */
  form: string | null;
}

/** Placeholder for Phase 7's scope-lock / assembly view. */
export function ShipScreen(_props: ShipScreenProps) {
  return (
    <div className="app">
      <Header statusLabel="Preparing to Finish" statusIcon={<SealIcon size={13} />} />
      <main className="loading-screen">
        <LoadingBloom label="Preparing to finish…" />
      </main>
      <Footer />
    </div>
  );
}
