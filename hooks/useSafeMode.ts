"use client";

import { useCallback, useEffect } from "react";

import {
  readStoredPrefs,
  useAppStore,
  writeStoredPrefs,
  type ThemeName,
} from "@/store/useAppStore";

interface SafeModeApi {
  theme: ThemeName;
  isSafe: boolean;
  dyslexiaFont: boolean;
  hydrated: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleSafeMode: () => void;
  setDyslexiaFont: (on: boolean) => void;
}

function applyToDocument(theme: ThemeName, dyslexiaFont: boolean): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-font", dyslexiaFont ? "dyslexic" : "default");
}

/**
 * Owns the theme contract: store state, the `data-theme` / `data-font`
 * attributes on <html>, and the localStorage round-trip.
 *
 * Themes never fork the component tree — they only swap tokens.
 */
export function useSafeMode(): SafeModeApi {
  const theme = useAppStore((state) => state.theme);
  const dyslexiaFont = useAppStore((state) => state.dyslexiaFont);
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const setThemeState = useAppStore((state) => state.setTheme);
  const toggleThemeState = useAppStore((state) => state.toggleTheme);
  const setDyslexiaFontState = useAppStore((state) => state.setDyslexiaFont);

  // Fold the pre-paint preference into the store exactly once.
  useEffect(() => {
    if (useAppStore.getState().hydrated) return;
    const prefs = readStoredPrefs();
    hydrate(prefs);
    applyToDocument(prefs.theme, prefs.dyslexiaFont);
  }, [hydrate]);

  // Keep the document and localStorage in step with every later change.
  useEffect(() => {
    if (!hydrated) return;
    applyToDocument(theme, dyslexiaFont);
    writeStoredPrefs({ theme, dyslexiaFont });
  }, [hydrated, theme, dyslexiaFont]);

  const setTheme = useCallback(
    (next: ThemeName) => setThemeState(next),
    [setThemeState],
  );

  const toggleSafeMode = useCallback(
    () => toggleThemeState(),
    [toggleThemeState],
  );

  const setDyslexiaFont = useCallback(
    (on: boolean) => setDyslexiaFontState(on),
    [setDyslexiaFontState],
  );

  return {
    theme,
    isSafe: theme === "safe",
    dyslexiaFont,
    hydrated,
    setTheme,
    toggleSafeMode,
    setDyslexiaFont,
  };
}
