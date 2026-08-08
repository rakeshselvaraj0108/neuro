import { Fragment } from "react";

import type { PieceSegment } from "@/types/domain";
import { isRuleStanza } from "@/lib/samplePiece";

import { Verbatim } from "./Verbatim";

interface PieceBodyProps {
  stanzas: PieceSegment[][];
}

interface LineSegment extends PieceSegment {
  key: string;
}

/**
 * Splits a stanza's segments on embedded `\n` boundaries so each visual line
 * of the poem becomes its own block-level element — proper line-break
 * semantics for a screen reader, rather than a run of `<br />` tags.
 */
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

/** Renders the poem body straight from `Piece.stanzas` — no inline JSX text. */
export function PieceBody({ stanzas }: PieceBodyProps) {
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
