"use client";

import { Fragment, useRef, useState } from "react";
import type { PieceSegment } from "@/types/domain";
import { isRuleStanza } from "@/lib/samplePiece";
import { Verbatim } from "./Verbatim";
import { EditableStanza } from "./EditableStanza";
import { Portal } from "@/components/ui/Portal";
import { Toast } from "@/components/ui/Toast";
import { useAppStore } from "@/store/useAppStore";

type PieceToastKind = "removed" | "offline";
interface PieceToastState {
  kind: PieceToastKind;
  key: number;
}

const TOAST_COPY: Record<PieceToastKind, string> = {
  removed: "Stanza removed",
  offline: "Couldn't reshape that offline — your original is untouched",
};

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
  const undoLastPieceChange = useAppStore((state) => state.undoLastPieceChange);

  // Reuses the exact Phase 3 Toast + undo pattern, per spec — not a new
  // notification mechanism. One shared toast slot: a removal and an
  // offline-refine note are both rare, brief, single-purpose interruptions,
  // never expected to overlap in practice.
  const [toast, setToast] = useState<PieceToastState | null>(null);
  const toastKeyRef = useRef(0);

  const showToast = (kind: PieceToastKind): void => {
    toastKeyRef.current += 1;
    setToast({ kind, key: toastKeyRef.current });
  };

  const handleRemoveStanza = (stanzaIndex: number): void => {
    removeStanza(stanzaIndex);
    showToast("removed");
  };

  const handleUndoFromToast = (): void => {
    undoLastPieceChange();
    setToast(null);
  };

  const handleRefineStanza = async (stanzaIndex: number, instruction: string): Promise<void> => {
    const result = await refineStanza(stanzaIndex, instruction);
    if (!result.success) {
      // The store's refineStanza only ever fails with isOffline: true (a
      // genuine mid-flight fetch throw is caught and reported the same
      // way) — treat any failure here as the calm offline note, and the
      // stanza itself is guaranteed untouched since the store never
      // applies a partial/failed result.
      showToast("offline");
    }
  };

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
              onRemoveStanza={() => handleRemoveStanza(stanzaIndex)}
              onMoveUp={() => reorderStanza(stanzaIndex, stanzaIndex - 1)}
              onMoveDown={() => reorderStanza(stanzaIndex, stanzaIndex + 1)}
              onRefineStanza={(instruction) => handleRefineStanza(stanzaIndex, instruction)}
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

      {/* Portal-ed for the same reason as Phase 3's FloodScreen toast: the
          orchestrator's screen-crossfade wrapper animates via transform,
          which silently breaks position:fixed on a non-portaled descendant. */}
      <Portal>
        <Toast
          open={toast !== null}
          message={toast ? TOAST_COPY[toast.kind] : ""}
          actionLabel={toast?.kind === "removed" ? "Undo" : undefined}
          onAction={toast?.kind === "removed" ? handleUndoFromToast : undefined}
          onDismiss={() => setToast(null)}
          resetKey={toast?.key}
        />
      </Portal>
    </div>
  );
}
