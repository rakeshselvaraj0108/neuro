/**
 * The atmosphere behind the poem: a blood moon, a receding skyline, and a
 * train catching the light low on the horizon — the poem's own imagery,
 * built entirely from CSS gradients and inline SVG paths. No images.
 *
 * Depth is layered back to front: a hazy far skyline, a darker mid skyline,
 * then a foreground silhouette carrying the train and its lit windows. The
 * whole group sits behind the text column and is masked out well before it
 * reaches it (see `.backdrop` in globals.css).
 */
export function MoonBackdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__bloom" />
      <div className="backdrop__disc" />

      <svg
        className="backdrop__silhouettes"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        {/* Far skyline: hazy, low-contrast, furthest back. */}
        <path
          d="M0 210 L0 196 L18 196 L18 182 L34 182 L34 202 L54 202 L54 170 L70 170 L70 190 L92 190 L92 176 L110 176 L110 198 L134 198 L134 178 L152 178 L152 206 L176 206 L176 184 L196 184 L196 210 L400 210 L400 300 L0 300 Z"
          fill="var(--ink-panel)"
          opacity="0.55"
        />

        {/* Mid skyline: a touch darker and closer. */}
        <path
          d="M40 240 L40 214 L64 214 L64 228 L84 228 L84 198 L106 198 L106 224 L128 224 L128 206 L150 206 L150 236 L176 236 L176 212 L200 212 L200 240 L400 240 L400 300 L40 300 Z"
          fill="var(--ink-void)"
          opacity="0.7"
        />

        {/* Foreground silhouette + train, nearest and darkest. */}
        <path
          d="M0 268 L0 250 L20 250 L20 260 L44 260 L44 232 L64 232 L64 254 L88 254 L88 268 L120 268 L120 244 L142 244 L142 268 L166 236 L188 268 L400 268 L400 300 L0 300 Z"
          fill="var(--ink-void)"
          opacity="0.92"
        />

        {/* The blue train, low on the horizon, windows lit blood-bright. */}
        <g opacity="0.9">
          <rect
            x="188"
            y="246"
            width="128"
            height="22"
            rx="4"
            fill="var(--ink-void)"
          />
          <rect
            x="198"
            y="252"
            width="10"
            height="9"
            rx="1.5"
            fill="var(--blood-bright)"
            opacity="0.55"
          />
          <rect
            x="216"
            y="252"
            width="10"
            height="9"
            rx="1.5"
            fill="var(--blood-bright)"
            opacity="0.4"
          />
          <rect
            x="234"
            y="252"
            width="10"
            height="9"
            rx="1.5"
            fill="var(--blood-bright)"
            opacity="0.55"
          />
          <rect
            x="252"
            y="252"
            width="10"
            height="9"
            rx="1.5"
            fill="var(--blood-bright)"
            opacity="0.4"
          />
          <circle cx="200" cy="270" r="4" fill="var(--ink-void)" />
          <circle cx="304" cy="270" r="4" fill="var(--ink-void)" />
        </g>
      </svg>

      <div className="backdrop__vignette" />
    </div>
  );
}
