import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, SlidersHorizontal, X, MapPin, Clock, Truck, Navigation } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { FARMER_HOME, distanceKm } from "@/services/mockMaps";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chip } from "@/components/common/Badges";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { CentreStatusBadge } from "@/components/common/Badges";
import { CapacityMeter } from "@/components/common/CapacityMeter";
import { EmptyState } from "@/components/common/Card";
import { DemoModeNotice } from "@/components/common/Card";
import { useNavigate } from "react-router-dom";
import type { CentreStatus, ProcurementCentre } from "@/types";
import { cn } from "@/utils/format";

const statusColors: Record<CentreStatus, string> = {
  available: "#2c9960",
  busy: "#f7a90b",
  full: "#ef4444",
  closed: "#5c7263",
};

const markerIcon = (status: CentreStatus, label: string) =>
  L.divIcon({
    className: "",
    html: `<div style="position:relative">
      <div style="position:absolute;inset:-6px;border-radius:9999px;background:${statusColors[status]}33;animation:pulse-ring 1.8s cubic-bezier(.2,.6,.4,1) infinite"></div>
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:${statusColors[status]};color:#fff;font:700 11px/1 Inter,sans-serif;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">${label}</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });

const cropFilters = ["All", "Wheat", "Rice", "Cotton", "Soybean", "Onion", "Tomato", "Maize", "Chickpea"];
const availabilityFilters = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "full", label: "Full" },
];

export default function CentresMap() {
  const { centres } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [crop, setCrop] = useState("All");
  const [availability, setAvailability] = useState("all");
  const [maxDistance, setMaxDistance] = useState(1500);
  const [minCapacity, setMinCapacity] = useState(0);
  const [selected, setSelected] = useState<ProcurementCentre | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const enriched = useMemo(
    () =>
      centres.map((c) => ({
        centre: c,
        km: Math.max(0.4, distanceKm(FARMER_HOME.lat, FARMER_HOME.lng, c.lat, c.lng)),
        wait: Math.round((c.queue / Math.max(1, c.lanes - 1)) * c.avgWeighingMinutes),
      })),
    [centres],
  );

  const filtered = useMemo(
    () =>
      enriched
        .filter((e) => e.km <= maxDistance)
        .filter((e) => crop === "All" || e.centre.supportedCrops.includes(crop))
        .filter((e) => availability === "all" || e.centre.status === availability)
        .filter((e) => e.centre.remainingCapacityKg >= minCapacity)
        .filter(
          (e) =>
            !query ||
            e.centre.name.toLowerCase().includes(query.toLowerCase()) ||
            e.centre.city.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => a.km - b.km),
    [enriched, maxDistance, crop, availability, minCapacity, query],
  );

  const selectedEnriched = selected ? enriched.find((e) => e.centre.centreId === selected.centreId) : null;

  return (
    <div>
      <PageHeader
        title="Procurement Centres"
        description="Live availability across the KrushiSetu network. Filters update results and map markers instantly."
        actions={<DemoModeNotice />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        {/* Map */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search centre or city…"
                aria-label="Search centres"
                className="h-10 w-full rounded-xl border border-ink-200 bg-earth-50 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:bg-white"
              />
            </div>
            <Button variant="outline" size="sm" className="lg:hidden" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setShowFilters((v) => !v)}>
              Filters
            </Button>
          </div>

          <div className="relative h-[26rem] lg:h-[34rem]">
            <MapContainer
              center={[FARMER_HOME.lat, FARMER_HOME.lng]}
              zoom={5}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[FARMER_HOME.lat, FARMER_HOME.lng]}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:#0284c7;color:#fff;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg></div>`,
                  iconSize: [26, 26],
                  iconAnchor: [13, 13],
                })}
              >
                <Popup>You are here — {FARMER_HOME.label}</Popup>
              </Marker>
              {filtered.map(({ centre }) => (
                <Marker
                  key={centre.centreId}
                  position={[centre.lat, centre.lng]}
                  icon={markerIcon(centre.status, centre.city.slice(0, 2).toUpperCase())}
                  eventHandlers={{ click: () => setSelected(centre) }}
                >
                  <Popup>
                    <strong>{centre.name}</strong>
                    <br />
                    {(centre.remainingCapacityKg / 1000).toFixed(1)}t free · {centre.queue} trucks queued
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 px-4 py-2.5 text-xs font-semibold text-ink-500">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2c9960]" /> Available</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#f7a90b]" /> Busy</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> Full</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#5c7263]" /> Closed</span>
            <span className="ml-auto text-ink-400">{filtered.length} of {centres.length} centres</span>
          </div>
        </Card>

        {/* Filters + list */}
        <div className={cn("space-y-4", !showFilters && "hidden lg:block")}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <SlidersHorizontal className="h-4 w-4 text-primary-700" aria-hidden /> Filters
              </h2>
              <button
                onClick={() => {
                  setCrop("All");
                  setAvailability("all");
                  setMaxDistance(1500);
                  setMinCapacity(0);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800"
              >
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-400">Crop</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cropFilters.map((c) => (
                <Chip key={c} active={crop === c} onClick={() => setCrop(c)}>{c}</Chip>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-400">Availability</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {availabilityFilters.map((a) => (
                <Chip key={a.value} active={availability === a.value} onClick={() => setAvailability(a.value)}>{a.label}</Chip>
              ))}
            </div>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-ink-400" htmlFor="distance-range">
              Max distance — up to {maxDistance >= 1500 ? "any" : `${maxDistance} km`}
            </label>
            <input
              id="distance-range"
              type="range"
              min={10}
              max={1500}
              step={10}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />

            <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-ink-400" htmlFor="capacity-range">
              Min remaining capacity — {(minCapacity / 1000).toFixed(0)}t
            </label>
            <input
              id="capacity-range"
              type="range"
              min={0}
              max={30000}
              step={1000}
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
          </Card>

          <div className="space-y-3 lg:max-h-[26rem] lg:overflow-y-auto lg:pr-1">
            {filtered.length === 0 ? (
              <EmptyState
                title="No centres match"
                body="Try widening the distance, clearing the crop filter, or lowering the minimum capacity."
              />
            ) : (
              filtered.map(({ centre, km, wait }) => (
                <button
                  key={centre.centreId}
                  onClick={() => setSelected(centre)}
                  className={cn(
                    "w-full rounded-2xl border bg-white p-4 text-left shadow-soft transition hover:shadow-lift",
                    selected?.centreId === centre.centreId ? "border-primary-600 ring-2 ring-primary-100" : "border-ink-100",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-ink-900">{centre.name}</h3>
                    <CentreStatusBadge status={centre.status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden /> {centre.city} · {km} km
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-ink-700">
                    <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-ink-400" aria-hidden /> {centre.queue} queue</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-ink-400" aria-hidden /> ~{wait} min</span>
                  </div>
                  <CapacityMeter className="mt-2" remaining={centre.remainingCapacityKg} total={centre.capacityKg} showValues={false} />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected centre detail */}
      {selected && selectedEnriched && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={selected.name}>
          <button aria-label="Close details" className="absolute inset-0 bg-ink-900/45" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-lift animate-fade-up sm:rounded-2xl">
            <div className="relative h-36">
              <img src={selected.image} alt={selected.name} className="h-full w-full object-cover" />
              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-ink-700 shadow-soft"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="absolute left-4 top-3">
                <CentreStatusBadge status={selected.status} />
              </span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-5">
              <h3 className="font-display text-xl font-bold text-ink-900">{selected.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
                <MapPin className="h-4 w-4" aria-hidden /> {selected.city}, {selected.state} · {selectedEnriched.km} km away
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-earth-50 p-3">
                  <p className="font-display text-lg font-extrabold text-primary-700">
                    {Math.round((selected.remainingCapacityKg / selected.capacityKg) * 100)}%
                  </p>
                  <p className="text-[11px] font-semibold text-ink-400">Capacity free</p>
                </div>
                <div className="rounded-xl bg-earth-50 p-3">
                  <p className="font-display text-lg font-extrabold text-ink-900">{selected.queue}</p>
                  <p className="text-[11px] font-semibold text-ink-400">Trucks in queue</p>
                </div>
                <div className="rounded-xl bg-earth-50 p-3">
                  <p className="font-display text-lg font-extrabold text-ink-900">~{selectedEnriched.wait} min</p>
                  <p className="text-[11px] font-semibold text-ink-400">Est. waiting</p>
                </div>
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-400">Crops accepted</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.supportedCrops.map((c) => (
                  <span key={c} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-800">{c} ✓</span>
                ))}
              </div>

              <div className="mt-4">
                <CapacityMeter remaining={selected.remainingCapacityKg} total={selected.capacityKg} />
              </div>

              <p className="mt-4 text-xs text-ink-400">
                Operator: {selected.operatorName} · {selected.phone} · {selected.lanes} lanes
              </p>
            </div>
            <div className="flex gap-2 border-t border-ink-100 bg-earth-50/60 p-4">
              <Button className="flex-1" onClick={() => navigate(`/farmer/book-slot?centre=${selected.centreId}`)} disabled={selected.status === "full" || selected.status === "closed"}>
                {selected.status === "full" ? "Centre Full" : "Book Slot"}
              </Button>
              <Button variant="outline" icon={<Navigation className="h-4 w-4" />} onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=13/${selected.lat}/${selected.lng}`, "_blank", "noopener")}>
                Directions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
