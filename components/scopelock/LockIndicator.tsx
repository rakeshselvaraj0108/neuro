"use client";

import { useAppStore } from "@/store/useAppStore";

export function LockIndicator() {
  const scopeLocked = useAppStore((state) => state.scopeLocked);
  const chosenForm = useAppStore((state) => state.chosenForm);

  if (!scopeLocked || !chosenForm) return null;

  const formText = chosenForm.toLowerCase();
  const accessibleLabel = `Scope locked. You're finishing a ${formText}. New ideas will be saved for later.`;

  return (
    <div
      className="lock-indicator"
      role="status"
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="lock-indicator__icon"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="7"
          width="10"
          height="7"
          rx="1.5"
          stroke="var(--ember)"
          strokeWidth="1.5"
        />
        <path
          d="M5 7V4.5C5 2.84315 6.34315 1.5 8 1.5C9.65685 1.5 11 2.84315 11 4.5V7"
          stroke="var(--ember)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="lock-indicator__label">
        Scope locked · finishing <strong>{chosenForm}</strong>
      </span>
    </div>
  );
}
