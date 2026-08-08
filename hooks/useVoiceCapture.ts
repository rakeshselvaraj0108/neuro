"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAppStore } from "@/store/useAppStore";

/**
 * The Web Speech API has no official TS lib coverage (it's still
 * vendor-prefixed on most engines), so this is a deliberately minimal,
 * structurally-typed surface covering exactly what this hook uses — no
 * `any`, no dependency on an external types package.
 */
interface SpeechRecognitionResultItem {
  readonly transcript: string;
}
interface SpeechRecognitionResultEntry {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionResultItem;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResultEntry;
}
interface SpeechRecognitionResultEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** How long a pause has to be before a rambling voice session becomes one fragment. */
const SILENCE_COMMIT_MS = 1800;

export interface UseVoiceCaptureResult {
  isSupported: boolean;
  isListening: boolean;
  /** The still-unconfirmed tail of speech — render faint/italic, never committed as-is. */
  interimText: string;
  /** True once the user has been asked and said no. Never re-prompted automatically. */
  permissionDenied: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * Wraps the browser-native SpeechRecognition API. Voice and typed text share
 * the same `draftText` buffer in the store, so switching mid-thought never
 * loses anything: final speech segments are appended into `draftText` exactly
 * like keystrokes would be, and only the still-in-flight tail is tracked here
 * separately (as `interimText`) for live-preview styling.
 */
export function useVoiceCapture(): UseVoiceCaptureResult {
  const draftText = useAppStore((state) => state.draftText);
  const setDraftText = useAppStore((state) => state.setDraftText);
  const addFragment = useAppStore((state) => state.addFragment);
  const markAbandoned = useAppStore((state) => state.markAbandoned);

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFinalSinceCommitRef = useRef(false);
  const stoppedByUserRef = useRef(false);
  // Avoids stale closures inside the recognition event callbacks, which are
  // registered once per start() and outlive individual renders. Kept in sync
  // with the store's draftText below — important because draftText can also
  // be cleared from OUTSIDE this hook (e.g. CaptureDock's Enter/"Catch it"
  // commit while voice is still listening); without this sync the hook would
  // keep appending new speech onto text that's already been committed.
  const draftTextRef = useRef("");
  useEffect(() => {
    draftTextRef.current = draftText;
  }, [draftText]);

  useEffect(() => {
    setIsSupported(getSpeechRecognitionConstructor() !== null);
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const commitDraftAsVoiceFragment = useCallback(
    (options: { abandoned: boolean }) => {
      clearSilenceTimer();
      hasFinalSinceCommitRef.current = false;
      const text = draftTextRef.current.trim();
      setInterimText("");
      if (!text) return;

      const fragment = addFragment(text, "voice");
      if (fragment && options.abandoned) {
        markAbandoned(fragment.id);
      }
      draftTextRef.current = "";
      setDraftText("");
    },
    [addFragment, markAbandoned, setDraftText, clearSilenceTimer],
  );

  const scheduleSilenceCommit = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (hasFinalSinceCommitRef.current) {
        commitDraftAsVoiceFragment({ abandoned: false });
      }
    }, SILENCE_COMMIT_MS);
  }, [clearSilenceTimer, commitDraftAsVoiceFragment]);

  const stop = useCallback(() => {
    stoppedByUserRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor || recognitionRef.current) return;

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Hardcoded for now — real localization is future work once the product
    // supports more than one capture language.
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalAppend = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result?.[0]?.transcript ?? "";
        if (result?.isFinal) {
          finalAppend += (finalAppend ? " " : "") + transcript.trim();
        } else {
          interim += transcript;
        }
      }

      if (finalAppend) {
        const current = draftTextRef.current;
        const next = current ? `${current} ${finalAppend}` : finalAppend;
        draftTextRef.current = next;
        setDraftText(next);
        hasFinalSinceCommitRef.current = true;
        scheduleSilenceCommit();
      }

      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setPermissionDenied(true);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
      const wasStoppedByUser = stoppedByUserRef.current;
      stoppedByUserRef.current = false;
      recognitionRef.current = null;

      // Unexpected cutoff (tab lost focus, a speech-backend network hiccup,
      // etc.) with something unsaid still buffered: catch it as a valid,
      // if abandoned, fragment rather than silently dropping it.
      if (!wasStoppedByUser && draftTextRef.current.trim()) {
        commitDraftAsVoiceFragment({ abandoned: true });
      } else {
        setInterimText("");
      }
    };

    recognitionRef.current = recognition;
    stoppedByUserRef.current = false;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // start() throws if called while already starting/started — never
      // user-facing, the button simply stays in its current state.
      recognitionRef.current = null;
    }
  }, [clearSilenceTimer, commitDraftAsVoiceFragment, scheduleSilenceCommit, setDraftText]);

  // Stop listening (without triggering the abandoned-commit path) if the
  // component unmounts mid-session, e.g. the user navigates away.
  useEffect(
    () => () => {
      clearSilenceTimer();
      stoppedByUserRef.current = true;
      recognitionRef.current?.stop();
    },
    [clearSilenceTimer],
  );

  return { isSupported, isListening, interimText, permissionDenied, start, stop };
}
