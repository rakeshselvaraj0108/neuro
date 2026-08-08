import { useId } from "react";

/**
 * The circular "CAUGHT · SHAPED · FINISHED" mark, bottom-right of the canvas.
 * The ring text follows an invisible circular path via `<textPath>`; the id
 * comes from `useId` so it's stable across server and client renders and
 * never collides if more than one seal ends up on a page.
 */
export function WaxSeal() {
  const pathId = `seal-ring-${useId()}`;

  return (
    <svg
      className="seal"
      viewBox="0 0 78 78"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path
          id={pathId}
          d="M39,39 m-29,0 a29,29 0 1,1 58,0 a29,29 0 1,1 -58,0"
        />
      </defs>

      <circle
        cx="39"
        cy="39"
        r="36.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle
        cx="39"
        cy="39"
        r="29"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.75"
      />

      <text className="seal__text">
        <textPath href={`#${pathId}`} startOffset="3%">
          CAUGHT · SHAPED · FINISHED
        </textPath>
      </text>

      {/* Small centred flame, echoing the footer mark. */}
      <g transform="translate(39 40)" opacity="0.85">
        <path
          d="M0 -8.4c2.6 3.2 4.2 5.5 4.2 7.6 0 2.6-1.9 4.6-4.6 4.6-2.5 0-4.4-1.9-4.4-4.3 0-1.2.7-2.2 1.9-3.1-.2 1.6.4 2.4 1.3 2.9-.6-2.2.2-4 1.6-7.7z"
          fill="currentColor"
          stroke="none"
        />
      </g>
    </svg>
  );
}
