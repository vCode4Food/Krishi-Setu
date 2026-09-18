import { describe, it, expect, beforeEach } from "vitest";
import {
  resolveLanguageContext,
  contextualLanguageList,
  regionalLanguageForState,
  savedLanguagePreference,
  saveLanguagePreference,
  isSupportedLanguage,
  dirFor,
  languageByCode,
  LANGUAGES,
  LANGUAGE_CODES,
  type LanguageCode,
} from "@/i18n/languages";

describe("language catalogue integrity", () => {
  it("exposes exactly 13 supported languages", () => {
    expect(LANGUAGES).toHaveLength(13);
    expect(LANGUAGE_CODES).toEqual([
      "en", "hi", "mr", "bn", "te", "ta", "gu", "kn", "ml", "pa", "or", "as", "ur",
    ]);
  });

  it("uses unique codes and non-empty native names", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const l of LANGUAGES) {
      expect(l.nativeName.length).toBeGreaterThan(0);
      expect(l.englishName.length).toBeGreaterThan(0);
    }
  });

  it("marks only Urdu as RTL", () => {
    expect(LANGUAGES.filter((l) => l.dir === "rtl").map((l) => l.code)).toEqual(["ur"]);
  });

  it("dirFor falls back to ltr for unknown codes", () => {
    expect(dirFor("ur")).toBe("rtl");
    expect(dirFor("en")).toBe("ltr");
    expect(dirFor("nope")).toBe("ltr");
  });

  it("languageByCode resolves and misses safely", () => {
    expect(languageByCode("mr")?.englishName).toBe("Marathi");
    expect(languageByCode("zz")).toBeUndefined();
  });

  it("isSupportedLanguage guards correctly", () => {
    expect(isSupportedLanguage("hi")).toBe(true);
    expect(isSupportedLanguage("xx")).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
  });
});

describe("state → regional language map", () => {
  it("maps every required state to its language", () => {
    expect(regionalLanguageForState("Maharashtra")).toBe("mr");
    expect(regionalLanguageForState("Gujarat")).toBe("gu");
    expect(regionalLanguageForState("Karnataka")).toBe("kn");
    expect(regionalLanguageForState("Tamil Nadu")).toBe("ta");
    expect(regionalLanguageForState("Telangana")).toBe("te");
    expect(regionalLanguageForState("West Bengal")).toBe("bn");
    expect(regionalLanguageForState("Punjab")).toBe("pa");
    expect(regionalLanguageForState("Kerala")).toBe("ml");
    expect(regionalLanguageForState("Odisha")).toBe("or");
    expect(regionalLanguageForState("Assam")).toBe("as");
  });

  it("maps Hindi-belt states to Hindi and handles unknowns/nulls", () => {
    expect(regionalLanguageForState("Rajasthan")).toBe("hi");
    expect(regionalLanguageForState("Uttar Pradesh")).toBe("hi");
    expect(regionalLanguageForState("Atlantis")).toBeNull();
    expect(regionalLanguageForState(null)).toBeNull();
    expect(regionalLanguageForState(undefined)).toBeNull();
    expect(regionalLanguageForState("")).toBeNull();
  });
});

describe("contextual selector list", () => {
  it("is English + Hindi when no regional language applies", () => {
    expect(contextualLanguageList(null)).toEqual(["en", "hi"]);
    expect(contextualLanguageList("hi")).toEqual(["en", "hi"]); // regional=hi dedupes
  });

  it("appends the regional language without duplicates", () => {
    expect(contextualLanguageList("mr")).toEqual(["en", "hi", "mr"]);
    expect(contextualLanguageList("ta")).toEqual(["en", "hi", "ta"]);
  });
});

describe("resolveLanguageContext — English-first default", () => {
  it("defaults to English on a first visit with no signals", () => {
    const ctx = resolveLanguageContext(null, {});
    expect(ctx.active).toBe("en");
    expect(ctx.source).toBe("default");
    expect(ctx.preference).toBeNull();
    expect(ctx.regional).toBeNull();
  });

  it("NEVER auto-applies the profile state language — recommendation only", () => {
    // The core product rule: Maharashtra profile must NOT switch the UI to Marathi.
    for (const state of ["Maharashtra", "Gujarat", "Tamil Nadu", "West Bengal", "Punjab", "Kerala"]) {
      const ctx = resolveLanguageContext(null, { profileState: state });
      expect(ctx.active).toBe("en");
      expect(ctx.source).toBe("default");
    }
  });

  it("exposes the regional recommendation alongside the English default", () => {
    const ctx = resolveLanguageContext(null, { profileState: "Maharashtra" });
    expect(ctx.active).toBe("en");
    expect(ctx.regional).toBe("mr");
    expect(ctx.regionalState).toBe("Maharashtra");
    expect(ctx.contextual).toEqual(["en", "hi", "mr"]);
  });

  it("prefers profile state over app location hints", () => {
    const ctx = resolveLanguageContext(null, { profileState: "Maharashtra", appState: "Gujarat" });
    expect(ctx.regional).toBe("mr");
    expect(ctx.regionalState).toBe("Maharashtra");
  });

  it("falls back to app-level location when no profile state exists", () => {
    const ctx = resolveLanguageContext(null, { appState: "Karnataka" });
    expect(ctx.active).toBe("en"); // still English
    expect(ctx.regional).toBe("kn");
    expect(ctx.regionalState).toBe("Karnataka");
  });

  it("explicit preference wins over every location signal", () => {
    const ctx = resolveLanguageContext("hi", { profileState: "Maharashtra" });
    expect(ctx.active).toBe("hi");
    expect(ctx.source).toBe("preference");
    // recommendation still follows the profile state
    expect(ctx.regional).toBe("mr");
    expect(ctx.regionalState).toBe("Maharashtra");
  });

  it("recommendation follows a state change WITHOUT changing an explicit choice", () => {
    // user picked Hindi while in Maharashtra...
    let ctx = resolveLanguageContext("hi", { profileState: "Maharashtra" });
    expect(ctx.active).toBe("hi");
    // ...then moves to Gujarat: choice stays Hindi, only the recommendation moves
    ctx = resolveLanguageContext("hi", { profileState: "Gujarat" });
    expect(ctx.active).toBe("hi");
    expect(ctx.regional).toBe("gu");
  });

  it("rejects unsupported preference values by falling back to English", () => {
    // cast simulates a corrupted storage value reaching the resolver
    const ctx = resolveLanguageContext("zz" as unknown as LanguageCode);
    expect(ctx.active).toBe("en");
    expect(ctx.source).toBe("default");
  });
});

describe("language preference persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a saved preference", () => {
    expect(savedLanguagePreference()).toBeNull();
    saveLanguagePreference("pa");
    expect(savedLanguagePreference()).toBe("pa");
  });

  it("treats corrupted values as no preference", () => {
    localStorage.setItem("krushisetu.language", "klingon");
    expect(savedLanguagePreference()).toBeNull();
  });
});
