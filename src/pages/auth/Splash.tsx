import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Wheat, Warehouse, Scale, IndianRupee, Radar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/services/mockAuth";

const pipeline = [
  { icon: Wheat, label: "Farmer" },
  { icon: Sprout, label: "Crop" },
  { icon: Warehouse, label: "Centre" },
  { icon: Scale, label: "Weigh" },
  { icon: IndianRupee, label: "Procure" },
  { icon: Radar, label: "Track" },
];

const messages = [
  "Preparing your KrushiSetu experience…",
  "Checking secure session…",
  "Loading procurement centres…",
  "Syncing live availability…",
  "Ready to connect…",
];

export default function Splash() {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 420);
    return () => clearInterval(t);
  }, []);

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
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-800 shadow-lift ring-1 ring-white/10">
          <Sprout className="h-10 w-10 text-primary-200" aria-hidden />
        </span>
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
        Kisan Se Kendra Tak, Har Kadam Aasaan.
      </p>

      {/* pipeline */}
      <div className="mt-10 flex items-center gap-1.5 sm:gap-2.5" aria-hidden>
        {pipeline.map((p, i) => (
          <motion.div
            key={p.label}
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
                {p.label}
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
          {messages[msgIdx]}
        </motion.p>
      </div>

      <div className="mt-4 h-1 w-44 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-saffron-400"
          initial={{ width: "8%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.45, ease: "easeInOut" }}
        />
      </div>

      <p className="absolute bottom-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-300/70">
        Prototype Demo
      </p>
    </div>
  );
}
