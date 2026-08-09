"use client";

import { useAppStore } from "@/store/useAppStore";
import { useSafeMode } from "@/hooks/useSafeMode";
import { CALM_THEME, THEMES, type PresentationTheme, type ThemeKey } from "@/lib/presentation/themes";

export interface EffectiveThemeApi {
  effectiveTheme: PresentationTheme;
  userThemeKey: ThemeKey | null;
  suggestedThemeKey: ThemeKey;
  suggestionReason: string;
  isSafeMode: boolean;
  setPresentationTheme: (theme: ThemeKey) => void;
}

/**
 * Single source of truth for presentation theme resolution across the app.
 * Guarantees that when app-wide Safe Mode is active, the CALM_THEME variant
 * is enforced regardless of user selection or auto-suggestion.
 */
export function useEffectiveTheme(): EffectiveThemeApi {
  const { isSafe } = useSafeMode();
  const presentationTheme = useAppStore((state) => state.presentationTheme);
  const suggestedTheme = useAppStore((state) => state.suggestedTheme);
  const suggestionReason = useAppStore((state) => state.suggestionReason);
  const setPresentationTheme = useAppStore((state) => state.setPresentationTheme);

  const effectiveKey: ThemeKey = presentationTheme ?? suggestedTheme ?? "bloodmoon";
  const themeObject = THEMES[effectiveKey] ?? THEMES.bloodmoon;

  const effectiveTheme: PresentationTheme = isSafe ? CALM_THEME : themeObject;

  return {
    effectiveTheme,
    userThemeKey: presentationTheme,
    suggestedThemeKey: suggestedTheme ?? "bloodmoon",
    suggestionReason: suggestionReason || "Default presentation theme",
    isSafeMode: isSafe,
    setPresentationTheme,
  };
}
