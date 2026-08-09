export type ThemeName = "blood" | "safe";

export interface StoredPrefs {
  theme: ThemeName;
  dyslexiaFont: boolean;
}

export const PREFS_KEY = "ctf.prefs";

export function readStoredPrefs(): StoredPrefs {
  const fallback: StoredPrefs = { theme: "blood", dyslexiaFont: false };
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return fallback;

    const record = parsed as Record<string, unknown>;
    return {
      theme: record.theme === "safe" ? "safe" : "blood",
      dyslexiaFont: record.dyslexiaFont === true,
    };
  } catch {
    return fallback;
  }
}

export function writeStoredPrefs(prefs: StoredPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Private browsing or a full quota. Preferences simply stay session-only.
  }
}

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var r=document.documentElement;var s=localStorage.getItem(${JSON.stringify(
  PREFS_KEY,
)});var p=s?JSON.parse(s):{};r.setAttribute("data-theme",p&&p.theme==="safe"?"safe":"blood");r.setAttribute("data-font",p&&p.dyslexiaFont===true?"dyslexic":"default");}catch(e){}})();`;
