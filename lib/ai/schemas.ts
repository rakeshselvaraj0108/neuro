import { z } from "zod";

/**
 * Zod schemas for every agent's output, aligned with the domain types in
 * types/domain.ts. These are the contract between the model path and the
 * fallback path — both must satisfy the exact same schema so downstream
 * code never needs to know which one ran.
 */

const SegmentOriginSchema = z.enum(["captured", "invented"]);

export const ConstellationResultSchema = z.object({
  clusters: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      fragmentIds: z.array(z.string()),
      readiness: z.number().min(0).max(100),
      readinessReason: z.string(),
      suggestedForms: z.array(z.string()).min(1).max(4),
    }),
  ),
});
export type ConstellationResult = z.infer<typeof ConstellationResultSchema>;

export const FidelityResultSchema = z.object({
  captured: z.number(),
  invented: z.number(),
  segments: z.array(
    z.object({
      text: z.string(),
      origin: SegmentOriginSchema,
    }),
  ),
});
export type FidelityResult = z.infer<typeof FidelityResultSchema>;

export const MomentumResultSchema = z.object({
  options: z
    .array(
      z.object({
        form: z.string(),
        pitch: z.string(),
      }),
    )
    .length(3),
});
export type MomentumResult = z.infer<typeof MomentumResultSchema>;

/**
 * NVIDIA models are JSON-mode compatible but don't all use the same field
 * names for a creative work. The route is the one canonical normalizer, so
 * accept a non-empty JSON object here rather than throwing away good prose
 * merely because it arrived as `poem`, `output`, or `lines`.
 */
export const ShipResultSchema = z.record(z.unknown()).refine(
  (value) => Object.keys(value).length > 0,
  "A finished piece is required",
);
export type ShipRawResult = z.infer<typeof ShipResultSchema>;

export interface ShipResult {
  title: string;
  stanzas: Array<Array<{ text: string; origin: z.infer<typeof SegmentOriginSchema>; sourceFragmentId?: string }>>;
}

export const RefineResultSchema = z.object({
  segments: z.array(
    z.object({
      text: z.string(),
      origin: SegmentOriginSchema,
      sourceFragmentId: z.string().optional(),
    }),
  ),
});
export type RefineResult = z.infer<typeof RefineResultSchema>;

