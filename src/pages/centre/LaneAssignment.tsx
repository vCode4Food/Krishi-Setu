import { useState } from "react";
import { GitBranch, Truck, Wand2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { buildLanes, assignLane } from "@/services/mockProcurement";
import type { Lane } from "@/services/mockProcurement";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { LaneStateBadge, StatusBadge } from "@/components/common/Badges";
import { cn } from "@/utils/format";

export default function LaneAssignment() {
  const { pushToast } = useApp();
  const [lanes, setLanes] = useState<Lane[]>(() => buildLanes(4));
  const [queue] = useState([
    { reg: "MH-31-EF-1109", crop: "Wheat" },
    { reg: "RJ-14-JK-7788", crop: "Rice" },
    { reg: "MH-27-GH-3301", crop: "Tomato" },
  ]);
  const [assigning, setAssigning] = useState(false);

  const autoAssign = async (reg: string, crop: string) => {
    setAssigning(true);
    const res = await assignLane(lanes, reg, `Weighing — ${crop}`);
    setAssigning(false);
    if (!res.lane) {
      pushToast({ kind: "warning", title: "No lane available", body: "All lanes are occupied or under maintenance." });
      return;
    }
    setLanes(res.lanes);
    pushToast({ kind: "success", title: `Truck assigned to ${res.lane.name}`, body: `${reg} · ${crop}` });
  };

  return (
    <div>
      <PageHeader
        title="Lane Assignment"
        description="Automatic assignment based on lane availability, operation type and queue position."
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "Lane Assignment" }]}
        actions={<StatusBadge tone="green" label="● Auto-assign active" />}
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {lanes.map((l) => (
            <Card
              key={l.id}
              className={cn(
                "p-5 transition-colors",
                l.state === "available" && "border-primary-200 bg-primary-50/40",
                l.state === "maintenance" && "bg-earth-50",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-wide text-ink-900">
                  <GitBranch className="h-4.5 w-4.5 text-primary-700" aria-hidden /> {l.name}
                </h2>
                <LaneStateBadge state={l.state} />
              </div>
              {l.truck ? (
                <div className="mt-3 rounded-xl bg-white px-3.5 py-3 shadow-soft">
                  <p className="font-mono text-sm font-extrabold text-ink-900">{l.truck}</p>
                  <p className="mt-0.5 text-xs font-semibold text-ink-500">{l.operation}</p>
                  {l.state === "weighing" && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-earth-200">
                      <div className="h-full w-2/3 animate-pulse rounded-full bg-primary-500" />
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-ink-200 px-3.5 py-4 text-center text-xs font-semibold text-ink-400">
                  {l.state === "maintenance" ? "Under maintenance until 16:00" : "Waiting for assignment"}
                </p>
              )}
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <h2 className="text-base font-bold text-ink-900">Assignment Queue</h2>
          <p className="text-xs text-ink-400">Trucks waiting for a lane</p>
          <ul className="mt-3 space-y-2">
            {queue.map((q) => (
              <li key={q.reg} className="flex items-center gap-3 rounded-xl bg-earth-50 px-3 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-white">
                  <Truck className="h-4.5 w-4.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold text-ink-900">{q.reg}</p>
                  <p className="text-xs text-ink-500">{q.crop}</p>
                </div>
                <Button size="sm" variant="secondary" loading={assigning} onClick={() => autoAssign(q.reg, q.crop)} icon={<Wand2 className="h-3.5 w-3.5" />}>
                  Assign
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-xl bg-primary-50 px-3.5 py-2.5 text-[11px] leading-relaxed font-semibold text-primary-900">
            Auto-assignment order: weighbridge-free lane → loading lane → lowest queue. Maintenance lanes are never assigned.
          </p>
        </Card>
      </div>
    </div>
  );
}
