import { cn } from "@/utils/format";
import { capacityPercent } from "@/utils/format";

export function CapacityMeter({
  remaining,
  total,
  label = "Capacity available",
  showValues = true,
  className,
}: {
  remaining: number;
  total: number;
  label?: string;
  showValues?: boolean;
  className?: string;
}) {
  const pct = capacityPercent(remaining, total);
  const tone =
    pct >= 40 ? "bg-primary-500" : pct >= 15 ? "bg-saffron-400" : pct > 0 ? "bg-alert-500" : "bg-ink-300";

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-ink-500">{label}</span>
        <span className={cn(pct >= 40 ? "text-primary-700" : pct > 0 ? "text-saffron-600" : "text-alert-600")}>
          {pct}%
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-earth-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={cn("h-full rounded-full transition-all duration-700", tone)} style={{ width: `${pct}%` }} />
      </div>
      {showValues && (
        <p className="mt-1 text-[11px] text-ink-400">
          {(remaining / 1000).toFixed(1)}t free of {(total / 1000).toFixed(0)}t
        </p>
      )}
    </div>
  );
}
