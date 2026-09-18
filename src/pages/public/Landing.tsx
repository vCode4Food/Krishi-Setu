import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Scale,
  MapPin,
  ShieldCheck,
  Bot,
  Award,
  Newspaper,
  Wifi,
  Route as RouteIcon,
  ChevronRight,
  Wheat,
  Warehouse,
  Radio,
  Camera,
  Link2,
  Fingerprint,
  Lock,
  CheckCircle2,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { images } from "@/data/images";
import { mspTicker, news } from "@/data/news";
import { useCountUp } from "@/hooks/useCountUp";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/Badges";
import { Carousel } from "@/components/common/Carousel";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { KrushiAI } from "@/components/chatbot/KrushiAI";
import { Toasts } from "@/components/layout/Toasts";
import { cn } from "@/utils/format";

const stats = [
  { key: "statFarmers", value: 10000, suffix: "+" },
  { key: "statCentres", value: 250, suffix: "+" },
  { key: "statTonnes", value: 1.2, suffix: "M+", decimals: true },
  { key: "statTraceability", value: 98, suffix: "%" },
];

const howItWorks = [
  { icon: Fingerprint, titleKey: "step1Title", bodyKey: "step1Body" },
  { icon: RouteIcon, titleKey: "step2Title", bodyKey: "step2Body" },
  { icon: Radio, titleKey: "step3Title", bodyKey: "step3Body" },
  { icon: Scale, titleKey: "step4Title", bodyKey: "step4Body" },
  { icon: Camera, titleKey: "step5Title", bodyKey: "step5Body" },
  { icon: ShieldCheck, titleKey: "step6Title", bodyKey: "step6Body" },
];

const farmerBenefits = [
  { icon: MapPin, titleKey: "benefit1Title", bodyKey: "benefit1Body" },
  { icon: Award, titleKey: "benefit2Title", bodyKey: "benefit2Body" },
  { icon: Bot, titleKey: "benefit3Title", bodyKey: "benefit3Body" },
  { icon: Newspaper, titleKey: "benefit4Title", bodyKey: "benefit4Body" },
];

const transparencyChecks = [
  { icon: Wifi, key: "checkRfid" },
  { icon: Scale, key: "checkWeighing" },
  { icon: Camera, key: "checkCv" },
  { icon: Link2, key: "checkLink" },
  { icon: Warehouse, key: "checkCapacity" },
  { icon: Lock, key: "checkAudit" },
];

