import { Outlet, useLocation, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, Route as RouteIcon, Truck, Radar, History } from "lucide-react";
import { cn } from "@/utils/format";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { KrushiAI } from "@/components/chatbot/KrushiAI";
import { Toasts } from "@/components/layout/Toasts";

const bottomNav = [
  { to: "/driver", label: "Today", icon: LayoutDashboard, end: true },
  { to: "/driver/trips", label: "Trips", icon: RouteIcon },
  { to: "/driver/navigation", label: "Navigate", icon: Radar },
  { to: "/driver/vehicle", label: "Vehicle", icon: Truck },
  { to: "/driver/history", label: "History", icon: History },
];

export function DriverLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container-page flex-1 py-6 pb-24 md:py-8 md:pb-8">
        <Outlet />
      </main>
      <Footer />
      <KrushiAI />
      <Toasts />
      <nav
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
        aria-label="Bottom navigation"
      >
        <div className="grid grid-cols-5">
          {bottomNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                  isActive ? "text-primary-700" : "text-ink-400",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-primary-50",
                    )}
                  >
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
