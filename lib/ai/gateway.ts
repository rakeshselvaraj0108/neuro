import { createHash } from "crypto";

import OpenAI from "openai";
import type { z } from "zod";

import * as cache from "./cache";
import * as circuitBreaker from "./circuitBreaker";
import { AI_ENABLED, NVIDIA_API_KEY } from "./env";
import { logAgentCall, type AgentSource } from "./telemetry";

/**
 * The single AI gateway. No file anywhere else in the project may import
 * the `openai` package or call NVIDIA directly — every AI interaction in
 * every phase goes through `runAgent`.
 *
 * The overriding design constraint: `runAgent` NEVER throws. It always
 * resolves with a valid AgentResult, falling all the way back to a
 * deterministic, caller-supplied generator if the network, the model, or
 * validation fails at any point.
 */

export type AgentTask = "constellation" | "fidelity" | "momentum" | "ship" | "health" | "refine";

export interface AgentResult<T> {
  data: T;
  source: AgentSource;
  latencyMs: number;
  /** Safe provider diagnostic for local health checks; never contains creator content. */
  providerError: string | null;
}

interface RunAgentInput<T> {
  task: AgentTask;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  /** Deterministic generator — see lib/ai/fallbacks.ts. Never receives a real input; the caller closes over whatever it needs. */
  fallback: (input: unknown) => T;
  maxTokens?: number;
  temperature?: number;
}

const BASE_URL = "https://integrate.api.nvidia.com/v1";
// The 8B instruction model has materially better interactive latency on the
// hosted NVIDIA endpoint. The larger 70B model remains available as a retry
// path when the primary provider request fails.
const PRIMARY_MODEL = "meta/llama-3.1-8b-instruct";
const FALLBACK_MODEL = "meta/llama-3.3-70b-instruct";
// NVIDIA's hosted models can take longer than a typical UI request on a cold
// start. Nine seconds made a valid configured key look broken and forced the
// product down the deterministic path before the provider could answer.
const TIMEOUT_MS = 35_000;
const DEFAULT_MAX_TOKENS = 900;
const DEFAULT_TEMPERATURE = 0.4;
const TEMPERATURE_DROP_ON_RETRY = 0.15;

const JSON_ONLY_SUFFIX =
  '\n\nRespond with ONLY a single valid JSON object. No markdown code fences, no prose before or after, no explanations. If you cannot comply with the schema, respond with {"error": true}.';

const SCHEMA_CORRECTION_MESSAGE =
  "Your previous response did not match the required JSON schema. Return ONLY corrected JSON.";

const CODE_FENCE_RE = /^```(?:json)?\s*|\s*```$/g;

let cachedClient: OpenAI | null = null;
let lastProviderError: string | null = null;

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 180);
  return "Unknown provider error";
}

/** Diagnostic metadata only: never includes prompt, response, or creator text. */
export function getLastProviderError(): string | null {
  return lastProviderError;
}

/** Constructed lazily — only ever reached once AI_ENABLED has been confirmed true. */
function getClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: NVIDIA_API_KEY, baseURL: BASE_URL });
  }
  return cachedClient;
}

function sha1(input: string): string {
  return createHash("sha1").update(input).digest("hex");
}

function stripCodeFences(raw: string): string {
  return raw.trim().replace(CODE_FENCE_RE, "").trim();
}

interface ParseResult<T> {
  ok: boolean;
  data?: T;
}

function tryParseAndValidate<T>(raw: string, schema: z.ZodType<T>): ParseResult<T> {
  try {
    const cleaned = stripCodeFences(raw);
    const json: unknown = JSON.parse(cleaned);
    const result = schema.safeParse(json);
    if (result.success) return { ok: true, data: result.data };
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

async function callModel(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
  extraUserMessage?: string;
}): Promise<string> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const messages = [
      { role: "system" as const, content: params.systemPrompt + JSON_ONLY_SUFFIX },
      { role: "user" as const, content: params.userPrompt },
      ...(params.extraUserMessage
        ? [{ role: "user" as const, content: params.extraUserMessage }]
        : []),
    ];

    const completion = await getClient().chat.completions.create(
      {
        model: params.model,
        messages,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        stream: false,
        response_format: { type: "json_object" },
      },
      { signal: controller.signal },
    );

    return completion.choices[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function finish<T>(
  task: AgentTask,
  start: number,
  data: T,
  source: AgentSource,
  success: boolean,
): AgentResult<T> {
  const latencyMs = Date.now() - start;
  logAgentCall({ task, source, latencyMs, success });
  return { data, source, latencyMs, providerError: source === "fallback" ? lastProviderError : null };
}

export async function runAgent<T>(input: RunAgentInput<T>): Promise<AgentResult<T>> {
  const start = Date.now();
  const {
    task,
    systemPrompt,
    userPrompt,
    schema,
    fallback,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
  } = input;

  try {
    // STEP 1 — cache check.
    const cacheKey = `${task}:${sha1(userPrompt)}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      lastProviderError = null;
      return finish(task, start, cached as T, "cache", true);
    }

    // STEP 2 + 3 — circuit breaker / AI disabled guard.
    if (!AI_ENABLED || circuitBreaker.isOpen()) {
      return finish(task, start, fallback(undefined), "fallback", true);
    }

    // STEP 4 — the actual call, with real resilience.
    try {
      cache.recordRequest();

      let content: string | null = null;
      let modelThatResponded = PRIMARY_MODEL;

      lastProviderError = null;
      try {
        content = await callModel({ model: PRIMARY_MODEL, systemPrompt, userPrompt, maxTokens, temperature });
      } catch (error) {
        lastProviderError = safeErrorMessage(error);
        // Network error, non-2xx, or the 9s timeout firing on the primary model.
        circuitBreaker.recordFailure();
        try {
          modelThatResponded = FALLBACK_MODEL;
          content = await callModel({ model: FALLBACK_MODEL, systemPrompt, userPrompt, maxTokens, temperature });
        } catch (fallbackError) {
          // Both models failed at the network level — give up on the network path.
          circuitBreaker.recordFailure();
          lastProviderError = safeErrorMessage(fallbackError);
          content = null;
        }
      }

      if (content !== null) {
        let parsed = tryParseAndValidate(content, schema);

        if (!parsed.ok) {
          try {
            const retryContent = await callModel({
              model: modelThatResponded,
              systemPrompt,
              userPrompt,
              maxTokens,
              temperature: Math.max(temperature - TEMPERATURE_DROP_ON_RETRY, 0),
              extraUserMessage: SCHEMA_CORRECTION_MESSAGE,
            });
            parsed = tryParseAndValidate(retryContent, schema);
          } catch (retryError) {
            lastProviderError = safeErrorMessage(retryError);
            parsed = { ok: false };
          }
        }

        if (parsed.ok && parsed.data !== undefined) {
          circuitBreaker.recordSuccess();
          cache.set(cacheKey, parsed.data);
          return finish(task, start, parsed.data, "model", true);
        }

        // Malformed JSON or schema mismatch survived the retry — treat as a failure.
        circuitBreaker.recordFailure();
      }
    } catch {
      // Absolute safety net around the network step — never let it escape.
      circuitBreaker.recordFailure();
    }

    // STEP 5 — deterministic fallback.
    return finish(task, start, fallback(undefined), "fallback", false);
  } catch {
    // Nothing above should reach here, but runAgent must never throw or
    // reject under any circumstance — resolve with the fallback path.
    return finish(task, start, input.fallback(undefined), "fallback", false);
  }
}
