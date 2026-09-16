import { Link } from "react-router-dom";
import {
  Truck, MapPin, Navigation, ScanLine, Fuel, Gauge, Wrench, User, Package, Route as RouteIcon, CheckCircle2, Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { driverTrips, tripStageLabels } from "@/data/roles";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/Badges";
import { EmptyState } from "@/components/common/Card";
import { cn, formatKg } from "@/utils/format";

const toneFor = (s: string) =>
  s === "completed" ? "green" : s === "en-route" ? "blue" : "amber";

export function DriverTrips() {
  const active = driverTrips.filter((t) => t.status !== "completed");
  const done = driverTrips.filter((t) => t.status === "completed");
  return (
    <div>
      <PageHeader title="My Trips" description="Assignments from linked bookings, updated live." />
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-400">Active</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {active.map((t) => (
          <Card key={t.tripId} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-bold text-ink-400">{t.tripId}</p>
                <h3 className="mt-0.5 font-bold text-ink-900">{t.centreName}</h3>
              </div>
              <StatusBadge tone={toneFor(t.status)} label={tripStageLabels[t.status]} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">Farmer</dt><dd className="font-semibold">{t.farmerName}</dd></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">Load</dt><dd className="font-semibold">{t.crop} · {formatKg(t.quantityKg)}</dd></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">ETA</dt><dd className="font-semibold">{t.etaMin} min</dd></div>
              <div className="rounded-xl bg-earth-50 px-3 py-2"><dt className="text-[10px] font-bold uppercase text-ink-400">Booking</dt><dd className="font-mono text-xs font-semibold">{t.bookingId}</dd></div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Link to="/driver/navigation" className="flex-1"><Button size="sm" className="w-full" icon={<Navigation className="h-3.5 w-3.5" />}>Navigate</Button></Link>
              <Link to="/driver/rfid" className="flex-1"><Button size="sm" variant="outline" className="w-full" icon={<ScanLine className="h-3.5 w-3.5" />}>RFID</Button></Link>
            </div>
          </Card>
        ))}
        {active.length === 0 && <EmptyState title="No active trips" body="New assignments appear here as soon as a centre accepts your linked booking." />}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-ink-400">Completed today</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {done.map((t) => (
          <Card key={t.tripId} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink-900">{t.centreName}</h3>
              <StatusBadge tone="green" label="Completed" />
            </div>
            <p className="mt-1 text-sm text-ink-500">{t.farmerName} · {t.crop} · {formatKg(t.quantityKg)} · {t.lane}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DriverVehicle() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="My Vehicle" description="Registered truck and RFID tag details." />
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <Truck className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink-900">{user?.truckReg}</h2>
              <p className="font-mono text-xs text-ink-400">RFID {user?.rfid}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              { icon: Gauge, k: "Vehicle type", v: "6-wheeler open bed" },
              { icon: Package, k: "Max load", v: "16,000 kg" },
              { icon: Fuel, k: "Fuel level", v: "72% · ~410 km range" },
              { icon: Wrench, k: "Last service", v: "02 Sep 2026 — fit" },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between rounded-xl bg-earth-50 px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-ink-500"><r.icon className="h-4 w-4" aria-hidden /> {r.k}</span>
                <span className="font-semibold text-ink-900">{r.v}</span>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink-900">RFID tag health</h3>
          <div className="mt-3 rounded-2xl border border-primary-200 bg-primary-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold text-ink-900">{user?.rfid}</span>
              <StatusBadge tone="green" label="● Tag active" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              Battery OK · last read at Nagpur gate 4 today, 08:41. Tag is linked to Driver {user?.employeeId}
              and vehicle {user?.truckReg}.
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { icon: User, t: "Owner/operator matches registry" },
              { icon: CheckCircle2, t: "Vehicle insurance valid till Mar 2027" },
              { icon: CheckCircle2, t: "PUC certificate valid" },
            ].map((x) => (
              <li key={x.t} className="flex items-center gap-2 text-ink-700">
                <x.icon className="h-4.5 w-4.5 shrink-0 text-primary-600" aria-hidden /> {x.t}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function DriverRfid() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="RFID Status" description="Live gate-read simulation for your tag." />
      <Card className="p-6">
        <div className="relative mx-auto flex h-56 max-w-md items-center justify-center overflow-hidden rounded-3xl bg-primary-950">
          <div
            className="absolute inset-0"
            style={{ background: "conic-gradient(from 0deg, rgba(72,180,123,.35), transparent 25%)", animation: "radar 2.4s linear infinite" }}
            aria-hidden
          />
          <div className="relative z-10 text-center">
            <ScanLine className="mx-auto h-10 w-10 text-primary-300" aria-hidden />
            <p className="mt-2 font-mono text-lg font-extrabold tracking-widest text-white">{user?.rfid}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-200">Awaiting gate read · demo scanner</p>
          </div>
        </div>
        <div className="mx-auto mt-5 grid max-w-md gap-2">
          {[
            "Tag registered ✓",
            "Vehicle linked ✓",
            "Driver licence verified ✓",
            "Booking match — pending gate arrival",
          ].map((t, i) => (
            <div key={t} className={cn("flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold", i < 3 ? "bg-primary-50 text-primary-800" : "bg-earth-100 text-ink-500")}>
              {i < 3 ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Clock className="h-4 w-4" aria-hidden />} {t}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function DriverNavigation() {
  const trip = driverTrips[0];
  return (
    <div>
      <PageHeader title="Navigation" description="Route guidance to the assigned procurement centre." />
      <Card className="overflow-hidden">
        <div className="relative h-72 bg-primary-950">
          <img
            src="https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=1200&q=80"
            alt="Aerial route view"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-4 shadow-lift">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Destination</p>
              <p className="text-sm font-extrabold text-ink-900">{trip.centreName}</p>
              <p className="text-xs text-ink-500">{trip.distanceKm} km · ETA {trip.etaMin} min · Gate 2 → LANE 03</p>
            </div>
            <Button
              icon={<Navigation className="h-4 w-4" />}
              onClick={() => window.open("https://www.openstreetmap.org/directions?to=21.1458%2C79.0882", "_blank", "noopener")}
            >
              Open turn-by-turn
            </Button>
          </div>
        </div>
        <ol className="divide-y divide-ink-100">
          {[
            "Head east on Kamptee Road toward Jaripatka (1.8 km)",
            "Continue onto NH-44 South — keep left at the fork (1.6 km)",
            "Turn right at KrushiSetu Centre Arch (800 m)",
            "Arrive Gate 2 — RFID lane. Queue position: 3rd",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3 px-5 py-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-700 text-[11px] font-extrabold text-white">{i + 1}</span>
              <span className="text-ink-700">{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

export function DriverHistory() {
  return (
    <div>
      <PageHeader title="Trip History" description="Completed deliveries linked to procurement transactions." />
      <div className="space-y-3">
        {driverTrips.filter((t) => t.status === "completed").map((t) => (
          <Card key={t.tripId} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <RouteIcon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-bold text-ink-900">{t.centreName}</p>
                <p className="text-xs text-ink-500">{t.farmerName} · {t.crop} · {formatKg(t.quantityKg)} · {t.lane}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge tone="green" label={`✓ Net settled · ${t.bookingId}`} />
              <span className="text-xs font-semibold text-ink-400">Today, 09:52</span>
            </div>
          </Card>
        ))}
        <Card className="flex items-center gap-3 p-5 opacity-70">
          <MapPin className="h-5 w-5 text-ink-300" aria-hidden />
          <p className="text-sm text-ink-500">Older trips (before 15 Sep 2026) are archived in the district register — demo dataset covers today only.</p>
        </Card>
      </div>
    </div>
  );
}
