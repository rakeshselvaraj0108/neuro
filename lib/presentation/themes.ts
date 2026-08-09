export type ThemeKey = "bloodmoon" | "dawn" | "tide" | "paper";
export type BackdropKind = "moon" | "sun" | "wave" | "none";

export interface PresentationTheme {
  key: ThemeKey | "calm";
  name: string;
  description: string;
  ground: string;
  canvas: string;
  panel: string;
  accent: string;
  accentBright: string;
  verbatimGlow: string;
  textPrimary: string;
  textDim: string;
  textFaint: string;
  backdropKind: BackdropKind;
}

export const THEMES: Record<ThemeKey, PresentationTheme> = {
  bloodmoon: {
    key: "bloodmoon",
    name: "Blood Moon",
    description: "Crimson accents over deep ink void. For dark, elegiac, defiant pieces.",
    ground: "#0B0A0E",
    canvas: "#14121A",
    panel: "#1C1924",
    accent: "#8B1E2B",
    accentBright: "#D9364A",
    verbatimGlow: "#FF5C5C",
    textPrimary: "#F4EFE6",
    textDim: "#B8B0A2",
    textFaint: "#756E63",
    backdropKind: "moon",
  },
  dawn: {
    key: "dawn",
    name: "Dawn",
    description: "Warm cream ground with terracotta & gold accents. For hopeful, tender pieces.",
    ground: "#FAF5EB",
    canvas: "#FFFDF9",
    panel: "#F5ECE0",
    accent: "#B84A14",
    accentBright: "#D96828",
    verbatimGlow: "#B84A14",
    textPrimary: "#2C1E14",
    textDim: "#6B5344",
    textFaint: "#A38C7A",
    backdropKind: "sun",
  },
  tide: {
    key: "tide",
    name: "Tide",
    description: "Deep teal-slate ground with pale aqua & silver accents. For quiet, reflective pieces.",
    ground: "#0D191F",
    canvas: "#14232B",
    panel: "#1C2F3A",
    accent: "#2A7B9B",
    accentBright: "#38BDF8",
    verbatimGlow: "#38BDF8",
    textPrimary: "#E8F4F8",
    textDim: "#9BC2D0",
    textFaint: "#587C8A",
    backdropKind: "wave",
  },
  paper: {
    key: "paper",
    name: "Paper Archive",
    description: "Archival paper ground with rich ink black type. Minimalist, timeless.",
    ground: "#F5F5F0",
    canvas: "#FFFFFF",
    panel: "#EBEBE3",
    accent: "#525252",
    accentBright: "#1A1A1A",
    verbatimGlow: "#991B1B",
    textPrimary: "#1A1A1A",
    textDim: "#525252",
    textFaint: "#8C8C8C",
    backdropKind: "none",
  },
};

export const CALM_THEME: PresentationTheme = {
  key: "calm",
  name: "Calm Safe Mode",
  description: "High-contrast neutral presentation enforcing maximum legibility.",
  ground: "#F7F4EE",
  canvas: "#FFFFFF",
  panel: "#EFECE6",
  accent: "#44403C",
  accentBright: "#1C1917",
  verbatimGlow: "#854D0E",
  textPrimary: "#1C1917",
  textDim: "#57534E",
  textFaint: "#78716C",
  backdropKind: "none",
};

/**
 * Computes WCAG 2.1 relative luminance for an RGB tuple [0-255].
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;
  const R = rs <= 0.04045 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const G = gs <= 0.04045 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const B = bs <= 0.04045 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Converts #HEX string to RGB tuple */
function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Calculates WCAG 2.1 contrast ratio between two hex colors */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(...hexToRgb(hex1));
  const lum2 = relativeLuminance(...hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}
