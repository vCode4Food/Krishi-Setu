import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/format";

const RESEND_SECONDS = 30;

export default function OtpVerification() {
  const { pendingMobile, demoOtp, login, verify } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from;

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // countdown
  useEffect(() => {
    setSecondsLeft(RESEND_SECONDS);
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [demoOtp]);

  // if the flow was refreshed away, bounce back to login
  useEffect(() => {
    if (!pendingMobile) navigate("/login", { replace: true });
  }, [pendingMobile, navigate]);

  const code = digits.join("");

  const setDigit = (i: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length > 1) {
      // paste handling
      const paste = clean.slice(0, 6).split("");
      const next = Array(6).fill("");
      paste.forEach((d, j) => (next[j] = d));
      setDigits(next);
      inputs.current[Math.min(5, paste.length - 1)]?.focus();
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (code.length !== 6 || checking) return;
    setError(null);
    setChecking(true);
    const res = await verify(code);
    setChecking(false);
    if (!res.ok) {
      setError(res.reason ?? "Verification failed.");
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      navigate("/post-login", { replace: true, state: { from: returnTo } });
    }, 700);
  };

  const resend = async () => {
    if (!pendingMobile || secondsLeft > 0) return;
    await login(pendingMobile);
    setDigits(Array(6).fill(""));
    setError(null);
    inputs.current[0]?.focus();
  };

  const masked = pendingMobile ? `+91 ${pendingMobile.slice(0, 5)} ${pendingMobile.slice(5)}` : "";

  return (
    <div className="flex min-h-screen flex-col bg-earth-50">
      <div className="container-page flex flex-1 flex-col items-center justify-center py-10">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 text-white">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-extrabold text-ink-900">KrushiSetu</span>
        </Link>

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center">
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary-600" aria-hidden />
                </motion.span>
                <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900">Verified!</h1>
                <p className="mt-1 text-sm text-ink-500">Detecting your role…</p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => navigate("/login")} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Change mobile number
                </button>
                <h1 className="font-display text-2xl font-extrabold text-ink-900">OTP Verification</h1>
                <p className="mt-1.5 text-sm text-ink-500">
                  Enter the 6-digit code sent to <strong className="text-ink-900">{masked}</strong>
                </p>

                <form onSubmit={submit} className="mt-7">
                  <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="6-digit OTP">
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputs.current[i] = el;
                        }}
                        value={d}
                        onChange={(e) => setDigit(i, e.target.value)}
                        onKeyDown={(e) => onKeyDown(i, e)}
                        inputMode="numeric"
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        maxLength={6}
                        aria-label={`OTP digit ${i + 1}`}
                        className={cn(
                          "h-14 w-full max-w-14 rounded-xl border-2 bg-white text-center font-display text-2xl font-extrabold outline-none transition",
                          d ? "border-primary-600 text-primary-800" : "border-ink-200 text-ink-900",
                          "focus:border-primary-500 focus:ring-4 focus:ring-primary-100",
                        )}
                      />
                    ))}
                  </div>

                  {demoOtp && (
                    <p className="mt-4 rounded-xl border border-info-500/20 bg-info-50 px-3.5 py-2.5 text-sm text-info-600">
                      <strong>Demo OTP:</strong>{" "}
                      <button type="button" onClick={() => setDigits(demoOtp.split(""))} className="font-mono font-extrabold underline underline-offset-2">
                        {demoOtp}
                      </button>{" "}
                      (tap to autofill — simulates the SMS)
                    </p>
                  )}

                  {error && (
                    <p className="mt-4 rounded-xl bg-alert-50 px-3.5 py-2.5 text-sm font-semibold text-alert-700" role="alert">
                      {error}
                    </p>
                  )}

                  <Button type="submit" size="lg" className="mt-5 w-full" loading={checking} disabled={code.length !== 6} icon={<ShieldCheck className="h-5 w-5" />}>
                    {checking ? "Verifying…" : "Verify & Continue"}
                  </Button>
                </form>

                <div className="mt-5 flex items-center justify-between text-sm">
                  {secondsLeft > 0 ? (
                    <p className="text-ink-400">
                      Resend OTP in <span className="font-mono font-bold text-ink-700">{String(secondsLeft).padStart(2, "0")}s</span>
                    </p>
                  ) : (
                    <button onClick={resend} className="font-bold text-primary-700 hover:text-primary-800">
                      Resend OTP
                    </button>
                  )}
                  <button onClick={() => navigate("/login")} className="font-semibold text-ink-500 hover:text-ink-900">
                    Change number
                  </button>
                </div>

                <p className="mt-8 text-center text-xs leading-relaxed text-ink-400">
                  Prototype authentication — no real SMS is sent. OTP is shown on screen for the demo.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
