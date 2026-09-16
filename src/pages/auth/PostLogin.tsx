import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Wheat, Truck, ClipboardList, Warehouse, Map, Flag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/services/mockAuth";

const roleMeta: Record<string, { icon: typeof Wheat; blurbKey: string }> = {
  farmer: { icon: Wheat, blurbKey: "auth.openFarmer" },
  truck_driver: { icon: Truck, blurbKey: "auth.openDriver" },
  procurement_officer: { icon: ClipboardList, blurbKey: "auth.openOfficer" },
  centre_manager: { icon: Warehouse, blurbKey: "auth.openManager" },
  district_admin: { icon: Map, blurbKey: "auth.openDistrict" },
  state_admin: { icon: Flag, blurbKey: "auth.openState" },
};

export default function PostLogin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    const t = setTimeout(() => {
      const home = homeRouteFor(user.role);
      if (returnTo && home !== "/unauthorized") {
        // allow only route families this role may visit
        const fam = `/${returnTo.split("/")[1]}`;
        const allowed: Record<string, string[]> = {
          "/farmer": ["/farmer"],
          "/driver": ["/driver"],
          "/officer": ["/officer"],
          "/centre-manager": ["/centre-manager"],
          "/admin": ["/admin"],
          "/unauthorized": [],
        };
        if ((allowed[home] ?? []).includes(fam) || !["/farmer", "/driver", "/officer", "/centre-manager", "/admin"].includes(fam)) {
          navigate(returnTo, { replace: true });
          return;
        }
      }
      navigate(home, { replace: true });
    }, 1200);
    return () => clearTimeout(t);
  }, [user, navigate, returnTo]);

  const meta = user ? roleMeta[user.role] : null;
  const Icon = meta?.icon ?? Loader2;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-950 px-6 text-center text-white">
      <div className="relative">
        <div className="absolute -inset-5 animate-ping rounded-full bg-primary-600/30" aria-hidden />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-800 ring-1 ring-white/10">
          <Icon className="h-9 w-9 text-saffron-300" aria-hidden />
        </span>
      </div>
      <h1 className="mt-7 font-display text-2xl font-extrabold">
        {user ? t("auth.welcomeName", { name: user.name.split(" ")[0] }) : t("auth.signingIn")}
      </h1>
      <p className="mt-1.5 flex items-center justify-center gap-2 text-sm text-primary-100">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {meta ? t(meta.blurbKey) : t("auth.verifyingSession")}
      </p>
      {user && (
        <p className="mt-5 rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs font-bold tracking-wide text-primary-100">
          {user.roleLabel} · {user.farmerId ?? user.employeeId ?? user.id}
        </p>
      )}
    </div>
  );
}
