import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Leaf, Wheat, Warehouse, Scale, IndianRupee, Radar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/services/mockAuth";
import { BrandLogo } from "@/components/common/BrandLogo";

const pipeline = [
  { icon: Wheat, key: "pipelineFarmer" },
  { icon: Leaf, key: "pipelineCrop" },
  { icon: Warehouse, key: "pipelineCentre" },
  { icon: Scale, key: "pipelineWeigh" },
  { icon: IndianRupee, key: "pipelineProcure" },
  { icon: Radar, key: "pipelineTrack" },
];

const messages = [
  "splash.msg1",
  "splash.msg2",
  "splash.msg3",
  "splash.msg4",
  "splash.msg5",
];

export default function Splash() {
  const { status, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [msgIdx, setMsgIdx] = useState(0);
  // Two-phase progress: crawl toward 85% while the session restores, then
  // finish to 100% once auth state is known — slow first loads feel alive
  // instead of stuck, and the bar never sits at 0.
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 420);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const ready = status !== "loading";
    const t = setInterval(() => {
      setProgress((p) => {
        const target = ready ? 100 : 85;
        const step = ready ? (100 - p) * 0.28 + 1.5 : (85 - p) * 0.05 + 0.35;
        return Math.min(target, p + step);
      });
    }, 70);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status === "loading") return; // still restoring session
    const t = setTimeout(() => {
      navigate(status === "in" && user ? homeRouteFor(user.role) : "/login", { replace: true });
    }, 1500);
    return () => clearTimeout(t);
  }, [status, user, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primary-950 px-6 text-center text-white">
      {/* soft field backdrop */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: "radial-gradient(circle at 25% 20%, #2c9960 0, transparent 42%), radial-gradient(circle at 78% 78%, #9c865f 0, transparent 46%)",
        }}
        aria-hidden
      />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <BrandLogo className="mx-auto h-20 w-20 rounded-3xl bg-white object-contain p-1.5 shadow-lift ring-1 ring-white/20" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mt-6 font-display text-3xl font-extrabold tracking-tight"
      >
        KrushiSetu
      </motion.h1>
      <p className="mt-1.5 text-sm font-medium text-primary-200">
        {t("splash.tagline")}
      </p>

      {/* pipeline */}
      <div className="mt-10 flex items-center gap-1.5 sm:gap-2.5" aria-hidden>
        {pipeline.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.12 }}
            className="flex items-center gap-1.5 sm:gap-2.5"
          >
            <span className="flex flex-col items-center gap-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 sm:h-10 sm:w-10">
                <p.icon className="h-4.5 w-4.5 text-saffron-300" />
              </span>
              <span className="hidden text-[9px] font-bold uppercase tracking-wider text-primary-200 sm:block">
                {t(`splash.${p.key}`)}
              </span>
            </span>
            {i < pipeline.length - 1 && (
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.45 + i * 0.12, duration: 0.3 }}
                className="h-px w-4 origin-left bg-primary-500/70 sm:w-7"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-10 h-5" aria-live="polite">
        <motion.p key={msgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold tracking-wide text-primary-100/90">
          {t(messages[msgIdx])}
        </motion.p>
      </div>

      <div
        className="mt-4 h-1 w-44 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={t("splash.loadingAria")}
      >
        <div
          className="h-full rounded-full bg-saffron-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="absolute bottom-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-300/70">
        {t("splash.prototypeDemo")}
      </p>
    </div>
  );
}
