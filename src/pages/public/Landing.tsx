import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Scale,
  MapPin,
  ShieldCheck,
  Sprout,
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
  { label: "Farmers Connected", value: 10000, suffix: "+" },
  { label: "Procurement Centres", value: 250, suffix: "+" },
  { label: "Tonnes Processed", value: 1.2, suffix: "M+", decimals: true },
  { label: "Transaction Traceability", value: 98, suffix: "%" },
];

const howItWorks = [
  { icon: Fingerprint, title: "Farmer registers", body: "Digital farmer ID with land, crop and bank details — verified once, valid across every centre." },
  { icon: RouteIcon, title: "Discovers centre", body: "Live map of centres with real capacity, queue and predicted waiting time before travelling." },
  { icon: Radio, title: "Truck identified via RFID", body: "Vehicle automatically matched to farmer, booking and produce at the entry gate." },
  { icon: Scale, title: "Digital weighing", body: "Weighbridge captures gross, tare and net weight directly into the transaction — no manual logs." },
  { icon: Camera, title: "CV verifies produce", body: "Computer vision confirms the expected crop and flags mismatches before settlement." },
  { icon: ShieldCheck, title: "Audit recorded", body: "Every step is traceable end-to-end, protecting farmers and the procurement system." },
];

const farmerBenefits = [
  { icon: MapPin, title: "Live centre visibility", body: "See capacity, queue and waiting time before you travel." },
  { icon: Award, title: "Schemes made simple", body: "Personalised eligibility across PM-KISAN, PMFBY, KCC and more." },
  { icon: Bot, title: "Krushi AI assistant", body: "Ask questions in 9 Indian languages, any time." },
  { icon: Newspaper, title: "Advisories & news", body: "Weather, MSP and crop advisories tuned to your district." },
];

const transparencyChecks = [
  { icon: Wifi, label: "RFID truck verification" },
  { icon: Scale, label: "Digital weighing" },
  { icon: Camera, label: "CV produce verification" },
  { icon: Link2, label: "Farmer–Truck–Weight linkage" },
  { icon: Warehouse, label: "Capacity validation" },
  { icon: Lock, label: "Immutable audit trail" },
];

