"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ReleaseLockPrompt } from "@/components/scopelock/ReleaseLockPrompt";

export function LockedFloodBanner() {
  const scopeLocked = useAppStore((state) => state.scopeLocked);
  const chosenForm = useAppStore((state) => state.chosenForm);
  const parkedCount = useAppStore((state) => state.parkedSinceLockCount);

  const [showConfirm, setShowConfirm] = useState(false);

  if (!scopeLocked) return null;

  return (
    <div className="locked-flood-banner" role="region" aria-label="Scope lock active status">
      <div className="locked-flood-banner__main">
        <div className="locked-flood-banner__info">
          <span className="locked-flood-banner__icon" aria-hidden="true">🔒</span>
          <p className="locked-flood-banner__text">
            You&apos;re finishing <strong>{chosenForm ?? "a piece"}</strong> right now. Anything you catch
            here is saved for after.
            {parkedCount > 0 ? (
              <span className="locked-flood-banner__count"> ({parkedCount} saved since lock)</span>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          className="locked-flood-banner__release-link"
          onClick={() => setShowConfirm(!showConfirm)}
        >
          {showConfirm ? "Cancel" : "Release scope lock"}
        </button>
      </div>

      {showConfirm ? (
        <ReleaseLockPrompt onCancel={() => setShowConfirm(false)} />
      ) : null}
    </div>
  );
}
