import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Sprout,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
  Timer,
} from "lucide-react";
import { cn } from "@/utils/format";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationPanel } from "./NotificationPanel";
import type { Role } from "@/services/mockAuth";

const NAV: Record<string, { to: string; label: string }[]> = {
  farmer: [
    { to: "/farmer", label: "Dashboard" },
    { to: "/farmer/crop-health", label: "Crop Health" },
    { to: "/farmer/centres", label: "Centres" },
    { to: "/farmer/book-slot", label: "Book Slot" },
    { to: "/farmer/schemes", label: "Schemes" },
    { to: "/farmer/news", label: "News" },
    { to: "/farmer/experts", label: "Experts" },
  ],
  truck_driver: [
    { to: "/driver", label: "Dashboard" },
    { to: "/driver/trips", label: "My Trips" },
    { to: "/driver/navigation", label: "Navigation" },
    { to: "/driver/rfid", label: "RFID" },
    { to: "/driver/history", label: "History" },
  ],
  procurement_officer: [
    { to: "/officer", label: "Dashboard" },
    { to: "/officer/weighing", label: "Live Weighing" },
    { to: "/officer/queue", label: "Queue" },
    { to: "/officer/trucks", label: "Trucks" },
    { to: "/officer/verification", label: "Verification" },
    { to: "/officer/transactions", label: "Transactions" },
  ],
  centre_manager: [
    { to: "/centre-manager", label: "Dashboard" },
    { to: "/centre-manager/capacity", label: "Capacity" },
    { to: "/centre-manager/lanes", label: "Lanes" },
    { to: "/centre-manager/slots", label: "Slots" },
    { to: "/centre-manager/analytics", label: "Analytics" },
    { to: "/centre-manager/audit", label: "Audit" },
  ],
  district_admin: [
    { to: "/admin/district", label: "Dashboard" },
    { to: "/admin/district/centres", label: "Centres" },
    { to: "/admin/district/procurement", label: "Procurement" },
    { to: "/admin/district/analytics", label: "Analytics" },
    { to: "/admin/district/alerts", label: "Alerts" },
  ],
  state_admin: [
    { to: "/admin/state", label: "State Overview" },
    { to: "/admin/state/districts", label: "Districts" },
    { to: "/admin/state/centres", label: "Centres" },
    { to: "/admin/state/fraud", label: "Fraud Alerts" },
    { to: "/admin/state/analytics", label: "Analytics" },
  ],
};

const GUEST_NAV = [
  { to: "/#platform", label: "Platform" },
  { to: "/#how-it-works", label: "How it works" },
  { to: "/#transparency", label: "Transparency" },
  { to: "/#news", label: "News" },
  { to: "/#impact", label: "Impact" },
];

const isHashLink = (to: string) => to.includes("#");

const familyOf = (role: Role) =>
  ({
    farmer: "farmer",
    truck_driver: "driver",
    procurement_officer: "officer",
    centre_manager: "centre-manager",
    district_admin: "admin",
    state_admin: "admin",
    citizen: "",
  })[role] ?? "";

export function Navbar() {
  const { notifications, pushToast } = useApp();
  const { user, logout, minutesLeft } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;
  const links = (user && NAV[user.role]) || GUEST_NAV;
  const base = user ? familyOf(user.role) : "";
  const regionLabel =
    user?.role === "state_admin"
      ? user.state ?? "Maharashtra"
      : user?.district
        ? `${user.district} District`
        : user?.centreId
          ? user.centreId
          : "";

  const doLogout = () => {
    logout();
    pushToast({ kind: "info", title: "Signed out", body: "Session cleared (simulated)." });
    setMobileOpen(false);
    setNotifOpen(false);
    navigate("/login");
  };

  const initials = user
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
    : "";

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5" aria-label="KrushiSetu home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white shadow-soft">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold tracking-tight text-ink-900">
              KrushiSetu
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-700">
              {user ? user.roleLabel : "Guest"}
              {regionLabel ? ` · ${regionLabel}` : ""}
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) =>
            isHashLink(l.to) ? (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ink-500 transition-colors hover:bg-earth-100 hover:text-ink-900"
              >
                {l.label}
              </Link>
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === base || l.to === "/admin/district" || l.to === "/admin/state"}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors",
                    isActive ? "bg-primary-50 text-primary-800" : "text-ink-500 hover:bg-earth-100 hover:text-ink-900",
                  )
                }
              >
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate("/search")}
            className="hidden h-10 items-center gap-2 rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm text-ink-400 transition hover:border-primary-400 hover:text-ink-700 md:flex"
            aria-label="Open natural language search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden xl:inline">Ask in any language…</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition hover:bg-earth-100 hover:text-ink-900"
              aria-label={`Notifications (${unread} unread)`}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-saffron-400 px-1 text-[10px] font-extrabold text-ink-900">
                  {unread}
                </span>
              )}
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Session / sign-in */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white pl-1.5 pr-3 xl:flex" title="Demo session">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-700 text-[11px] font-extrabold text-white">
                  {initials}
                </span>
                <span className="leading-tight">
                  <span className="block max-w-28 truncate text-xs font-bold text-ink-900">{user.name}</span>
                  <span className="flex items-center gap-1 font-mono text-[9px] font-semibold text-ink-400">
                    <Timer className="h-2.5 w-2.5" aria-hidden />
                    {minutesLeft !== null ? `${minutesLeft}m session` : "demo"}
                  </span>
                </span>
              </span>
              <button
                onClick={doLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition hover:bg-alert-50 hover:text-alert-600"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center gap-1.5 rounded-xl bg-primary-700 px-4 text-sm font-bold text-white shadow-soft transition hover:bg-primary-800 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" aria-hidden /> Sign in
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 hover:bg-earth-100 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white xl:hidden animate-fade-up">
          <nav className="container-page grid gap-1 py-3" aria-label="Mobile">
            <button
              onClick={() => {
                setMobileOpen(false);
                navigate("/search");
              }}
              className="mb-1 flex h-11 items-center gap-2 rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm text-ink-500"
            >
              <Search className="h-4 w-4" /> Ask in any language…
            </button>
            {links.map((l) =>
              isHashLink(l.to) ? (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-ink-700 hover:bg-earth-100"
                >
                  {l.label}
                  <ChevronDown className="h-4 w-4 -rotate-90 opacity-40" />
                </Link>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === base}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold",
                      isActive ? "bg-primary-50 text-primary-800" : "text-ink-700 hover:bg-earth-100",
                    )
                  }
                >
                  {l.label}
                  <ChevronDown className="h-4 w-4 -rotate-90 opacity-40" />
                </NavLink>
              ),
            )}
            <div className="mt-2 border-t border-ink-100 pt-2">
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-700 text-sm font-bold text-white"
                >
                  <LogIn className="h-4 w-4" aria-hidden /> Sign in to KrushiSetu
                </Link>
              )}
              {user ? (
                <div className="flex items-center justify-between rounded-xl bg-earth-50 px-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink-900">{user.name}</span>
                    <span className="block text-[10px] font-semibold text-primary-700">{user.roleLabel}</span>
                  </span>
                  <button
                    onClick={doLogout}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-alert-600"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
