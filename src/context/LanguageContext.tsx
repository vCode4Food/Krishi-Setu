import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";
import {
  contextualLanguageList,
  dirFor,
  isSupportedLanguage,
  languageByCode,
  regionalLanguageForState,
  resolveLanguageContext,
  saveLanguagePreference,
  savedLanguagePreference,
  type LanguageCode,
  type LocationHints,
} from "@/i18n/languages";

interface LanguageContextValue {
  /** Active UI language code (synced with i18next). */
  language: LanguageCode;
  /** Where the active language was resolved from. */
  source: "preference" | "profile-state" | "location" | "browser" | "default";
  /** Explicit user selection, or null if following the region. */
  preference: LanguageCode | null;
  /** Regional language recommended by the current location context. */
  regional: LanguageCode | null;
  /** State that produced the recommendation, if known. */
  regionalState: string | null;
  /** English + Hindi + regional, deduplicated. */
  contextual: LanguageCode[];
  /** Native names for the contextual list, in display order. */
  contextualNames: { code: LanguageCode; nativeName: string; englishName: string; active: boolean }[];
  /** Native names for every supported language. */
  allLanguages: { code: LanguageCode; nativeName: string; englishName: string; active: boolean }[];
  /** Change language and persist the explicit preference. */
  setLanguage: (code: LanguageCode) => void;
  /** Full native name of the active language. */
  activeNativeName: string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  hints,
}: {
  children: ReactNode;
  /** Location context: profile state takes priority over app-level state. */
  hints: LocationHints;
}) {
  // Boot: stored preference beats region. No preference → resolve from region.
  const [preference, setPreference] = useState<LanguageCode | null>(() => {
    const saved = savedLanguagePreference();
    return isSupportedLanguage(saved) ? saved : null;
  });

  const ctx = useMemo(
    () => resolveLanguageContext(preference, hints),
    [preference, hints],
  );

  // Keep i18next in sync with the resolved language.
  useEffect(() => {
    if (i18n.language !== ctx.active) {
      void i18n.changeLanguage(ctx.active);
    }
  }, [ctx.active]);

  const setLanguage = useCallback((code: LanguageCode) => {
    if (!isSupportedLanguage(code)) return;
    saveLanguagePreference(code);
    setPreference(code);
    void i18n.changeLanguage(code);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const toEntries = (codes: readonly LanguageCode[]) =>
      codes.map((code) => {
        const l = languageByCode(code)!;
        return {
          code,
          nativeName: l.nativeName,
          englishName: l.englishName,
          active: code === ctx.active,
        };
      });
    return {
      language: ctx.active,
      source: ctx.source,
      preference,
      regional: ctx.regional,
      regionalState: ctx.regionalState,
      contextual: ctx.contextual,
      contextualNames: toEntries(contextualLanguageList(ctx.regional)),
      allLanguages: toEntries(
        [
          "en", "hi", "mr", "bn", "te", "ta", "gu", "kn", "ml", "pa", "or", "as", "ur",
        ] as LanguageCode[],
      ),
      setLanguage,
      activeNativeName: languageByCode(ctx.active)?.nativeName ?? "English",
      dir: dirFor(ctx.active),
    };
  }, [ctx, preference, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = (): LanguageContextValue => {
  const v = useContext(LanguageContext);
  if (!v) throw new Error("useLanguage must be used within LanguageProvider");
  return v;
};

/** Convenience hook for components that only need translations. */
export const useT = () => useTranslation().t;

/** Sync provider context when auth changes externally (e.g. session restore). */
export function useAuthLocationHint(state?: string | null) {
  return useMemo<LocationHints>(() => ({ profileState: state ?? null }), [state]);
}

// Re-export for the selector component.
export { regionalLanguageForState };
