import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/Button";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/services/mockAuth";

/**
 * 404 — "wrong turn" screen.
 *
 * Metaphor: a farmer took a wrong turn on the digital KrushiSetu field-path.
 * A dashed trail leaves the furrow rows, wanders, and ends at a destination
 * pin — redirecting the visitor back into the ecosystem. Continuous motion
 * (needle sway, sprout sway, dash drift, drifting leaves) is disabled under
 * prefers-reduced-motion; entrance transitions collapse to instant there too.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function NotFound() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  // Entrance helper: collapses to "already visible" when reduced motion is on.
  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.55, ease: EASE },
        };

  const primaryTo = user ? homeRouteFor(user.role) : "/login";

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-earth-50 px-6 py-12 text-center">
      {/* Warm field backdrop — two soft mint/saffron glows, nothing busy */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        {...(reduceMotion
          ? {}
          : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.9 } })}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,var(--color-primary-50)_0,transparent_46%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,var(--color-saffron-50)_0,transparent_44%)]" />
      </motion.div>

      <main className="relative flex w-full max-w-2xl flex-col items-center">
        {/* Brand */}
        <motion.div {...enter(0.1)}>
          <BrandLogo className="h-14 w-14 select-none object-contain sm:h-16 sm:w-16" />
        </motion.div>

        {/* 404 numeral — primary focus, gentle float-breathe (CSS, reduced-motion aware) */}
        <div className="ks-404-in mt-4" aria-hidden="true">
          <p className="select-none bg-gradient-to-b from-primary-300 via-primary-400 to-primary-600 bg-clip-text font-display text-[5.25rem] font-extrabold leading-none tracking-tight text-transparent sm:text-[7rem]">
            404
          </p>
        </div>

        {/* Agricultural navigation illustration */}
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

            {/* the wandering path: faint guide draws itself, dashed trail follows */}
            <motion.path
              d="M 58 152 C 64 122 96 128 116 112 C 136 96 148 92 166 66"
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
              d="M 58 152 C 64 122 96 128 116 112 C 136 96 148 92 166 66"
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

            {/* destination pin */}
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
              <circle className="ks-pulse" cx="172" cy="46" r="10" stroke="#48b47b" strokeWidth="2" />
              <path
                d="M172 30 c -10.5 0 -17 7.2 -17 16 c 0 11.5 17 26 17 26 s 17 -14.5 17 -26 c 0 -8.8 -6.5 -16 -17 -16 z"
                fill="#1a7c4b"
              />
              <circle cx="172" cy="46" r="6.5" fill="#ffffff" />
            </motion.g>

            {/* compass at the wrong-turn start */}
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
              <circle cx="58" cy="152" r="15" fill="#ffffff" stroke="#ace4c2" strokeWidth="2" />
              <g className="ks-needle">
                <polygon points="58,143 62.5,153 58,151" fill="#f7a90b" />
                <polygon points="58,161 53.5,151 58,153" fill="#7bd0a0" />
              </g>
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
        <motion.h1
          {...enter(0.95)}
          className="mt-5 max-w-lg font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl"
        >
          <span className="sr-only">404 — </span>
          {t("notFound.heading")}
        </motion.h1>
        <motion.p {...enter(1.1)} className="mt-2.5 max-w-xl text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
          {t("notFound.body")}
        </motion.p>

        {/* Actions */}
        <motion.div
          {...enter(1.25)}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link to={primaryTo} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" iconRight={<ArrowRight className="h-4.5 w-4.5" aria-hidden />}>
              {user ? t("notFound.backDashboard") : t("notFound.goLogin")}
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto" icon={<Home className="h-4.5 w-4.5" aria-hidden />}>
              {t("notFound.goHome")}
            </Button>
          </Link>
        </motion.div>

        {/* Brand footer */}
        <motion.footer
          {...enter(1.45)}
          className="mt-12 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-ink-400"
        >
          <BrandLogo className="inline-block h-4 w-4 rounded align-middle" />
          <span>
            KrushiSetu — {t("footer.tagline")}
          </span>
        </motion.footer>
      </main>
    </div>
  );
}
