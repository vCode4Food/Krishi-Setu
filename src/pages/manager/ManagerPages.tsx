import { useState } from "react";
import { Warehouse, Gauge, GitBranch, CalendarClock, Users, ShieldAlert, Wand2, Save } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { currentCentre } from "@/data/centres";
import { buildLanes, assignLane } from "@/services/mockProcurement";
import type { Lane } from "@/services/mockProcurement";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, SectionHeading } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, LaneStateBadge, Chip } from "@/components/common/Badges";
import { CapacityMeter } from "@/components/common/CapacityMeter";
import { DemoModeNotice } from "@/components/common/Card";
import { ThroughputChart, CropVolumeChart, ProcessingTimeChart, VerificationDonut, DonutLegend } from "@/components/centre/Charts";
import { cn, formatKg } from "@/utils/format";

export function ManagerDashboard() {
  const { centres, transactions } = useApp();
  const centre = centres.find((c) => c.centreId === currentCentre.centreId) ?? currentCentre;
  const staff = [
    { name: "Amit Deshmukh", id: "PO-102", role: "Procurement Officer", status: "On weighbridge WB-03", active: true },
    { name: "Neha Kale", id: "PO-101", role: "Procurement Officer", status: "Gate 2 · RFID checks", active: true },
    { name: "Ravi Wagh", id: "PO-103", role: "Procurement Officer", status: "Break · back 15:30", active: false },
  ];
  return (
    <div>
      <PageHeader
        title={`${centre.name} — Operations`}
        description="Centre-wide view: capacity, lanes, queue, staff and verification health."
        actions={<><DemoModeNotice /><StatusBadge tone="green" label="● Operational" /></>}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Capacity free" value={Math.round(centre.remainingCapacityKg / 1000)} suffix=" t" icon={<Warehouse className="h-5 w-5" />} tone="green" animate />
        <StatCard label="Trucks today" value={23} icon={<Gauge className="h-5 w-5" />} tone="blue" />
        <StatCard label="In queue" value={centre.queue} icon={<Users className="h-5 w-5" />} tone="amber" />
        <StatCard label="Avg wait" value={Math.round((centre.queue / Math.max(1, centre.lanes - 1)) * centre.avgWeighingMinutes)} suffix=" min" icon={<Gauge className="h-5 w-5" />} tone="blue" />
        <StatCard label="Verification alerts" value={transactions.filter((t) => t.status === "manual-review").length} icon={<ShieldAlert className="h-5 w-5" />} tone="red" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Hourly Throughput</h3><ThroughputChart /></Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Produce Volume (t)</h3><CropVolumeChart /></Card>
      </div>
      <Card className="mt-5 p-5">
        <h3 className="text-sm font-bold text-ink-900">Staff activity</h3>
        <ul className="mt-3 grid gap-2 md:grid-cols-3">
          {staff.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl bg-earth-50 px-3.5 py-3">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", s.active ? "bg-primary-500" : "bg-earth-300")} aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{s.name} <span className="ml-1 font-mono text-[10px] font-semibold text-ink-400">{s.id}</span></p>
                <p className="truncate text-xs text-ink-500">{s.role} · {s.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function ManagerCapacity() {
  const { centres, updateCentreCapacity, pushToast } = useApp();
  const centre = centres.find((c) => c.centreId === currentCentre.centreId) ?? currentCentre;
  const [adjust, setAdjust] = useState(2000);
  return (
    <div>
      <PageHeader title="Capacity Management" description="Produce-based daily capacity and manual top-up control." actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Remaining capacity</p>
              <p className="mt-1 font-display text-4xl font-extrabold text-primary-800">{formatKg(centre.remainingCapacityKg)}</p>
              <p className="text-sm text-ink-500">of {formatKg(centre.capacityKg)} daily capacity</p>
            </div>
            <StatusBadge tone={centre.remainingCapacityKg > centre.capacityKg * 0.25 ? "green" : "red"} label={centre.remainingCapacityKg > centre.capacityKg * 0.25 ? "Healthy buffer" : "Nearly full"} />
          </div>
          <CapacityMeter className="mt-5" remaining={centre.remainingCapacityKg} total={centre.capacityKg} label="Utilisation" />
          <div className="mt-6 rounded-2xl bg-earth-50 p-4">
            <p className="text-sm font-bold text-ink-900">Emergency top-up (district approval simulated)</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[2000, 4000, 8000].map((v) => (
                <Chip key={v} active={adjust === v} onClick={() => setAdjust(v)}>+{v / 1000}t</Chip>
              ))}
              <Button
                size="sm"
                icon={<Save className="h-4 w-4" />}
                onClick={() => {
                  updateCentreCapacity(centre.centreId, adjust);
                  pushToast({ kind: "success", title: "Capacity increased", body: `+${adjust / 1000}t approved via demo workflow. District admin notified.` });
                }}
              >
                Apply top-up
              </Button>
            </div>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">By produce</h3>
            <ul className="mt-3 space-y-2.5">
              {centre.supportedCrops.map((c, i) => {
                const share = [0.42, 0.33, 0.25][i] ?? 0.2;
                const kg = Math.round(centre.remainingCapacityKg * share);
                return (
                  <li key={c}>
                    <div className="flex justify-between text-sm font-semibold"><span>{c}</span><span className="text-ink-500">{formatKg(kg)}</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-earth-200">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${share * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">Booking pressure</h3>
            <p className="mt-2 text-sm text-ink-500">
              Slots for tomorrow are <strong className="text-ink-900">72% reserved</strong>. Morning windows
              will fill by 18:00 at the current rate.
            </p>
            <Button size="sm" variant="outline" className="mt-3">Open slot plan</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ManagerLanes() {
  const { pushToast } = useApp();
  const [lanes, setLanes] = useState<Lane[]>(() => buildLanes(4));
  const [busy, setBusy] = useState(false);
  const assign = async (reg: string) => {
    setBusy(true);
    const res = await assignLane(lanes, reg);
    setBusy(false);
    if (!res.lane) {
      pushToast({ kind: "warning", title: "No lane available", body: "All lanes occupied or under maintenance." });
      return;
    }
    setLanes(res.lanes);
    pushToast({ kind: "success", title: `Truck assigned to ${res.lane.name}`, body: reg });
  };
  return (
    <div>
      <PageHeader title="Lane Management" description="Assign, release and maintain weighbridge lanes." actions={<StatusBadge tone="green" label="● Auto-assign active" />} />
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {lanes.map((l) => (
            <Card key={l.id} className={cn("p-5", l.state === "available" && "border-primary-200 bg-primary-50/40", l.state === "maintenance" && "bg-earth-50")}>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink-900"><GitBranch className="h-4.5 w-4.5 text-primary-700" aria-hidden /> {l.name}</h2>
                <LaneStateBadge state={l.state} />
              </div>
              {l.truck ? (
                <div className="mt-3 rounded-xl bg-white px-3.5 py-3 shadow-soft">
                  <p className="font-mono text-sm font-extrabold">{l.truck}</p>
                  <p className="text-xs text-ink-500">{l.operation}</p>
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
          <h2 className="text-base font-bold text-ink-900">Assignment queue</h2>
          <ul className="mt-3 space-y-2">
            {["MH-31-EF-1109 · Wheat", "RJ-14-JK-7788 · Rice", "MH-27-GH-3301 · Tomato"].map((row) => {
              const [reg, crop] = row.split(" · ");
              return (
                <li key={reg} className="flex items-center justify-between gap-2 rounded-xl bg-earth-50 px-3 py-3">
                  <div><p className="font-mono text-sm font-bold">{reg}</p><p className="text-xs text-ink-500">{crop}</p></div>
                  <Button size="sm" variant="secondary" loading={busy} onClick={() => assign(reg)} icon={<Wand2 className="h-3.5 w-3.5" />}>Assign</Button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function ManagerSlots() {
  const { centres, pushToast } = useApp();
  const centre = centres.find((c) => c.centreId === currentCentre.centreId) ?? currentCentre;
  return (
    <div>
      <PageHeader title="Slot Management" description="Tomorrow's booking windows — adjust availability per slot." actions={<DemoModeNotice />} />
      <SectionHeading title={`${centre.name}`} subtitle="Drag-free demo: use the buttons to open or close slots." className="!mb-4" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {centre.slots.map((s) => {
          const pct = Math.round((s.bookedKg / s.capacityKg) * 100);
          const full = pct >= 100;
          return (
            <Card key={s.time} className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink-900"><CalendarClock className="h-4.5 w-4.5 text-primary-700" aria-hidden /> {s.time}</h3>
                <StatusBadge tone={full ? "red" : pct >= 90 ? "amber" : "green"} label={full ? "● Full" : pct >= 90 ? "● Limited" : "● Available"} />
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold text-ink-500">
                  <span>{formatKg(s.bookedKg)} booked</span><span>{formatKg(s.capacityKg - s.bookedKg)} free</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-earth-200">
                  <div className={cn("h-full rounded-full", full ? "bg-alert-500" : pct >= 90 ? "bg-saffron-400" : "bg-primary-500")} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => pushToast({ kind: "info", title: `${s.time} expanded`, body: "+1,000 kg capacity added (simulated approval)." })}>
                  +1t capacity
                </Button>
                <Button size="sm" variant="ghost" className="flex-1" disabled={full} onClick={() => pushToast({ kind: "warning", title: `${s.time} closed`, body: "Slot hidden from farmers. 3 booked entries unaffected." })}>
                  Close slot
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function ManagerAnalytics() {
  return (
    <div>
      <PageHeader title="Centre Analytics" description="Nagpur Central — operational reports (demo dataset)." actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Hourly Truck Throughput</h3><ThroughputChart /></Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Produce Volume by Crop</h3><CropVolumeChart /></Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">CV Verification Outcomes</h3>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4"><VerificationDonut /><DonutLegend /></div>
        </Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Avg Time by Stage</h3><ProcessingTimeChart /></Card>
      </div>
    </div>
  );
}
