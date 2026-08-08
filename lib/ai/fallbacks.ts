import type { Cluster, Fragment, PieceSegment } from "@/types/domain";

import { jaccardSimilarity } from "./similarity";
import type {
  ConstellationResult,
  FidelityResult,
  MomentumResult,
  ShipResult,
} from "./schemas";

/**
 * The zero-AI paths that guarantee the demo cannot break. Every function
 * here is PURE (same input → same output) and fast (<5ms) — no wall-clock
 * reads, no randomness — so results are stable across repeat demo runs and
 * downstream UI never needs to know or care which path produced them.
 */

// ---------------------------------------------------------------------------
// Constellation — deterministic clustering by keyword overlap.
// ---------------------------------------------------------------------------

const SIMILARITY_THRESHOLD = 0.15;
const COUNT_SATURATION = 5; // 5+ fragments in a cluster = max "count" score
const LENGTH_SATURATION = 90; // 90+ avg chars = max "length" score
const READINESS_WEIGHTS = { count: 0.45, length: 0.35, recency: 0.2 } as const;

interface WorkingCluster {
  fragmentIds: string[];
  texts: string[];
}

function deriveLabel(firstFragmentText: string): string {
  const words = firstFragmentText.trim().split(/\s+/).filter(Boolean);
  const head = words.slice(0, 5).join(" ");
  return words.length > 5 ? `${head}…` : head || "Untitled fragment";
}

function readinessReasonFor(score: number): string {
  if (score >= 75) return "Several connected fragments — this idea already has a shape.";
  if (score >= 50) return "A clear thread is forming here — a little more would finish it.";
  if (score >= 25) return "The beginning of something — worth returning to.";
  return "A single spark, not yet connected to anything else.";
}

function suggestedFormsFor(fragmentCount: number): string[] {
  if (fragmentCount === 1) return ["A short poem"];
  if (fragmentCount === 2) return ["A short poem", "A reflective paragraph"];
  return ["A short poem", "A reflective paragraph", "A structured list"];
}

/**
 * Computed relative only to the batch of fragments passed in (never to
 * `Date.now()`), so the function stays pure — the same flood always scores
 * the same way, regardless of when it's re-run.
 */
function computeReadiness(members: Fragment[], allFragments: Fragment[]): number {
  const count = members.length;
  const avgLength = members.reduce((sum, f) => sum + f.text.length, 0) / count;
  const mostRecent = Math.max(...members.map((f) => f.createdAt));

  const allTimestamps = allFragments.map((f) => f.createdAt);
  const globalMax = Math.max(...allTimestamps);
  const globalMin = Math.min(...allTimestamps);
  const span = globalMax - globalMin;

  const countScore = Math.min(count / COUNT_SATURATION, 1);
  const lengthScore = Math.min(avgLength / LENGTH_SATURATION, 1);
  const recencyScore = span === 0 ? 0.5 : (mostRecent - globalMin) / span;

  const combined =
    countScore * READINESS_WEIGHTS.count +
    lengthScore * READINESS_WEIGHTS.length +
    recencyScore * READINESS_WEIGHTS.recency;

  return Math.round(combined * 100);
}

/**
 * Groups fragments by Jaccard token-overlap (threshold 0.15) — no external
 * NLP, no model call. Any fragment that matches no existing cluster well
 * enough starts its own.
 *
 * @example
 *   // Verified output — see .scratch-verify pattern in Phase 2 notes if you
 *   // change the scoring weights and need to re-derive these numbers.
 *   fallbackConstellation([
 *     { id: "f1", text: "the blue train still comes", createdAt: 1000, mode: "text", abandoned: false, clusterId: null },
 *     { id: "f2", text: "the blue train arrives every midnight", createdAt: 2000, mode: "text", abandoned: false, clusterId: null },
 *     { id: "f3", text: "recipe idea lemon cake", createdAt: 3000, mode: "text", abandoned: true, clusterId: null },
 *   ])
 *   // => {
 *   //   clusters: [
 *   //     { id: "cluster_1", label: "the blue train still comes", fragmentIds: ["f1","f2"], readiness: 40, readinessReason: "The beginning of something — worth returning to.", suggestedForms: ["A short poem", "A reflective paragraph"] },
 *   //     { id: "cluster_2", label: "recipe idea lemon cake", fragmentIds: ["f3"], readiness: 38, readinessReason: "The beginning of something — worth returning to.", suggestedForms: ["A short poem"] },
 *   //   ],
 *   // }
 *   // (f1/f2 share "blue" and "train" after stopword-stripping — Jaccard
 *   // 0.286, clearing the 0.15 threshold; f3 shares nothing with either.)
 */
