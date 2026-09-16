import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScanSearch,
  MapPin,
  CalendarPlus,
  Award,
  Bot,
  Stethoscope,
  ArrowRight,
  Sprout,
  Truck,
  PackageCheck,
  Scale,
  CloudSun,
  ChevronRight,
  BellRing,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { images } from "@/data/images";
import { mspTicker } from "@/data/news";
import { getWaitingTime } from "@/services/mockProcurement";
import { FARMER_HOME } from "@/services/mockMaps";
import { distanceKm } from "@/services/mockMaps";
import type { WaitingPrediction } from "@/types";
import { SectionHeading } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badges";
import { Carousel } from "@/components/common/Carousel";
import { CapacityMeter } from "@/components/common/CapacityMeter";
import { DemoModeNotice } from "@/components/common/Card";
import { CentreCard } from "@/components/farmer/CentreCard";
import { SchemeCard } from "@/components/farmer/SchemeCard";
import { NewsCard } from "@/components/farmer/NewsCard";
import { schemes } from "@/data/schemes";
import { news } from "@/data/news";
import { formatKg } from "@/utils/format";

const quickActions = [
  { labelKey: "qaAnalyze", icon: ScanSearch, to: "/farmer/crop-health", tone: "bg-primary-50 text-primary-700" },
  { labelKey: "qaFindCentre", icon: MapPin, to: "/farmer/centres", tone: "bg-info-50 text-info-600" },
  { labelKey: "qaBookSlot", icon: CalendarPlus, to: "/farmer/book-slot", tone: "bg-saffron-100 text-saffron-600" },
  { labelKey: "qaSchemes", icon: Award, to: "/farmer/schemes", tone: "bg-primary-100 text-primary-800" },
  { labelKey: "qaAskAI", icon: Bot, action: "chat" as const, tone: "bg-earth-100 text-earth-700" },
  { labelKey: "qaConsult", icon: Stethoscope, to: "/farmer/experts", tone: "bg-alert-50 text-alert-600" },
];

const greetingKeyForHour = (h: number) =>
  h < 12 ? "dashboard.greetingMorning" : h < 17 ? "dashboard.greetingAfternoon" : "dashboard.greetingEvening";

