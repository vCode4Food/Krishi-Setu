import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Sprout, MapPin, CalendarPlus, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/format";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { KrushiAI } from "@/components/chatbot/KrushiAI";
import { Toasts } from "@/components/layout/Toasts";
import { useApp } from "@/context/AppContext";

const bottomNav = [
  { to: "/farmer", key: "home", icon: LayoutDashboard, end: true },
  { to: "/farmer/centres", key: "centres", icon: MapPin },
  { to: "/farmer/book-slot", key: "book", icon: CalendarPlus },
  { to: "/farmer/crop-health", key: "crop", icon: Sprout },
  { to: "/farmer/profile", key: "profile", icon: User },
];

export function FarmerLayout() {
  const { chatOpen } = useApp();
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container-page flex-1 py-6 md:py-8">
        <Outlet />
      </main>
      <Footer />
      <KrushiAI />
      <Toasts />
      {/* Mobile bottom navigation */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-[60] border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
          chatOpen && "hidden",
        )}
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
                  {t(`navbar.${item.key}`)}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
