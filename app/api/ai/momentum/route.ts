import { NextResponse } from "next/server";

import { fallbackMomentum } from "@/lib/ai/fallbacks";
import { runAgent } from "@/lib/ai/gateway";
import { buildMomentumPrompt } from "@/lib/ai/prompts";
import { MomentumResultSchema, type MomentumResult } from "@/lib/ai/schemas";
import { ClusterSchema, FragmentsSchema } from "@/lib/ai/input";
import type { Cluster } from "@/types/domain";

export const dynamic = "force-dynamic";

function deriveLabel(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const head = words.slice(0, 5).join(" ");
  return words.length > 5 ? `${head}…` : head || "Untitled cluster";
}

function hasDuplicateForms(options: Array<{ form: string; pitch: string }>): boolean {
  if (!options || options.length < 2) return false;
  const normalized = options.map((opt) => opt.form.trim().toLowerCase());
  const unique = new Set(normalized);
  if (unique.size < normalized.length) return true;

  // Trivial variant check (e.g. "Poem" vs "A Poem" or "Short Poem")
  for (let i = 0; i < normalized.length; i += 1) {
    for (let j = i + 1; j < normalized.length; j += 1) {
      const optI = normalized[i];
      const optJ = normalized[j];
      if (!optI || !optJ) continue;
      const a = optI.replace(/^(a|an|the)\s+/, "");
      const b = optJ.replace(/^(a|an|the)\s+/, "");
      if (a === b) return true;
    }
  }
  return false;
}

async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await parseBody<{
    clusterId?: unknown;
    cluster?: unknown;
    fragments?: unknown;
    clusterLabel?: unknown;
  }>(request);

  const fragmentsResult = FragmentsSchema.safeParse(body?.fragments);
  if (!fragmentsResult.success) {
    return NextResponse.json({ error: "Invalid fragments" }, { status: 400 });
  }

  const allFragments = fragmentsResult.data;

  let targetClusterId: string | null = null;
  let targetCluster: Cluster | null = null;

  const parsedCluster = ClusterSchema.safeParse(body?.cluster);
  if (parsedCluster.success) {
    targetCluster = parsedCluster.data;
    targetClusterId = targetCluster.id;
  } else if (typeof body?.clusterId === "string" && body.clusterId.trim()) {
    targetClusterId = body.clusterId.trim();
  }

  if (!targetClusterId) {
    return NextResponse.json({ error: "Missing clusterId or cluster" }, { status: 400 });
  }

  // Filter fragments strictly to target cluster (hard isolation rule)
  const targetFragments = allFragments.filter(
    (f) => f.clusterId === targetClusterId || (targetCluster && targetCluster.fragmentIds.includes(f.id)),
  );

  if (targetFragments.length === 0) {
    return NextResponse.json({ error: "No fragments found for cluster" }, { status: 400 });
  }

  if (!targetCluster) {
    targetCluster = {
      id: targetClusterId,
      label: typeof body?.clusterLabel === "string" && body.clusterLabel.trim()
        ? body.clusterLabel.trim()
        : targetFragments[0]?.text
        ? deriveLabel(targetFragments[0].text)
        : "Untitled cluster",
      fragmentIds: targetFragments.map((f) => f.id),
      readiness: 100,
      readinessReason: "Ready to finish",
      suggestedForms: ["Poem", "Essay", "Script"],
    };
  }

  const finalCluster = targetCluster;
  const prompt = buildMomentumPrompt(finalCluster, targetFragments);

  const agentResult = await runAgent({
    task: "momentum",
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    schema: MomentumResultSchema,
    fallback: () => fallbackMomentum(finalCluster) as unknown as Record<string, unknown>,
    maxTokens: 300,
    temperature: 0.6,
  });

  let data = agentResult.data as MomentumResult;

  // Duplicate form post-check: enforce 3 genuinely distinct forms
  if (hasDuplicateForms(data?.options)) {
    // eslint-disable-next-line no-console
    console.warn(
      "[Momentum Route] Model returned duplicate or trivial variant form values. Discarding model result and triggering fallbackMomentum override.",
    );
    data = fallbackMomentum(finalCluster);
    return NextResponse.json({
      options: data.options,
      source: "fallback",
      overrideApplied: true,
    });
  }

  return NextResponse.json({
    options: data.options,
    source: agentResult.source,
  });
}
