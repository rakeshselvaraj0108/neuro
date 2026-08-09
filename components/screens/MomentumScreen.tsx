"use client";

import { useEffect, useState } from "react";
import { LoadingBloom } from "@/components/screens/LoadingBloom";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { FormCard } from "@/components/momentum/FormCard";
import { useAppStore } from "@/store/useAppStore";

export function MomentumScreen() {
  const selectedCluster = useAppStore((state) => state.selectedCluster);
  const selectedClusterId = useAppStore((state) => state.selectedClusterId);
  const momentumOptions = useAppStore((state) => state.momentumOptions);
  const momentumStatus = useAppStore((state) => state.momentumStatus);
  const runMomentum = useAppStore((state) => state.runMomentum);
  const chooseForm = useAppStore((state) => state.chooseForm);
  const pieceStatus = useAppStore((state) => state.pieceStatus);
  const setView = useAppStore((state) => state.setView);

  const [chosenFormLocal, setChosenFormLocal] = useState<string | null>(null);

  useEffect(() => {
    void runMomentum();
  }, [runMomentum, selectedClusterId]);

  const handleSelectForm = (form: string) => {
    setChosenFormLocal(form);
    chooseForm(form);
  };

  const isGenerating = pieceStatus === "generating" || chosenFormLocal !== null;
  const clusterLabel = selectedCluster?.label || "Your Idea Cluster";

  return (
    <div className="momentum-screen">
      <Header statusLabel="Choosing Form" />

      <main className="momentum-screen__main">
        {/* Top-left breadcrumb — retreat back to constellation without locking scope */}
        <div className="momentum-screen__nav">
          <button
            type="button"
            className="momentum-screen__breadcrumb"
            onClick={() => setView("constellation")}
          >
            ← Back to your ideas
          </button>
        </div>

        {momentumStatus === "loading" ? (
          /* Reusing the same LoadingBloom ambient placeholder from Phase 3/4 */
          <div className="momentum-screen__loading">
            <LoadingBloom label="Shaping your options…" />
          </div>
        ) : (
          <div className="momentum-screen__content">
            <header className="momentum-screen__header">
              <h2 className="momentum-screen__title">
                You&apos;ve got a piece here. What should it become?
              </h2>
              <p className="momentum-screen__cluster-label">
                Shaping cluster: <strong>{clusterLabel}</strong>
              </p>
            </header>

            <div
              className="momentum-screen__cards"
              role="group"
              aria-label="Select a finished form for your piece"
            >
              {momentumOptions.map((opt, idx) => {
                const isChosen = chosenFormLocal === opt.form;
                const isUnchosen = chosenFormLocal !== null && chosenFormLocal !== opt.form;

                return (
                  <FormCard
                    key={`${opt.form}-${idx}`}
                    form={opt.form}
                    pitch={opt.pitch}
                    index={idx}
                    isChosen={isChosen}
                    isUnchosen={isUnchosen}
                    isGenerating={isGenerating}
                    onSelect={handleSelectForm}
                  />
                );
              })}
            </div>

            <div className="sr-only" role="status" aria-live="polite">
              {chosenFormLocal
                ? `Form ${chosenFormLocal} selected. Scope locked. Weaving your words into a finished piece.`
                : "Three distinct forms suggested for your cluster. Select one to lock scope and finish."}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
