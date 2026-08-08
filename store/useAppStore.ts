"use client";

import { create } from "zustand";

export type ThemeName = "blood" | "safe";

/** localStorage is the only persistence layer in this app. No accounts, ever. */
export const PREFS_KEY = "ctf.prefs";

export interface StoredPrefs {
  theme: ThemeName;
  dyslexiaFont: boolean;
}

interface AppState {
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
}

/**
 * Server render and first client render must agree, so the store always starts
 * on the blood theme. The real preference is applied to <html> by a blocking
 * script before first paint, then folded into the store by useSafeMode.
 */
export const useAppStore = create<AppState>((set) => ({
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
}));

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
