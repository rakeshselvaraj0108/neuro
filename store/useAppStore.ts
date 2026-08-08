"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { uuid } from "@/lib/uuid";
import type { CaptureMode, Fragment } from "@/types/domain";

export type ThemeName = "blood" | "safe";

/** localStorage is the only persistence layer in this app. No accounts, ever. */
export const PREFS_KEY = "ctf.prefs";

export interface StoredPrefs {
  theme: ThemeName;
  dyslexiaFont: boolean;
}

/**
 * The whole product is one page driven by this state machine — no route
 * changes, so transitions stay fluid and the demo can never 404.
 */
export type AppView = "flood" | "constellation" | "momentum" | "ship" | "finished";

interface LastRemoved {
  fragment: Fragment;
  /** Original position in `fragments`, so undo restores it exactly, not just at the top. */
  index: number;
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

/** Reads stored preferences defensively — malformed JSON must never throw. */
export function readStoredPrefs(): StoredPrefs {
  const fallback: StoredPrefs = { theme: "blood", dyslexiaFont: false };
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return fallback;

    const record = parsed as Record<string, unknown>;
    return {
      theme: record.theme === "safe" ? "safe" : "blood",
      dyslexiaFont: record.dyslexiaFont === true,
    };
  } catch {
    return fallback;
  }
}

export function writeStoredPrefs(prefs: StoredPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Private browsing or a full quota. Preferences simply stay session-only.
  }
}

/**
 * Runs before first paint, inlined into <head>, so the correct theme is on
 * <html> before anything renders. Kept dependency-free and exception-safe.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var r=document.documentElement;var s=localStorage.getItem(${JSON.stringify(
  PREFS_KEY,
)});var p=s?JSON.parse(s):{};r.setAttribute("data-theme",p&&p.theme==="safe"?"safe":"blood");r.setAttribute("data-font",p&&p.dyslexiaFont===true?"dyslexic":"default");}catch(e){}})();`;
