import { NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/gateway";
import { buildRefinePrompt } from "@/lib/ai/prompts";
import { RefineResultSchema } from "@/lib/ai/schemas";
import { fallbackRefine } from "@/lib/ai/fallbacks";
import { buildNormalizedFragments, verifySegment } from "@/lib/fidelity/verify";
import type { Fragment, PieceSegment } from "@/types/domain";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stanza, instruction, clusterId, fragments } = body as {
      stanza?: PieceSegment[];
      instruction?: string;
      clusterId?: string;
      fragments?: Fragment[];
    };

    if (!stanza || !Array.isArray(stanza) || !instruction) {
      return NextResponse.json(
        { error: "Stanza array and instruction are required" },
        { status: 400 },
      );
    }

    const availableFragments = Array.isArray(fragments) ? fragments : [];
    const targetFragments = clusterId
      ? availableFragments.filter((f) => f.clusterId === clusterId)
      : availableFragments;

    const { system, user } = buildRefinePrompt(stanza, instruction);

    const result = await runAgent({
      task: "refine",
      systemPrompt: system,
      userPrompt: user,
      schema: RefineResultSchema,
      fallback: () => fallbackRefine(stanza),
    });

    if (result.source === "fallback" || ("isOffline" in result.data && result.data.isOffline)) {
      return NextResponse.json({
        segments: stanza,
        source: "fallback",
        isOffline: true,
      });
    }

    // Same classification Phase 5's initial generation and Phase 7's edit
    // re-verification use — a single-stanza refine is just verification
    // scoped to one stanza's worth of segments, not a separate algorithm.
    const normalizedFragments = buildNormalizedFragments(targetFragments);
    const verifiedSegments = result.data.segments.map((segment) =>
      verifySegment(segment, normalizedFragments),
    );

    return NextResponse.json({
      segments: verifiedSegments,
      source: result.source,
      isOffline: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process refine request" },
      { status: 500 },
    );
  }
}
