import type { ThemeKey } from "./themes";

const LEXICON: Record<ThemeKey, string[]> = {
  bloodmoon: [
    "dark", "night", "cold", "blood", "shadow", "loss", "grief", "storm",
    "ghost", "death", "flame", "void", "wild", "rage", "ash", "iron",
    "burn", "black", "wound", "smoke", "shatter", "broken",
  ],
  dawn: [
    "hope", "light", "warm", "sun", "morning", "bloom", "gold", "joy",
    "spring", "gentle", "rise", "soft", "heart", "tender", "promise",
    "bright", "shine", "day", "sweet", "love", "open", "breath",
  ],
  tide: [
    "sea", "water", "ocean", "wave", "rain", "river", "blue", "silence",
    "quiet", "wind", "memory", "drift", "deep", "echo", "sleep", "tide",
    "flow", "stream", "drown", "glass", "sky", "still",
  ],
  paper: [
    "letter", "essay", "prose", "note", "fragment", "word", "page",
    "ink", "write", "record", "paper", "archival", "line", "text",
  ],
};

export function suggestTheme(
  text: string,
  form?: string,
): { themeKey: ThemeKey; reason: string } {
  const lowerText = text.toLowerCase();
  const lowerForm = (form || "").toLowerCase();

  const scores: Record<ThemeKey, number> = {
    bloodmoon: 0,
    dawn: 0,
    tide: 0,
    paper: 0,
  };

  // Form weighting
  if (lowerForm.includes("letter") || lowerForm.includes("prose") || lowerForm.includes("note")) {
    scores.paper += 3;
  } else if (lowerForm.includes("hymn") || lowerForm.includes("song") || lowerForm.includes("couplet")) {
    scores.dawn += 2;
  } else if (lowerForm.includes("elegy") || lowerForm.includes("sonnet") || lowerForm.includes("haiku")) {
    scores.tide += 2;
  } else if (lowerForm.includes("poem") || lowerForm.includes("free verse")) {
    scores.bloodmoon += 1;
  }

  // Keyword scoring
  (Object.keys(LEXICON) as ThemeKey[]).forEach((key) => {
    LEXICON[key].forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        scores[key] += matches.length;
      }
    });
  });

  let maxKey: ThemeKey = "paper";
  let maxScore = -1;

  (Object.keys(scores) as ThemeKey[]).forEach((key) => {
    if (scores[key] > maxScore) {
      maxScore = scores[key];
      maxKey = key;
    }
  });

  // Default neutral to paper if no strong signal
  if (maxScore <= 0) {
    maxKey = "paper";
  }

  const reasons: Record<ThemeKey, string> = {
    bloodmoon: "This piece felt dark and defiant, so it's dressed in Blood Moon.",
    dawn: "This piece felt warm and hopeful, so it's dressed in Dawn.",
    tide: "This piece felt quiet and reflective, so it's dressed in Tide.",
    paper: "This piece has a clean, archival voice, so it's dressed in Paper Archive.",
  };

  return {
    themeKey: maxKey,
    reason: reasons[maxKey],
  };
}
