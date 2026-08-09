/**
 * Static lookup table deriving structural preview hints from form names.
 * Used locally on Momentum form cards without extra AI calls.
 */

const FORM_STRUCTURE_MAP: Record<string, string> = {
  poem: "short, line-broken, image-driven",
  "short poem": "short, line-broken, image-driven",
  verse: "short, line-broken, image-driven",
  essay: "a few flowing paragraphs",
  "reflective paragraph": "a few flowing paragraphs",
  "personal essay": "a few flowing paragraphs",
  prose: "a few flowing paragraphs",
  script: "spoken, with rhythm and pause",
  "spoken-word script": "spoken, with rhythm and pause",
  monologue: "spoken, with rhythm and pause",
  letter: "addressed, personal, direct tone",
  list: "stacked points, distinct thoughts",
  "structured list": "stacked points, distinct thoughts",
  bulletin: "stacked points, distinct thoughts",
  story: "scene-based, narrative arc",
  "micro-fiction scene": "scene-based, narrative arc",
  fiction: "scene-based, narrative arc",
};

export function getFormStructureHint(form: string): string {
  const normalized = form.trim().toLowerCase();
  if (FORM_STRUCTURE_MAP[normalized]) {
    return FORM_STRUCTURE_MAP[normalized];
  }
  for (const [key, hint] of Object.entries(FORM_STRUCTURE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return hint;
    }
  }
  return "structured creative form";
}
