import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/format";
import { useCountUp } from "@/hooks/useCountUp";
import { formatNumber } from "@/utils/format";

export function StatCard({
  label,
  value,
  icon,
  suffix = "",
  prefix = "",
  delta,
  deltaDown = false,
  tone = "green",
  animate = false,
  className,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  suffix?: string;
  prefix?: string;
  delta?: string;
  deltaDown?: boolean;
  tone?: "green" | "amber" | "red" | "blue";
  animate?: boolean;
  className?: string;
}) {
  const { value: animated, ref } = useCountUp(animate ? value : 0);
  const shown = animate ? animated : value;

  const tones = {
    green: "bg-primary-50 text-primary-700",
    amber: "bg-saffron-100 text-saffron-600",
    red: "bg-alert-50 text-alert-600",
    blue: "bg-info-50 text-info-600",
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cn("rounded-2xl border border-ink-100 bg-white p-4 shadow-soft md:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-ink-900 md:text-3xl">
            {prefix}
            {formatNumber(shown)}
            {suffix}
          </p>
          {delta && (
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-xs font-semibold",
                deltaDown ? "text-alert-600" : "text-primary-600",
              )}
            >
              {deltaDown ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
              {delta}
            </p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
