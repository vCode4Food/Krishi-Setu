import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard, Scale, Truck, ScanBarcode, ReceiptText, FileClock,
  GitBranch, Warehouse, CalendarClock, BarChart3,
} from "lucide-react";
import { cn } from "@/utils/format";
import { Navbar } from "@/components/layout/Navbar";
import { KrushiAI } from "@/components/chatbot/KrushiAI";
import { Toasts } from "@/components/layout/Toasts";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

interface Item {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

/** Shared sidebar shell for officer / manager / admin consoles. */
export function ConsoleLayout({
  family,
  items,
  contextLabel,
  contextSub,
}: {
  family: "officer" | "centre-manager" | "district" | "state";
  items: Item[];
  contextLabel: string;
  contextSub: string;
}) {
  const { user } = useAuth();
  const { chatOpen } = useApp();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  const base = family === "district" ? "/admin/district" : family === "state" ? "/admin/state" : `/${family}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <aside
          className={cn(
            "sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-ink-100 bg-white py-4 lg:flex",
            chatOpen && "lg:pointer-events-none lg:opacity-60",
          )}
        >
          <div className="mb-3 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">{contextLabel}</p>
            <p className="text-xs font-semibold text-primary-700">{contextSub}</p>
          </div>
          <nav className="flex-1 space-y-0.5 px-2" aria-label={`${family} sections`}>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive ? "bg-primary-50 text-primary-800" : "text-ink-500 hover:bg-earth-50 hover:text-ink-900",
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mx-3 mt-2 rounded-xl bg-earth-50 p-3 text-[11px] leading-relaxed text-ink-500">
            <p className="font-bold text-ink-700">{user?.roleLabel ?? "Session"}</p>
            <p className="mt-1">{user?.employeeId ?? user?.id} · {user?.name}</p>
            <p>{user?.district ? `District: ${user.district}` : ""}{user?.state ? ` State: ${user.state}` : ""}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
      <KrushiAI />
      <Toasts />
      {/* Mobile: horizontal scroll nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label={`${family} mobile navigation`}
      >
        <div className="flex overflow-x-auto px-2 py-2">
          {items.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-semibold",
                  isActive ? "bg-primary-50 text-primary-800" : "text-ink-400",
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <span className="hidden">{base}</span>
    </div>
  );
}

export const officerItems: Item[] = [
  { to: "/officer", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/officer/weighing", label: "Live Weighing", icon: Scale },
  { to: "/officer/queue", label: "Queue", icon: Truck },
  { to: "/officer/trucks", label: "Trucks", icon: Truck },
  { to: "/officer/verification", label: "Verification", icon: ScanBarcode },
  { to: "/officer/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/officer/audit", label: "Audit", icon: FileClock },
];

export const managerItems: Item[] = [
  { to: "/centre-manager", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/centre-manager/capacity", label: "Capacity", icon: Warehouse },
  { to: "/centre-manager/lanes", label: "Lanes", icon: GitBranch },
  { to: "/centre-manager/slots", label: "Slots", icon: CalendarClock },
  { to: "/centre-manager/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/centre-manager/audit", label: "Audit", icon: FileClock },
];
