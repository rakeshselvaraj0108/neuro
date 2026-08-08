import { NextResponse } from "next/server";
import { z } from "zod";

import * as cache from "@/lib/ai/cache";
import * as circuitBreaker from "@/lib/ai/circuitBreaker";
import { AI_ENABLED } from "@/lib/ai/env";
import { runAgent } from "@/lib/ai/gateway";

/**
 * Diagnostic-only route: proves the entire gateway path end-to-end against
 * the real NVIDIA endpoint (when a key is present) for at most one credit,
 * or proves the fallback path resolves cleanly (when it isn't). Hitting
 * this in a browser is the fastest way to confirm real connectivity before
 * building anything on top of it.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await runAgent({
    task: "health",
    systemPrompt: 'Reply with {"ok":true}',
    userPrompt: "ping",
    schema: z.object({ ok: z.literal(true) }),
    fallback: () => ({ ok: true as const }),
    maxTokens: 20,
    temperature: 0,
  });

  return NextResponse.json({
    aiEnabled: AI_ENABLED,
    circuitBreakerOpen: circuitBreaker.isOpen(),
    cacheSize: cache.getCacheSize(),
    requestCount: cache.getRequestCount(),
    source: result.source,
    latencyMs: result.latencyMs,
  });
}
