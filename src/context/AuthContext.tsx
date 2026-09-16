import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DemoUser, Session } from "@/services/mockAuth";
import {
  sendOTP as svcSendOtp,
  verifyOTP as svcVerifyOtp,
  clearSession,
  persistSession,
  getCurrentUser,
  getCurrentSession,
} from "@/services/mockAuth";

export type AuthStatus = "loading" | "out" | "otp-sent" | "in" | "expired";

interface AuthContextValue {
  status: AuthStatus;
  user: DemoUser | null;
  session: Session | null;
  pendingMobile: string | null;
  demoOtp: string | null;
  otpRequestedAt: number | null;
  login: (mobile: string) => Promise<{ ok: boolean; reason?: string }>;
  verify: (code: string) => Promise<{ ok: boolean; reason?: string; reasonKey?: string }>;
  logout: (reason?: "user" | "expired") => void;
  resetFlow: () => void;
  hasPermission: (permission: string) => boolean;
  minutesLeft: number | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [pendingMobile, setPendingMobile] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [otpRequestedAt, setOtpRequestedAt] = useState<number | null>(null);

  // Session restore on load
  useEffect(() => {
    const existing = getCurrentUser();
    const sess = getCurrentSession();
    if (existing && sess) {
      setUser(existing);
      setSession(sess);
      setStatus("in");
    } else {
      setStatus("out");
    }
  }, []);

  const login = useCallback(async (mobile: string) => {
    const res = await svcSendOtp(mobile);
    setPendingMobile(mobile.replace(/\D/g, ""));
    setDemoOtp(res.demoOtp);
    setOtpRequestedAt(Date.now());
    setStatus("otp-sent");
    return { ok: true };
  }, []);

  const verify = useCallback(
    async (code: string) => {
      if (!pendingMobile) return { ok: false, reason: "Session flow expired — request a new OTP." };
      const res = await svcVerifyOtp(pendingMobile, code);
      if (res.success && res.user && res.session) {
        persistSession(res.user, res.session);
        setUser(res.user);
        setSession(res.session);
        setStatus("in");
      }
      return { ok: res.success, reason: res.reason };
    },
    [pendingMobile],
  );

  const logout = useCallback((reason: "user" | "expired" = "user") => {
    clearSession();
    setUser(null);
    setSession(null);
    setPendingMobile(null);
    setDemoOtp(null);
    setOtpRequestedAt(null);
    setStatus(reason === "expired" ? "expired" : "out");
  }, []);

  const resetFlow = useCallback(() => {
    setStatus(user ? "in" : "out");
    setPendingMobile(null);
    setDemoOtp(null);
    setOtpRequestedAt(null);
  }, [user]);

  // session expiry ticker (updates once per minute while signed in)
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  useEffect(() => {
    if (status !== "in" || !session) {
      setMinutesLeft(null);
      return;
    }
    const tick = () => {
      const mins = Math.max(0, Math.round((session.expiresAt - Date.now()) / 60000));
      setMinutesLeft(mins);
      if (mins <= 0) logout("expired");
    };
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, [status, session, logout]);

  const hasPermission = useCallback(
    (permission: string) => Boolean(user?.permissions.includes(permission)),
    [user],
  );

  const value = useMemo(
    () => ({
      status, user, session, pendingMobile, demoOtp, otpRequestedAt,
      login, verify, logout, resetFlow, hasPermission, minutesLeft,
    }),
    [status, user, session, pendingMobile, demoOtp, otpRequestedAt, login, verify, logout, resetFlow, hasPermission, minutesLeft],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
