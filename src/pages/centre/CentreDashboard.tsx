import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Scale,
  Timer,
  Warehouse,
  ShieldAlert,
  ArrowRight,
  GitBranch,
  Radio,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { currentCentre } from "@/data/centres";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, SectionHeading, DemoModeNotice } from "@/components/common/Card";
import { TxnStatusBadge, StatusBadge, LaneStateBadge } from "@/components/common/Badges";
import { CapacityMeter } from "@/components/common/CapacityMeter";
import { Button } from "@/components/common/Button";
import { ThroughputChart, CropVolumeChart, VerificationDonut, DonutLegend, ProcessingTimeChart } from "@/components/centre/Charts";
import { buildLanes } from "@/services/mockProcurement";
import type { Lane } from "@/services/mockProcurement";
import { cn, formatKg } from "@/utils/format";

export default function CentreDashboard() {
  const { transactions, centres } = useApp();
  const centre = centres.find((c) => c.centreId === currentCentre.centreId) ?? currentCentre;

  const [liveTxns, setLiveTxns] = useState(transactions.slice(0, 6));
  const [lanes] = useState<Lane[]>(() => buildLanes(centre.lanes));

  // Simulate live operations: new transactions appear over time
  useEffect(() => {
    const t = setInterval(() => {
      setLiveTxns((prev) => {
        const next = { ...prev[0] };
        next.transactionId = `KS-TXN-2026-00${8423 + Math.floor(Math.random() * 40)}`;
        next.status = "processing";
        next.timestamp = `Today, ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
        return [{ ...next }, ...prev].slice(0, 7);
      });
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const completed = transactions.filter((t) => t.status === "completed").length;

  const kpis = useMemo(
    () => [
      { label: "Trucks Today", value: 23, icon: <Truck className="h-5 w-5" />, tone: "blue" as const },
      { label: "Weighments Completed", value: completed + 14, icon: <Scale className="h-5 w-5" />, tone: "green" as const },
      { label: "Waiting Trucks", value: centre.queue, icon: <Timer className="h-5 w-5" />, tone: "amber" as const },
      { label: "Avg Processing", value: 9, suffix: " min", icon: <Timer className="h-5 w-5" />, tone: "blue" as const },
      { label: "Verification Alerts", value: liveTxns.filter((t) => t.status === "manual-review" || t.status === "warning").length, icon: <ShieldAlert className="h-5 w-5" />, tone: "red" as const },
    ],
    [centre.queue, completed, liveTxns],
  );

  return (
    <div>
      <PageHeader
        title="Centre Dashboard"
        description="Nagpur Central Procurement Centre · CRC-NAG-01 · Weighbridge WB-03"
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "Dashboard" }]}
        actions={
          <>
            <DemoModeNotice />
            <StatusBadge tone="green" label="● Operational" />
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            suffix={k.suffix ?? ""}
            icon={k.icon}
            tone={k.tone}
            animate
          />
        ))}
      </div>

      {/* Capacity strip */}
      <Card className="mt-5 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <Warehouse className="h-4.5 w-4.5 text-primary-700" aria-hidden /> Produce-based capacity control
            </h2>
            <p className="text-xs font-semibold text-ink-400">
              {formatKg(centre.remainingCapacityKg)} of {formatKg(centre.capacityKg)} free
            </p>
          </div>
          <CapacityMeter className="mt-2" remaining={centre.remainingCapacityKg} total={centre.capacityKg} showValues={false} label="Remaining capacity" />
        </div>
        <div className="flex gap-2">
          <Link to="/centre/weighing"><Button size="sm" icon={<Scale className="h-4 w-4" />}>Open Live Weighing</Button></Link>
          <Link to="/centre/trucks"><Button size="sm" variant="outline" icon={<Radio className="h-4 w-4" />}>Gate Feed</Button></Link>
        </div>
      </Card>

      {/* Main grid: table + queue/lanes */}
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        {/* Live transactions */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 p-4">
            <div>
              <h2 className="text-base font-bold text-ink-900">Live Transactions</h2>
              <p className="text-xs text-ink-400">Farmer–truck–weight linkage · auto-refreshing (demo)</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-primary-500 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-primary-600" />
              </span>
              LIVE
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-earth-50 text-[11px] uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-2.5 font-bold">Time</th>
                  <th className="px-4 py-2.5 font-bold">Farmer</th>
                  <th className="px-4 py-2.5 font-bold">Truck</th>
                  <th className="px-4 py-2.5 font-bold">RFID</th>
                  <th className="px-4 py-2.5 font-bold">Crop</th>
                  <th className="px-4 py-2.5 text-right font-bold">Net kg</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {liveTxns.map((t) => (
                  <tr key={t.transactionId} className="border-b border-ink-100/70 last:border-0 hover:bg-earth-50/60">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-ink-500">{t.timestamp}</td>
                    <td className="px-4 py-2.5 font-semibold text-ink-900">{t.farmerName}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{t.registrationNumber}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-400">{t.rfid}</td>
                    <td className="px-4 py-2.5">{t.crop}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{t.netWeightKg.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2.5"><TxnStatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-ink-100 p-3 text-right">
            <Link to="/centre/transactions" className="text-xs font-bold text-primary-700 hover:text-primary-800">
              All transactions <ArrowRight className="inline h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </Card>

        {/* Queue + lanes */}
        <div className="space-y-5">
          <Card className="p-4">
            <h2 className="text-base font-bold text-ink-900">Truck Queue</h2>
            <p className="text-xs text-ink-400">{centre.queue} trucks waiting · est. {Math.round((centre.queue / Math.max(1, centre.lanes - 1)) * centre.avgWeighingMinutes)} min</p>
            <ul className="mt-3 space-y-2">
              {transactions.slice(0, 5).map((t, i) => (
                <li key={t.transactionId} className="flex items-center gap-3 rounded-xl bg-earth-50 px-3 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-700 text-xs font-extrabold text-white">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{t.registrationNumber} · {t.farmerName}</p>
                    <p className="text-[11px] text-ink-500">{t.crop} · booking verified</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-ink-400">{i === 0 ? "Next" : `+${i * 9}m`}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
                <GitBranch className="h-4.5 w-4.5 text-primary-700" aria-hidden /> Lane Status
              </h2>
              <Link to="/centre/lanes" className="text-xs font-bold text-primary-700 hover:text-primary-800">Manage</Link>
            </div>
            <ul className="mt-3 space-y-2">
              {lanes.map((l) => (
                <li key={l.id} className={cn("rounded-xl border px-3 py-2.5", l.state === "available" ? "border-primary-200 bg-primary-50/50" : "border-ink-100 bg-earth-50")}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold tracking-wide text-ink-900">{l.name}</p>
                    <LaneStateBadge state={l.state} />
                  </div>
                  {l.truck && <p className="mt-0.5 font-mono text-xs text-ink-500">{l.truck} · {l.operation}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <section className="mt-8">
        <SectionHeading title="Operations Analytics" subtitle="Throughput, volumes, verification quality and stage timings" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">Hourly Truck Throughput</h3>
            <ThroughputChart />
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">Produce Volume by Crop (tonnes)</h3>
            <CropVolumeChart />
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">CV Verification Outcomes</h3>
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
              <VerificationDonut />
              <DonutLegend />
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">Average Time by Stage (min)</h3>
            <ProcessingTimeChart />
          </Card>
        </div>
      </section>
    </div>
  );
}
