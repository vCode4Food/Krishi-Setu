import { CalendarClock, Landmark, CheckCircle2 } from "lucide-react";
import type { Scheme } from "@/types";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badges";
import { Button } from "@/components/common/Button";

const statusMap: Record<Scheme["status"], { tone: "green" | "amber" | "gray"; label: string }> = {
  open: { tone: "green", label: "Open" },
  "closing-soon": { tone: "amber", label: "Closing Soon" },
  enrolled: { tone: "green", label: "Enrolled ✓" },
  closed: { tone: "gray", label: "Closed" },
};

export function SchemeCard({
  scheme,
  onApply,
  onEligibility,
  onDetails,
}: {
  scheme: Scheme;
  onApply?: (s: Scheme) => void;
  onEligibility?: (s: Scheme) => void;
  onDetails?: (s: Scheme) => void;
}) {
  const st = statusMap[scheme.status];
  return (
    <Card hover className="flex h-full flex-col overflow-hidden">
      <div className="relative">
        <img src={scheme.image} alt={scheme.name} className="aspect-[16/7] w-full object-cover" />
        <span className="absolute left-3 top-3">
          <StatusBadge tone={st.tone} label={st.label} className="!bg-white/95" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
          <Landmark className="h-3.5 w-3.5" aria-hidden /> {scheme.department}
        </p>
        <h3 className="mt-1.5 font-bold leading-snug text-ink-900">
          <button type="button" onClick={() => onDetails?.(scheme)} className="text-left hover:text-primary-800">
            {scheme.name}
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-500">{scheme.description}</p>

        <div className="mt-3 rounded-xl bg-primary-50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-700">Benefit</p>
          <p className="text-sm font-bold text-primary-900">{scheme.benefit}</p>
        </div>

        <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden /> {scheme.deadline}
        </p>

        <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
          {scheme.applied ? (
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-100 px-3 py-2 text-sm font-bold text-primary-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Enrolled
            </span>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              disabled={scheme.status === "closed"}
              onClick={() => onApply?.(scheme)}
            >
              {scheme.status === "closed" ? "Closed" : "Apply Now"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onEligibility?.(scheme)}>
            Check Eligibility
          </Button>
        </div>
      </div>
    </Card>
  );
}
