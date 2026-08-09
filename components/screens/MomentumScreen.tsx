"use client";

import { useEffect, useState } from "react";

import { BranchIcon } from "@/components/icons/BranchIcon";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { fallbackMomentum } from "@/lib/ai/fallbacks";
import { useAppStore } from "@/store/useAppStore";
import type { Cluster, Fragment } from "@/types/domain";

import { LoadingBloom } from "./LoadingBloom";

export interface MomentumScreenProps {
  cluster: Cluster | null;
  fragments: Fragment[];
}

export function MomentumScreen({ cluster, fragments }: MomentumScreenProps) {
  const [options, setOptions] = useState<Array<{ form: string; pitch: string }>>([]);
  const setMomentumOptions = useAppStore((state) => state.setMomentumOptions);
  const setChosenForm = useAppStore((state) => state.setChosenForm);
  const setView = useAppStore((state) => state.setView);

  useEffect(() => {
    if (!cluster) return;

    const safeCluster = cluster;
    let cancelled = false;

    async function fetchMomentum() {
      try {
        const response = await fetch("/api/ai/momentum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cluster: safeCluster, fragments }),
        });

        if (!response.ok) {
          throw new Error(`Momentum request failed: ${response.status}`);
        }

        const text = await response.text();
        const payload = text ? (JSON.parse(text) as {
          data?: { options?: Array<{ form: string; pitch: string }> };
        }) : { data: fallbackMomentum(safeCluster) };

        if (cancelled) return;

        const nextOptions = payload.data?.options ?? fallbackMomentum(safeCluster).options;
        setOptions(nextOptions);
        setMomentumOptions(nextOptions);
      } catch {
        if (cancelled) return;
        const nextOptions = fallbackMomentum(safeCluster).options;
        setOptions(nextOptions);
        setMomentumOptions(nextOptions);
      }
    }

    fetchMomentum();
    return () => {
      cancelled = true;
    };
  }, [cluster, fragments, setMomentumOptions]);

  return (
    <div className="app">
      <Header statusLabel="Shaping Your Options" statusIcon={<BranchIcon size={13} />} />

      <main className="momentum-screen">
        {options.length === 0 ? (
          <LoadingBloom label="Shaping your options…" />
        ) : (
          <div className="momentum-shell">
            <div className="momentum-header">
              <span className="t-label">Cluster ready</span>
              <h2 className="momentum-title">{cluster?.label ?? "Your idea"}</h2>
              <p className="momentum-summary">
                {cluster?.readinessReason ?? "A clear thread is forming."}
              </p>
            </div>

            <div className="momentum-list">
              {options.map((option, index) => (
                <button
                  key={option.form}
                  type="button"
                  className="momentum-option"
                  onClick={() => {
                    setChosenForm(option.form);
                    setView("ship");
                  }}
                >
                  <span className="momentum-option__index">0{index + 1}</span>
                  <div className="momentum-option__content">
                    <span className="momentum-option__form">{option.form}</span>
                    <span className="momentum-option__pitch">{option.pitch}</span>
                  </div>
                  <span className="momentum-option__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
