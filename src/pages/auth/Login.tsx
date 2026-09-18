import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  UserX,
  CircleCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { demoUsers } from "@/services/mockAuth";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/Badges";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { BrandLogo } from "@/components/common/BrandLogo";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from;

  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundName, setFoundName] = useState<string | null>(null);

  const clean = phone.replace(/\D/g, "");
  const detected = demoUsers.find((usr) => usr.mobile === clean);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (clean.length !== 10) {
      setError(t("auth.invalidMobile"));
      return;
    }
    setError(null);
    setSending(true);
    await login(clean);
    setSending(false);
    navigate("/otp-verification", { state: { from: returnTo } });
  };

  const useDemo = (mobile: string) => {
    setPhone(mobile);
    setError(null);
    setFoundName(null);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-primary-900 text-white lg:block">
        {/* Language selector floats top-right over the brand visual */}
        <div className="absolute right-4 top-4 z-10">
          <div className="rounded-xl bg-white/10 backdrop-blur">
            <LanguageSelector compact />
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-primary-900/70 to-primary-800/40" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-10 w-10 rounded-xl bg-white/95 object-cover p-1 shadow-lift" />
            <span className="font-display text-xl font-extrabold">KrushiSetu</span>
          </Link>
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight">
              {t("auth.brandPitch1")}
              <br />
              {t("auth.brandPitch2")} <span className="text-saffron-300">{t("auth.brandPitch3")}</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-100">
              {t("auth.brandBlurb")}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-primary-100">
              {[t("auth.bulletOtp"), t("auth.bulletRbac"), t("auth.bulletSession")].map((txt) => (
                <li key={txt} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-saffron-300" aria-hidden /> {txt}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-primary-200/70">{t("auth.noSms")}</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center bg-earth-50 px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Language selector stays reachable on mobile auth screens too */}
          <div className="mb-2 flex justify-end lg:hidden">
            <LanguageSelector compact />
          </div>
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandLogo className="h-10 w-10 rounded-xl bg-white object-cover p-1 shadow-soft ring-1 ring-primary-100" />
            <span className="font-display text-xl font-extrabold text-ink-900">KrushiSetu</span>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-ink-900">{t("auth.welcome")}</h1>
          <p className="mt-1 text-sm text-ink-500">{t("auth.subtitle")}</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-400">{t("auth.mobileLabel")}</span>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 transition focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
                <Phone className="h-4.5 w-4.5 text-ink-400" aria-hidden />
                <span className="text-sm font-bold text-ink-500">+91</span>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10));
                    setError(null);
                    setFoundName(null);
                  }}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  aria-label="Mobile number"
                  className="h-12 flex-1 bg-transparent text-base font-semibold tracking-wide outline-none"
                />
                {detected && <CircleCheck className="h-5 w-5 shrink-0 text-primary-600" aria-hidden />}
              </div>
            </label>

            {/* Role detection preview */}
            <AnimatePresence mode="wait">
              {clean.length === 10 && (
                <motion.div
                  key={clean}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-2xl border border-ink-100 bg-white p-4"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{t("auth.lookupLabel")}</p>
                  {detected ? (
                    <div className="mt-2">
                      <p className="text-sm font-bold text-ink-900">{detected.name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StatusBadge
                          tone={detected.role === "farmer" ? "green" : detected.role === "truck_driver" ? "amber" : detected.role.startsWith("admin") ? "red" : "blue"}
                          label={detected.roleLabel}
                        />
                        <span className="font-mono text-[11px] font-semibold text-ink-400">
                          {detected.farmerId ?? detected.employeeId ?? detected.id}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start gap-2">
                      <UserX className="mt-0.5 h-4.5 w-4.5 shrink-0 text-saffron-500" aria-hidden />
                      <p className="text-xs leading-relaxed text-ink-500">
                        {t("auth.notRegistered")}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {foundName && <p className="hidden">{foundName}</p>}

            {error && (
              <p className="rounded-xl bg-alert-50 px-3.5 py-2.5 text-sm font-semibold text-alert-700" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={sending} iconRight={<ArrowRight className="h-5 w-5" />}>
              {t("auth.continue")}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7 rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary-700">{t("auth.demoHeading")}</p>
            <div className="mt-2.5 grid gap-1.5">
              {demoUsers.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => useDemo(usr.mobile)}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-left transition hover:shadow-soft"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <img src={usr.avatar} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink-900">{usr.name}</span>
                      <span className="block font-mono text-[10px] text-ink-400">+91 {usr.mobile}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-primary-700">
                    {usr.roleLabel}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-ink-500">
              {t("auth.demoHint")}
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-ink-400">
            <Link to="/" className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-800">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("auth.backHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
