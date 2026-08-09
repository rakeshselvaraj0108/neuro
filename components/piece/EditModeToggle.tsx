"use client";

import { useAppStore } from "@/store/useAppStore";

export function EditModeToggle() {
  const editMode = useAppStore((state) => state.editMode);
  const toggleEditMode = useAppStore((state) => state.toggleEditMode);
  const undoSnapshot = useAppStore((state) => state.undoSnapshot);
  const undoLastPieceChange = useAppStore((state) => state.undoLastPieceChange);

  return (
    <div className="edit-mode-controls" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
        type="button"
        className={`edit-mode-toggle ${editMode ? "edit-mode-toggle--active" : ""}`}
        onClick={toggleEditMode}
        aria-label={editMode ? "Done refining piece" : "Refine piece stanzas"}
        aria-pressed={editMode}
      >
        <svg
          className="edit-mode-toggle__icon"
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l2 2-9 9H3v-2l9-9z" />
          <path d="M10 4l2 2" />
        </svg>
        <span>{editMode ? "DONE REFINING" : "REFINE"}</span>
      </button>

      {editMode && undoSnapshot ? (
        <button
          type="button"
          className="piece-undo-btn"
          onClick={undoLastPieceChange}
          aria-label="Undo last piece edit (Ctrl+Z)"
          title="Undo last edit (Ctrl+Z)"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h7a3 3 0 013 3v0a3 3 0 01-3 3H8" />
            <path d="M7 4L4 7l3 3" />
          </svg>
          <span>Undo edit</span>
        </button>
      ) : null}
    </div>
  );
}
