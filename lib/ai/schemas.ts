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

export const ShipResultSchema = z.object({
  title: z.string(),
  stanzas: z.array(
    z.array(
      z.object({
        text: z.string(),
        origin: SegmentOriginSchema,
        sourceFragmentId: z.string().optional(),
      }),
    ),
  ),
});
export type ShipResult = z.infer<typeof ShipResultSchema>;
