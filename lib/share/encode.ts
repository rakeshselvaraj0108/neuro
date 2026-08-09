import LZString from "lz-string";
import type { Piece } from "@/types/domain";
import type { ThemeKey } from "@/lib/presentation/themes";

export interface MinimalSharePayload {
  t: string;
  s: { t: string; o: "captured" | "invented" }[][];
  f: { c: number; i: number };
  form: string;
  th: ThemeKey;
}

export interface DecodedSharedPiece {
  piece: Piece;
  themeKey: ThemeKey;
}

const MAX_SAFE_URL_LENGTH = 8000;

/**
 * Encodes a finished piece and active theme into a compressed URL fragment.
 * Uses lz-string's compressToEncodedURIComponent so it is safe for URL fragment (#).
 */
export function encodePieceToFragment(piece: Piece, themeKey: ThemeKey): string {
  const payload: MinimalSharePayload = {
    t: piece.title,
    s: piece.stanzas.map((stanza) =>
      stanza.map((seg) => ({
        t: seg.text,
        o: seg.origin,
      })),
    ),
    f: {
      c: piece.fidelity.captured,
      i: piece.fidelity.invented,
    },
    form: piece.form || "Poem",
    th: themeKey,
  };

  const jsonStr = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(jsonStr);
}

/**
 * Decodes a URL fragment (#...) back into a read-only Piece and ThemeKey.
 * Returns null safely if fragment is corrupt or invalid.
 */
export function decodeFragmentToPiece(fragment: string): DecodedSharedPiece | null {
  if (!fragment) return null;

  try {
    // Strip leading '#' if present
    const cleanFragment = fragment.startsWith("#") ? fragment.slice(1) : fragment;
    const jsonStr = LZString.decompressFromEncodedURIComponent(cleanFragment);

    if (!jsonStr) return null;

    const payload = JSON.parse(jsonStr) as MinimalSharePayload;

    if (!payload.t || !Array.isArray(payload.s) || !payload.f) {
      return null;
    }

    const reconstructedPiece: Piece = {
      id: `shared-${Date.now()}`,
      title: payload.t,
      form: payload.form || "Poem",
      stanzas: payload.s.map((stanza) =>
        stanza.map((seg) => ({
          text: seg.t,
          origin: seg.o,
          sourceFragmentId: seg.o === "captured" ? "__shared__" : undefined,
          matchScore: seg.o === "captured" ? 1.0 : 0.0,
        })),
      ),
      fidelity: {
        captured: payload.f.c ?? 0,
        invented: payload.f.i ?? 0,
      },
      lockedAt: Date.now(),
      journey: [
        { key: "flood", title: "Original Words", subtitle: `${payload.f.c} captured`, complete: true },
        { key: "finished", title: "Shared Piece", subtitle: `${payload.form}`, complete: true },
      ],
    };

    const validThemes: ThemeKey[] = ["bloodmoon", "dawn", "tide", "paper"];
    const themeKey: ThemeKey = validThemes.includes(payload.th) ? payload.th : "bloodmoon";

    return {
      piece: reconstructedPiece,
      themeKey,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to decode piece fragment:", err);
    return null;
  }
}

/**
 * Checks if the generated full URL length will be within safe limits (<= 8000 chars).
 */
export function isUrlLengthValid(piece: Piece, themeKey: ThemeKey, baseUrl = ""): boolean {
  const fragment = encodePieceToFragment(piece, themeKey);
  const fullLength = baseUrl.length + 3 + fragment.length; // /p#...
  return fullLength <= MAX_SAFE_URL_LENGTH;
}
