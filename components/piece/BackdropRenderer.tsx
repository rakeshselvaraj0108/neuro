"use client";

import type { BackdropKind } from "@/lib/presentation/themes";

interface BackdropRendererProps {
  kind: BackdropKind;
}

export function BackdropRenderer({ kind }: BackdropRendererProps) {
  if (kind === "none") {
    return (
      <div className="backdrop backdrop--none" aria-hidden="true">
        <div className="backdrop__paper-grain" />
        <div className="backdrop__vignette" />
      </div>
    );
  }

  if (kind === "sun") {
    return (
      <div className="backdrop backdrop--sun" aria-hidden="true">
        <div className="backdrop__sun-bloom" />
        <div className="backdrop__sun-disc" />
        <svg
          className="backdrop__silhouettes"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMax slice"
          focusable="false"
        >
          <path
            d="M0 240 Q100 210 200 230 T400 220 L400 300 L0 300 Z"
            fill="var(--theme-panel)"
            opacity="0.6"
          />
          <path
            d="M0 260 Q150 235 300 250 T400 240 L400 300 L0 300 Z"
            fill="var(--theme-ground)"
            opacity="0.8"
          />
        </svg>
        <div className="backdrop__vignette" />
      </div>
    );
  }

  if (kind === "wave") {
    return (
      <div className="backdrop backdrop--wave" aria-hidden="true">
        <div className="backdrop__wave-glow" />
        <svg
          className="backdrop__silhouettes"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMax slice"
          focusable="false"
        >
          <path
            d="M0 200 C120 180 240 220 400 190 L400 300 L0 300 Z"
            fill="var(--theme-panel)"
            opacity="0.4"
          />
          <path
            d="M0 230 C150 250 250 210 400 235 L400 300 L0 300 Z"
            fill="var(--theme-accent)"
            opacity="0.25"
          />
          <path
            d="M0 265 C100 250 300 275 400 260 L400 300 L0 300 Z"
            fill="var(--theme-ground)"
            opacity="0.7"
          />
        </svg>
        <div className="backdrop__vignette" />
      </div>
    );
  }

  // Default: "moon"
  return (
    <div className="backdrop backdrop--moon" aria-hidden="true">
      <div className="backdrop__bloom" />
      <div className="backdrop__disc" />

      <svg
        className="backdrop__silhouettes"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <path
          d="M0 210 L0 196 L18 196 L18 182 L34 182 L34 202 L54 202 L54 170 L70 170 L70 190 L92 190 L92 176 L110 176 L110 198 L134 198 L134 178 L152 178 L152 206 L176 206 L176 184 L196 184 L196 210 L400 210 L400 300 L0 300 Z"
          fill="var(--theme-panel)"
          opacity="0.55"
        />

        <path
          d="M40 240 L40 214 L64 214 L64 228 L84 228 L84 198 L106 198 L106 224 L128 224 L128 206 L150 206 L150 236 L176 236 L176 212 L200 212 L200 240 L400 240 L400 300 L40 300 Z"
          fill="var(--theme-ground)"
          opacity="0.7"
        />

        <path
          d="M0 268 L0 250 L20 250 L20 260 L44 260 L44 232 L64 232 L64 254 L88 254 L88 268 L120 268 L120 244 L142 244 L142 268 L166 236 L188 268 L400 268 L400 300 L0 300 Z"
          fill="var(--theme-ground)"
          opacity="0.92"
        />

        <g opacity="0.9">
          <rect x="188" y="246" width="128" height="22" rx="4" fill="var(--theme-ground)" />
          <rect x="198" y="252" width="10" height="9" rx="1.5" fill="var(--theme-accent-bright)" opacity="0.75" />
          <rect x="216" y="252" width="10" height="9" rx="1.5" fill="var(--theme-accent-bright)" opacity="0.6" />
          <rect x="234" y="252" width="10" height="9" rx="1.5" fill="var(--theme-accent-bright)" opacity="0.75" />
          <rect x="252" y="252" width="10" height="9" rx="1.5" fill="var(--theme-accent-bright)" opacity="0.6" />
          <circle cx="200" cy="270" r="4" fill="var(--theme-ground)" />
          <circle cx="304" cy="270" r="4" fill="var(--theme-ground)" />
        </g>
      </svg>

      <div className="backdrop__vignette" />
    </div>
  );
}
