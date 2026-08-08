import type { Config } from "tailwindcss";

/**
 * Every colour here mirrors a CSS custom property declared in app/globals.css.
 * The custom property is the single source of truth — it is what the
 * `data-theme="blood" | "safe"` swap rewrites — so `text-paper` and
 * `var(--paper)` always resolve to the same value in the same theme.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ink-void": "var(--ink-void)",
        "ink-deep": "var(--ink-deep)",
        "ink-panel": "var(--ink-panel)",
        "ink-raise": "var(--ink-raise)",
        "blood-core": "var(--blood-core)",
        "blood-bright": "var(--blood-bright)",
        "blood-glow": "var(--blood-glow)",
        "blood-deep": "var(--blood-deep)",
        ember: "var(--ember)",
        paper: "var(--paper)",
        "paper-dim": "var(--paper-dim)",
        "paper-faint": "var(--paper-faint)",
      },
      fontFamily: {
        display: "var(--font-display)",
        serif: "var(--font-serif)",
        ui: "var(--font-ui)",
      },
      spacing: {
        // The whole app is built on this scale and nothing else.
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
      },
      borderRadius: {
        inner: "4px",
        panel: "8px",
        pill: "999px",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        // Layered elevation: tight near-black + wide ambient + inset hairline.
        raise: [
          "0 8px 20px -8px rgba(0, 0, 0, 0.72)",
          "0 48px 80px -32px rgba(0, 0, 0, 0.68)",
          "inset 0 0 0 1px color-mix(in srgb, var(--blood-deep) 40%, transparent)",
        ].join(", "),
      },
      screens: {
        rail: "900px",
        wide: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
