"use client";

import { useState } from "react";
import { EditModeToggle } from "@/components/piece/EditModeToggle";
import { ThemePicker } from "@/components/piece/ThemePicker";
import { useAppStore } from "@/store/useAppStore";
import { useEffectiveTheme } from "@/hooks/useEffectiveTheme";

export function FinishedControls() {
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const setView = useAppStore((state) => state.setView);
  const scopeLocked = useAppStore((state) => state.scopeLocked);
  const { effectiveTheme } = useEffectiveTheme();

  return (
    <div className="finished-controls-container">
      {/* Desktop & Tablet control cluster */}
      <div className="finished-controls-bar" role="toolbar" aria-label="Finished piece options">
        <EditModeToggle />

        <div className="finished-controls-group">
          <button
            type="button"
            className={`finished-control-btn ${themePickerOpen ? "finished-control-btn--active" : ""}`}
            onClick={() => setThemePickerOpen(!themePickerOpen)}
            aria-label="Change presentation theme"
            aria-expanded={themePickerOpen}
          >
            <span
              className="theme-indicator-dot"
              style={{ backgroundColor: effectiveTheme.accentBright }}
            />
            <span>Theme</span>
          </button>

          {/* Export Placeholders (Phase 9) */}
          <div className="export-placeholders-group" role="group" aria-label="Export options (Phase 9)">
            <button
              type="button"
              className="finished-control-btn finished-control-btn--disabled"
              disabled
              title="Export as PNG (Phase 9)"
            >
              <span>PNG</span>
            </button>
            <button
              type="button"
              className="finished-control-btn finished-control-btn--disabled"
              disabled
              title="Export as PDF (Phase 9)"
            >
              <span>PDF</span>
            </button>
            <button
              type="button"
              className="finished-control-btn finished-control-btn--disabled"
              disabled
              title="Share piece (Phase 9)"
            >
              <span>Share</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className="finished-control-btn finished-control-btn--new-flood"
          onClick={() => setView("flood")}
          title={scopeLocked ? "Start a new flood (Scope lock remains active)" : "Start a new flood"}
        >
          <span>+ New Flood</span>
        </button>
      </div>

      {/* Mobile collapse button (<640px) */}
      <div className="finished-controls-mobile-toggle">
        <button
          type="button"
          className="finished-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle options menu"
          aria-expanded={mobileMenuOpen}
        >
          ⋯
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen ? (
        <div className="finished-mobile-drawer" role="dialog" aria-label="Piece actions menu">
          <div className="finished-mobile-drawer__backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="finished-mobile-drawer__content">
            <div className="finished-mobile-drawer__header">
              <span>Options</span>
              <button
                type="button"
                className="finished-mobile-drawer__close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="finished-mobile-drawer__items">
              <EditModeToggle />
              <button
                type="button"
                className="finished-mobile-drawer__btn"
                onClick={() => {
                  setThemePickerOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                Change Theme
              </button>
              <button
                type="button"
                className="finished-mobile-drawer__btn"
                onClick={() => {
                  setView("flood");
                  setMobileMenuOpen(false);
                }}
              >
                + Start New Flood
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Theme Picker Popover */}
      {themePickerOpen ? (
        <div className="theme-picker-overlay" onClick={() => setThemePickerOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ThemePicker onClose={() => setThemePickerOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
