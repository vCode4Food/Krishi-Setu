import { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Map, Building2, Users, Package, Timer, ShieldAlert, ChevronRight, ArrowLeft,
  AlertTriangle, Info, Download, Search, Flag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  districtCentres, districtStats, stateDistricts, fraudAlerts, adminAlerts,
} from "@/data/roles";

const download = () => window.print();
import { hourlyThroughput, CropVolumeChart, VerificationDonut, DonutLegend } from "@/components/centre/Charts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, SectionHeading, DemoModeNotice } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge, Chip } from "@/components/common/Badges";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/utils/format";

const statusColor: Record<string, string> = {
  available: "#2c9960", busy: "#f7a90b", full: "#ef4444", offline: "#5c7263",
};

function CentreMap({ centres, onSelect }: { centres: typeof districtCentres; onSelect?: (id: string) => void }) {
  return (
    <MapContainer center={[21.25, 78.9]} zoom={8} scrollWheelZoom={false} className="h-80 w-full">
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {centres.map((c) => (
        <Marker
          key={c.centreId}
          position={[c.lat, c.lng]}
          eventHandlers={{ click: () => onSelect?.(c.centreId) }}
          icon={L.divIcon({
            className: "",
            html: `<div style="width:22px;height:22px;border-radius:9999px;background:${statusColor[c.status]};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          })}
        >
          <Popup>
            <strong>{c.name}</strong><br />{(c.remainingT / c.capacityT * 100).toFixed(0)}% free · {c.queue} queued
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

/* ------------------------------ DISTRICT ------------------------------ */

export function DistrictDashboard() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const centre = districtCentres.find((c) => c.centreId === selected);
  return (
    <div>
      <PageHeader
        title={`${user?.district ?? "Nagpur"} District — Governance`}
        description="Live centre network, procurement and queue health for the district."
        actions={<DemoModeNotice />}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <StatCard label="Centres" value={districtStats.centres} icon={<Building2 className="h-5 w-5" />} tone="blue" animate />
        <StatCard label="Active" value={districtStats.active} icon={<Map className="h-5 w-5" />} tone="green" />
        <StatCard label="Farmers" value={districtStats.farmers} icon={<Users className="h-5 w-5" />} tone="green" />
        <StatCard label="Volume (t)" value={districtStats.volumeT} icon={<Package className="h-5 w-5" />} tone="blue" />
        <StatCard label="In queue" value={districtStats.queueTotal} icon={<Timer className="h-5 w-5" />} tone="amber" />
        <StatCard label="Alerts" value={districtStats.alerts} icon={<ShieldAlert className="h-5 w-5" />} tone="red" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-ink-100 p-4"><h2 className="text-base font-bold text-ink-900">Centre network map</h2></div>
          <CentreMap centres={districtCentres} onSelect={setSelected} />
          <div className="flex flex-wrap gap-3 border-t border-ink-100 px-4 py-2.5 text-xs font-semibold text-ink-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2c9960]" /> Available</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f7a90b]" /> Busy</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> Full</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#5c7263]" /> Offline</span>
          </div>
        </Card>

        <div className="space-y-4">
          {centre ? (
            <Card className="p-5 animate-fade-up">
              <button onClick={() => setSelected(null)} className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-primary-700"><ArrowLeft className="h-3.5 w-3.5" /> All centres</button>
              <h3 className="font-display text-lg font-extrabold text-ink-900">{centre.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge tone={centre.status === "available" ? "green" : centre.status === "busy" ? "amber" : centre.status === "full" ? "red" : "gray"} label={`● ${centre.status}`} />
                <span className="text-xs font-semibold text-ink-400">{centre.centreId}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">Queue</dt><dd className="font-bold">{centre.queue} trucks</dd></div>
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">Wait</dt><dd className="font-bold">~{centre.waitMin} min</dd></div>
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">Free</dt><dd className="font-bold">{centre.remainingT}t of {centre.capacityT}t</dd></div>
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">Crops</dt><dd className="font-semibold text-xs">{centre.crops.join(", ")}</dd></div>
              </dl>
            </Card>
          ) : (
            <Card className="p-4">
              <h2 className="mb-2 text-base font-bold text-ink-900">Centre status board</h2>
              <ul className="space-y-2">
                {districtCentres.map((c) => (
                  <li key={c.centreId}>
                    <button onClick={() => setSelected(c.centreId)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-earth-50 px-3.5 py-3 text-left transition hover:bg-primary-50">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-ink-900">{c.name}</span>
                        <span className="block text-xs text-ink-500">{c.queue} queued · ~{c.waitMin} min · {c.remainingT}t free</span>
                      </span>
                      <StatusBadge tone={c.status === "available" ? "green" : c.status === "busy" ? "amber" : c.status === "full" ? "red" : "gray"} label={`● ${c.status}`} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">District queue trend (today)</h3>
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={hourlyThroughput} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
                  <Line type="monotone" dataKey="avgMin" name="Avg wait (min)" stroke="#f7a90b" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <SectionHeading title="District analytics" subtitle="Procurement mix and verification quality" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Procurement by crop (t)</h3><CropVolumeChart /></Card>
          <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Verification outcomes</h3>
            <div className="grid grid-cols-[1fr_auto] items-center gap-4"><VerificationDonut /><DonutLegend /></div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export function DistrictCentres() {
  const [query, setQuery] = useState("");
  const filtered = districtCentres.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.city.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <PageHeader title="District Centres" description="All procurement centres in Nagpur district with live status." />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search centre or town…" aria-label="Search centres" className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-500" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.centreId} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div><h3 className="font-bold text-ink-900">{c.name}</h3><p className="text-xs text-ink-400">{c.centreId} · {c.city}</p></div>
              <StatusBadge tone={c.status === "available" ? "green" : c.status === "busy" ? "amber" : c.status === "full" ? "red" : "gray"} label={`● ${c.status}`} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-earth-50 py-2"><p className="font-display text-base font-extrabold">{c.queue}</p><p className="text-ink-400">queue</p></div>
              <div className="rounded-lg bg-earth-50 py-2"><p className="font-display text-base font-extrabold">{c.waitMin}m</p><p className="text-ink-400">wait</p></div>
              <div className="rounded-lg bg-earth-50 py-2"><p className="font-display text-base font-extrabold">{Math.round(c.remainingT / c.capacityT * 100)}%</p><p className="text-ink-400">free</p></div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-earth-200">
              <div className={cn("h-full rounded-full", c.remainingT / c.capacityT > 0.25 ? "bg-primary-500" : c.remainingT > 0 ? "bg-saffron-400" : "bg-alert-500")} style={{ width: `${(c.remainingT / c.capacityT) * 100}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-medium text-ink-400">{c.crops.join(" · ")}</p>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <Card className="p-10 text-center text-sm text-ink-500">No centres match “{query}”.</Card>}
    </div>
  );
}

export function DistrictProcurement() {
  return (
    <div>
      <PageHeader title="District Procurement" description="Season register across all Nagpur centres." actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Volume by crop (t)</h3><CropVolumeChart /></Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-ink-900">Centre performance</h3>
          <table className="mt-3 w-full text-left text-sm">
            <thead><tr className="border-b border-ink-100 text-[11px] uppercase text-ink-400"><th className="py-2 font-bold">Centre</th><th className="py-2 text-right font-bold">Volume</th><th className="py-2 text-right font-bold">Avg wait</th></tr></thead>
            <tbody>
              {districtCentres.filter((c) => c.status !== "offline").map((c) => (
                <tr key={c.centreId} className="border-b border-ink-100/60 last:border-0">
                  <td className="py-2.5 font-semibold text-ink-900">{c.name}</td>
                  <td className="py-2.5 text-right">{Math.round(c.capacityT - c.remainingT)}t</td>
                  <td className="py-2.5 text-right">{c.waitMin} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export function DistrictAnalytics() {
  return (
    <div>
      <PageHeader title="District Analytics" description="Nagpur district — season reports." actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Hourly throughput (avg trucks)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hourlyThroughput} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
              <Line type="monotone" dataKey="trucks" stroke="#1a5c38" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Verification outcomes</h3>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4"><VerificationDonut /><DonutLegend /></div>
        </Card>
      </div>
    </div>
  );
}

export function DistrictAlerts() {
  return (
    <div>
      <PageHeader title="District Alerts" description="Operational and anomaly alerts across the district." actions={<DemoModeNotice />} />
      <div className="space-y-3">
        {adminAlerts.map((a) => (
          <Card key={a.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", a.level === "critical" ? "bg-alert-50 text-alert-600" : a.level === "warning" ? "bg-saffron-100 text-saffron-600" : "bg-info-50 text-info-600")}>
                {a.level === "info" ? <Info className="h-5 w-5" aria-hidden /> : <AlertTriangle className="h-5 w-5" aria-hidden />}
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{a.text}</p>
                <p className="mt-0.5 text-xs text-ink-400">{a.centre} · {a.time}</p>
              </div>
            </div>
            <StatusBadge tone={a.level === "critical" ? "red" : a.level === "warning" ? "amber" : "blue"} label={a.level.toUpperCase()} />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DistrictReports() {
  return (
    <div>
      <PageHeader title="District Reports" description="Season reports for Nagpur district (demo exports)." actions={<DemoModeNotice />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { t: "Daily procurement register", d: "All weighments, CV outcomes and settlements", s: "Ready" },
          { t: "Centre performance review", d: "Wait times, throughput, utilisation by centre", s: "Ready" },
          { t: "MSP payment reconciliation", d: "Amounts credited vs weighment register", s: "Generating…" },
        ].map((r) => (
          <Card key={r.t} className="flex flex-col p-5">
            <h3 className="font-bold text-ink-900">{r.t}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-500">{r.d}</p>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge tone={r.s === "Ready" ? "green" : "amber"} label={r.s} />
              <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={download}>Export</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DistrictAudit() {
  return (
    <div>
      <PageHeader title="District Audit" description="Read-only audit view across all centres in the district." actions={<DemoModeNotice />} />
      <Card className="p-5">
        <p className="text-sm text-ink-500">
          District admins see the consolidated audit register. Open the detailed timeline at the centre level:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {districtCentres.slice(0, 4).map((c) => (
            <span key={c.centreId} className="rounded-full bg-earth-100 px-3 py-1.5 text-xs font-bold text-ink-700">{c.name} — {c.centreId}</span>
          ))}
        </div>
        <Link to="/officer/audit" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800">
          Open consolidated audit timeline <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </Card>
    </div>
  );
}

/* -------------------------------- STATE -------------------------------- */

export function StateDashboard() {
  const { user } = useAuth();
  const totals = stateDistricts.reduce(
    (acc, d) => ({ centres: acc.centres + d.centres, farmers: acc.farmers + d.farmers, volume: acc.volume + d.volumeT, queue: acc.queue + d.queue }),
    { centres: 0, farmers: 0, volume: 0, queue: 0 },
  );
  const critical = stateDistricts.filter((d) => d.status === "critical");
  return (
    <div>
      <PageHeader
        title={`${user?.state ?? "Maharashtra"} — State Overview`}
        description="State-wide procurement monitoring with district drill-down."
        actions={<DemoModeNotice />}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Districts" value={stateDistricts.length} icon={<Map className="h-5 w-5" />} tone="blue" animate />
        <StatCard label="Centres" value={totals.centres} icon={<Building2 className="h-5 w-5" />} tone="blue" />
        <StatCard label="Farmers" value={totals.farmers} icon={<Users className="h-5 w-5" />} tone="green" />
        <StatCard label="Volume (t)" value={totals.volume} icon={<Package className="h-5 w-5" />} tone="green" />
        <StatCard label="Fraud flags" value={fraudAlerts.length} icon={<Flag className="h-5 w-5" />} tone="red" />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-ink-100 p-4"><h2 className="text-base font-bold text-ink-900">Districts — State → District → Centre drill-down</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-earth-50 text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-bold">District</th>
                <th className="px-4 py-2.5 text-right font-bold">Centres</th>
                <th className="px-4 py-2.5 text-right font-bold">Farmers</th>
                <th className="px-4 py-2.5 text-right font-bold">Volume</th>
                <th className="px-4 py-2.5 text-right font-bold">Queue</th>
                <th className="px-4 py-2.5 text-right font-bold">Avg wait</th>
                <th className="px-4 py-2.5 text-right font-bold">Utilisation</th>
                <th className="px-4 py-2.5 font-bold">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {stateDistricts.map((d) => (
                <tr key={d.districtId} className="border-b border-ink-100/60 last:border-0 hover:bg-earth-50/60">
                  <td className="px-4 py-3 font-bold text-ink-900">{d.name}</td>
                  <td className="px-4 py-3 text-right">{d.centres}</td>
                  <td className="px-4 py-3 text-right">{d.farmers.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">{d.volumeT.toLocaleString("en-IN")}t</td>
                  <td className="px-4 py-3 text-right">{d.queue}</td>
                  <td className="px-4 py-3 text-right">{d.avgWaitMin} min</td>
                  <td className="px-4 py-3 text-right">{d.utilisation}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={d.status === "normal" ? "green" : d.status === "watch" ? "amber" : "red"} label={`● ${d.status}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/state/districts" className="text-xs font-bold text-primary-700 hover:text-primary-800">Drill down <ChevronRight className="inline h-3 w-3" aria-hidden /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {critical.length > 0 && (
        <Card className="mt-5 border-alert-100 bg-alert-50/50 p-5">
          <h3 className="flex items-center gap-2 font-bold text-alert-700"><AlertTriangle className="h-5 w-5" aria-hidden /> Districts needing attention</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            {critical.map((d) => (
              <li key={d.districtId}><strong>{d.name}</strong> — {d.utilisation}% utilisation, avg wait {d.avgWaitMin} min. Consider opening overflow capacity.</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function StateDistricts() {
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = statusFilter === "All" ? stateDistricts : stateDistricts.filter((d) => d.status === statusFilter.toLowerCase());
  return (
    <div>
      <PageHeader title="Districts" description="All districts in the state network." actions={<DemoModeNotice />} />
      <div className="mb-4 flex gap-2">
        {["All", "Normal", "Watch", "Critical"].map((s) => (
          <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</Chip>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <Card key={d.districtId} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-ink-900">{d.name}</h3>
              <StatusBadge tone={d.status === "normal" ? "green" : d.status === "watch" ? "amber" : "red"} label={`● ${d.status}`} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">Centres</p><p className="font-bold">{d.centres}</p></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">Farmers</p><p className="font-bold">{d.farmers.toLocaleString("en-IN")}</p></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">Volume</p><p className="font-bold">{d.volumeT.toLocaleString("en-IN")}t</p></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">Avg wait</p><p className="font-bold">{d.avgWaitMin} min</p></div>
            </div>
            <Link to="/admin/district" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800">
              Open Nagpur district (demo) <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StateCentres() {
  return (
    <div>
      <PageHeader title="All Centres" description="State-wide centre register with live utilisation." actions={<DemoModeNotice />} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead><tr className="border-b border-ink-100 bg-earth-50 text-[11px] uppercase text-ink-400">
              <th className="px-4 py-3 font-bold">Centre</th><th className="px-4 py-3 font-bold">District</th>
              <th className="px-4 py-3 text-right font-bold">Queue</th><th className="px-4 py-3 text-right font-bold">Wait</th>
              <th className="px-4 py-3 text-right font-bold">Free</th><th className="px-4 py-3 font-bold">Status</th>
            </tr></thead>
            <tbody>
              {districtCentres.map((c) => (
                <tr key={c.centreId} className="border-b border-ink-100/60 last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink-900">{c.name}</td>
                  <td className="px-4 py-3">Nagpur</td>
                  <td className="px-4 py-3 text-right">{c.queue}</td>
                  <td className="px-4 py-3 text-right">{c.waitMin} min</td>
                  <td className="px-4 py-3 text-right">{c.remainingT}t</td>
                  <td className="px-4 py-3"><StatusBadge tone={c.status === "available" ? "green" : c.status === "busy" ? "amber" : c.status === "full" ? "red" : "gray"} label={`● ${c.status}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function StateProcurement() {
  return (
    <div>
      <PageHeader title="State Procurement" description="Season totals across all districts." actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Volume by crop (t, state)</h3><CropVolumeChart /></Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">District contribution</h3>
          <ul className="mt-3 space-y-2.5">
            {stateDistricts.map((d) => (
              <li key={d.districtId}>
                <div className="flex justify-between text-sm font-semibold"><span>{d.name}</span><span className="text-ink-500">{d.volumeT.toLocaleString("en-IN")}t</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-earth-200">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${(d.volumeT / 2640) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function StateFraud() {
  return (
    <div>
      <PageHeader title="Fraud & Anomaly Alerts" description="CV mismatches, weight variance and booking anomalies." actions={<DemoModeNotice />} />
      <div className="space-y-3">
        {fraudAlerts.map((f) => (
          <Card key={f.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", f.severity === "high" ? "bg-alert-50 text-alert-600" : f.severity === "medium" ? "bg-saffron-100 text-saffron-600" : "bg-earth-100 text-ink-500")}>
                <Flag className="h-5 w-5" aria-hidden />
              </span>
              <div className="max-w-2xl">
                <p className="text-sm font-bold text-ink-900">{f.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">{f.body}</p>
                <p className="mt-1 text-xs text-ink-400">{f.centre} · {f.district} · {f.time}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Mark reviewed</Button>
              <Button size="sm" variant="danger">Escalate</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StateAnalytics() {
  return (
    <div>
      <PageHeader title="State Analytics" description="Maharashtra — season analytics." actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Hourly network throughput</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hourlyThroughput} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
              <Line type="monotone" dataKey="trucks" stroke="#1a5c38" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="avgMin" name="Wait" stroke="#f7a90b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">Verification outcomes</h3>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4"><VerificationDonut /><DonutLegend /></div>
        </Card>
      </div>
    </div>
  );
}

export function StateReports() {
  return (
    <div>
      <PageHeader title="State Reports" description="Ministry-ready reports (demo exports)." actions={<DemoModeNotice />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { t: "State procurement summary", d: "District-wise volumes, MSP payouts and pending settlements", s: "Ready" },
          { t: "Centre utilisation review", d: "Capacity, queues and staffing across the network", s: "Ready" },
          { t: "Fraud & anomaly digest", d: "CV mismatches, weight variance and repeat flags", s: "Ready" },
          { t: "Scheme enrolment tracker", d: "PM-KISAN / PMFBY linkage with procurement", s: "Generating…" },
          { t: "Wait-time SLA compliance", d: "Centres exceeding 30 min average wait", s: "Ready" },
          { t: "Weekly ministry brief", d: "Auto-generated summary for agriculture ministry", s: "Scheduled" },
        ].map((r) => (
          <Card key={r.t} className="flex flex-col p-5">
            <h3 className="font-bold text-ink-900">{r.t}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-500">{r.d}</p>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge tone={r.s === "Ready" ? "green" : r.s === "Scheduled" ? "gray" : "amber"} label={r.s} />
              <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={download}>Export</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StateAudit() {
  return (
    <div>
      <PageHeader title="State Audit" description="State-wide audit register (read-only)." actions={<DemoModeNotice />} />
      <Card className="p-5">
        <p className="text-sm text-ink-500">
          Consolidated, hash-referenced audit events from all centres. The full immutable timeline lives at centre level:
        </p>
        <Link to="/officer/audit" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800">
          Open audit timeline <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {stateDistricts.slice(0, 4).map((d) => (
            <div key={d.districtId} className="rounded-xl bg-earth-50 px-3.5 py-2.5 text-xs font-semibold text-ink-700">
              {d.name} — {d.centres} centres · audit streaming healthy
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
