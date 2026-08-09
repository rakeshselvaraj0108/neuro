"use client";

import { Fragment, useEffect, useState } from "react";
import type { PieceSegment } from "@/types/domain";
import { Verbatim } from "@/components/piece/Verbatim";
import { StanzaToolbar } from "@/components/piece/StanzaToolbar";
import { RefineInput } from "@/components/piece/RefineInput";

interface EditableSegmentFieldProps {
  text: string;
  label: string;
  onCommit: (newText: string) => void;
}

/**
 * Holds its own draft text while the user is typing — the store only ever
 * hears about a change on blur or Enter, per spec ("On blur or Enter,
 * commits via editStanzaLine"). Committing on every keystroke instead
 * (an earlier version of this component did, via a plain onChange handler)
 * silently breaks the one-level undo: editStanzaLine pushes a fresh undo
 * snapshot on every call, so undo would only ever restore the second-to-
 * last keystroke rather than the state before this edit began.
 */
function EditableSegmentField({ text, label, onCommit }: EditableSegmentFieldProps) {
  const [draft, setDraft] = useState(text);

  // If the underlying segment changes from outside this field (a refine,
  // an undo, a reorder touching this stanza), pick up the new value rather
  // than silently overwriting it on the next blur.
  useEffect(() => {
    setDraft(text);
  }, [text]);

  const commit = (): void => {
    if (draft !== text) onCommit(draft);
  };

  return (
    <textarea
      className="editable-stanza__textarea"
      rows={Math.max(1, draft.split("\n").length)}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          commit();
          event.currentTarget.blur();
        } else if (event.key === "Escape") {
          setDraft(text);
          event.currentTarget.blur();
        }
      }}
      aria-label={label}
    />
  );
}

interface EditableStanzaProps {
  stanza: PieceSegment[];
  stanzaIndex: number;
  totalStanzas: number;
  editMode: boolean;
  isRefining: boolean;
  onEditLine: (segmentIndex: number, newText: string) => void;
  onRemoveStanza: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRefineStanza: (instruction: string) => Promise<void>;
}

export function EditableStanza({
  stanza,
  stanzaIndex,
  totalStanzas,
  editMode,
  isRefining,
  onEditLine,
  onRemoveStanza,
  onMoveUp,
  onMoveDown,
  onRefineStanza,
}: EditableStanzaProps) {
  const [isEditingLines, setIsEditingLines] = useState(false);
  const [isReshaping, setIsReshaping] = useState(false);

  return (
    <div
      className={`editable-stanza ${editMode ? "editable-stanza--edit-mode" : ""} ${
        isRefining ? "editable-stanza--refining" : ""
      }`}
    >
      {editMode ? (
        <StanzaToolbar
          stanzaIndex={stanzaIndex}
          totalStanzas={totalStanzas}
          isEditingLines={isEditingLines}
          isReshaping={isReshaping}
          onToggleEditLines={() => {
            setIsEditingLines(!isEditingLines);
            if (isReshaping) setIsReshaping(false);
          }}
          onToggleReshape={() => {
            setIsReshaping(!isReshaping);
            if (isEditingLines) setIsEditingLines(false);
          }}
          onRemove={onRemoveStanza}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      ) : null}

      {isReshaping && editMode ? (
        <RefineInput
          stanzaIndex={stanzaIndex}
          isLoading={isRefining}
          onRefine={async (instruction) => {
            await onRefineStanza(instruction);
            setIsReshaping(false);
          }}
          onCancel={() => setIsReshaping(false)}
        />
      ) : null}

      <p className="piece-stanza">
        {stanza.map((segment, segIdx) => {
          if (isEditingLines && editMode) {
            return (
              <EditableSegmentField
                key={`edit-${stanzaIndex}-${segIdx}`}
                text={segment.text}
                label={`Edit line ${segIdx + 1} of stanza ${stanzaIndex + 1}`}
                onCommit={(newText) => onEditLine(segIdx, newText)}
              />
            );
          }

          return (
            <span key={`seg-${stanzaIndex}-${segIdx}`} className="piece-line">
              {segment.origin === "captured" ? (
                <Verbatim>{segment.text}</Verbatim>
              ) : (
                <Fragment>{segment.text}</Fragment>
              )}
            </span>
          );
        })}
      </p>

      {isRefining ? (
        <div className="stanza-shimmer-overlay" aria-live="polite">
          <span>Reshaping stanza…</span>
        </div>
      ) : null}
    </div>
  );
}
