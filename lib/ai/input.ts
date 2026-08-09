import { z } from "zod";

import type { Cluster, Fragment } from "@/types/domain";

const MAX_FRAGMENTS = 60;
const MAX_FRAGMENT_LENGTH = 2_000;

const FragmentSchema = z.object({
  id: z.string().min(1).max(120),
  text: z.string().trim().min(1).max(MAX_FRAGMENT_LENGTH),
  createdAt: z.number().finite(),
  mode: z.enum(["text", "voice"]),
  abandoned: z.boolean(),
  clusterId: z.string().nullable(),
});

export const FragmentsSchema = z.array(FragmentSchema).min(1).max(MAX_FRAGMENTS);

export const ClusterSchema = z.object({
  id: z.string().min(1).max(120),
  label: z.string().trim().min(1).max(180),
  fragmentIds: z.array(z.string().min(1).max(120)).min(1).max(MAX_FRAGMENTS),
  readiness: z.number().min(0).max(100),
  readinessReason: z.string().trim().min(1).max(300),
  suggestedForms: z.array(z.string().trim().min(1).max(100)).min(1).max(4),
});

/** Returns only the creator's fragments belonging to the selected cluster. */
export function fragmentsForCluster(cluster: Cluster, fragments: Fragment[]): Fragment[] {
  const ids = new Set(cluster.fragmentIds);
  return fragments.filter((fragment) => ids.has(fragment.id));
}
