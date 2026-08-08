/**
 * The single source of truth for whether the AI path is usable at all.
 *
 * A missing or empty key must never throw or crash the server — it must
 * simply disable the AI path so every consumer routes straight to the
 * deterministic fallback in lib/ai/fallbacks.ts. This file has no
 * dependencies and does no I/O, so importing it can never fail.
 */
const rawKey = process.env.NVIDIA_API_KEY;

export const NVIDIA_API_KEY: string = typeof rawKey === "string" ? rawKey.trim() : "";

export const AI_ENABLED: boolean = NVIDIA_API_KEY.length > 0;
