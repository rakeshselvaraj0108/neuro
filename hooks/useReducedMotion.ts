"use client";

import { useEffect } from "react";

import { useAppStore } from "@/store/useAppStore";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Mirrors the OS motion preference into the store and keeps it live.
 *
 * This is deliberately independent of Safe Mode: a creator who has asked their
 * system for less motion gets less motion whichever theme they are in.
 */
export function useReducedMotion(): boolean {
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const setReducedMotion = useAppStore((state) => state.setReducedMotion);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    setReducedMotion(media.matches);

    const onChange = (event: MediaQueryListEvent): void => {
      setReducedMotion(event.matches);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [setReducedMotion]);

  return reducedMotion;
}