export function fallbackConstellation(fragments: Fragment[]): ConstellationResult {
  if (fragments.length === 0) {
    return { clusters: [] };
  }

  const clusters: WorkingCluster[] = [];

  for (const fragment of fragments) {
    let bestCluster: WorkingCluster | null = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      const score = Math.max(
        ...cluster.texts.map((text) => jaccardSimilarity(fragment.text, text)),
      );
      if (score > bestScore) {
        bestScore = score;
        bestCluster = cluster;
      }
    }

    if (bestCluster && bestScore >= SIMILARITY_THRESHOLD) {
      bestCluster.fragmentIds.push(fragment.id);
      bestCluster.texts.push(fragment.text);
    } else {
      clusters.push({ fragmentIds: [fragment.id], texts: [fragment.text] });
    }
  }

  const fragmentById = new Map(fragments.map((f) => [f.id, f] as const));

  return {
    clusters: clusters.map((cluster, index) => {
      const members = cluster.fragmentIds
        .map((id) => fragmentById.get(id))
        .filter((f): f is Fragment => f !== undefined);
      const readiness = computeReadiness(members, fragments);
      const firstText = cluster.texts[0] ?? "";

      return {
        id: `cluster_${index + 1}`,
        label: deriveLabel(firstText),
        fragmentIds: cluster.fragmentIds,
        readiness,
        readinessReason: readinessReasonFor(readiness),
        suggestedForms: suggestedFormsFor(cluster.fragmentIds.length),
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Fidelity — pure bookkeeping, no heuristic guessing needed.
// ---------------------------------------------------------------------------

/**
 * Counts origin:"captured" vs origin:"invented" directly from the segments
 * that were actually assembled into the draft. Fidelity is a bookkeeping
 * problem, not a generation problem — Phase 5 may make this the *only*
 * path (no AI call at all) for exactly that reason.
 *
 * @example
 *   fallbackFidelity([
 *     [{ text: "the city ", origin: "invented" }, { text: "forgets", origin: "captured", sourceFragmentId: "f1" }],
 *     [{ text: "I remember", origin: "captured", sourceFragmentId: "f2" }],
 *   ])
 *   // => {
 *   //   captured: 2,
 *   //   invented: 1,
 *   //   segments: [
 *   //     { text: "the city ", origin: "invented" },
 *   //     { text: "forgets", origin: "captured" },
 *   //     { text: "I remember", origin: "captured" },
 *   //   ],
 *   // }
 */
export function fallbackFidelity(stanzas: PieceSegment[][]): FidelityResult {
  const segments = stanzas.flat();
  let captured = 0;
  let invented = 0;

  for (const segment of segments) {
    if (segment.origin === "captured") captured += 1;
    else invented += 1;
  }

  return {
    captured,
    invented,
    segments: segments.map((segment) => ({
      text: segment.text,
      origin: segment.origin,
    })),
  };
}

// ---------------------------------------------------------------------------
// Momentum — a fixed, well-written set of 3 forms, label-interpolated.
// ---------------------------------------------------------------------------

/**
 * @example
 *   // Verified output, using the cluster_1 result from fallbackConstellation's example above:
 *   fallbackMomentum({
 *     id: "cluster_1", label: "the blue train still comes", fragmentIds: ["f1", "f2"],
 *     readiness: 40, readinessReason: "The beginning of something — worth returning to.",
 *     suggestedForms: ["A short poem", "A reflective paragraph"],
 *   })
 *   // => {
 *   //   options: [
 *   //     { form: "Poem", pitch: "A short poem built from your strongest lines about the blue train still comes." },
 *   //     { form: "Reflective Paragraph", pitch: "A reflective paragraph connecting your fragments on the blue train still comes." },
 *   //     { form: "Structured List", pitch: "A structured list capturing each idea about the blue train still comes on its own." },
 *   //   ],
 *   // }
 */
export function fallbackMomentum(cluster: Cluster): MomentumResult {
  const label = cluster.label;
  return {
    options: [
      {
        form: "Poem",
        pitch: `A short poem built from your strongest lines about ${label}.`,
      },
      {
        form: "Reflective Paragraph",
        pitch: `A reflective paragraph connecting your fragments on ${label}.`,
      },
      {
        form: "Structured List",
        pitch: `A structured list capturing each idea about ${label} on its own.`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Ship — assembled directly from the creator's own words, zero invention.
// ---------------------------------------------------------------------------

/**
 * Every segment's origin is "captured" here — this is philosophically
 * correct for the product, not just a fallback: it proves the tool works
 * with zero invented words, one fragment per stanza, in the order given.
 *
 * @example
 *   // Verified output, using the cluster_1 result from fallbackConstellation's example above:
 *   fallbackShip(
 *     { id: "cluster_1", label: "the blue train still comes", fragmentIds: ["f1", "f2"], readiness: 40, readinessReason: "...", suggestedForms: [] },
 *     [
 *       { id: "f1", text: "the blue train still comes", createdAt: 1000, mode: "text", abandoned: false, clusterId: "cluster_1" },
 *       { id: "f2", text: "the blue train arrives every midnight", createdAt: 2000, mode: "text", abandoned: false, clusterId: "cluster_1" },
 *     ],
 *   )
 *   // => {
 *   //   title: "the blue train still comes",
 *   //   stanzas: [
 *   //     [{ text: "the blue train still comes", origin: "captured", sourceFragmentId: "f1" }],
 *   //     [{ text: "the blue train arrives every midnight", origin: "captured", sourceFragmentId: "f2" }],
 *   //   ],
 *   // }
 */
// `form` isn't taken as a parameter: the deterministic path always lays
// fragments out one-per-stanza regardless of the requested form, since
// reshaping text to fit a form is exactly the invention this path exists
// to avoid. Callers may still pass `form` through their own `fallback`
// closure for logging/telemetry — it just won't change this output.
export function fallbackShip(cluster: Cluster, fragments: Fragment[]): ShipResult {
  const fragmentById = new Map(fragments.map((f) => [f.id, f] as const));
  const members = cluster.fragmentIds
    .map((id) => fragmentById.get(id))
    .filter((f): f is Fragment => f !== undefined);

  return {
    title: cluster.label,
    stanzas: members.map((fragment) => [
      {
        text: fragment.text,
        origin: "captured" as const,
        sourceFragmentId: fragment.id,
      },
    ]),
  };
}
