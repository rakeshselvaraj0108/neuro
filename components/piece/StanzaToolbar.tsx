"use client";

interface StanzaToolbarProps {
  stanzaIndex: number;
  totalStanzas: number;
  isEditingLines: boolean;
  isReshaping: boolean;
  onToggleEditLines: () => void;
  onToggleReshape: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function StanzaToolbar({
  stanzaIndex,
  totalStanzas,
  isEditingLines,
  isReshaping,
  onToggleEditLines,
  onToggleReshape,
  onRemove,
  onMoveUp,
  onMoveDown,
}: StanzaToolbarProps) {
  return (
    <div
      className="stanza-toolbar"
      role="toolbar"
      aria-label={`Actions for stanza ${stanzaIndex + 1} of ${totalStanzas}`}
    >
      <button
        type="button"
        className={`stanza-toolbar__btn ${isEditingLines ? "stanza-toolbar__btn--active" : ""}`}
        onClick={onToggleEditLines}
        title="Directly edit text lines"
      >
        <span>{isEditingLines ? "Done editing" : "Edit lines"}</span>
      </button>

      <button
        type="button"
        className={`stanza-toolbar__btn ${isReshaping ? "stanza-toolbar__btn--active" : ""}`}
        onClick={onToggleReshape}
        title="Reshape this stanza with prompt"
      >
        <span>Reshape…</span>
      </button>

      <button
        type="button"
        className="stanza-toolbar__btn stanza-toolbar__btn--remove"
        onClick={onRemove}
        title="Remove this stanza"
      >
        <span>Remove</span>
      </button>

      <div className="stanza-toolbar__reorder" role="group" aria-label="Reorder stanza">
        <button
          type="button"
          className="stanza-toolbar__reorder-btn"
          onClick={onMoveUp}
          disabled={stanzaIndex === 0}
          aria-label={`Move stanza ${stanzaIndex + 1} up`}
          title="Move up (keyboard operable)"
        >
          ▲
        </button>
        <button
          type="button"
          className="stanza-toolbar__reorder-btn"
          onClick={onMoveDown}
          disabled={stanzaIndex === totalStanzas - 1}
          aria-label={`Move stanza ${stanzaIndex + 1} down`}
          title="Move down (keyboard operable)"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
