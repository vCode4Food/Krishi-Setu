import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, LogIn, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/Button";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/services/mockAuth";

/**
 * 403 — "restricted section" screen, sibling of the 404.
 *
 * Same family language as NotFound: field disc, furrow rows, dashed path,
 * drifting leaves, staged framer-motion entrance. The story differs: the
 * dashed trail leads to a **locked field gate** — a padlock with a swaying
 * keyhole and a radar pulse — so the visitor reads "wrong person, right
 * platform", not "error". All RBAC context (current role, requested section,
 * missing permission) is preserved from the previous design.
 */

const sectionKeys: Record<string, string> = {
  "/farmer": "unauthorized.sectionFarmer",
  "/driver": "unauthorized.sectionDriver",
  "/officer": "unauthorized.sectionOfficer",
  "/centre-manager": "unauthorized.sectionManager",
  "/admin": "unauthorized.sectionAdmin",
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const state = location.state as { requested?: string; permission?: string } | null;
  const requested = state?.requested && location.pathname === "/unauthorized" ? state.requested : location.pathname !== "/unauthorized" ? location.pathname : null;
  const family = requested ? `/${requested.split("/")[1]}` : null;
  const sectionName = family ? (sectionKeys[family] ? t(sectionKeys[family]) : family) : t("unauthorized.thisSection");
  const currentRole = user?.roleLabel ?? t("unauthorized.guestRole");

  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.55, ease: EASE },
        };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-earth-50 px-6 py-12 text-center">
      {/* Warm field backdrop — sibling of the 404's, with a faint alert tint */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        {...(reduceMotion
          ? {}
          : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.9 } })}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,var(--color-primary-50)_0,transparent_46%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,var(--color-alert-50)_0,transparent_44%)]" />
      </motion.div>

      <main className="relative flex w-full max-w-2xl flex-col items-center">
        {/* Brand */}
        <motion.div {...enter(0.1)}>
          <BrandLogo className="h-14 w-14 select-none object-contain sm:h-16 sm:w-16" />
        </motion.div>

        {/* 403 numeral — same gradient treatment as the 404 */}
        <div className="ks-404-in mt-4" aria-hidden="true">
          <p className="select-none bg-gradient-to-b from-saffron-200 via-saffron-400 to-saffron-600 bg-clip-text font-display text-[5.25rem] font-extrabold leading-none tracking-tight text-transparent sm:text-[7rem]">
            403
          </p>
        </div>

        {/* Locked-field-gate illustration */}
        <motion.div
          className="relative -mt-2 sm:-mt-4"
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 12, scale: 0.96 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { delay: 0.45, duration: 0.6, ease: EASE },
              })}
        >
          {/* drifting leaves (decorative) */}
          <span aria-hidden className="ks-leaf absolute -top-1 left-8 h-2.5 w-2.5 rounded-[0_100%_0_100%] bg-primary-200" />
          <span
            aria-hidden
            className="ks-leaf absolute right-6 top-6 h-2 w-2 rounded-[100%_0_100%_0] bg-primary-300"
            style={{ animationDelay: "3.5s" }}
          />
          <span
            aria-hidden
            className="ks-leaf absolute bottom-8 left-2 h-3 w-3 rounded-[0_100%_0_100%] bg-primary-100"
            style={{ animationDelay: "7s" }}
          />

          <svg
            viewBox="0 0 240 210"
            aria-hidden="true"
            className="h-44 w-56 sm:h-52 sm:w-64"
            fill="none"
          >
            {/* field disc */}
            <circle cx="120" cy="105" r="92" fill="#eefaf2" />
            <circle cx="120" cy="105" r="72" stroke="#d5f2e0" strokeWidth="1.5" />

            {/* crop-row furrows */}
            <path d="M 40 172 Q 120 144 200 172" stroke="#d5f2e0" strokeWidth="7" strokeLinecap="round" />
            <path d="M 50 184 Q 120 158 190 184" stroke="#ace4c2" strokeWidth="7" strokeLinecap="round" />
            <path d="M 64 195 Q 120 172 176 195" stroke="#7bd0a0" strokeWidth="6" strokeLinecap="round" />

            {/* dashed trail walks up to the gate and stops there */}
            <motion.path
              d="M 46 150 C 56 122 88 124 110 106 C 128 92 148 84 164 78"
              stroke="#ace4c2"
              strokeWidth="3"
              strokeLinecap="round"
              {...(reduceMotion
                ? {}
                : {
                    initial: { pathLength: 0 },
                    animate: { pathLength: 1 },
                    transition: { delay: 0.7, duration: 1.1, ease: "easeInOut" },
                  })}
            />
            <motion.path
              className="ks-dash"
              d="M 46 150 C 56 122 88 124 110 106 C 128 92 148 84 164 78"
              stroke="#2c9960"
              strokeWidth="3"
              strokeLinecap="round"
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 1.4, duration: 0.5 },
                  })}
            />

            {/* locked field gate — the destination you can't enter */}
            <motion.g
              style={{ transformBox: "fill-box", originX: "50%", originY: "100%" }}
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0, scale: 0.4 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { delay: 1.5, type: "spring", stiffness: 260, damping: 16 },
                  })}
            >
              <circle className="ks-pulse" cx="172" cy="52" r="12" stroke="#f7a90b" strokeWidth="2" />
              {/* gate posts */}
              <rect x="152" y="44" width="6" height="34" rx="2" fill="#1a5c38" />
              <rect x="186" y="44" width="6" height="34" rx="2" fill="#1a5c38" />
              {/* gate bars */}
              <rect x="155" y="48" width="34" height="4" rx="2" fill="#2c9960" />
              <rect x="155" y="58" width="34" height="4" rx="2" fill="#48b47b" />
              <rect x="155" y="68" width="34" height="4" rx="2" fill="#2c9960" />
              {/* padlock with gently swaying keyhole */}
              <g className="ks-needle">
                <rect x="162" y="18" width="20" height="16" rx="4" fill="#f7a90b" />
                <path d="M166 18 v-4 a6 6 0 0 1 12 0 v4" stroke="#c96e04" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <circle cx="172" cy="25" r="2.6" fill="#7c3a00" />
                <rect x="170.8" y="26" width="2.4" height="4.5" rx="1.2" fill="#7c3a00" />
              </g>
            </motion.g>

            {/* visitor figure at the trailhead — compass position in the 404 */}
            <motion.g
              style={{ transformBox: "fill-box", originX: "50%", originY: "50%" }}
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0, scale: 0.6 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { delay: 1.15, duration: 0.5, ease: EASE },
                  })}
            >
              <circle cx="46" cy="150" r="15" fill="#ffffff" stroke="#ace4c2" strokeWidth="2" />
              {/* simple person marker: head + shoulders */}
              <circle cx="46" cy="145.5" r="4" fill="#1a7c4b" />
              <path d="M 39 156 a 7 7 0 0 1 14 0 z" fill="#2c9960" />
            </motion.g>

            {/* sprout by the furrows */}
            <motion.g
              className="ks-sprout"
              transform="translate(96 176)"
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 1.3, duration: 0.5 },
                  })}
            >
              <path d="M 0 0 C 0 -8 0 -12 0 -17" stroke="#1a7c4b" strokeWidth="3" strokeLinecap="round" />
              <path d="M 0 -10 C -10 -12 -13 -18 -14 -23 C -6 -22 -1 -17 0 -10 z" fill="#2c9960" />
              <path d="M 0 -12 C 8 -14 10 -19 11 -23 C 5 -22 1 -18 0 -12 z" fill="#48b47b" />
            </motion.g>
          </svg>
        </motion.div>

        {/* Message */}
        <motion.h1 {...enter(0.95)} className="mt-5 max-w-lg font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          <span className="sr-only">403 — </span>
          {t("unauthorized.heading")}
        </motion.h1>
        <motion.p {...enter(1.1)} className="mt-2.5 max-w-xl text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
          {t("unauthorized.body")}
        </motion.p>

        {/* RBAC context card — role-aware and permission-aware, as before */}
        <motion.div
          {...enter(1.25)}
          className="mt-7 grid w-full max-w-md gap-3 rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-soft sm:grid-cols-2"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{t("unauthorized.currentRole")}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink-900">
              <BrandLogo className="h-4 w-4" /> {currentRole}
            </p>
            {user?.employeeId && <p className="mt-0.5 font-mono text-[11px] text-ink-400">{user.employeeId}</p>}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{t("unauthorized.requestedSection")}</p>
            <p className="mt-1 text-sm font-bold text-ink-900">{sectionName}</p>
            {requested && <p className="mt-0.5 font-mono text-[11px] text-ink-400">{requested}</p>}
          </div>
          {state?.permission && (
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{t("unauthorized.missingPermission")}</p>
              <p className="mt-1 font-mono text-xs font-semibold text-alert-600">{state.permission}</p>
            </div>
          )}
        </motion.div>

        {/* Actions — role-aware primary + history-aware back */}
        <motion.div
          {...enter(1.4)}
          className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          {user ? (
            <Link to={homeRouteFor(user.role)} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" iconRight={<LayoutDashboard className="h-4.5 w-4.5" aria-hidden />}>
                {t("unauthorized.returnDashboard")}
              </Button>
            </Link>
          ) : (
            <Link to="/login" state={{ from: requested }} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" iconRight={<LogIn className="h-4.5 w-4.5" aria-hidden />}>
                {t("unauthorized.signIn")}
              </Button>
            </Link>
          )}
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            icon={<ArrowLeft className="h-4.5 w-4.5 rtl-flip" aria-hidden />}
            onClick={() => {
              if (user) logout();
              window.history.length > 1 ? window.history.back() : (window.location.href = "/");
            }}
          >
            {t("unauthorized.goBack")}
          </Button>
        </motion.div>

        {/* Brand footer */}
        <motion.footer
          {...enter(1.55)}
          className="mt-10 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-ink-400"
        >
          <BrandLogo className="inline-block h-4 w-4 rounded align-middle" />
          <span>{t("unauthorized.brandLine")}</span>
        </motion.footer>
      </main>
    </div>
  );
}
