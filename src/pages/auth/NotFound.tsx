import { Link } from "react-router-dom";
import { Compass, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/services/mockAuth";

export default function NotFound() {
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-earth-50 px-6 py-12 text-center">
      <p className="font-display text-7xl font-extrabold tracking-tight text-primary-200">404</p>
      <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Compass className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">
        {t("notFound.heading")}
      </h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        {t("notFound.body")}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to={user ? homeRouteFor(user.role) : "/login"}>
          <Button>{user ? t("notFound.backDashboard") : t("notFound.goLogin")}</Button>
        </Link>
        <Link to="/">
          <Button variant="outline">{t("notFound.goHome")}</Button>
        </Link>
      </div>
      <p className="mt-10 flex items-center gap-1.5 text-[11px] text-ink-300">
        <Sprout className="h-3.5 w-3.5" aria-hidden /> KrushiSetu — Digital Agriculture. Transparent Procurement.
      </p>
    </div>
  );
}
