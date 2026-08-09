import { NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/gateway";
import { buildRefinePrompt } from "@/lib/ai/prompts";
import { RefineResultSchema } from "@/lib/ai/schemas";
import { fallbackRefine } from "@/lib/ai/fallbacks";
import { computeSimilarity } from "@/lib/fidelity/verify";
import { normalizeText, wordsOf } from "@/lib/fidelity/normalize";
import type { Fragment, PieceSegment, SegmentOrigin } from "@/types/domain";

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

    const normalizedFragments = targetFragments.map((f) => ({
      id: f.id,
      normalized: normalizeText(f.text),
    }));

    const verifiedSegments = result.data.segments.map((segment) => {
      const wordCount = wordsOf(segment.text).length;
      let matchScore = 0;
      let matchedFragmentId: string | null = null;

      if (wordCount <= 4) {
        const normalizedSeg = normalizeText(segment.text);
        if (normalizedSeg.length > 0) {
          for (const frag of normalizedFragments) {
            if (frag.normalized.includes(normalizedSeg)) {
              matchScore = 1;
              matchedFragmentId = frag.id;
              break;
            }
          }
        }
      } else {
        for (const frag of normalizedFragments) {
          const score = computeSimilarity(segment.text, frag.normalized);
          if (score > matchScore) {
            matchScore = score;
            matchedFragmentId = frag.id;
          }
        }
      }

      const origin: SegmentOrigin = matchScore >= 0.72 ? "captured" : "invented";

      return {
        text: segment.text,
        origin,
        sourceFragmentId: origin === "captured" ? (matchedFragmentId ?? segment.sourceFragmentId) : undefined,
        matchScore,
        matchedFragmentId,
      };
    });

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
