import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { dirFor, savedLanguagePreference } from "./languages";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import mr from "./locales/mr/translation.json";
import bn from "./locales/bn/translation.json";
import te from "./locales/te/translation.json";
import ta from "./locales/ta/translation.json";
import gu from "./locales/gu/translation.json";
import kn from "./locales/kn/translation.json";
import ml from "./locales/ml/translation.json";
import pa from "./locales/pa/translation.json";
import or from "./locales/or/translation.json";
import as from "./locales/as/translation.json";
import ur from "./locales/ur/translation.json";

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  bn: { translation: bn },
  te: { translation: te },
  ta: { translation: ta },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur },
} as const;

/** Boot language: the saved explicit preference, otherwise English. */
export const initialLanguage = (): string => savedLanguagePreference() ?? "en";

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

/** Keep <html lang> and direction (RTL for Urdu) in sync with i18n. */
export const applyDocumentLanguage = (code: string) => {
  document.documentElement.lang = code;
  document.documentElement.dir = dirFor(code);
};

applyDocumentLanguage(i18n.language);
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
