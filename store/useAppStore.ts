"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { uuid } from "@/lib/uuid";
import { type StoredPrefs, type ThemeName } from "@/lib/prefs";
import { fallbackConstellation, fallbackMomentum, fallbackShip } from "@/lib/ai/fallbacks";
import type { AgentSource } from "@/lib/ai/telemetry";
import { verifyPiece, type VerifiedPiece, type VerifiedShipResult } from "@/lib/fidelity/verify";
import type { CaptureMode, Cluster, Fragment, JourneyStep, Piece } from "@/types/domain";

export type AppView = "flood" | "constellation" | "momentum" | "ship" | "finished";
export type ConstellationStatus = "idle" | "loading" | "ready";
export type MomentumStatus = "idle" | "loading" | "ready";
export type PieceStatus = "idle" | "generating" | "ready";

export interface MomentumOption {
  form: string;
  pitch: string;
}

interface LastRemoved {
  fragment: Fragment;
  index: number;
}

function hashFragments(fragments: Fragment[]): string {
  let hash = 0;
  const input = fragments.map((f) => `${f.id}:${f.text}`).join("|");
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(i)) | 0;
  }
  return `${fragments.length}:${hash}`;
}

interface AppState {
  // --- theme -----------------------------------------------------------------
  theme: ThemeName;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  hydrated: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  setDyslexiaFont: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  hydrate: (prefs: StoredPrefs) => void;

  // --- view state machine ----------------------------------------------------
  view: AppView;
  setView: (view: AppView) => void;

  // --- constellation / clustering --------------------------------------------
  clusters: Cluster[];
  constellationStatus: ConstellationStatus;
  constellationSource: AgentSource | null;
  selectedClusterId: string | null;
  constellationFragmentsHash: string | null;
  runConstellation: () => Promise<void>;
  selectCluster: (id: string) => void;
  resetConstellation: () => void;

  // --- momentum & form options ----------------------------------------------
  selectedCluster: Cluster | null;
  momentumOptions: MomentumOption[];
  momentumStatus: MomentumStatus;
  momentumSource: AgentSource | null;
  momentumClusterIdHash: string | null;
  chosenForm: string | null;
  runMomentum: () => Promise<void>;
  chooseForm: (form: string) => void;

  // --- scope-lock executive function ----------------------------------------
  scopeLocked: boolean;
  lockedClusterId: string | null;
  parkedSinceLockCount: number;
  engageScopeLock: (clusterId: string) => void;
  releaseScopeLock: () => void;

  // --- piece generation & finished -------------------------------------------
  generatedPiece: Piece | null;
  currentPiece: VerifiedPiece | null;
  pieceStatus: PieceStatus;
  pieceSource: AgentSource | null;

  setSelectedCluster: (cluster: Cluster | null) => void;
  setMomentumOptions: (options: MomentumOption[]) => void;
  setChosenForm: (form: string | null) => void;
  setGeneratedPiece: (piece: Piece | null) => void;
  generatePiece: (form: string) => Promise<void>;

