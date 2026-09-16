import { useEffect, useRef } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Sprout,
  Bell,
  Award,
  Warehouse,
  CloudSun,
  ShieldAlert,
  Stethoscope,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/utils/format";
import { useApp } from "@/context/AppContext";
import type { Notification } from "@/types";

const typeIcon: Record<Notification["type"], React.ReactNode> = {
  "slot-reminder": <CalendarClock className="h-4 w-4" />,
  "procurement-update": <CheckCircle2 className="h-4 w-4" />,
  "scheme-alert": <Award className="h-4 w-4" />,
  "crop-health-alert": <Sprout className="h-4 w-4" />,
  "expert-consultation": <Stethoscope className="h-4 w-4" />,
  "centre-capacity-alert": <Warehouse className="h-4 w-4" />,
  "weather-advisory": <CloudSun className="h-4 w-4" />,
  "verification-warning": <ShieldAlert className="h-4 w-4" />,
};

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift animate-fade-up"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary-700" />
          <h3 className="text-sm font-bold text-ink-900">Notifications</h3>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-bold text-primary-800">
            {notifications.filter((n) => !n.read).length} new
          </span>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </button>
      </div>
      <div className="max-h-[26rem] overflow-y-auto">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={cn(
              "flex w-full gap-3 border-b border-ink-100/70 px-4 py-3 text-left transition-colors last:border-0 hover:bg-earth-50",
              !n.read && "bg-primary-50/60",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                !n.read ? "bg-primary-100 text-primary-700" : "bg-earth-100 text-ink-400",
              )}
            >
              {typeIcon[n.type]}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className={cn("truncate text-sm", !n.read ? "font-bold text-ink-900" : "font-semibold text-ink-700")}>
                  {n.title}
                </span>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-saffron-400" aria-label="Unread" />}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ink-500">{n.body}</span>
              <span className="mt-1 block text-[11px] font-medium text-ink-400">{n.timestamp}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
