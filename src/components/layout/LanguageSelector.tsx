import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check, ChevronRight, Languages } from "lucide-react";
import { cn } from "@/utils/format";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const {
    contextualNames,
    allLanguages,
    setLanguage,
    activeNativeName,
    regionalState,
  } = useLanguage();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (code: Parameters<typeof setLanguage>[0]) => {
    setLanguage(code);
    setOpen(false);
    setMoreOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.selectLanguage")}
        className={cn(
          "flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-ink-500 transition hover:bg-earth-100 hover:text-ink-900",
          open && "bg-earth-100 text-ink-900",
          compact && "h-9 px-2 text-[13px]",
        )}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="max-w-[9ch] truncate">{activeNativeName}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 opacity-60 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("common.selectLanguage")}
          className="absolute ltr:right-0 rtl:left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift animate-fade-up"
        >
          <ul className="py-1.5">
            {contextualNames.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.active}
                  onClick={() => pick(l.code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                    l.active ? "text-primary-800" : "text-ink-700 hover:bg-earth-50",
                  )}
                >
                  <span className="truncate">{l.nativeName}</span>
                  {l.active && <Check className="h-4 w-4 shrink-0 text-primary-600" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-ink-100 py-1.5">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-ink-500 transition hover:bg-earth-50 hover:text-ink-900"
            >
              <span className="inline-flex items-center gap-2">
                <Languages className="h-4 w-4 opacity-60" aria-hidden />
                {t("common.moreLanguages")}
              </span>
              <ChevronRight
                className={cn("h-4 w-4 opacity-50 transition-transform rtl:rotate-180", moreOpen && "rotate-90 rtl:-rotate-90")}
                aria-hidden
              />
            </button>

            {moreOpen && (
              <ul className="max-h-64 overflow-y-auto border-t border-ink-100 bg-earth-50/60 py-1">
                {allLanguages.map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={l.active}
                      onClick={() => pick(l.code)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-4 py-2 text-[13px] font-medium transition-colors",
                        l.active ? "text-primary-800" : "text-ink-700 hover:bg-white",
                      )}
                    >
                      <span className="truncate">{l.nativeName}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-ink-400">{l.englishName}</span>
                        {l.active && <Check className="h-3.5 w-3.5 text-primary-600" aria-hidden />}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {regionalState && (
            <p className="border-t border-ink-100 bg-earth-50 px-4 py-2 text-[10px] font-semibold text-ink-400">
              {regionalState} · {t("common.language")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
