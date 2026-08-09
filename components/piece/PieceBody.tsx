"use client";

import { Fragment } from "react";
import type { PieceSegment } from "@/types/domain";
import { isRuleStanza } from "@/lib/samplePiece";
import { Verbatim } from "./Verbatim";
import { EditableStanza } from "./EditableStanza";
import { useAppStore } from "@/store/useAppStore";

interface PieceBodyProps {
  stanzas: PieceSegment[][];
}

interface LineSegment extends PieceSegment {
  key: string;
}

function toLines(stanza: PieceSegment[], stanzaIndex: number): LineSegment[][] {
  const lines: LineSegment[][] = [[]];

  stanza.forEach((segment, segmentIndex) => {
    const parts = segment.text.split("\n");
    parts.forEach((part, partIndex) => {
      if (partIndex > 0) lines.push([]);
      if (part.length === 0) return;
      const line = lines[lines.length - 1];
      if (!line) return;
      line.push({
        ...segment,
        text: part,
        key: `s${stanzaIndex}-f${segmentIndex}-l${partIndex}`,
      });
    });
  });

  return lines;
}

export function PieceBody({ stanzas }: PieceBodyProps) {
  const editMode = useAppStore((state) => state.editMode);
  const refiningStanzaIndex = useAppStore((state) => state.refiningStanzaIndex);
  const editStanzaLine = useAppStore((state) => state.editStanzaLine);
  const removeStanza = useAppStore((state) => state.removeStanza);
  const reorderStanza = useAppStore((state) => state.reorderStanza);
  const refineStanza = useAppStore((state) => state.refineStanza);

  return (
    <div className="piece-body">
      {stanzas.map((stanza, stanzaIndex) => {
        if (isRuleStanza(stanza)) {
          return (
            <hr
              key={`rule-${stanzaIndex}`}
              className="stanza-rule"
              aria-hidden="true"
            />
          );
        }

        if (editMode) {
          return (
            <EditableStanza
              key={`stanza-edit-${stanzaIndex}`}
              stanza={stanza}
              stanzaIndex={stanzaIndex}
              totalStanzas={stanzas.length}
              editMode={editMode}
              isRefining={refiningStanzaIndex === stanzaIndex}
              onEditLine={(segmentIndex, newText) => editStanzaLine(stanzaIndex, segmentIndex, newText)}
              onRemoveStanza={() => removeStanza(stanzaIndex)}
              onMoveUp={() => reorderStanza(stanzaIndex, stanzaIndex - 1)}
              onMoveDown={() => reorderStanza(stanzaIndex, stanzaIndex + 1)}
              onRefineStanza={(instruction) => {
                void refineStanza(stanzaIndex, instruction);
                return Promise.resolve();
              }}
            />
          );
        }

        const lines = toLines(stanza, stanzaIndex);

        return (
          <p key={`stanza-${stanzaIndex}`} className="piece-stanza">
            {lines.map((line, lineIndex) => (
              <span key={`line-${stanzaIndex}-${lineIndex}`} className="piece-line">
                {line.map((segment) =>
                  segment.origin === "captured" ? (
                    <Verbatim key={segment.key}>{segment.text}</Verbatim>
                  ) : (
                    <Fragment key={segment.key}>{segment.text}</Fragment>
                  ),
                )}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
