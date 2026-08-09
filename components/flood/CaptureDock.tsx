"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useVoiceCapture } from "@/hooks/useVoiceCapture";
import { useAppStore } from "@/store/useAppStore";
import type { CaptureMode } from "@/types/domain";

import { VoiceToggle } from "./VoiceToggle";
import { Toast } from "@/components/ui/Toast";

const CHECKPOINT_INTERVAL_MS = 4000;
const DESKTOP_BREAKPOINT_PX = 768;

export function CaptureDock() {
  const draftText = useAppStore((state) => state.draftText);
  const setDraftText = useAppStore((state) => state.setDraftText);
  const addFragment = useAppStore((state) => state.addFragment);
  const updateFragmentText = useAppStore((state) => state.updateFragmentText);
  const fragmentCount = useAppStore((state) => state.fragments.length);
  const setView = useAppStore((state) => state.setView);

  const voice = useVoiceCapture();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const checkpointIdRef = useRef<string | null>(null);
  const draftModeRef = useRef<CaptureMode>("text");
  const [counterPulse, setCounterPulse] = useState(false);
  const [parkedToastOpen, setParkedToastOpen] = useState(false);
  const [parkedToastKey, setParkedToastKey] = useState<number>(0);
  const previousCountRef = useRef(fragmentCount);

  // Desktop only auto-focus
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT_PX) {
      textareaRef.current?.focus();
    }
  }, []);

  // Voice permission fallback focus
  useEffect(() => {
    if (voice.permissionDenied) {
      textareaRef.current?.focus();
    }
  }, [voice.permissionDenied]);

  // Auto-grow height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draftText]);

  // Count pulse animation
  useEffect(() => {
    if (fragmentCount === previousCountRef.current) return;
    previousCountRef.current = fragmentCount;
    setCounterPulse(true);
    const timer = setTimeout(() => setCounterPulse(false), 200);
    return () => clearTimeout(timer);
  }, [fragmentCount]);

  // Track voice contribution
  useEffect(() => {
    if (voice.isListening) draftModeRef.current = "voice";
  }, [voice.isListening]);

  const resetDraftBookkeeping = useCallback(() => {
    checkpointIdRef.current = null;
    draftModeRef.current = "text";
  }, []);

  const commitDraft = useCallback(() => {
    const text = draftText.trim();
    if (!text) {
      resetDraftBookkeeping();
      textareaRef.current?.focus();
      return;
    }
    const isLocked = useAppStore.getState().scopeLocked;
    if (checkpointIdRef.current) {
      updateFragmentText(checkpointIdRef.current, text);
    } else {
      addFragment(text, draftModeRef.current);
    }
    if (isLocked) {
      setParkedToastOpen(true);
      setParkedToastKey(Date.now());
    }
    resetDraftBookkeeping();
    setDraftText("");
    // Keep focus active in input box for rapid consecutive captures
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 10);
  }, [draftText, addFragment, updateFragmentText, setDraftText, resetDraftBookkeeping]);

  // 4-second checkpoint
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useAppStore.getState();
      const text = state.draftText.trim();
      if (!text) return;
      if (checkpointIdRef.current) {
        state.updateFragmentText(checkpointIdRef.current, text);
      } else {
        const fragment = state.addFragment(text, draftModeRef.current);
        if (fragment) checkpointIdRef.current = fragment.id;
      }
    }, CHECKPOINT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        commitDraft();
        if (fragmentCount + (draftText.trim() ? 1 : 0) >= 1) {
          setView("constellation");
        }
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        commitDraft();
      }
    },
    [commitDraft, fragmentCount, draftText, setView],
  );

  const handleBlur = useCallback(() => {
    if (draftText.trim()) commitDraft();
  }, [draftText, commitDraft]);

  const handleVoiceToggle = useCallback(() => {
    if (voice.isListening) voice.stop();
    else voice.start();
  }, [voice]);

  const showNote = !voice.isSupported || voice.permissionDenied;

  return (
    <div className="capture-dock">
      <div className="capture-surface" onClick={() => textareaRef.current?.focus()}>
        <div className="capture-field">
          <textarea
            ref={textareaRef}
            className="capture-field__input"
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Say it. Type it. Don't polish it."
            aria-label="Capture a fragment"
            data-voice-active={voice.isListening}
            rows={1}
          />
          {voice.isListening ? (
            <div className="capture-field__overlay" aria-hidden="true">
              {draftText}
              {draftText && voice.interimText ? " " : ""}
              <span className="capture-field__interim">{voice.interimText}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="capture-controls">
        {voice.isSupported ? (
          <VoiceToggle isListening={voice.isListening} onToggle={handleVoiceToggle} />
        ) : (
          <span />
        )}

        <span className="capture-counter" aria-live="polite">
          <motion.span
            animate={counterPulse ? { scale: [1, 1.16, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: "inline-block" }}
          >
            {fragmentCount}
          </motion.span>{" "}
          {fragmentCount === 1 ? "idea" : "ideas"} caught
        </span>

        <button
          type="button"
          className="catch-it-button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={commitDraft}
        >
          Catch it
        </button>
      </div>

      {showNote ? (
        <p className="capture-note">
          Voice capture works best in Chrome or Edge — text works everywhere.
        </p>
      ) : null}

      <Toast
        open={parkedToastOpen}
        message="Caught and saved for later — not added to the piece you're finishing."
        onDismiss={() => setParkedToastOpen(false)}
        resetKey={parkedToastKey}
      />
    </div>
  );
}
