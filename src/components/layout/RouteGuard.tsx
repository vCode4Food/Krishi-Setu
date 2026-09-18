import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { roleAllowsRoute } from "@/services/mockAuth";
import type { Role } from "@/services/mockAuth";
import { useApp } from "@/context/AppContext";

/**
 * RoleRoute — protects a route family. Requires an authenticated session whose
 * role is allowed on this route; otherwise renders /unauthorized with context.
 */
export function RoleRoute({ family }: { family: "farmer" | "driver" | "officer" | "centre-manager" | "admin" }) {
  const { status, user } = useAuth();
  const { setMode } = useApp();
  const location = useLocation();
  const allowed = Boolean(user && status === "in" && roleAllowsRoute(user.role, `/${family}`));

  // sync app-shell mode for existing farmer/centre layouts (hooks before any return)
  useEffect(() => {
    if (!allowed) return;
    if (family === "farmer") setMode("farmer");
    if (family === "officer" || family === "centre-manager") setMode("centre");
  }, [allowed, family, setMode]);

  if (status === "loading") return null;
  // Session ran out while the user was inside a protected area — send them to
  // the dedicated expired screen (not the generic login) with return context.
  if (status === "expired") {
    return <Navigate to="/session-expired" state={{ from: location.pathname }} replace />;
  }
  if (status !== "in" || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!allowed) {
    return <Navigate to="/unauthorized" state={{ requested: location.pathname }} replace />;
  }

  return <Outlet />;
}

/** PermissionRoute — fine-grained capability gate inside a role's area. */
export function PermissionRoute({ permission }: { permission: string }) {
  const { hasPermission } = useAuth();
  const location = useLocation();
  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" state={{ requested: location.pathname, permission }} replace />;
  }
  return <Outlet />;
}

/** Convenience for typed role checks. */
export const roleHome = (role: Role) =>
  ({
    farmer: "/farmer",
    truck_driver: "/driver",
    procurement_officer: "/officer",
    centre_manager: "/centre-manager",
    district_admin: "/admin/district",
    state_admin: "/admin/state",
    citizen: "/unauthorized",
  })[role];
