import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Scale,
  Truck,
  ScanBarcode,
  GitBranch,
  ReceiptText,
  FileClock,
  BarChart3,
} from "lucide-react";
import { cn } from "@/utils/format";
import { Navbar } from "@/components/layout/Navbar";
import { KrushiAI } from "@/components/chatbot/KrushiAI";
import { Toasts } from "@/components/layout/Toasts";
import { useApp } from "@/context/AppContext";

const sidebar = [
  { to: "/centre", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/centre/weighing", label: "Live Weighing", icon: Scale },
  { to: "/centre/trucks", label: "Incoming Trucks", icon: Truck },
  { to: "/centre/lanes", label: "Lane Assignment", icon: GitBranch },
  { to: "/centre/verification", label: "CV Verification", icon: ScanBarcode },
  { to: "/centre/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/centre/audit", label: "Audit Trail", icon: FileClock },
  { to: "/centre/analytics", label: "Reports", icon: BarChart3 },
];

export function CentreLayout() {
  const { chatOpen } = useApp();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-ink-100 bg-white py-4 lg:flex",
            chatOpen && "lg:pointer-events-none lg:opacity-60",
          )}
        >
          <div className="mb-3 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Nagpur Central</p>
            <p className="text-xs font-semibold text-primary-700">● Operational — 4 lanes</p>
          </div>
          <nav className="flex-1 space-y-0.5 px-2" aria-label="Centre sections">
            {sidebar.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-800"
                      : "text-ink-500 hover:bg-earth-50 hover:text-ink-900",
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mx-3 mt-2 rounded-xl bg-earth-50 p-3 text-[11px] leading-relaxed text-ink-500">
            <p className="font-bold text-ink-700">Operator session</p>
            <p className="mt-1">OP-102 · Amit Deshmukh</p>
            <p>Console CN-02 · Weighbridge WB-03</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
      <KrushiAI />
      <Toasts />
    </div>
  );
}