export default function FarmerDashboard() {
  const { farmer, centres, bookings, setChatOpen } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [wait, setWait] = useState<WaitingPrediction | null>(null);

  const homeCentre = centres[0];

  useEffect(() => {
    let alive = true;
    getWaitingTime(homeCentre).then((w) => alive && setWait(w));
    return () => {
      alive = false;
    };
  }, [homeCentre]);

  const registered = farmer.registeredQtyKg;
  const booked = bookings.reduce((s, b) => s + b.quantityKg, farmer.bookedQtyKg);
  const procured = farmer.procuredQtyKg;
  const remaining = Math.max(0, registered - booked);

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-primary-900 text-white">
        <img src={images.crops.wheat} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/85 to-primary-900/40" />
        <div className="relative flex flex-col gap-6 p-6 md:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-200">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              {t(greetingKeyForHour(new Date().getHours()))}, {farmer.name.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-primary-100">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden /> {farmer.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sprout className="h-4 w-4" aria-hidden /> {t("dashboard.currentCrop")} <strong>{farmer.currentCrop}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CloudSun className="h-4 w-4" aria-hidden /> 29°C · Clear
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur md:min-w-[19rem]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-200">{t("dashboard.nextSlot")}</p>
              <BellRing className="h-4 w-4 text-saffron-300" aria-hidden />
            </div>
            {bookings.length > 0 ? (
              <div className="mt-2">
                <p className="font-display text-xl font-bold">
                  {bookings[0].time} · {new Date(bookings[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
                <p className="mt-0.5 text-sm text-primary-100">
                  {bookings[0].centreName} · {bookings[0].crop} · {formatKg(bookings[0].quantityKg)}
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <p className="font-display text-xl font-bold">Tomorrow · 11:00 AM</p>
                <p className="mt-0.5 text-sm text-primary-100">Nagpur Central Procurement Centre · Wheat · 8,000 kg</p>
              </div>
            )}
            <Link to="/farmer/book-slot" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-saffron-300 hover:text-saffron-200">
              {t("dashboard.manageBooking")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-8">
        <SectionHeading title={t("dashboard.quickActions")} className="!mb-4" />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {quickActions.map((a) => (
            <button
              key={a.labelKey}
              onClick={() => (a.action === "chat" ? setChatOpen(true) : navigate(a.to!))}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.tone} transition-transform group-hover:scale-110`}>
                <a.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xs font-bold text-ink-900">{t(`dashboard.${a.labelKey}`)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Procurement overview + weather/MSP */}
      <section className="mb-10 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card className="p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-ink-900">{t("dashboard.overview")}</h2>
            <StatusBadge tone="blue" label={t("dashboard.season", { status: farmer.remainingQtyKg > 0 ? t("dashboard.seasonSelling") : t("dashboard.seasonComplete") })} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">              {[
              { labelKey: "kpiRegistered", value: registered, icon: PackageCheck, tone: "text-primary-700" },
              { labelKey: "kpiBooked", value: booked, icon: CalendarPlus, tone: "text-info-600" },
              { labelKey: "kpiProcured", value: procured, icon: Truck, tone: "text-primary-600" },
              { labelKey: "kpiRemaining", value: remaining, icon: Scale, tone: "text-saffron-600" },
            ].map((x) => (
              <div key={x.labelKey} className="rounded-2xl bg-earth-50 p-4">
                <x.icon className={`h-5 w-5 ${x.tone}`} aria-hidden />
                <p className="mt-2 font-display text-xl font-extrabold text-ink-900 md:text-2xl">{formatKg(x.value)}</p>
                <p className="text-xs font-semibold text-ink-400">{t(`dashboard.${x.labelKey}`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <CapacityMeter
              remaining={remaining}
              total={registered}
              label={t("dashboard.capacityLabel")}
              showValues={false}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/farmer/book-slot")}>{t("dashboard.btnBookSlot")}</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/farmer/transactions")}>{t("dashboard.btnHistory")}</Button>
          </div>
        </Card>

        <div className="grid gap-5">
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-400">{t("dashboard.mspToday")}</h3>
            <ul className="mt-3 space-y-2.5">
              {mspTicker.slice(0, 4).map((m) => (
                <li key={m.crop} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-700">{m.crop}</span>
                  <span className="flex items-center gap-2">
                    <strong className="text-ink-900">{m.price}</strong>
                    <span className={m.up ? "text-xs font-bold text-primary-600" : "text-xs font-bold text-alert-600"}>
                      {m.change}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-400">
              <CloudSun className="h-4 w-4" aria-hidden /> {t("dashboard.weather", { city: "Nagpur" })}
            </h3>
            <p className="mt-3 font-display text-3xl font-extrabold text-ink-900">29°C</p>
            <p className="text-sm font-semibold text-ink-700">{t("dashboard.weatherNow")} · {t("dashboard.humidity", { n: 41 })}</p>
            <p className="mt-2 rounded-xl bg-info-50 px-3 py-2 text-xs font-semibold text-info-600">
              {t("dashboard.advisory")}
            </p>
          </Card>
        </div>
      </section>

      {/* Nearby centres carousel */}
      <section className="mb-10">
        <SectionHeading
          title={t("dashboard.nearbyTitle")}
          subtitle={t("dashboard.nearbySubtitle")}
          className="!mb-4"
          action={
            <Link to="/farmer/centres" className="hidden items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 md:inline-flex">
              {t("dashboard.viewMap")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <DemoModeNotice className="mb-3" />
        <Carousel ariaLabel="Nearby procurement centres" itemClassName="w-[85%] sm:w-[47%] lg:w-[31.5%]">
          {centres.slice(0, 6).map((c) => {
            const km = distanceKm(FARMER_HOME.lat, FARMER_HOME.lng, c.lat, c.lng);
            return <CentreCard key={c.centreId} centre={c} distanceKm={km > 0 ? km : 4.2} />;
          })}
        </Carousel>
      </section>

      {/* Crop health + prediction */}
      <section className="mb-10 grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 p-5">
            <h2 className="text-lg font-bold text-ink-900">{t("dashboard.cropHealthTitle")}</h2>
            <Link to="/farmer/crop-health" className="text-sm font-bold text-primary-700 hover:text-primary-800">
              {t("dashboard.analyzeAgain")}
            </Link>
          </div>
          <div className="flex items-center gap-5 p-5">
            <img src={images.crops.wheat} alt="Wheat crop sample" className="h-20 w-20 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-ink-900">Wheat</h3>
                <StatusBadge tone="green" label={t("dashboard.healthyBadge", { score: 82 })} />
              </div>
              <p className="mt-1 text-sm text-ink-500">{t("dashboard.cropIssue")}</p>
              <p className="mt-1.5 text-xs font-semibold text-primary-700">
                {t("dashboard.cropAdvice")}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-300" aria-hidden />
          </div>
          <div className="border-t border-ink-100 bg-earth-50 px-5 py-3 text-xs text-ink-500">
            {t("dashboard.analyzedOn", { date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-ink-900">{t("dashboard.waitTitle")}</h2>
          <p className="mt-1 text-sm text-ink-500">{homeCentre.name}</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary-100">
              <div className="text-center">
                <p className="font-display text-2xl font-extrabold text-primary-800">{wait?.minutes ?? "—"}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">{t("dashboard.minutes")}</p>
              </div>
            </div>
            <ul className="flex-1 space-y-1.5 text-xs text-ink-500">
              {(wait?.factors ?? [t("dashboard.loadingPrediction")]).map((f) => (
                <li key={f} className="flex items-start gap-1.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {wait && (
            <p className="mt-3 text-xs font-semibold text-primary-700">{t("dashboard.predictionConfidence", { n: wait.confidence })}</p>
          )}
        </Card>
      </section>

      {/* Schemes carousel */}
      <section className="mb-10">
        <SectionHeading
          title={t("dashboard.schemesTitle")}
          subtitle={t("dashboard.schemesSubtitle")}
          className="!mb-4"
          action={
            <Link to="/farmer/schemes" className="hidden items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 md:inline-flex">
              {t("dashboard.allSchemes")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <Carousel ariaLabel="Government schemes" itemClassName="w-[85%] sm:w-[47%] lg:w-[31.5%]">
          {schemes.slice(0, 6).map((s) => (
            <SchemeCard key={s.id} scheme={s} onApply={() => navigate("/farmer/schemes")} onEligibility={() => navigate("/farmer/schemes")} />
          ))}
        </Carousel>
      </section>

      {/* News carousel */}
      <section className="mb-4">
        <SectionHeading
          title={t("dashboard.newsTitle")}
          subtitle={t("dashboard.newsSubtitle")}
          className="!mb-4"
          action={
            <Link to="/farmer/news" className="hidden items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 md:inline-flex">
              {t("dashboard.allNews")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <Carousel ariaLabel="Latest farmer news" itemClassName="w-[85%] sm:w-[47%] lg:w-[31.5%]">
          {news.slice(0, 6).map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </Carousel>
      </section>
    </div>
  );
}
