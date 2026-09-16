/**
 * KrushiSetu language catalogue + context-aware resolution.
 *
 * Priority chain (see README §i18n):
 *   1. explicit saved user preference (localStorage, namespaced)
 *   2. authenticated user's profile state  → regional language
 *   3. existing application location context
 *   4. browser language (fallback signal only)
 *   5. English
 */

export const LANGUAGES = [
  { code: "en", nativeName: "English", englishName: "English", dir: "ltr" },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi", dir: "ltr" },
  { code: "mr", nativeName: "मराठी", englishName: "Marathi", dir: "ltr" },
  { code: "bn", nativeName: "বাংলা", englishName: "Bengali", dir: "ltr" },
  { code: "te", nativeName: "తెలుగు", englishName: "Telugu", dir: "ltr" },
  { code: "ta", nativeName: "தமிழ்", englishName: "Tamil", dir: "ltr" },
  { code: "gu", nativeName: "ગુજરાતી", englishName: "Gujarati", dir: "ltr" },
  { code: "kn", nativeName: "ಕನ್ನಡ", englishName: "Kannada", dir: "ltr" },
  { code: "ml", nativeName: "മലയാളം", englishName: "Malayalam", dir: "ltr" },
  { code: "pa", nativeName: "ਪੰਜਾਬੀ", englishName: "Punjabi", dir: "ltr" },
  { code: "or", nativeName: "ଓଡ଼ିଆ", englishName: "Odia", dir: "ltr" },
  { code: "as", nativeName: "অসমীয়া", englishName: "Assamese", dir: "ltr" },
  { code: "ur", nativeName: "اردو", englishName: "Urdu", dir: "rtl" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code) as LanguageCode[];

export const languageByCode = (code: string) =>
  LANGUAGES.find((l) => l.code === code);

export const isSupportedLanguage = (code: string | null | undefined): code is LanguageCode =>
  !!code && (LANGUAGE_CODES as string[]).includes(code);

export const dirFor = (code: string): "ltr" | "rtl" =>
  languageByCode(code)?.dir === "rtl" ? "rtl" : "ltr";

/** Indian state / union territory → recommended regional language. */
export const STATE_LANGUAGE_MAP: Record<string, LanguageCode> = {
  Maharashtra: "mr",
  Gujarat: "gu",
  Karnataka: "kn",
  "Tamil Nadu": "ta",
  Kerala: "ml",
  Telangana: "te",
  "Andhra Pradesh": "te",
  "West Bengal": "bn",
  Odisha: "or",
  Punjab: "pa",
  Assam: "as",
  "Jammu & Kashmir": "ur",
  Ladakh: "ur",
  "Uttar Pradesh": "hi",
  Bihar: "hi",
  "Madhya Pradesh": "hi",
  Rajasthan: "hi",
  Chhattisgarh: "hi",
  Jharkhand: "hi",
  Haryana: "hi",
  Delhi: "hi",
  Uttarakhand: "hi",
  "Himachal Pradesh": "hi",
  Goa: "mr",
  "Dadra & Nagar Haveli and Daman & Diu": "gu",
};

/**
 * Regional language for a state. States without a dedicated supported
 * locale resolve to Hindi (which pairs with English in the selector)
 * rather than an unsupported language.
 */
export const regionalLanguageForState = (state?: string | null): LanguageCode | null => {
  if (!state) return null;
  const hit = STATE_LANGUAGE_MAP[state];
  return hit ?? null;
};

/** Map a BCP-47 browser tag ("hi-IN", "en-GB") to a supported code. */
export const browserLanguage = (): LanguageCode | null => {
  if (typeof navigator === "undefined") return null;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag?.split("-")[0]?.toLowerCase();
    if (isSupportedLanguage(base)) return base;
  }
  return null;
};

/**
 * Contextual selector list: English + Hindi + regional, deduplicated.
 * regional = hi  →  [English, हिन्दी]
 * regional = mr  →  [English, हिन्दी, मराठी]
 */
export const contextualLanguageList = (regional: LanguageCode | null): LanguageCode[] => {
  const list: LanguageCode[] = ["en"];
  if (!list.includes("hi") && regional !== "hi") list.push("hi");
  if (regional && !list.includes(regional)) list.push(regional);
  return list;
};

/* ------------------------------------------------------------------ */
/* Explicit preference persistence (namespaced like the rest of the app) */
/* ------------------------------------------------------------------ */

const PREF_KEY = "krushisetu.language";

export const savedLanguagePreference = (): LanguageCode | null => {
  try {
    const v = localStorage.getItem(PREF_KEY);
    return isSupportedLanguage(v) ? v : null;
  } catch {
    return null;
  }
};

export const saveLanguagePreference = (code: LanguageCode) => {
  try {
    localStorage.setItem(PREF_KEY, code);
  } catch {
    /* storage unavailable (private mode) — preference is session-only */
  }
};

/* ------------------------------------------------------------------ */
/* Resolver                                                            */
/* ------------------------------------------------------------------ */

export interface LanguageContext {
  /** Language i18n is rendering in right now. */
  active: LanguageCode;
  /** Where the initial active language came from. */
  source: "preference" | "profile-state" | "location" | "browser" | "default";
  /** User's explicit choice — sticky across location changes. */
  preference: LanguageCode | null;
  /** Regional language suggested by the current location context. */
  regional: LanguageCode | null;
  /** The state that produced `regional`, if known. */
  regionalState: string | null;
  /** English + Hindi + regional, deduplicated — shown in the navbar dropdown. */
  contextual: LanguageCode[];
}

export interface LocationHints {
  /** state from the signed-in user's profile */
  profileState?: string | null;
  /** state from any other in-app location context (guest detection etc.) */
  appState?: string | null;
}

/**
 * Pure resolver — no React, easy to unit-test.
 * `preference` always wins. Without one, the location context decides;
 * only then browser language; finally English.
 */
export const resolveLanguageContext = (
  preference: LanguageCode | null,
  hints: LocationHints = {},
): LanguageContext => {
  const profileRegional = regionalLanguageForState(hints.profileState);
  const appRegional = regionalLanguageForState(hints.appState);

  const regional = profileRegional ?? appRegional;
  const regionalState = profileRegional ? (hints.profileState ?? null) : appRegional ? (hints.appState ?? null) : null;

  let active: LanguageCode = "en";
  let source: LanguageContext["source"] = "default";

  if (preference) {
    active = preference;
    source = "preference";
  } else if (regional) {
    active = regional;
    source = profileRegional ? "profile-state" : "location";
  } else {
    const browser = browserLanguage();
    if (browser) {
      active = browser;
      source = "browser";
    }
  }

  return {
    active,
    source,
    preference,
    regional,
    regionalState,
    contextual: contextualLanguageList(regional),
  };
};
