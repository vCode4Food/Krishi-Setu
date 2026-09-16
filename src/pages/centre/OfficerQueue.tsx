import { useState } from "react";
import { Users, Timer, MoveRight, Phone } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/Badges";
import { cn } from "@/utils/format";

interface QueueEntry {
  pos: number;
  token: string;
  truck: string;
  farmer: string;
  crop: string;
  quantityKg: number;
  bookingId: string;
  waitMin: number;
  lane?: string;
  state: "called" | "waiting" | "in-lane";
}

const seed: QueueEntry[] = [
  { pos: 1, token: "T-101", truck: "MH-31-EF-1109", farmer: "Ramesh Patil", crop: "Wheat", quantityKg: 8000, bookingId: "KS-PROC-2026-00482", waitMin: 0, state: "called" },
  { pos: 2, token: "T-102", truck: "RJ-14-JK-7788", farmer: "Sunita Devi", crop: "Rice", quantityKg: 5200, bookingId: "KS-PROC-2026-00483", waitMin: 12, lane: "LANE 01", state: "in-lane" },
  { pos: 3, token: "T-103", truck: "MH-27-GH-3301", farmer: "Vijay More", crop: "Tomato", quantityKg: 3100, bookingId: "KS-PROC-2026-00484", waitMin: 19, state: "waiting" },
  { pos: 4, token: "T-104", truck: "MH-12-AB-4521", farmer: "Anita Deshmukh", crop: "Soybean", quantityKg: 6400, bookingId: "KS-PROC-2026-00485", waitMin: 26, state: "waiting" },
  { pos: 5, token: "T-105", truck: "MH-40-PQ-9012", farmer: "Ganesh Pawar", crop: "Cotton", quantityKg: 4500, bookingId: "KS-PROC-2026-00486", waitMin: 33, state: "waiting" },
];

export default function OfficerQueue() {
  const { pushToast } = useApp();
  const [queue, setQueue] = useState<QueueEntry[]>(seed);

  const callNext = () => {
    const next = queue.find((q) => q.state === "waiting");
    if (!next) {
      pushToast({ kind: "info", title: "Queue clear", body: "No waiting trucks — all entries called or in lane." });
      return;
    }
    setQueue((q) =>
      q.map((e) =>
        e.token === next.token
          ? { ...e, state: "called", waitMin: 0 }
          : e.state === "called"
            ? { ...e, state: "in-lane", lane: "LANE 03" }
            : e,
      ),
    );
    pushToast({ kind: "success", title: `${next.token} called`, body: `${next.truck} — proceed to RFID gate, Lane 03 free.` });
  };

  const waiting = queue.filter((q) => q.state === "waiting").length;
  const avgWait = queue.filter((q) => q.state === "waiting").reduce((a, q) => a + q.waitMin, 0) / Math.max(1, waiting);

  return (
    <div>
      <PageHeader
        title="Queue Management"
        description="Call trucks forward in booking order; state syncs to driver apps and the centre dashboard."
        actions={<StatusBadge tone="green" label="● Live" />}
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Waiting" value={waiting} icon={<Users className="h-5 w-5" />} tone="amber" />
        <StatCard label="Avg wait" value={Math.round(avgWait)} suffix=" min" icon={<Timer className="h-5 w-5" />} tone="blue" />
        <StatCard label="In lane" value={queue.filter((q) => q.state === "in-lane").length} icon={<MoveRight className="h-5 w-5" />} tone="green" />
      </div>

      <div className="mt-5 flex justify-end">
        <Button icon={<Timer className="h-4 w-4" />} onClick={callNext}>Call next truck</Button>
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-earth-50 text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-bold">#</th>
                <th className="px-4 py-2.5 font-bold">Truck</th>
                <th className="px-4 py-2.5 font-bold">Farmer</th>
                <th className="px-4 py-2.5 font-bold">Load</th>
                <th className="px-4 py-2.5 font-bold">Booking</th>
                <th className="px-4 py-2.5 font-bold">State</th>
                <th className="px-4 py-2.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.token} className={cn("border-b border-ink-100/60 last:border-0", q.state === "called" && "bg-saffron-50/60")}>
                  <td className="px-4 py-3 font-mono font-extrabold text-ink-900">{q.token}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold">{q.truck}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{q.farmer}</td>
                  <td className="px-4 py-3">{q.crop} · {(q.quantityKg / 1000).toFixed(1)}t</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-500">{q.bookingId}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={q.state === "called" ? "amber" : q.state === "in-lane" ? "blue" : "gray"}
                      label={q.state === "called" ? "● Called" : q.state === "in-lane" ? `● ${q.lane}` : `● Waiting ${q.waitMin}m`}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" icon={<Phone className="h-3.5 w-3.5" />} onClick={() => pushToast({ kind: "info", title: `Calling ${q.farmer}`, body: "SMS + IVR call simulated to registered mobile." })}>
                      Notify
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
