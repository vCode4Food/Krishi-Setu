import { useState } from "react";
import { useTranslation } from "react-i18next";
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

/** Capitalises the first letter — used to build status/level/filter i18n keys. */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function CentreMap({ centres, onSelect }: { centres: typeof districtCentres; onSelect?: (id: string) => void }) {
  const { t } = useTranslation();
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
            <strong>{c.name}</strong><br />{t("admin.mapPopup", { pct: (c.remainingT / c.capacityT * 100).toFixed(0), queue: c.queue })}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

/* ------------------------------ DISTRICT ------------------------------ */

export function DistrictDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const centre = districtCentres.find((c) => c.centreId === selected);
  return (
    <div>
      <PageHeader
        title={t("admin.distGovTitle", { district: user?.district ?? "Nagpur" })}
        description={t("admin.distGovDesc")}
        actions={<DemoModeNotice />}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <StatCard label={t("admin.kpiCentres")} value={districtStats.centres} icon={<Building2 className="h-5 w-5" />} tone="blue" animate />
        <StatCard label={t("admin.kpiActive")} value={districtStats.active} icon={<Map className="h-5 w-5" />} tone="green" />
        <StatCard label={t("admin.kpiFarmers")} value={districtStats.farmers} icon={<Users className="h-5 w-5" />} tone="green" />
        <StatCard label={t("admin.kpiVolume")} value={districtStats.volumeT} icon={<Package className="h-5 w-5" />} tone="blue" />
        <StatCard label={t("admin.kpiQueue")} value={districtStats.queueTotal} icon={<Timer className="h-5 w-5" />} tone="amber" />
        <StatCard label={t("admin.kpiAlerts")} value={districtStats.alerts} icon={<ShieldAlert className="h-5 w-5" />} tone="red" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-ink-100 p-4"><h2 className="text-base font-bold text-ink-900">{t("admin.mapTitle")}</h2></div>
          <CentreMap centres={districtCentres} onSelect={setSelected} />
          <div className="flex flex-wrap gap-3 border-t border-ink-100 px-4 py-2.5 text-xs font-semibold text-ink-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2c9960]" /> {t("admin.legendAvailable")}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f7a90b]" /> {t("admin.legendBusy")}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> {t("admin.legendFull")}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#5c7263]" /> {t("admin.legendOffline")}</span>
          </div>
        </Card>

        <div className="space-y-4">
          {centre ? (
            <Card className="p-5 animate-fade-up">
              <button onClick={() => setSelected(null)} className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-primary-700"><ArrowLeft className="h-3.5 w-3.5" /> {t("admin.backAllCentres")}</button>
              <h3 className="font-display text-lg font-extrabold text-ink-900">{centre.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge tone={centre.status === "available" ? "green" : centre.status === "busy" ? "amber" : centre.status === "full" ? "red" : "gray"} label={t(`admin.status${cap(centre.status)}`)} />
                <span className="text-xs font-semibold text-ink-400">{centre.centreId}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">{t("admin.detailQueue")}</dt><dd className="font-bold">{t("admin.detailQueueVal", { n: centre.queue })}</dd></div>
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">{t("admin.detailWait")}</dt><dd className="font-bold">{t("admin.detailWaitVal", { n: centre.waitMin })}</dd></div>
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">{t("admin.detailFree")}</dt><dd className="font-bold">{t("admin.detailFreeVal", { free: centre.remainingT, cap: centre.capacityT })}</dd></div>
                <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">{t("admin.detailCrops")}</dt><dd className="font-semibold text-xs">{centre.crops.map((c) => t(`crops.${c}`)).join(", ")}</dd></div>
              </dl>
            </Card>
          ) : (
            <Card className="p-4">
              <h2 className="mb-2 text-base font-bold text-ink-900">{t("admin.statusBoardTitle")}</h2>
              <ul className="space-y-2">
                {districtCentres.map((c) => (
                  <li key={c.centreId}>
                    <button onClick={() => setSelected(c.centreId)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-earth-50 px-3.5 py-3 text-left transition hover:bg-primary-50">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-ink-900">{c.name}</span>
                        <span className="block text-xs text-ink-500">{t("admin.boardRow", { queue: c.queue, wait: c.waitMin, free: c.remainingT })}</span>
                      </span>
                      <StatusBadge tone={c.status === "available" ? "green" : c.status === "busy" ? "amber" : c.status === "full" ? "red" : "gray"} label={t(`admin.status${cap(c.status)}`)} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-ink-900">{t("admin.queueTrendTitle")}</h3>
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={hourlyThroughput} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
                  <Line type="monotone" dataKey="avgMin" name={t("admin.chartAvgWaitMin")} stroke="#f7a90b" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <SectionHeading title={t("admin.analyticsTitle")} subtitle={t("admin.analyticsSubtitle")} />
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartByCrop")}</h3><CropVolumeChart /></Card>
          <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartVerification")}</h3>
            <div className="grid grid-cols-[1fr_auto] items-center gap-4"><VerificationDonut /><DonutLegend /></div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export function DistrictCentres() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const filtered = districtCentres.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.city.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <PageHeader title={t("admin.dcTitle")} description={t("admin.dcDesc")} />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("admin.searchPlaceholder")} aria-label={t("admin.searchAria")} className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-500" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.centreId} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div><h3 className="font-bold text-ink-900">{c.name}</h3><p className="text-xs text-ink-400">{c.centreId} · {c.city}</p></div>
              <StatusBadge tone={c.status === "available" ? "green" : c.status === "busy" ? "amber" : c.status === "full" ? "red" : "gray"} label={t(`admin.status${cap(c.status)}`)} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-earth-50 py-2"><p className="font-display text-base font-extrabold">{c.queue}</p><p className="text-ink-400">{t("admin.cardQueue")}</p></div>
              <div className="rounded-lg bg-earth-50 py-2"><p className="font-display text-base font-extrabold">{c.waitMin}m</p><p className="text-ink-400">{t("admin.cardWait")}</p></div>
              <div className="rounded-lg bg-earth-50 py-2"><p className="font-display text-base font-extrabold">{Math.round(c.remainingT / c.capacityT * 100)}%</p><p className="text-ink-400">{t("admin.cardFree")}</p></div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-earth-200">
              <div className={cn("h-full rounded-full", c.remainingT / c.capacityT > 0.25 ? "bg-primary-500" : c.remainingT > 0 ? "bg-saffron-400" : "bg-alert-500")} style={{ width: `${(c.remainingT / c.capacityT) * 100}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-medium text-ink-400">{c.crops.map((c) => t(`crops.${c}`)).join(" · ")}</p>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <Card className="p-10 text-center text-sm text-ink-500">{t("admin.noMatch", { query })}</Card>}
    </div>
  );
}

export function DistrictProcurement() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.dpTitle")} description={t("admin.dpDesc")} actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartVolumeCrop")}</h3><CropVolumeChart /></Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-ink-900">{t("admin.perfTitle")}</h3>
          <table className="mt-3 w-full text-left text-sm">
            <thead><tr className="border-b border-ink-100 text-[11px] uppercase text-ink-400"><th className="py-2 font-bold">{t("admin.thCentre")}</th><th className="py-2 text-right font-bold">{t("admin.thVolume")}</th><th className="py-2 text-right font-bold">{t("admin.thAvgWait")}</th></tr></thead>
            <tbody>
              {districtCentres.filter((c) => c.status !== "offline").map((c) => (
                <tr key={c.centreId} className="border-b border-ink-100/60 last:border-0">
                  <td className="py-2.5 font-semibold text-ink-900">{c.name}</td>
                  <td className="py-2.5 text-right">{Math.round(c.capacityT - c.remainingT)}{t("admin.unitTonnes")}</td>
                  <td className="py-2.5 text-right">{c.waitMin} {t("admin.unitMin")}</td>
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
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.daTitle")} description={t("admin.daDesc")} actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartHourlyAvg")}</h3>
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
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartVerification")}</h3>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4"><VerificationDonut /><DonutLegend /></div>
        </Card>
      </div>
    </div>
  );
}

export function DistrictAlerts() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.dalTitle")} description={t("admin.dalDesc")} actions={<DemoModeNotice />} />
      <div className="space-y-3">
        {adminAlerts.map((a) => (
          <Card key={a.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", a.level === "critical" ? "bg-alert-50 text-alert-600" : a.level === "warning" ? "bg-saffron-100 text-saffron-600" : "bg-info-50 text-info-600")}>
                {a.level === "info" ? <Info className="h-5 w-5" aria-hidden /> : <AlertTriangle className="h-5 w-5" aria-hidden />}
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{t(a.textKey)}</p>
                <p className="mt-0.5 text-xs text-ink-400">{a.centre} · {t(a.timeKey)}</p>
              </div>
            </div>
            <StatusBadge tone={a.level === "critical" ? "red" : a.level === "warning" ? "amber" : "blue"} label={t(`admin.level${cap(a.level)}`)} />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DistrictReports() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.drTitle")} description={t("admin.drDesc")} actions={<DemoModeNotice />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { k: "rep1", s: "Ready" },
          { k: "rep2", s: "Ready" },
          { k: "rep3", s: "Generating" },
        ].map((r) => (
          <Card key={r.k} className="flex flex-col p-5">
            <h3 className="font-bold text-ink-900">{t(`admin.${r.k}Title`)}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-500">{t(`admin.${r.k}Desc`)}</p>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge tone={r.s === "Ready" ? "green" : "amber"} label={t(`admin.rep${r.s}`)} />
              <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={download}>{t("admin.exportBtn")}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DistrictAudit() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.dauTitle")} description={t("admin.dauDesc")} actions={<DemoModeNotice />} />
      <Card className="p-5">
        <p className="text-sm text-ink-500">
          {t("admin.dauBody")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {districtCentres.slice(0, 4).map((c) => (
            <span key={c.centreId} className="rounded-full bg-earth-100 px-3 py-1.5 text-xs font-bold text-ink-700">{c.name} — {c.centreId}</span>
          ))}
        </div>
        <Link to="/officer/audit" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800">
          {t("admin.dauLink")} <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </Card>
    </div>
  );
}

/* -------------------------------- STATE -------------------------------- */

export function StateDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  void selected; void setSelected;
  const totals = stateDistricts.reduce(
    (acc, d) => ({ centres: acc.centres + d.centres, farmers: acc.farmers + d.farmers, volume: acc.volume + d.volumeT, queue: acc.queue + d.queue }),
    { centres: 0, farmers: 0, volume: 0, queue: 0 },
  );
  const critical = stateDistricts.filter((d) => d.status === "critical");
  return (
    <div>
      <PageHeader
        title={t("admin.stTitle", { state: user?.state ?? "Maharashtra" })}
        description={t("admin.stDesc")}
        actions={<DemoModeNotice />}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label={t("admin.kpiDistricts")} value={stateDistricts.length} icon={<Map className="h-5 w-5" />} tone="blue" animate />
        <StatCard label={t("admin.kpiCentres")} value={totals.centres} icon={<Building2 className="h-5 w-5" />} tone="blue" />
        <StatCard label={t("admin.kpiFarmers")} value={totals.farmers} icon={<Users className="h-5 w-5" />} tone="green" />
        <StatCard label={t("admin.kpiVolume")} value={totals.volume} icon={<Package className="h-5 w-5" />} tone="green" />
        <StatCard label={t("admin.kpiFraudFlags")} value={fraudAlerts.length} icon={<Flag className="h-5 w-5" />} tone="red" />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-ink-100 p-4"><h2 className="text-base font-bold text-ink-900">{t("admin.drillTitle")}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-earth-50 text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-bold">{t("admin.thDistrict")}</th>
                <th className="px-4 py-2.5 text-right font-bold">{t("admin.kpiCentres")}</th>
                <th className="px-4 py-2.5 text-right font-bold">{t("admin.thFarmers")}</th>
                <th className="px-4 py-2.5 text-right font-bold">{t("admin.thVolume")}</th>
                <th className="px-4 py-2.5 text-right font-bold">{t("admin.thQueue")}</th>
                <th className="px-4 py-2.5 text-right font-bold">{t("admin.thAvgWait")}</th>
                <th className="px-4 py-2.5 text-right font-bold">{t("admin.thUtilisation")}</th>
                <th className="px-4 py-2.5 font-bold">{t("admin.thStatus")}</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {stateDistricts.map((d) => (
                <tr key={d.districtId} className="border-b border-ink-100/60 last:border-0 hover:bg-earth-50/60">
                  <td className="px-4 py-3 font-bold text-ink-900">{d.name}</td>
                  <td className="px-4 py-3 text-right">{d.centres}</td>
                  <td className="px-4 py-3 text-right">{d.farmers.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">{d.volumeT.toLocaleString("en-IN")}{t("admin.unitTonnes")}</td>
                  <td className="px-4 py-3 text-right">{d.queue}</td>
                  <td className="px-4 py-3 text-right">{d.avgWaitMin} {t("admin.unitMin")}</td>
                  <td className="px-4 py-3 text-right">{d.utilisation}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={d.status === "normal" ? "green" : d.status === "watch" ? "amber" : "red"} label={t(`admin.status${cap(d.status)}`)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/state/districts" className="text-xs font-bold text-primary-700 hover:text-primary-800">{t("admin.drillLink")} <ChevronRight className="inline h-3 w-3" aria-hidden /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {critical.length > 0 && (
        <Card className="mt-5 border-alert-100 bg-alert-50/50 p-5">
          <h3 className="flex items-center gap-2 font-bold text-alert-700"><AlertTriangle className="h-5 w-5" aria-hidden /> {t("admin.criticalTitle")}</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            {critical.map((d) => (
              <li key={d.districtId}><strong>{d.name}</strong> — {t("admin.criticalRow", { name: "", pct: d.utilisation, wait: d.avgWaitMin }).replace(/^\s*—\s*/, "")}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function StateDistricts() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = statusFilter === "All" ? stateDistricts : stateDistricts.filter((d) => d.status === statusFilter.toLowerCase());
  return (
    <div>
      <PageHeader title={t("admin.sdTitle")} description={t("admin.sdDesc")} actions={<DemoModeNotice />} />
      <div className="mb-4 flex gap-2">
        {["All", "Normal", "Watch", "Critical"].map((s) => (
          <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{t(`admin.filter${cap(s)}`)}</Chip>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <Card key={d.districtId} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-ink-900">{d.name}</h3>
              <StatusBadge tone={d.status === "normal" ? "green" : d.status === "watch" ? "amber" : "red"} label={t(`admin.status${cap(d.status)}`)} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">{t("admin.cardCentres")}</p><p className="font-bold">{d.centres}</p></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">{t("admin.cardFarmers")}</p><p className="font-bold">{d.farmers.toLocaleString("en-IN")}</p></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">{t("admin.cardVolume")}</p><p className="font-bold">{d.volumeT.toLocaleString("en-IN")}{t("admin.unitTonnes")}</p></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><p className="text-[10px] font-bold uppercase text-ink-400">{t("admin.cardAvgWait")}</p><p className="font-bold">{d.avgWaitMin} {t("admin.unitMin")}</p></div>
            </div>
            <Link to="/admin/district" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800">
              {t("admin.openNagpur")} <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StateCentres() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.scTitle")} description={t("admin.scDesc")} actions={<DemoModeNotice />} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead><tr className="border-b border-ink-100 bg-earth-50 text-[11px] uppercase text-ink-400">
              <th className="px-4 py-3 font-bold">{t("admin.thCentre")}</th><th className="px-4 py-3 font-bold">{t("admin.thDistrictCol")}</th>
              <th className="px-4 py-3 text-right font-bold">{t("admin.thQueue")}</th><th className="px-4 py-3 text-right font-bold">{t("admin.thWait")}</th>
              <th className="px-4 py-3 text-right font-bold">{t("admin.thFree")}</th><th className="px-4 py-3 font-bold">{t("admin.thStatus")}</th>
            </tr></thead>
            <tbody>
              {districtCentres.map((c) => (
                <tr key={c.centreId} className="border-b border-ink-100/60 last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink-900">{c.name}</td>
                  <td className="px-4 py-3">Nagpur</td>
                  <td className="px-4 py-3 text-right">{c.queue}</td>
                  <td className="px-4 py-3 text-right">{c.waitMin} {t("admin.unitMin")}</td>
                  <td className="px-4 py-3 text-right">{c.remainingT}{t("admin.unitTonnes")}</td>
                  <td className="px-4 py-3"><StatusBadge tone={c.status === "available" ? "green" : c.status === "busy" ? "amber" : c.status === "full" ? "red" : "gray"} label={t(`admin.status${cap(c.status)}`)} /></td>
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
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.spTitle")} description={t("admin.spDesc")} actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartVolumeState")}</h3><CropVolumeChart /></Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartContribution")}</h3>
          <ul className="mt-3 space-y-2.5">
            {stateDistricts.map((d) => (
              <li key={d.districtId}>
                <div className="flex justify-between text-sm font-semibold"><span>{d.name}</span><span className="text-ink-500">{d.volumeT.toLocaleString("en-IN")}{t("admin.unitTonnes")}</span></div>
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
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.sfTitle")} description={t("admin.sfDesc")} actions={<DemoModeNotice />} />
      <div className="space-y-3">
        {fraudAlerts.map((f) => (
          <Card key={f.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", f.severity === "high" ? "bg-alert-50 text-alert-600" : f.severity === "medium" ? "bg-saffron-100 text-saffron-600" : "bg-earth-100 text-ink-500")}>
                <Flag className="h-5 w-5" aria-hidden />
              </span>
              <div className="max-w-2xl">
                <p className="text-sm font-bold text-ink-900">{t(f.titleKey)}</p>
                <p className="mt-0.5 text-sm text-ink-500">{t(f.bodyKey)}</p>
                <p className="mt-1 text-xs text-ink-400">{f.centre} · {f.district} · {t(f.timeKey)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">{t("admin.markReviewed")}</Button>
              <Button size="sm" variant="danger">{t("admin.escalate")}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StateAnalytics() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.saTitle")} description={t("admin.saDesc")} actions={<DemoModeNotice />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartHourlyNetwork")}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={hourlyThroughput} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
              <Line type="monotone" dataKey="trucks" stroke="#1a5c38" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="avgMin" name={t("admin.chartWaitName")} stroke="#f7a90b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5"><h3 className="text-sm font-bold text-ink-900">{t("admin.chartVerification")}</h3>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4"><VerificationDonut /><DonutLegend /></div>
        </Card>
      </div>
    </div>
  );
}

export function StateReports() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.srTitle")} description={t("admin.srDesc")} actions={<DemoModeNotice />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { k: "srep1", s: "Ready" },
          { k: "srep2", s: "Ready" },
          { k: "srep3", s: "Ready" },
          { k: "srep4", s: "Generating" },
          { k: "srep5", s: "Ready" },
          { k: "srep6", s: "Scheduled" },
        ].map((r) => (
          <Card key={r.k} className="flex flex-col p-5">
            <h3 className="font-bold text-ink-900">{t(`admin.${r.k}Title`)}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-500">{t(`admin.${r.k}Desc`)}</p>
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge tone={r.s === "Ready" ? "green" : r.s === "Scheduled" ? "gray" : "amber"} label={t(`admin.rep${r.s}`)} />
              <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={download}>{t("admin.exportBtn")}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StateAudit() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.stauTitle")} description={t("admin.stauDesc")} actions={<DemoModeNotice />} />
      <Card className="p-5">
        <p className="text-sm text-ink-500">
          {t("admin.stauBody")}
        </p>
        <Link to="/officer/audit" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800">
          {t("admin.stauLink")} <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {stateDistricts.slice(0, 4).map((d) => (
            <div key={d.districtId} className="rounded-xl bg-earth-50 px-3.5 py-2.5 text-xs font-semibold text-ink-700">
              {t("admin.stauRow", { name: d.name, n: d.centres })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
