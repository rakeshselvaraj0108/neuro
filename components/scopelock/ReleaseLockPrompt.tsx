// Deliberate confirmation step to guard user's own intention rather than second-guessing a destructive action.

"use client";

import { useAppStore } from "@/store/useAppStore";

export interface ReleaseLockPromptProps {
  onCancel?: () => void;
  className?: string;
}

export function ReleaseLockPrompt({ onCancel, className = "" }: ReleaseLockPromptProps) {
  const chosenForm = useAppStore((state) => state.chosenForm);
  const releaseScopeLock = useAppStore((state) => state.releaseScopeLock);

  const handleRelease = () => {
    releaseScopeLock();
    if (onCancel) onCancel();
  };

  return (
    <div
      className={`release-lock-prompt ${className}`}
      role="dialog"
      aria-label="Confirm releasing scope lock"
    >
      <div className="release-lock-prompt__content">
        <p className="release-lock-prompt__text">
          You set out to finish <strong>{chosenForm ?? "your piece"}</strong>. Let it go for now and
          open everything back up?
        </p>

        <div className="release-lock-prompt__actions">
          <button
            type="button"
            className="release-lock-prompt__btn-keep"
            onClick={onCancel}
          >
            Keep finishing
          </button>
          <button
            type="button"
            className="release-lock-prompt__btn-release"
            onClick={handleRelease}
          >
            Release
          </button>
        </div>
      </div>
    </div>
  );
}
