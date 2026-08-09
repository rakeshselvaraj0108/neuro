"use client";

import { useId } from "react";
import { getFormStructureHint } from "@/lib/momentum/formStructure";
import { FormGlyph } from "./FormGlyph";

export interface FormCardProps {
  form: string;
  pitch: string;
  index: number;
  isChosen: boolean;
  isUnchosen: boolean;
  isGenerating: boolean;
  onSelect: (form: string) => void;
}

export function FormCard({
  form,
  pitch,
  index,
  isChosen,
  isUnchosen,
  isGenerating,
  onSelect,
}: FormCardProps) {
  const cardId = useId();
  const hint = getFormStructureHint(form);
  const accessibleName = `Make it a ${form}: ${hint} — ${pitch}`;

  const handleClick = () => {
    if (!isGenerating && !isUnchosen) {
      onSelect(form);
    }
  };

  return (
    <div
      id={cardId}
      className={`form-card ${isChosen ? "form-card--chosen" : ""} ${
        isUnchosen ? "form-card--unchosen" : ""
      }`}
      data-chosen={isChosen}
      data-unchosen={isUnchosen}
    >
      <div className="form-card__bloom" aria-hidden="true" />
      <div className="form-card__content">
        <div className="form-card__glyph-wrapper">
          <FormGlyph form={form} size={40} />
          <span className="form-card__index-tag" aria-hidden="true">
            0{index + 1}
          </span>
        </div>

        <h3 className="form-card__title">{form}</h3>

        <p className="form-card__pitch">{pitch}</p>

        <span className="form-card__hint">{hint}</span>

        <div className="form-card__action">
          <button
            type="button"
            className="form-card__button"
            disabled={isGenerating || isUnchosen}
            onClick={handleClick}
            aria-label={accessibleName}
          >
            {isChosen ? "Weaving your words…" : `Make it a ${form} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
