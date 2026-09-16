import { Download, TrendingUp, Scale, Timer, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatCard } from "@/components/common/StatCard";
import { ThroughputChart, CropVolumeChart, VerificationDonut, DonutLegend, ProcessingTimeChart } from "@/components/centre/Charts";

export default function CentreAnalytics() {
  const { transactions, pushToast } = useApp();
  const totalNet = transactions.reduce((s, t) => s + t.netWeightKg, 0);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Season performance for Nagpur Central Procurement Centre — demo dataset."
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "Reports" }]}
        actions={
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ kind: "info", title: "Demo report", body: "PDF generation is simulated in this prototype." })}>
            Download season report
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Net volume today" value={totalNet} suffix=" kg" icon={<Scale className="h-5 w-5" />} tone="green" animate />
        <StatCard label="Avg processing" value={9} suffix=" min" icon={<Timer className="h-5 w-5" />} tone="blue" />
        <StatCard label="Verified rate" value={86} suffix="%" icon={<TrendingUp className="h-5 w-5" />} tone="green" delta="+4% vs last week" />
        <StatCard label="Open alerts" value={transactions.filter((t) => t.status === "manual-review").length} icon={<ShieldAlert className="h-5 w-5" />} tone="red" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
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

      <Card className="mt-5 p-5">
        <h3 className="text-sm font-bold text-ink-900">Season highlights</h3>
        <ul className="mt-3 grid gap-2 text-sm text-ink-700 md:grid-cols-2">
          {[
            "Wheat arrivals up 22% week-over-week; average weighment time steady at 8.9 min.",
            "CV engine flagged 5 mismatch attempts — all resolved within 15 minutes at review console.",
            "Capacity utilisation peaked at 91% on Wednesday; consider opening Lane 05 for peak hours.",
            "Digital settlement time averaged 26 hours — within the 48-hour service promise.",
          ].map((t) => (
            <li key={t} className="rounded-xl bg-earth-50 px-3.5 py-2.5">{t}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
