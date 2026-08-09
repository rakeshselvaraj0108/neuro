import { NextResponse } from "next/server";

import { ConstellationResultSchema } from "@/lib/ai/schemas";
import { buildConstellationPrompt } from "@/lib/ai/prompts";
import { fallbackConstellation, fallbackSingleCluster } from "@/lib/ai/fallbacks";
import { runAgent } from "@/lib/ai/gateway";
import { FragmentsSchema } from "@/lib/ai/input";

/** Below this, forcing an LLM to invent distinctions is worse than not asking. */
const MIN_FRAGMENTS_FOR_MODEL_CALL = 3;

export const dynamic = "force-dynamic";

function verifyClusters(
  data: { clusters: Array<{ id: string; label: string; fragmentIds: string[]; readiness: number; readinessReason: string; suggestedForms: string[] }> },
  fragments: Array<{ id: string; text: string; createdAt: number; mode: "text" | "voice"; abandoned: boolean; clusterId: string | null }>,
) {
  const knownIds = new Set(fragments.map((fragment) => fragment.id));
  const assigned = new Set<string>();
  const clusters = data.clusters.flatMap((cluster) => {
    const fragmentIds = cluster.fragmentIds.filter((id) => knownIds.has(id) && !assigned.has(id));
    fragmentIds.forEach((id) => assigned.add(id));
    return fragmentIds.length > 0 ? [{ ...cluster, fragmentIds }] : [];
  });
  const missing = fragments.filter((fragment) => !assigned.has(fragment.id));
  return {
    clusters: [...clusters, ...fallbackConstellation(missing).clusters],
  };
}

async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await parseBody<{ fragments?: unknown }>(request);
  const parsed = FragmentsSchema.safeParse(body?.fragments);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide 1 to 60 valid fragments" }, { status: 400 });
  }
  const fragments = parsed.data;

  // Cheap guard before ever reaching the network: a genuinely tiny flood
  // doesn't need — and is done a disservice by — an LLM inventing seams
  // between one or two sentences. No credit spent, no route-trip either.
  if (fragments.length < MIN_FRAGMENTS_FOR_MODEL_CALL) {
    return NextResponse.json({
      data: fallbackSingleCluster(fragments),
      source: "fallback" as const,
      latencyMs: 0,
    });
  }

  const prompt = buildConstellationPrompt(fragments);
  const result = await runAgent({
    task: "constellation",
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    schema: ConstellationResultSchema,
    fallback: () => fallbackConstellation(fragments),
    maxTokens: 900,
    temperature: 0.35,
  });

  return NextResponse.json({ ...result, data: verifyClusters(result.data, fragments) });
}
