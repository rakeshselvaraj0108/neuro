"use client";

import { Fragment, useState } from "react";
import type { PieceSegment } from "@/types/domain";
import { Verbatim } from "@/components/piece/Verbatim";
import { StanzaToolbar } from "@/components/piece/StanzaToolbar";
import { RefineInput } from "@/components/piece/RefineInput";

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
              <textarea
                key={`edit-${stanzaIndex}-${segIdx}`}
                className="editable-stanza__textarea"
                rows={Math.max(1, segment.text.split("\n").length)}
                value={segment.text}
                onChange={(e) => onEditLine(segIdx, e.target.value)}
                aria-label={`Edit line ${segIdx + 1} of stanza ${stanzaIndex + 1}`}
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
