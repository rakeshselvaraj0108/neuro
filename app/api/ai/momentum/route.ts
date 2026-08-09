import { NextResponse } from "next/server";

import { fallbackMomentum } from "@/lib/ai/fallbacks";
import { runAgent } from "@/lib/ai/gateway";
import { buildMomentumPrompt } from "@/lib/ai/prompts";
import { MomentumResultSchema } from "@/lib/ai/schemas";
import { ClusterSchema, FragmentsSchema, fragmentsForCluster } from "@/lib/ai/input";

export const dynamic = "force-dynamic";

async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await parseBody<{ cluster?: unknown; fragments?: unknown }>(request);
  const clusterResult = ClusterSchema.safeParse(body?.cluster);
  const fragmentsResult = FragmentsSchema.safeParse(body?.fragments);
  if (!clusterResult.success || !fragmentsResult.success) {
    return NextResponse.json({ error: "Invalid cluster or fragments" }, { status: 400 });
  }
  const safeCluster = clusterResult.data;
  const fragments = fragmentsForCluster(safeCluster, fragmentsResult.data);
  if (fragments.length !== safeCluster.fragmentIds.length) {
    return NextResponse.json({ error: "Cluster references unknown fragments" }, { status: 400 });
  }
  const prompt = buildMomentumPrompt(safeCluster, fragments);

  const result = await runAgent({
    task: "momentum",
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    schema: MomentumResultSchema,
    fallback: () => fallbackMomentum(safeCluster),
    maxTokens: 600,
    temperature: 0.4,
  });

  return NextResponse.json(result);
}
