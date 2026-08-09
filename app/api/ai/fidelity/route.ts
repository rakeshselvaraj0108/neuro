import { NextResponse } from "next/server";
import { z } from "zod";

import { fallbackFidelity } from "@/lib/ai/fallbacks";

export const dynamic = "force-dynamic";

const StanzasSchema = z.array(
  z.array(
    z.object({
      text: z.string().max(4_000),
      origin: z.enum(["captured", "invented"]),
      sourceFragmentId: z.string().max(120).optional(),
    }),
  ).max(100),
).max(100);

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = z.object({ stanzas: StanzasSchema }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid piece payload" }, { status: 400 });
    }

    // Origins are assigned during assembly. Counting them directly is more
    // truthful than asking another model to infer provenance from prose.
    return NextResponse.json({ data: fallbackFidelity(parsed.data.stanzas) });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
