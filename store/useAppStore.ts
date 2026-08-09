"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { uuid } from "@/lib/uuid";
import { type StoredPrefs, type ThemeName } from "@/lib/prefs";
import { fallbackConstellation } from "@/lib/ai/fallbacks";
import type { AgentSource } from "@/lib/ai/telemetry";
import type { CaptureMode, Cluster, Fragment, Piece } from "@/types/domain";

/** localStorage is the only persistence layer in this app. No accounts, ever. */

/**
 * The whole product is one page driven by this state machine — no route
 * changes, so transitions stay fluid and the demo can never 404.
 */
export type AppView = "flood" | "constellation" | "momentum" | "ship" | "finished";

export type ConstellationStatus = "idle" | "loading" | "ready";

interface LastRemoved {
  fragment: Fragment;
  /** Original position in `fragments`, so undo restores it exactly, not just at the top. */
  index: number;
}

/**
 * A simple, stable fingerprint of a fragment set (ids + text, order-
 * sensitive) — not cryptographic, just enough to know "has anything the
 * constellation pass cares about changed since last time", so revisiting
 * the screen without adding fragments never re-spends a credit.
 */
function hashFragments(fragments: Fragment[]): string {
  let hash = 0;
  const input = fragments.map((f) => `${f.id}:${f.text}`).join("|");
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(i)) | 0;
  }
  return `${fragments.length}:${hash}`;
}

interface AppState {
  // --- theme (Phase 1, unchanged) ------------------------------------------
  theme: ThemeName;
  dyslexiaFont: boolean;
  /** Mirrors `prefers-reduced-motion: reduce`. Never persisted. */
  reducedMotion: boolean;
  /** False until preferences have been read back from localStorage. */
  hydrated: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  setDyslexiaFont: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  hydrate: (prefs: StoredPrefs) => void;

  // --- view state machine (Phase 3) ----------------------------------------
  view: AppView;
  setView: (view: AppView) => void;

  // --- constellation / clustering (Phase 4) ---------------------------------
  clusters: Cluster[];
  constellationStatus: ConstellationStatus;
  constellationSource: AgentSource | null;
  selectedClusterId: string | null;
  /** A stable fingerprint of the fragment set the current `clusters` were computed from — the no-op / re-run guard. */
  constellationFragmentsHash: string | null;
  runConstellation: () => Promise<void>;
  selectCluster: (id: string) => void;
  /** Clears clusters back to idle. Wired up in Phase 5+ for "add more to the flood"; stubbed now, no call site yet. */
  resetConstellation: () => void;

  // --- AI flow state (momentum / ship / finished) ---------------------------
  /**
   * The full Cluster object for whichever id is selected — kept alongside
   * `selectedClusterId` (rather than derived on every read) so Momentum and
   * Ship can keep consuming a plain `Cluster | null` prop. `selectCluster`
   * keeps both in sync; this one is the one to read from.
   */
  selectedCluster: Cluster | null;
  momentumOptions: Array<{ form: string; pitch: string }>;
  chosenForm: string | null;
  generatedPiece: Piece | null;
  setSelectedCluster: (cluster: Cluster | null) => void;
  setMomentumOptions: (options: Array<{ form: string; pitch: string }>) => void;
  setChosenForm: (form: string | null) => void;
  setGeneratedPiece: (piece: Piece | null) => void;

  // --- flood / fragments (Phase 3) -----------------------------------------
  fragments: Fragment[];
  /** Live, unsaved text-mode (and in-progress voice) input. Never persisted. */
  draftText: string;
  /** True once the persisted `fragments` slice has been read back from localStorage. */
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

/**
 * Server render and first client render must agree, so the store always starts
 * on the blood theme. The real preference is applied to <html> by a blocking
 * script before first paint, then folded into the store by useSafeMode.
 *
 * Fragments are the one slice wrapped in zustand's `persist` middleware —
 * everything else (theme, view, draftText) stays plain in-memory state, with
 * theme using its own pre-paint bootstrap script instead (see below).
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- theme ---------------------------------------------------------
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

      // --- view ------------------------------------------------------------
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
          // Same flood the last run already covered — don't re-spend a credit
          // for a screen the user is just re-visiting.
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
          // The route itself is designed to never fail (the gateway
          // guarantees a valid result) — reaching here means the network
          // request never completed at all (e.g. genuinely offline).
          // Compute the same deterministic fallback locally so the screen
          // never hangs.
          clusters = fallbackConstellation(currentFragments).clusters;
          source = "fallback";
        }

        // Write clusterId back onto every fragment so it's always
        // traceable to its cluster from here on.
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

      // --- AI flow ----------------------------------------------------------
      selectedCluster: null,
      momentumOptions: [],
      chosenForm: null,
      generatedPiece: null,
      setSelectedCluster: (selectedCluster) => set({ selectedCluster }),
      setMomentumOptions: (momentumOptions) => set({ momentumOptions }),
      setChosenForm: (chosenForm) => set({ chosenForm }),
      setGeneratedPiece: (generatedPiece) => set({ generatedPiece }),

      // --- flood / fragments -------------------------------------------------
      fragments: [],
      draftText: "",
      fragmentsHydrated: false,
      lastRemoved: null,

      addFragment: (text, mode) => {
        const trimmed = text.trim();
        if (!trimmed) return null;
        const fragment: Fragment = {
          id: uuid(),
          text: trimmed,
          createdAt: Date.now(),
          mode,
          abandoned: false,
          clusterId: null,
        };
        // Prepend — newest first, so the flood visually grows toward the user.
        set((state) => ({ fragments: [fragment, ...state.fragments] }));
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
      // Only fragments survive a refresh — in-progress typing is deliberately
      // not restored (resuming half-typed text out of context is more
      // confusing than losing it), and view/theme have their own handling.
      partialize: (state) => ({ fragments: state.fragments }),
    },
  ),
);

// Rehydration is async (by design — keeps the SSR/client first-paint state
// identical, avoiding a hydration mismatch). Flip the flag once it resolves,
// covering both the "already finished by the time we got here" race and the
// normal case.
if (typeof window !== "undefined") {
  useAppStore.persist.onFinishHydration(() => {
    useAppStore.getState().setFragmentsHydrated(true);
  });
  if (useAppStore.persist.hasHydrated()) {
    useAppStore.getState().setFragmentsHydrated(true);
  }
}