  // --- flood / fragments ----------------------------------------------------
  fragments: Fragment[];
  draftText: string;
  fragmentsHydrated: boolean;
  lastRemoved: LastRemoved | null;
  addFragment: (text: string, mode: CaptureMode) => Fragment | null;
  updateFragmentText: (id: string, text: string) => void;
  markAbandoned: (id: string) => void;
  removeFragment: (id: string) => void;
  undoRemove: () => void;
  clearLastRemoved: () => void;
  setDraftText: (text: string) => void;
  setFragmentsHydrated: (on: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- theme -------------------------------------------------------------
      theme: "blood",
      dyslexiaFont: false,
      reducedMotion: false,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "safe" ? "blood" : "safe" })),
      setDyslexiaFont: (dyslexiaFont) => set({ dyslexiaFont }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      hydrate: (prefs) =>
        set({
          theme: prefs.theme,
          dyslexiaFont: prefs.dyslexiaFont,
          hydrated: true,
        }),

      // --- view --------------------------------------------------------------
      view: "flood",
      setView: (view) => set({ view }),

      // --- constellation / clustering ----------------------------------------
      clusters: [],
      constellationStatus: "idle",
      constellationSource: null,
      selectedClusterId: null,
      constellationFragmentsHash: null,

      runConstellation: async () => {
        const state = get();
        if (state.constellationStatus === "loading") return;

        const hash = hashFragments(state.fragments);
        if (state.constellationStatus === "ready" && state.constellationFragmentsHash === hash) {
          return;
        }

        set({ constellationStatus: "loading" });

        const currentFragments = state.fragments;
        let clusters: Cluster[];
        let source: AgentSource;

        try {
          const response = await fetch("/api/ai/constellation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fragments: currentFragments }),
          });
          const payload = (await response.json()) as {
            data?: { clusters?: Cluster[] };
            source?: AgentSource;
            error?: string;
          };
          if (!response.ok || !payload.data?.clusters) {
            throw new Error(payload.error ?? `Constellation request failed: ${response.status}`);
          }
          clusters = payload.data.clusters;
          source = payload.source ?? "fallback";
        } catch {
          clusters = fallbackConstellation(currentFragments).clusters;
          source = "fallback";
        }

        const clusterIdByFragmentId = new Map<string, string>();
        clusters.forEach((cluster) => {
          cluster.fragmentIds.forEach((fragmentId) => {
            clusterIdByFragmentId.set(fragmentId, cluster.id);
          });
        });

        set((s) => ({
          fragments: s.fragments.map((fragment) =>
            clusterIdByFragmentId.has(fragment.id)
              ? { ...fragment, clusterId: clusterIdByFragmentId.get(fragment.id) ?? null }
              : fragment,
          ),
          clusters,
          constellationStatus: "ready",
          constellationSource: source,
          constellationFragmentsHash: hash,
        }));
      },

      selectCluster: (id) => {
        const cluster = get().clusters.find((c) => c.id === id) ?? null;
        set({ selectedClusterId: id, selectedCluster: cluster });
      },

      resetConstellation: () =>
        set({
          clusters: [],
          constellationStatus: "idle",
          constellationSource: null,
          selectedClusterId: null,
          constellationFragmentsHash: null,
          selectedCluster: null,
        }),

      // --- momentum -----------------------------------------------------------
      selectedCluster: null,
      momentumOptions: [],
      momentumStatus: "idle",
      momentumSource: null,
      momentumClusterIdHash: null,
      chosenForm: null,

      runMomentum: async () => {
        const state = get();
        if (state.momentumStatus === "loading") return;

        const clusterId = state.selectedClusterId || state.selectedCluster?.id;
        if (!clusterId) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error("runMomentum requires a selectedClusterId from constellation");
          }
          return;
        }

        // Hash-guard pattern: don't re-spend a credit re-shaping the same cluster
        if (state.momentumStatus === "ready" && state.momentumClusterIdHash === clusterId) {
          return;
        }

        set({ momentumStatus: "loading" });

        const targetCluster = state.selectedCluster || {
          id: clusterId,
          label: "Your Idea",
          fragmentIds: state.fragments.map((f) => f.id),
          readiness: 100,
          readinessReason: "",
          suggestedForms: ["Poem", "Essay", "Script"],
        };

        const clusterFrags = state.fragments.filter(
          (f) => f.clusterId === clusterId || targetCluster.fragmentIds.includes(f.id),
        );
        const fragsToPass = clusterFrags.length > 0 ? clusterFrags : state.fragments;

        try {
          const response = await fetch("/api/ai/momentum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clusterId,
              cluster: targetCluster,
              fragments: fragsToPass,
              clusterLabel: targetCluster.label,
            }),
          });

          if (!response.ok) {
            throw new Error(`Momentum request failed with status ${response.status}`);
          }

          const payload = (await response.json()) as {
            options: MomentumOption[];
            source: AgentSource;
          };

          set({
            momentumOptions: payload.options,
            momentumSource: payload.source ?? "model",
            momentumStatus: "ready",
            momentumClusterIdHash: clusterId,
          });
        } catch {
          const fallback = fallbackMomentum(targetCluster);
          set({
            momentumOptions: fallback.options,
            momentumSource: "fallback",
            momentumStatus: "ready",
            momentumClusterIdHash: clusterId,
          });
        }
      },

      chooseForm: (form: string) => {
        const state = get();
        const clusterId = state.selectedClusterId || state.selectedCluster?.id || "cluster_1";

        set({ chosenForm: form });

        // Sequence matters: engage scope lock BEFORE generation starts
        state.engageScopeLock(clusterId);

        // Kick off piece generation
        void state.generatePiece(form);
      },

      // --- scope-lock --------------------------------------------------------
      scopeLocked: false,
      lockedClusterId: null,
      parkedSinceLockCount: 0,

      engageScopeLock: (clusterId: string) => {
        set({
          scopeLocked: true,
          lockedClusterId: clusterId,
          parkedSinceLockCount: 0,
        });
      },

      releaseScopeLock: () => {
        set((state) => ({
          scopeLocked: false,
          lockedClusterId: null,
          fragments: state.fragments.map((f) =>
            f.parkedDuringLock ? { ...f, parkedDuringLock: false } : f,
          ),
        }));
      },

      // --- piece generation ---------------------------------------------------
      generatedPiece: null,
      currentPiece: null,
      pieceStatus: "idle",
      pieceSource: null,

      setSelectedCluster: (selectedCluster) => set({ selectedCluster }),
      setMomentumOptions: (momentumOptions) => set({ momentumOptions }),
      setChosenForm: (chosenForm) => set({ chosenForm }),
      setGeneratedPiece: (generatedPiece) => set({ generatedPiece }),

      generatePiece: async (form: string) => {
        const state = get();
        if (state.pieceStatus === "generating") return;

        const clusterId = state.selectedClusterId || state.selectedCluster?.id;
        if (!clusterId) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error("generatePiece requires a selectedClusterId from Phase 4 constellation");
          }
          return;
        }

        set({ pieceStatus: "generating" });

        // Filter to cluster's own fragments, excluding any captured while locked
        const targetCluster = state.selectedCluster || {
          id: clusterId,
          label: "Your Idea",
          fragmentIds: state.fragments.map((f) => f.id),
          readiness: 100,
          readinessReason: "",
          suggestedForms: [form],
        };

        const matching = state.fragments.filter(
          (f) =>
            !f.parkedDuringLock &&
            (f.clusterId === clusterId || targetCluster.fragmentIds.includes(f.id)),
        );
        const targetFrags = matching.length > 0 ? matching : state.fragments.filter((f) => !f.parkedDuringLock);

        let pieceData: VerifiedShipResult;
        let source: AgentSource;

        try {
          const response = await fetch("/api/ai/ship", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clusterId,
              cluster: targetCluster,
              fragments: targetFrags,
              form,
            }),
          });

          if (!response.ok) {
            throw new Error(`Ship route failed with status ${response.status}`);
          }

          const payload = (await response.json()) as {
            piece: VerifiedShipResult;
            source: AgentSource;
          };

          pieceData = payload.piece;
          source = payload.source ?? "model";
        } catch {
          const fallbackDraft = fallbackShip(targetCluster, targetFrags);
          pieceData = verifyPiece(fallbackDraft, targetFrags);
          source = "fallback";
        }

        const totalWords = (pieceData.fidelity.captured || 0) + (pieceData.fidelity.invented || 0);
        const percent =
          totalWords > 0
            ? Math.round(((pieceData.fidelity.captured || 0) / totalWords) * 100)
            : 100;
        const ideaCount = targetFrags.length;

        // Dynamic, fully computed JourneyStep array (no hardcoded values)
        const journey: JourneyStep[] = [
          { key: "flood", title: "Flood captured", subtitle: `${ideaCount} ideas`, complete: true },
          {
            key: "fidelity",
            title: "Fidelity agent",
            subtitle: `${pieceData.fidelity.captured} captured / ${pieceData.fidelity.invented} invented`,
            complete: true,
          },
          {
            key: "momentum",
            title: "Momentum agent",
            subtitle: `${state.momentumOptions.length || 3} forms suggested`,
            complete: true,
          },
          { key: "chosen", title: "You chose", subtitle: form, complete: true },
          {
            key: "finished",
            title: "Piece finished",
            subtitle: `${totalWords} words, ${percent}% yours`,
            complete: true,
          },
        ];

        const fullPiece: VerifiedPiece = {
          id: uuid(),
          title: pieceData.title,
          form,
          stanzas: pieceData.stanzas,
          fidelity: pieceData.fidelity,
          lockedAt: Date.now(),
          journey,
        };

        set({
          currentPiece: fullPiece,
          generatedPiece: fullPiece as unknown as Piece,
          chosenForm: form,
          pieceStatus: "ready",
          pieceSource: source,
          view: "finished",
        });
      },

      // --- flood / fragments -------------------------------------------------
      fragments: [],
      draftText: "",
      fragmentsHydrated: false,
      lastRemoved: null,

      addFragment: (text, mode) => {
        const trimmed = text.trim();
        if (!trimmed) return null;
        const state = get();

        // Scope-Lock capture check: tag fragment as parked if scopeLocked is active
        const isLocked = state.scopeLocked;
        const fragment: Fragment = {
          id: uuid(),
          text: trimmed,
          createdAt: Date.now(),
          mode,
          abandoned: false,
          clusterId: isLocked ? "__parked__" : null,
          parkedDuringLock: isLocked,
        };

        set((s) => ({
          fragments: [fragment, ...s.fragments],
          parkedSinceLockCount: isLocked
            ? s.parkedSinceLockCount + 1
            : s.parkedSinceLockCount,
        }));

        return fragment;
      },

      updateFragmentText: (id, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((state) => ({
          fragments: state.fragments.map((f) =>
            f.id === id ? { ...f, text: trimmed } : f,
          ),
        }));
      },

      markAbandoned: (id) => {
        set((state) => ({
          fragments: state.fragments.map((f) =>
            f.id === id ? { ...f, abandoned: true } : f,
          ),
        }));
      },

      removeFragment: (id) => {
        const index = get().fragments.findIndex((f) => f.id === id);
        if (index === -1) return;
        set((state) => {
          const fragment = state.fragments[index];
          if (!fragment) return state;
          return {
            fragments: state.fragments.filter((f) => f.id !== id),
            lastRemoved: { fragment, index },
          };
        });
      },

      undoRemove: () => {
        const { lastRemoved, fragments } = get();
        if (!lastRemoved) return;
        const next = fragments.slice();
        next.splice(Math.min(lastRemoved.index, next.length), 0, lastRemoved.fragment);
        set({ fragments: next, lastRemoved: null });
      },

      clearLastRemoved: () => set({ lastRemoved: null }),

      setDraftText: (text) => set({ draftText: text }),
      setFragmentsHydrated: (on) => set({ fragmentsHydrated: on }),
    }),
    {
      name: "catch-the-flood-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        fragments: state.fragments,
        currentPiece: state.currentPiece,
        scopeLocked: state.scopeLocked,
        lockedClusterId: state.lockedClusterId,
        parkedSinceLockCount: state.parkedSinceLockCount,
        chosenForm: state.chosenForm,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  useAppStore.persist.onFinishHydration(() => {
    useAppStore.getState().setFragmentsHydrated(true);
  });
  if (useAppStore.persist.hasHydrated()) {
    useAppStore.getState().setFragmentsHydrated(true);
  }
}
