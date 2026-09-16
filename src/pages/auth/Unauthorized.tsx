import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogIn, LayoutDashboard, Sprout } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/services/mockAuth";

const sectionNames: Record<string, string> = {
  "/farmer": "Farmer Services",
  "/driver": "Driver Console",
  "/officer": "Procurement Operations",
  "/centre-manager": "Centre Management",
  "/admin": "Administration",
};

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const state = location.state as { requested?: string; permission?: string } | null;
  const requested = state?.requested && location.pathname === "/unauthorized" ? state.requested : location.pathname !== "/unauthorized" ? location.pathname : null;
  const family = requested ? `/${requested.split("/")[1]}` : null;
  const sectionName = family ? sectionNames[family] ?? family : "this section";
  const currentRole = user?.roleLabel ?? "Guest (not signed in)";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-earth-50 px-6 py-12 text-center">
      <p className="font-display text-7xl font-extrabold tracking-tight text-alert-200">403</p>
      <span className="mt-2 flex h-16 w-16 items-center justify-center rounded-3xl bg-alert-50 text-alert-600">
        <ShieldAlert className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-900">Access Restricted</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">
        You don't have permission to access this area. KrushiSetu enforces role-based access so
        farmer data, centre operations and government administration stay separate.
      </p>

      <div className="mt-7 grid w-full max-w-md gap-3 rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-soft sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Current role</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink-900">
            <Sprout className="h-4 w-4 text-primary-600" aria-hidden /> {currentRole}
          </p>
          {user?.employeeId && <p className="mt-0.5 font-mono text-[11px] text-ink-400">{user.employeeId}</p>}
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Requested section</p>
          <p className="mt-1 text-sm font-bold text-ink-900">{sectionName}</p>
          {requested && <p className="mt-0.5 font-mono text-[11px] text-ink-400">{requested}</p>}
        </div>
        {state?.permission && (
          <div className="sm:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Missing permission</p>
            <p className="mt-1 font-mono text-xs font-semibold text-alert-600">{state.permission}</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
        {user ? (
          <Link
            to={homeRouteFor(user.role)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-800"
          >
            <LayoutDashboard className="h-4.5 w-4.5" aria-hidden /> Return to my dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            state={{ from: requested }}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-800"
          >
            <LogIn className="h-4.5 w-4.5" aria-hidden /> Sign in
          </Link>
        )}
        <button
          onClick={() => {
            if (user) logout();
            window.history.length > 1 ? window.history.back() : (window.location.href = "/");
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-bold text-ink-900 transition hover:border-primary-400"
        >
          <ArrowLeft className="h-4.5 w-4.5" aria-hidden /> Go back
        </button>
      </div>

      <p className="mt-10 flex items-center gap-1.5 text-[11px] text-ink-300">
        <Sprout className="h-3.5 w-3.5" aria-hidden /> KrushiSetu · Prototype authorization (RBAC simulation)
      </p>
    </div>
  );
}
