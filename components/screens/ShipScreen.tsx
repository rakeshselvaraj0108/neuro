"use client";

import { useEffect } from "react";

import { SealIcon } from "@/components/icons/SealIcon";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { fallbackShip } from "@/lib/ai/fallbacks";
import { useAppStore } from "@/store/useAppStore";
import type { Cluster, Fragment } from "@/types/domain";

export interface ShipScreenProps {
  cluster: Cluster | null;
  fragments: Fragment[];
  form: string | null;
}

type ShipData = {
  title?: string;
  stanzas?: Array<Array<{ text: string; origin: "captured" | "invented"; sourceFragmentId?: string }>>;
};

async function getFidelity(stanzas: NonNullable<ShipData["stanzas"]>) {
  const response = await fetch("/api/ai/fidelity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stanzas }),
  });
  if (!response.ok) throw new Error("Fidelity request failed");
  const payload = (await response.json()) as { data?: { captured?: number; invented?: number } };
  return {
    captured: payload.data?.captured ?? 0,
    invented: payload.data?.invented ?? 0,
  };
}

export function ShipScreen({ cluster, fragments, form }: ShipScreenProps) {
  const setGeneratedPiece = useAppStore((state) => state.setGeneratedPiece);
  const setView = useAppStore((state) => state.setView);

  useEffect(() => {
    if (!cluster) {
      setView("flood");
      return;
    }

    const safeCluster = cluster;
    const safeForm = form ?? "Poem";
    let cancelled = false;

    async function shipPiece() {
      try {
        const response = await fetch("/api/ai/ship", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cluster: safeCluster, fragments, form: safeForm }),
        });

        if (!response.ok) {
          throw new Error(`Ship request failed: ${response.status}`);
        }

        const text = await response.text();
        const payload = text ? (JSON.parse(text) as { data?: ShipData }) : { data: fallbackShip(safeCluster, fragments) };

        if (cancelled) return;

        const nextPiece = payload.data ?? fallbackShip(safeCluster, fragments);
        const stanzas = nextPiece.stanzas ?? [];
        const fidelity = await getFidelity(stanzas);
        if (cancelled) return;
        setGeneratedPiece({
          id: `${safeCluster.id}-${Date.now()}`,
          title: nextPiece.title ?? safeCluster.label,
          form: safeForm,
          stanzas,
          fidelity,
          lockedAt: Date.now(),
          journey: [
            { key: "flood", title: "Flood captured", subtitle: `${fragments.length} ideas`, complete: true },
            { key: "fidelity", title: "Fidelity check", subtitle: "Origins counted from the final piece", complete: true },
            { key: "momentum", title: "Momentum agent", subtitle: `${safeForm} chosen`, complete: true },
            { key: "chosen", title: "You chose", subtitle: safeForm, complete: true },
            { key: "finished", title: "Piece finished", subtitle: "Ready to keep or share", complete: true },
          ],
        });
        setView("finished");
      } catch {
        if (cancelled) return;
        const nextPiece = fallbackShip(safeCluster, fragments);
        setGeneratedPiece({
          id: `${safeCluster.id}-${Date.now()}`,
          title: nextPiece.title ?? safeCluster.label,
          form: safeForm,
          stanzas: nextPiece.stanzas ?? [],
          fidelity: {
            captured: nextPiece.stanzas.flat().filter((segment) => segment.origin === "captured").length,
            invented: nextPiece.stanzas.flat().filter((segment) => segment.origin === "invented").length,
          },
          lockedAt: Date.now(),
          journey: [
            { key: "flood", title: "Flood captured", subtitle: `${fragments.length} ideas`, complete: true },
            { key: "fidelity", title: "Fidelity check", subtitle: "Origins counted from the final piece", complete: true },
            { key: "momentum", title: "Momentum agent", subtitle: `${safeForm} chosen`, complete: true },
            { key: "chosen", title: "You chose", subtitle: safeForm, complete: true },
            { key: "finished", title: "Piece finished", subtitle: "Ready to keep or share", complete: true },
          ],
        });
        setView("finished");
      }
    }

    shipPiece();
    return () => {
      cancelled = true;
    };
  }, [cluster, form, fragments, setGeneratedPiece, setView]);

  return (
    <div className="app">
      <Header statusLabel="Preparing to Finish" statusIcon={<SealIcon size={13} />} />

      <main className="ship-screen">
        <div className="ship-panel">
          <span className="t-label">Assembling</span>
          <h2 className="ship-panel__title">{form ?? "Your piece"}</h2>
          <p className="ship-panel__subtitle">
            Building a finished version from {fragments.length} captured fragments.
          </p>

          <div className="ship-progress" aria-hidden="true">
            <span className="ship-progress__bar" />
          </div>

          <div className="ship-meta">
            <span>{cluster?.label ?? "Cluster"}</span>
            <span>{form}</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
