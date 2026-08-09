"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";

interface RefineInputProps {
  stanzaIndex: number;
  onRefine: (instruction: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function RefineInput({ stanzaIndex, onRefine, onCancel, isLoading }: RefineInputProps) {
  const [instruction, setInstruction] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isLoading) return;
    await onRefine(instruction.trim());
  };

  return (
    <form className="refine-input-form" onSubmit={handleSubmit}>
      <div className="refine-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="refine-input__field"
          placeholder="e.g. make this softer, or cut it to two lines"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isLoading}
          aria-label={`Instruction to reshape stanza ${stanzaIndex + 1}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
        />
        <button
          type="submit"
          className="refine-input__submit"
          disabled={!instruction.trim() || isLoading}
        >
          {isLoading ? "Reshaping…" : "Reshape"}
        </button>
        <button
          type="button"
          className="refine-input__cancel"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
