import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Sparkles, ArrowRight, Languages, MapPin, ListChecks } from "lucide-react";
import { motion } from "framer-motion";
import { searchExamples } from "@/data/nlsearch";
import { searchNaturalLanguage } from "@/services/mockProcurement";
import type { IntentResult } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { KrushiAI } from "@/components/chatbot/KrushiAI";
import { Toasts } from "@/components/layout/Toasts";

export default function NaturalLanguageSearch() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<IntentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState("");

  const run = async (q: string) => {
    if (!q.trim()) return;
    setAsked(q);
    setLoading(true);
    setIntent(null);
    const result = await searchNaturalLanguage(q);
    setIntent(result);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Toasts />
      <KrushiAI />

      <main className="container-page flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800">
            <Languages className="h-3.5 w-3.5" aria-hidden /> {t("search.badge")}
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
            {t("search.heading")}
          </h1>
          <p className="mt-2 text-sm text-ink-500 md:text-base">
            {t("search.body")}
          </p>
        </div>

        <form
          className="mx-auto mt-8 flex max-w-2xl gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(query);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.heading")}
              className="h-14 w-full rounded-2xl border border-ink-200 bg-white pl-12 pr-4 text-base shadow-soft outline-none focus:border-primary-500"
            />
          </div>
          <Button type="submit" size="lg" loading={loading} className="!h-14 !px-6">
            {t("search.ask")}
          </Button>
        </form>

        <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-1.5">
          {searchExamples.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                run(ex);
              }}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-primary-400 hover:text-primary-700"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Result */}
        <div className="mx-auto mt-10 max-w-2xl">
          {loading && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 animate-pulse text-primary-600" aria-hidden />
                <div className="flex-1">
                  <div className="skeleton-shimmer h-4 w-40 rounded" />
                  <div className="skeleton-shimmer mt-2 h-3 w-64 rounded" />
                </div>
              </div>
              <div className="skeleton-shimmer mt-4 h-20 rounded-xl" />
            </Card>
          )}

          {intent && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                <div className="bg-primary-700 px-5 py-3 text-sm font-bold text-white">
                  {t("search.understood")}
                </div>
                <dl className="grid gap-4 p-5 sm:grid-cols-3">
                  {[
                    { icon: ListChecks, k: t("search.need"), v: intent.need },
                    { icon: MapPin, k: t("search.location"), v: intent.location },
                    { icon: Sparkles, k: t("search.preference"), v: intent.preference },
                  ].map((x) => (
                    <div key={x.k} className="rounded-2xl bg-earth-50 p-4">
                      <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-400">
                        <x.icon className="h-3.5 w-3.5" aria-hidden /> {x.k}
                      </dt>
                      <dd className="mt-1 font-bold text-ink-900">{x.v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="border-t border-ink-100 px-5 py-4">
                  <p className="text-sm leading-relaxed text-ink-700">{intent.resultsSummary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {intent.matchedAction.map((a) => (
                      <Button key={a.to} onClick={() => navigate(a.to)} iconRight={<ArrowRight className="h-4 w-4" />}>
                        {a.label}
                      </Button>
                    ))}
                    <Button variant="outline" onClick={() => navigate("/farmer")}>
                      {t("search.goToDashboard")}
                    </Button>
                  </div>
                </div>
              </Card>
              <p className="mt-3 text-center text-xs text-ink-400">
                {t("search.showingFor", { query: asked })}
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