function StatItem({ s }: { s: (typeof stats)[number] }) {
  const { value, ref } = useCountUp(s.value);
  const shown = s.decimals ? (value / 10).toFixed(1) : value.toLocaleString("en-IN");
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center">
      <p className="font-display text-3xl font-extrabold text-white md:text-4xl">
        {shown}
        {s.suffix}
      </p>
      <p className="mt-1 text-sm font-medium text-primary-100">{s.label}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
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
            <StatusBadge tone="green" label="● GovTech AgriTech Platform · Prototype" className="!bg-white/10 !text-primary-100 !border-white/20" />
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              A Digital Bridge Between Farmers and{" "}
              <span className="text-saffron-300">Transparent Procurement.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-100 md:text-lg">
              KrushiSetu connects farmers, procurement centres, transport and agricultural services
              through one intelligent digital platform — from AI crop advice to RFID-verified digital
              weighing and same-day settlement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="amber" onClick={() => navigate("/login")} iconRight={<ArrowRight className="h-5 w-5" />}>
                Explore KrushiSetu
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
                onClick={() => navigate("/login")}
              >
                View Centre Dashboard
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-primary-100">
              {["9 Indian languages", "RFID + CV verified", "48-hour settlement"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-saffron-300" aria-hidden /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MSP ticker */}
        <div className="relative border-t border-white/10 bg-primary-950/70 backdrop-blur">
          <div className="container-page flex h-11 items-center gap-6 overflow-hidden text-sm">
            <span className="flex shrink-0 items-center gap-1.5 font-bold text-saffron-300">
              <TrendingUp className="h-4 w-4" aria-hidden /> MSP Today
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
              Demo Mode — simulated data
            </span>
          </div>
        </div>
      </section>

      {/* --------------------------- OVERVIEW ----------------------------- */}
      <section id="platform" className="container-page scroll-mt-20 py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Platform Overview</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              One platform. The entire procurement journey.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              Most tools solve one fragment — a weighing slip here, a scheme portal there. KrushiSetu
              links the whole chain: farmer registration, crop intelligence, live centre capacity, slot
              booking, RFID truck identification, digital weighment, CV produce verification and
              settlement — all under one transaction identity.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Farmer, truck, weight and produce bound to a single transaction ID",
                "Capacity-checked slot booking — no more wasted trips",
                "Every weighment backed by a tamper-evident audit trail",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-600" aria-hidden />
                  {t}
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
              <p className="text-xs font-semibold text-ink-400">Live transaction integrity</p>
              <div className="mt-2 space-y-1.5">
                {["Farmer verified", "RFID matched", "Weight captured digitally"].map((c) => (
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">How KrushiSetu Works</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              From farm gate to payment, in six connected steps
            </h2>
          </div>
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step, i) => (
              <li key={step.title} className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                    <step.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="font-display text-4xl font-extrabold text-earth-200">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.body}</p>
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
                <div key={b.title} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-600">
                    <b.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-bold text-ink-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-ink-500">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Farmer Benefits</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              Built for the farmer first
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              Large readable interfaces, nine Indian languages, mobile-first navigation and an AI
              assistant that answers in your own words. Everything a farmer needs before the truck
              even leaves the village.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate("/login")} iconRight={<ArrowRight className="h-4 w-4" />}>
                Open Farmer Mode
              </Button>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Try Crop Analysis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------- SMART PROCUREMENT ------------------------- */}
      <section className="bg-primary-900 py-16 text-white md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300">Smart Procurement</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              A control room for every procurement centre
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-100/90">
              Operators see live weighments, truck queues, lane assignments and verification alerts in
              one operational dashboard — with automated lane assignment and computer-vision produce
              verification working alongside them.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: Users, k: "10,000+", v: "farmers on network" },
                { icon: Building2, k: "250+", v: "centres connected" },
                { icon: Wheat, k: "1.2M t", v: "produce processed" },
                { icon: ShieldCheck, k: "98%", v: "traceable transactions" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <s.icon className="h-5 w-5 text-saffron-300" aria-hidden />
                  <p className="mt-2 font-display text-2xl font-extrabold">{s.k}</p>
                  <p className="text-xs text-primary-100/80">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <img src={images.centres.nagpur} alt="Grain procurement centre yard with trucks" className="aspect-video w-full rounded-2xl object-cover" />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "Live weight", v: "12,480 kg" },
                { k: "Queue", v: "7 trucks" },
                { k: "Verification", v: "96% conf." },
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Transparency & Anti-Fraud</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              Fraud has nowhere to hide
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              Every stage of procurement is digitally verified and linked. If a weight, produce or
              identity doesn't match, the transaction is flagged before payment — protecting honest
              farmers and public grain stocks alike.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {transparencyChecks.map((c) => (
                <div key={c.label} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-soft">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <c.icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <p className="text-sm font-semibold text-ink-900">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">AI-Powered Agriculture</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              Advice that speaks your language
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-500">
              Krushi AI analyses crop photos, predicts centre waiting times, explains government
              schemes and answers questions across nine Indian languages — bringing expert-level
              guidance to every farmer with a phone.
            </p>
            <div className="mt-8 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
              <div className="bg-primary-700 px-5 py-3 text-sm font-bold text-white">Krushi AI — sample conversation</div>
              <div className="space-y-3 p-5 text-sm">
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary-700 px-4 py-2.5 text-white">
                  माझ्या जवळ गहू विक्रीसाठी केंद्र कुठे आहे?
                </p>
                <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-earth-100 px-4 py-2.5 text-ink-900">
                  तुमच्या परिसरात 3 अधिकृत गहू खरेदी केंद्रे उपलब्ध आहेत. सर्वात जवळचे नागपूर सेंट्रल — 4.2 किमी, 27 मिनिटे प्रतीक्षा.
                </p>
                <div className="flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => navigate("/search")}>
                    Try the search <ArrowRight className="h-3.5 w-3.5" />
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
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">Farmer News</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900">
                Latest from the fields
              </h2>
            </div>
            <Link to="/farmer/news" className="hidden items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 md:inline-flex">
              All news <ChevronRight className="h-4 w-4" />
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
                  <p className="text-xs font-semibold text-ink-400">{a.date} · {a.readTime} min read</p>
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
              <StatItem key={s.label} s={s} />
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-primary-200/70">
            Prototype figures for demonstration — not official statistics.
          </p>
        </div>
      </section>

      {/* ----------------------------- CTA -------------------------------- */}
      <section className="container-page py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary-800 px-6 py-14 text-center text-white md:py-20">
          <img src={images.patterns.weave} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <Sprout className="mx-auto h-10 w-10 text-saffron-300" aria-hidden />
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Ready to see transparent procurement in action?
            </h2>
            <p className="mt-3 text-primary-100">
              Sign in with a demo OTP and step into the farmer journey or the centre control room.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="amber" onClick={() => navigate("/login")}>
                Farmer Experience
              </Button>
              <Button size="lg" variant="outline" className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20" onClick={() => navigate("/login")}>
                Centre Operator Experience
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
