/**
 * The single source of truth for whether the AI path is usable at all.
 *
 * Checks process.env for GEMINI_API_KEY, NVIDIA_API_KEY, OPENAI_API_KEY, or AI_API_KEY.
 * A missing or empty key never throws or crashes the server — it simply routes
 * to the deterministic fallback generators in lib/ai/fallbacks.ts.
 */
const rawKey =
  process.env.GEMINI_API_KEY ||
  process.env.NVIDIA_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.AI_API_KEY;

export const NVIDIA_API_KEY: string = typeof rawKey === "string" ? rawKey.trim() : "";

export const AI_ENABLED: boolean = NVIDIA_API_KEY.length > 0;