function StatItem({ s }: { s: (typeof stats)[number] }) {
  const { value, ref } = useCountUp(s.value);
  const { t } = useTranslation();
  const shown = s.decimals ? (value / 10).toFixed(1) : value.toLocaleString("en-IN");
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center">
      <p className="font-display text-3xl font-extrabold text-white md:text-4xl">
        {shown}
        {s.suffix}
      </p>
      <p className="mt-1 text-sm font-medium text-primary-100">{t(`landing.${s.key}`)}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mspIdx, setMspIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMspIdx((i) => (i + 1) % mspTicker.length), 2600);
    return () => clearInterval(t);
  }, []);

  // Scroll to navbar hash targets (React Router doesn't do it automatically)
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    const el = document.getElementById(location.hash.slice(1));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Toasts />
      <KrushiAI />

      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <img
          src={images.hero.field}
          alt="Wide Indian wheat fields at golden hour"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-900/75 to-primary-900/40" />
        <div className="container-page relative flex min-h-[88vh] flex-col justify-center py-20">
          <div className="max-w-2xl">
            <StatusBadge tone="green" label={t("landing.badge")} className="!bg-white/10 !text-primary-100 !border-white/20" />
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              {t("landing.heroTitleStart")}{" "}
              <span className="text-saffron-300">{t("landing.heroTitleHighlight")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-100 md:text-lg">
              {t("landing.heroBody")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="amber" onClick={() => navigate("/login")} iconRight={<ArrowRight className="h-5 w-5" />}>
                {t("landing.exploreCta")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
                onClick={() => navigate("/login")}
              >
                {t("landing.centreCta")}
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-primary-100">
              {[t("landing.trustLanguages"), t("landing.trustRfid"), t("landing.trustSettlement")].map((txt) => (
                <span key={txt} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-saffron-300" aria-hidden /> {txt}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MSP ticker */}
        <div className="relative border-t border-white/10 bg-primary-950/70 backdrop-blur">
          <div className="container-page flex h-11 items-center gap-6 overflow-hidden text-sm">
            <span className="flex shrink-0 items-center gap-1.5 font-bold text-saffron-300">
              <TrendingUp className="h-4 w-4" aria-hidden /> {t("landing.mspToday")}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden">
              {mspTicker.map((m, i) => (
                <span
                  key={m.crop}
                  className={cn(
                    "absolute inset-x-0 top-0 flex items-center gap-2 text-primary-100 transition-all duration-500",
                    i === mspIdx ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
                  )}
                >
                  <strong className="text-white">{m.crop}</strong> {m.price}
                  <span className={m.up ? "text-primary-300" : "text-saffron-300"}>
                    {m.change}
                  </span>
                </span>
              ))}
            </div>
          </div>
          {/* demo notice */}
          <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center md:flex">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-primary-100">
              {t("common.demoMode")}
            </span>
          </div>
        </div>
      </section>

      {/* --------------------------- OVERVIEW ----------------------------- */}
      <section id="platform" className="container-page scroll-mt-20 py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">{t("landing.overviewEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              {t("landing.overviewHeading")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              {t("landing.overviewBody")}
            </p>
            <ul className="mt-6 space-y-3">
              {[t("landing.bullet1"), t("landing.bullet2"), t("landing.bullet3")].map((txt) => (
                <li key={txt} className="flex items-start gap-2.5 text-sm text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-600" aria-hidden />
                  {txt}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <img
              src={images.hero.farmerPortrait}
              alt="Indian farmer using a smartphone in the field"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-ink-100 bg-white p-4 shadow-lift md:block">
              <p className="text-xs font-semibold text-ink-400">{t("landing.integrityLabel")}</p>
              <div className="mt-2 space-y-1.5">
                {[t("landing.integrityFarmer"), t("landing.integrityRfid"), t("landing.integrityWeight")].map((c) => (
                  <p key={c} className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" aria-hidden /> {c}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- HOW IT WORKS --------------------------- */}
      <section id="how-it-works" className="scroll-mt-20 bg-earth-100/60 py-16 md:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">{t("landing.howEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              {t("landing.howHeading")}
            </h2>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step, i) => (
              <li key={step.titleKey} className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                    <step.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="font-display text-4xl font-extrabold text-earth-200">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{t(`landing.${step.titleKey}`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{t(`landing.${step.bodyKey}`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------- FARMER BENEFITS ------------------------ */}
      <section className="container-page py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="grid gap-4 sm:grid-cols-2">
              {farmerBenefits.map((b) => (
                <div key={b.titleKey} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600">
                    <b.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-bold text-ink-900">{t(`landing.${b.titleKey}`)}</h3>
                  <p className="mt-1 text-sm text-ink-500">{t(`landing.${b.bodyKey}`)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">{t("landing.benefitsEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              {t("landing.benefitsHeading")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              {t("landing.benefitsBody")}
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate("/login")} iconRight={<ArrowRight className="h-4 w-4" />}>
                {t("landing.openFarmerCta")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/login")}>
                {t("landing.tryCropCta")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------- SMART PROCUREMENT ------------------------- */}
      <section className="bg-primary-900 py-16 text-white md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300">{t("landing.smartEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              {t("landing.smartHeading")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-100/90">
              {t("landing.smartBody")}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: Users, k: "10,000+", vk: "smartStat1" },
                { icon: Building2, k: "250+", vk: "smartStat2" },
                { icon: Wheat, k: "1.2M t", vk: "smartStat3" },
                { icon: ShieldCheck, k: "98%", vk: "smartStat4" },
              ].map((s) => (
                <div key={s.vk} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <s.icon className="h-5 w-5 text-saffron-300" aria-hidden />
                  <p className="mt-2 font-display text-2xl font-extrabold">{s.k}</p>
                  <p className="text-xs text-primary-100/80">{t(`landing.${s.vk}`)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <img src={images.centres.nagpur} alt="Grain procurement centre yard with trucks" className="aspect-video w-full rounded-2xl object-cover" />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { k: t("landing.liveWeight"), v: "12,480 kg" },
                { k: t("landing.queueLabel"), v: "7 trucks" },
                { k: t("landing.verificationLabel"), v: "96% conf." },
              ].map((x) => (
                <div key={x.k} className="rounded-xl bg-white/5 px-2 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-200">{x.k}</p>
                  <p className="mt-0.5 font-display text-lg font-bold">{x.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------- TRANSPARENCY / AI ------------------------- */}
      <section id="transparency" className="container-page scroll-mt-20 py-16 md:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">{t("landing.transparencyEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              {t("landing.transparencyHeading")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              {t("landing.transparencyBody")}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {transparencyChecks.map((c) => (
                <div key={c.key} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-soft">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <c.icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <p className="text-sm font-semibold text-ink-900">{t(`landing.${c.key}`)}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">{t("landing.aiEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              {t("landing.aiHeading")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              {t("landing.aiBody")}
            </p>
            <div className="mt-8 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
              <div className="bg-primary-700 px-5 py-3 text-sm font-bold text-white">{t("landing.aiSampleTitle")}</div>
              <div className="space-y-3 p-5 text-sm">
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary-700 px-4 py-2.5 text-white">
                  माझ्या जवळ गहू विक्रीसाठी केंद्र कुठे आहे?
                </p>
                <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-earth-100 px-4 py-2.5 text-ink-900">
                  तुमच्या परिसरात 3 अधिकृत गहू खरेदी केंद्रे उपलब्ध आहेत. सर्वात जवळचे नागपूर सेंट्रल — 4.2 किमी, 27 मिनिटे प्रतीक्षा.
                </p>
                <div className="flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => navigate("/search")}>
                    {t("landing.trySearchCta")} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- NEWS CAROUSEL -------------------------- */}
      <section id="news" className="scroll-mt-20 bg-earth-100/60 py-16 md:py-20">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">{t("landing.newsEyebrow")}</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900">
                {t("landing.newsHeading")}
              </h2>
            </div>
            <Link to="/farmer/news" className="hidden items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 md:inline-flex">
              {t("landing.allNews")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <Carousel ariaLabel="Latest farmer news" itemClassName="w-[85%] sm:w-[46%] lg:w-[31.5%]">
            {news.slice(0, 6).map((a) => (
              <article key={a.id} className="group overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
                <div className="relative">
                  <img src={a.image} alt={a.title} className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3">
                    <StatusBadge tone="green" label={a.category} className="!bg-white/95" />
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-ink-400">{a.date} · {a.readTime} {t("landing.minRead")}</p>
                  <h3 className="mt-1.5 line-clamp-2 font-bold leading-snug text-ink-900">{a.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-500">{a.summary}</p>
                </div>
              </article>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ---------------------------- STATS ------------------------------- */}
      <section id="impact" className="scroll-mt-20 bg-primary-950 py-16 md:py-20">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <StatItem key={s.key} s={s} />
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-primary-200/70">
            {t("landing.statsDisclaimer")}
          </p>
        </div>
      </section>

      {/* ----------------------------- CTA -------------------------------- */}
      <section className="container-page py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary-800 px-6 py-14 text-center text-white md:py-20">
          <img src={images.patterns.weave} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <BrandLogo className="mx-auto h-16 w-16 rounded-2xl bg-white/95 object-contain p-1 shadow-lift" />
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              {t("landing.ctaHeading")}
            </h2>
            <p className="mt-3 text-primary-100">
              {t("landing.ctaBody")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="amber" onClick={() => navigate("/login")}>
                {t("landing.ctaFarmer")}
              </Button>
              <Button size="lg" variant="outline" className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20" onClick={() => navigate("/login")}>
                {t("landing.ctaCentre")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
