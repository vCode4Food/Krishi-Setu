import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Home, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/Button";
import { BrandLogo } from "@/components/common/BrandLogo";

/**
 * Session-expired screen — third member of the error-screen family.
 *
 * Same skeleton as the 403/404 (field disc, furrows, dashed trail, drifting
 * leaves, staged entrance), but the destination is a **sunset over the field**
 * — the working day (session) has ended. The keyhole-sway loop from the 403
 * is reused on the sun, so the family motion DNA carries through. The CTA
 * re-runs the login flow and returns the user to the deep link they were on
 * (`state.from` → Login → OTP → PostLogin round-trip, which already honours
 * role-permitted return paths).
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SessionExpired() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? null;

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
      {/* Warm field backdrop — sibling of the 403/404's */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        {...(reduceMotion
          ? {}
          : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.9 } })}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,var(--color-saffron-50)_0,transparent_46%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,var(--color-primary-50)_0,transparent_44%)]" />
      </motion.div>

      <main className="relative flex w-full max-w-2xl flex-col items-center">
        {/* Brand */}
        <motion.div {...enter(0.1)}>
          <BrandLogo className="h-14 w-14 select-none object-contain sm:h-16 sm:w-16" />
        </motion.div>

        {/* Numeral slot: session clock instead of a status code */}
        <div className="ks-404-in mt-4" aria-hidden="true">
          <p className="select-none bg-gradient-to-b from-saffron-200 via-saffron-400 to-primary-600 bg-clip-text font-display text-[5.25rem] font-extrabold leading-none tracking-tight text-transparent sm:text-[7rem]">
            30:00
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-saffron-600">
            <Timer className="h-3.5 w-3.5" aria-hidden />
            {t("sessionExpired.reason")}
          </p>
        </div>

        {/* Sunset-over-the-field illustration */}
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
          <span aria-hidden className="ks-leaf absolute -top-1 left-8 h-2.5 w-2.5 rounded-[0_100%_0_100%] bg-saffron-200" />
          <span
            aria-hidden
            className="ks-leaf absolute right-6 top-6 h-2 w-2 rounded-[100%_0_100%_0] bg-saffron-300"
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
            <circle cx="120" cy="105" r="92" fill="#fdf3df" />
            <circle cx="120" cy="105" r="72" stroke="#fdeecd" strokeWidth="1.5" />

            {/* crop-row furrows */}
            <path d="M 40 172 Q 120 144 200 172" stroke="#fdeecd" strokeWidth="7" strokeLinecap="round" />
            <path d="M 50 184 Q 120 158 190 184" stroke="#fcd98f" strokeWidth="7" strokeLinecap="round" />
            <path d="M 64 195 Q 120 172 176 195" stroke="#fbbf45" strokeWidth="6" strokeLinecap="round" />

            {/* dashed trail: the day's walk, ending at the horizon */}
            <motion.path
              d="M 46 150 C 58 124 90 126 112 108 C 132 92 150 84 168 76"
              stroke="#fcd98f"
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
              d="M 46 150 C 58 124 90 126 112 108 C 132 92 150 84 168 76"
              stroke="#ec9006"
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

            {/* setting sun sinking behind the furrows — keyhole-sway motion DNA */}
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
              <circle className="ks-needle" cx="172" cy="58" r="17" fill="#fbbf45" />
              <circle className="ks-pulse" cx="172" cy="58" r="12" stroke="#f7a90b" strokeWidth="2" />
              {/* horizon slats crossing the sun */}
              <rect x="146" y="56" width="52" height="4" rx="2" fill="#fdf3df" />
              <rect x="150" y="64" width="44" height="4" rx="2" fill="#fdeecd" />
            </motion.g>

            {/* trailhead: the farmer's mark, waiting for tomorrow */}
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
              <circle cx="46" cy="150" r="15" fill="#ffffff" stroke="#fcd98f" strokeWidth="2" />
              <circle cx="46" cy="145.5" r="4" fill="#ec9006" />
              <path d="M 39 156 a 7 7 0 0 1 14 0 z" fill="#c96e04" />
            </motion.g>

            {/* sprout resting by the furrows */}
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
              <path d="M 0 0 C 0 -8 0 -12 0 -17" stroke="#c96e04" strokeWidth="3" strokeLinecap="round" />
              <path d="M 0 -10 C -10 -12 -13 -18 -14 -23 C -6 -22 -1 -17 0 -10 z" fill="#f7a90b" />
              <path d="M 0 -12 C 8 -14 10 -19 11 -23 C 5 -22 1 -18 0 -12 z" fill="#fbbf45" />
            </motion.g>
          </svg>
        </motion.div>

        {/* Message */}
        <motion.h1 {...enter(0.95)} className="mt-5 max-w-lg font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          <span className="sr-only">30:00 — </span>
          {t("sessionExpired.heading")}
        </motion.h1>
        <motion.p {...enter(1.1)} className="mt-2.5 max-w-xl text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
          {t("sessionExpired.body")}
        </motion.p>

        {/* Actions — re-auth keeps the deep link; home is the quiet exit */}
        <motion.div
          {...enter(1.25)}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link to="/login" state={{ from: returnTo }} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" iconRight={<ArrowRight className="h-4.5 w-4.5" aria-hidden />}>
              {t("sessionExpired.signIn")}
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto" icon={<Home className="h-4.5 w-4.5" aria-hidden />}>
              {t("sessionExpired.goHome")}
            </Button>
          </Link>
        </motion.div>

        {/* Brand footer */}
        <motion.footer
          {...enter(1.45)}
          className="mt-12 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-ink-400"
        >
          <BrandLogo className="inline-block h-4 w-4 rounded align-middle" />
          <span>{t("sessionExpired.brandLine")}</span>
        </motion.footer>
      </main>
    </div>
  );
}
