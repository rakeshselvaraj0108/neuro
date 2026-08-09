import { NextResponse } from "next/server";
import { z } from "zod";

import { fallbackShip } from "@/lib/ai/fallbacks";
import { runAgent } from "@/lib/ai/gateway";
import { buildShipPrompt } from "@/lib/ai/prompts";
import { ShipResultSchema } from "@/lib/ai/schemas";
import { ClusterSchema, FragmentsSchema, fragmentsForCluster } from "@/lib/ai/input";

export const dynamic = "force-dynamic";

function verifyAttribution(
  data: { title: string; stanzas: Array<Array<{ text: string; origin: "captured" | "invented"; sourceFragmentId?: string }>> },
  fragments: Array<{ id: string; text: string }>,
) {
  const sourceById = new Map(fragments.map((fragment) => [fragment.id, fragment.text]));
  return {
    ...data,
    stanzas: data.stanzas.map((stanza) =>
      stanza.map((segment) => {
        const source = segment.sourceFragmentId ? sourceById.get(segment.sourceFragmentId) : undefined;
        if (segment.origin === "captured" && source && source.includes(segment.text)) {
          return segment;
        }
        return { text: segment.text, origin: "invented" as const };
      }),
    ),
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
  const body = await parseBody<{ cluster?: unknown; fragments?: unknown; form?: unknown }>(request);
  const clusterResult = ClusterSchema.safeParse(body?.cluster);
  const fragmentsResult = FragmentsSchema.safeParse(body?.fragments);
  const formResult = z.string().trim().min(1).max(100).safeParse(body?.form ?? "Poem");
  if (!clusterResult.success || !fragmentsResult.success || !formResult.success) {
    return NextResponse.json({ error: "Invalid assembly request" }, { status: 400 });
  }
  const safeCluster = clusterResult.data;
  const fragments = fragmentsForCluster(safeCluster, fragmentsResult.data);
  if (fragments.length !== safeCluster.fragmentIds.length) {
    return NextResponse.json({ error: "Cluster references unknown fragments" }, { status: 400 });
  }
  const form = formResult.data;
  const prompt = buildShipPrompt(safeCluster, fragments, form);

  const result = await runAgent({
    task: "ship",
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    schema: ShipResultSchema,
    fallback: () => fallbackShip(safeCluster, fragments),
    maxTokens: 1000,
    temperature: 0.35,
  });

  return NextResponse.json({
    ...result,
    data: verifyAttribution(result.data, fragments),
  });
}
