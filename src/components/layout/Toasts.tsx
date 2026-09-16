import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/utils/format";
import { useApp } from "@/context/AppContext";

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-primary-600" />,
  error: <XCircle className="h-5 w-5 text-alert-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-saffron-500" />,
  info: <Info className="h-5 w-5 text-info-500" />,
};

const borders = {
  success: "border-l-primary-500",
  error: "border-l-alert-500",
  warning: "border-l-saffron-400",
  info: "border-l-info-500",
};

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-100 border-l-4 bg-white p-3.5 shadow-lift animate-fade-up",
            borders[t.kind],
          )}
          role="status"
        >
          <span className="mt-0.5">{icons[t.kind]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink-900">{t.title}</p>
            {t.body && <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{t.body}</p>}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="rounded-lg p-1 text-ink-400 hover:bg-earth-100 hover:text-ink-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
