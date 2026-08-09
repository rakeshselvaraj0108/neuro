import { NextResponse } from "next/server";
import { z } from "zod";

import { fallbackShip } from "@/lib/ai/fallbacks";
import { runAgent } from "@/lib/ai/gateway";
import { buildShipPrompt } from "@/lib/ai/prompts";
import { ShipResultSchema, type ShipResult } from "@/lib/ai/schemas";
import { ClusterSchema, FragmentsSchema } from "@/lib/ai/input";
import { verifyPiece } from "@/lib/fidelity/verify";
import type { Cluster, Fragment } from "@/types/domain";

export const dynamic = "force-dynamic";

function textValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of ["text", "content", "value", "line"]) {
      const nested = textValue(record[key]);
      if (nested) return nested;
    }
  }
  return null;
}

function deriveLabel(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const head = words.slice(0, 5).join(" ");
  return words.length > 5 ? `${head}…` : head || "Untitled cluster";
}

function normalizeShipResult(
  data: Record<string, unknown>,
  fragments: Fragment[],
): ShipResult {
  const sourceById = new Map(fragments.map((fragment) => [fragment.id, fragment.text]));
  const sourceEntries = [...sourceById.entries()];
  const raw =
    data.stanzas ??
    data.paragraphs ??
    data.lines ??
    data.content ??
    data.text ??
    data.piece ??
    data.poem ??
    data.output;

  const rawStanzas = Array.isArray(raw)
    ? raw.map((stanza) =>
        Array.isArray(stanza)
          ? stanza
              .map(textValue)
              .filter((text): text is string => Boolean(text))
              .map((text) => ({ text }))
          : [{ text: textValue(stanza) ?? "" }],
      )
    : (textValue(raw) ?? "")
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((text) => [{ text }]);

  return {
    title:
      textValue(data.title ?? data.name) ??
      (fragments[0]?.text ? deriveLabel(fragments[0].text) : "Untitled piece"),
    stanzas: rawStanzas.map((stanza) =>
      stanza.map((segment) => {
        const matchingSource = sourceEntries.find(([, text]) => text.includes(segment.text));
        if (matchingSource && segment.text.trim()) {
          return {
            text: segment.text,
            origin: "captured" as const,
            sourceFragmentId: matchingSource[0],
          };
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
  const body = await parseBody<{
    clusterId?: unknown;
    cluster?: unknown;
    fragments?: unknown;
    form?: unknown;
  }>(request);

  const fragmentsResult = FragmentsSchema.safeParse(body?.fragments);
  const formResult = z.string().trim().min(1).max(100).safeParse(body?.form ?? "Poem");

  if (!fragmentsResult.success || !formResult.success) {
    return NextResponse.json({ error: "Invalid assembly request" }, { status: 400 });
  }

  const allFragments = fragmentsResult.data;
  const form = formResult.data;

  // Determine target cluster & clusterId
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

  // HARD CORRECTNESS REQUIREMENT: Filter fragments to ONLY those matching clusterId
  const targetFragments = allFragments.filter(
    (f) => f.clusterId === targetClusterId || (targetCluster && targetCluster.fragmentIds.includes(f.id)),
  );

  if (targetFragments.length === 0) {
    return NextResponse.json({ error: "No fragments found for cluster" }, { status: 400 });
  }

  if (!targetCluster) {
    targetCluster = {
      id: targetClusterId,
      label: targetFragments[0]?.text ? deriveLabel(targetFragments[0].text) : "Untitled cluster",
      fragmentIds: targetFragments.map((f) => f.id),
      readiness: 100,
      readinessReason: "Ready to finish",
      suggestedForms: [form],
    };
  }

  const finalCluster = targetCluster;
  const prompt = buildShipPrompt(finalCluster, targetFragments, form);

  const agentResult = await runAgent({
    task: "ship",
    systemPrompt: prompt.system,
    userPrompt: prompt.user,
    schema: ShipResultSchema,
    fallback: () => fallbackShip(finalCluster, targetFragments) as unknown as Record<string, unknown>,
    maxTokens: 420,
    temperature: 0.55,
  });

  const rawDraft = normalizeShipResult(agentResult.data as Record<string, unknown>, targetFragments);

  // Independent code verification: pass raw draft through verifyPiece BEFORE responding
  const verifiedResult = verifyPiece(rawDraft, targetFragments);

  return NextResponse.json({
    piece: verifiedResult,
    source: agentResult.source,
  });
}
