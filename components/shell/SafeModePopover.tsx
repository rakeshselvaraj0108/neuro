"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { SparkleIcon } from "@/components/icons/SparkleIcon";
import { useSafeMode } from "@/hooks/useSafeMode";

const EASE = [0.22, 1, 0.36, 1] as const;

interface SwitchRowProps {
  id: string;
  name: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function SwitchRow({ id, name, hint, checked, onChange }: SwitchRowProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch-row"
      onClick={() => onChange(!checked)}
    >
      <span>
        <span className="switch-row__name">{name}</span>
        <span className="switch-row__hint">{hint}</span>
      </span>
      <span className="switch" data-on={checked} aria-hidden="true">
        <span className="switch__knob" />
      </span>
    </button>
  );
}

/**
 * The Safe Mode control, opened from the footer's sparkle button.
 *
 * Both switches write straight through `useSafeMode`, which owns the
 * `data-theme` / `data-font` attributes on `<html>` and the localStorage
 * round-trip — this component only renders the controls.
 */
export function SafeModePopover() {
  const { isSafe, dyslexiaFont, toggleSafeMode, setDyslexiaFont } = useSafeMode();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="popover-anchor">
      <button
        ref={triggerRef}
        type="button"
        className="icon-button"
        aria-label="Open Safe Mode settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <SparkleIcon size={14} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={popoverRef}
            className="popover"
            role="dialog"
            aria-labelledby={headingId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <h2 id={headingId} className="t-label popover__title">
                Safe Mode
              </h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Close Safe Mode settings"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <CloseIcon size={12} />
              </button>
            </div>

            <p className="popover__intro">
              A calmer palette with no motion, no grain, and larger reading
              text. Same layout, same piece — only the surface changes.
            </p>

            <SwitchRow
              id="switch-safe-mode"
              name="Safe Mode"
              hint="Warm palette, zero motion, larger type"
              checked={isSafe}
              onChange={toggleSafeMode}
            />
            <SwitchRow
              id="switch-dyslexia-font"
              name="Dyslexia-friendly type"
              hint="Atkinson Hyperlegible, wider spacing"
              checked={dyslexiaFont}
              onChange={setDyslexiaFont}
            />

            <p className="popover__note">
              Your choice is saved on this device only. No account, ever.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
