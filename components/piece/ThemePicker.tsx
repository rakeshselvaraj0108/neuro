"use client";

import { useEffectiveTheme } from "@/hooks/useEffectiveTheme";
import { THEMES, type ThemeKey } from "@/lib/presentation/themes";

interface ThemePickerProps {
  onClose?: () => void;
}

export function ThemePicker({ onClose }: ThemePickerProps) {
  const {
    userThemeKey,
    suggestedThemeKey,
    suggestionReason,
    isSafeMode,
    setPresentationTheme,
  } = useEffectiveTheme();

  const themeKeys: ThemeKey[] = ["bloodmoon", "dawn", "tide", "paper"];

  return (
    <div
      className="theme-picker-popover"
      role="dialog"
      aria-label="Choose presentation theme"
    >
      <div className="theme-picker__header">
        <h3 className="theme-picker__title">Presentation Theme</h3>
        {onClose ? (
          <button
            type="button"
            className="theme-picker__close"
            onClick={onClose}
            aria-label="Close theme picker"
          >
            ✕
          </button>
        ) : null}
      </div>

      {isSafeMode ? (
        <div className="theme-picker__safe-note" role="status">
          <span>Safe Mode is keeping this calm — your theme returns when you exit Safe Mode.</span>
        </div>
      ) : null}

      <div className="theme-picker__suggestion-box">
        <span className="theme-picker__suggestion-label">Auto-Suggested:</span>
        <p className="theme-picker__suggestion-reason">{suggestionReason}</p>
      </div>

      <div className="theme-picker__grid" role="radiogroup" aria-label="Available presentation themes">
        {themeKeys.map((key) => {
          const theme = THEMES[key];
          const isSelected = (userThemeKey ?? suggestedThemeKey) === key;
          const isSuggested = suggestedThemeKey === key;

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`theme-chip ${isSelected ? "theme-chip--selected" : ""} ${
                isSuggested ? "theme-chip--suggested" : ""
              }`}
              onClick={() => {
                setPresentationTheme(key);
                if (onClose) onClose();
              }}
            >
              <div
                className="theme-chip__preview"
                style={{
                  backgroundColor: theme.ground,
                  borderColor: theme.accent,
                }}
              >
                <div
                  className="theme-chip__swatch"
                  style={{ backgroundColor: theme.canvas }}
                >
                  <span
                    className="theme-chip__swatch-line"
                    style={{ backgroundColor: theme.textPrimary }}
                  />
                  <span
                    className="theme-chip__swatch-line"
                    style={{ backgroundColor: theme.verbatimGlow }}
                  />
                </div>
              </div>

              <div className="theme-chip__info">
                <div className="theme-chip__name-row">
                  <span className="theme-chip__name">{theme.name}</span>
                  {/* Never rely on the ring/border alone — a text label backs
                      up every non-color signal, for sighted users who might
                      not register a subtle border change, not just for
                      screen readers (which already get this via aria-checked). */}
                  {isSelected ? (
                    <span className="theme-chip__badge theme-chip__badge--selected">Selected</span>
                  ) : null}
                  {isSuggested ? (
                    <span className="theme-chip__badge">Suggested</span>
                  ) : null}
                </div>
                <span className="theme-chip__desc">{theme.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
