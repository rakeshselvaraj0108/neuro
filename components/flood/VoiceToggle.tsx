"use client";

import { MicIcon } from "@/components/icons/MicIcon";

interface VoiceToggleProps {
  isListening: boolean;
  onToggle: () => void;
}

/**
 * 56px circular capture button. Idle is a solid --blood-core fill; listening
 * adds a soft breathing glow — the one Phase 1 motion-law exception (faster
 * than a 4s cycle) because it's live proof-of-life feedback, not decoration.
 * Reduced motion swaps the breathing animation for a plain solid-color state
 * change (handled in CSS via data-listening + the media query), never removes
 * the "I'm listening" signal entirely.
 */
export function VoiceToggle({ isListening, onToggle }: VoiceToggleProps) {
  return (
    <button
      type="button"
      className="voice-toggle"
      data-listening={isListening}
      aria-pressed={isListening}
      aria-label={isListening ? "Stop voice capture" : "Start voice capture"}
      onClick={onToggle}
    >
      <MicIcon size={22} />
    </button>
  );
}
