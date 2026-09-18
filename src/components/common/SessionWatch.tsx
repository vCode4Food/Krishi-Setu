import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

/**
 * Global bridge: fires the inactivity-warning toast 60s before the session
 * expires, with a "Stay signed in" action that renews the session in place
 * (no re-login). Fires once per session window — renewing re-arms the
 * watcher for the next window. Rendered once, inside AppProvider + AuthProvider.
 */
export function SessionWatch() {
  const { status, session, renewSession } = useAuth();
  const { pushToast } = useApp();
  const { t } = useTranslation();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (status !== "in" || !session) {
      warnedRef.current = false;
      return;
    }
    const check = () => {
      const msLeft = session.expiresAt - Date.now();
      if (msLeft <= 60_000 && msLeft > 0 && !warnedRef.current) {
        warnedRef.current = true;
        pushToast({
          kind: "warning",
          title: t("sessionWarning.title", { minutes: 1 }),
          body: t("sessionWarning.body"),
          actionLabel: t("sessionWarning.stay"),
          onAction: renewSession,
          durationMs: 0, // pin until acted on or dismissed
        });
      }
    };
    check();
    const iv = setInterval(check, 10_000);
    return () => clearInterval(iv);
  }, [status, session, pushToast, renewSession, t]);

  return null;
}
