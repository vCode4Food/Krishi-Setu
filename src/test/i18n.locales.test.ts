import { describe, it, expect } from "vitest";
import en from "@/i18n/locales/en/translation.json";
import hi from "@/i18n/locales/hi/translation.json";
import mr from "@/i18n/locales/mr/translation.json";
import bn from "@/i18n/locales/bn/translation.json";
import te from "@/i18n/locales/te/translation.json";
import ta from "@/i18n/locales/ta/translation.json";
import gu from "@/i18n/locales/gu/translation.json";
import kn from "@/i18n/locales/kn/translation.json";
import ml from "@/i18n/locales/ml/translation.json";
import pa from "@/i18n/locales/pa/translation.json";
import or from "@/i18n/locales/or/translation.json";
import as from "@/i18n/locales/as/translation.json";
import ur from "@/i18n/locales/ur/translation.json";

const locales: Record<string, Record<string, unknown>> = {
  en, hi, mr, bn, te, ta, gu, kn, ml, pa, or, as, ur,
};

/** Flatten nested translation trees into dot-keys. */
function flat(tree: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object") Object.assign(out, flat(v as Record<string, unknown>, key));
    else out[key] = String(v);
  }
  return out;
}

/** {{name}}-style interpolation placeholders used by i18next. */
const placeholders = (s: string) => [...s.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1]);

describe("locale file integrity (13 languages)", () => {
  const flattened: Record<string, Record<string, string>> = Object.fromEntries(
    Object.entries(locales).map(([code, tree]) => [code, flat(tree)]),
  );
  const enKeys = Object.keys(flattened.en);

  it("English is a non-empty baseline", () => {
    expect(enKeys.length).toBeGreaterThan(500);
    expect(Object.values(flattened.en).every((v) => v.length > 0)).toBe(true);
  });

  it("every locale has the exact same key set as English", () => {
    for (const [code, dict] of Object.entries(flattened)) {
      const keys = Object.keys(dict);
      const missing = enKeys.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !enKeys.includes(k));
      expect({ code, missing: missing.slice(0, 10), extra: extra.slice(0, 10) }).toEqual({
        code, missing: [], extra: [],
      });
    }
  });

  it("no locale leaks an untranslated literal key (i18next can render raw keys)", () => {
    for (const [code, dict] of Object.entries(flattened)) {
      if (code === "en") continue;
      const offenders = Object.entries(dict)
        .filter(([k, v]) => v.trim() === k.split(".").pop()!)
        .map(([k]) => k);
      expect({ code, offenders: offenders.slice(0, 10) }).toEqual({ code, offenders: [] });
    }
  });

  it("every translation value keeps i18next interpolation placeholders in sync", () => {
    for (const [code, dict] of Object.entries(flattened)) {
      for (const [key, value] of Object.entries(dict)) {
        const expected = placeholders(flattened.en[key] ?? "").sort();
        const actual = placeholders(value).sort(); // order may differ per grammar
        expect({ code, key, actual }).toEqual({ code, key, actual: expected });
      }
    }
  });

  it("required product namespaces exist in every locale", () => {
    const required = ["navbar", "auth", "common", "dashboard", "weighing", "manager", "admin", "district"];
    for (const [code, dict] of Object.entries(flattened)) {
      const keys = Object.keys(dict);
      for (const ns of required) {
        expect({ code, ns, present: keys.some((k) => k.startsWith(`${ns}.`)) })
          .toEqual({ code, ns, present: true });
      }
    }
  });

  it("RTL locale (Urdu) actually contains Urdu-script content", () => {
    // Sanity: the RTL locale must not have been left as English text.
    const sample = Object.entries(flattened.ur).slice(0, 40);
    const urduRtl = sample.filter(([, v]) => /[\u0600-\u06FF]/.test(v));
    expect(urduRtl.length).toBeGreaterThan(0);
  });
});
