import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck, MapPin, Clock, Radar, Navigation, Phone, Wheat, ScanLine, CheckCircle2, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { driverTrips, tripStageLabels, tripStages } from "@/data/roles";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/Badges";
import { cn, formatKg } from "@/utils/format";

export default function DriverDashboard() {
  const { user } = useAuth();
  const trip = driverTrips[0];
  const [stageIdx, setStageIdx] = useState(tripStages.indexOf(trip.status as (typeof tripStages)[number]));

  const advance = () => setStageIdx((i) => Math.min(tripStages.length - 1, i + 1));
  const stage = tripStages[stageIdx];

  return (
    <div>
      <PageHeader
        title={`Namaste, ${user?.name.split(" ")[0]}`}
        description={`${user?.truckReg} · RFID ${user?.rfid} · Driver ID ${user?.employeeId}`}
        actions={<StatusBadge tone="amber" label={`● ${tripStageLabels[stage]}`} />}
      />

      {/* Assignment card */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-primary-700 px-5 py-4 text-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-200">Today's assignment</p>
            <h2 className="font-display text-lg font-extrabold">{trip.centreName}</h2>
          </div>
          <StatusBadge tone="green" label={`Booking ${trip.bookingId}`} className="!border-white/20 !bg-white/10 !text-white" />
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Wheat, k: "Produce", v: trip.crop },
            { icon: Truck, k: "Quantity", v: formatKg(trip.quantityKg) },
            { icon: MapPin, k: "Distance", v: `${trip.distanceKm} km` },
            { icon: Clock, k: "ETA", v: `${trip.etaMin} min` },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl bg-earth-50 p-4">
              <x.icon className="h-5 w-5 text-primary-700" aria-hidden />
              <p className="mt-2 font-display text-lg font-extrabold text-ink-900">{x.v}</p>
              <p className="text-xs font-semibold text-ink-400">{x.k}</p>
            </div>
          ))}
        </div>

        {/* Linked farmer */}
        <div className="mx-5 mb-5 flex items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary-700">Linked shipment</p>
            <p className="text-sm font-bold text-ink-900">{trip.farmerName} · {trip.farmerId}</p>
            <p className="text-xs text-ink-500">{trip.crop} · {formatKg(trip.quantityKg)} · verified against booking</p>
          </div>
          <Button size="sm" variant="outline" icon={<Phone className="h-3.5 w-3.5" />}>Call</Button>
        </div>

        {/* Trip tracker */}
        <div className="border-t border-ink-100 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-900">Trip progress</h3>
            <Button size="sm" variant="secondary" onClick={advance} disabled={stageIdx >= tripStages.length - 1}>
              {stageIdx === 1 ? "I've arrived" : "Advance (demo)"}
            </Button>
          </div>
          <ol className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {tripStages.map((s, i) => (
              <li key={s} className="text-center">
                <motion.span
                  initial={false}
                  animate={{ scale: i === stageIdx ? 1.08 : 1 }}
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-extrabold",
                    i < stageIdx ? "bg-primary-600 text-white" : i === stageIdx ? "bg-saffron-400 text-ink-900 ring-4 ring-saffron-100" : "bg-earth-200 text-ink-400",
                  )}
                >
                  {i < stageIdx ? "✓" : i + 1}
                </motion.span>
                <p className={cn("mt-1.5 text-[9px] font-bold uppercase leading-tight tracking-wide", i <= stageIdx ? "text-ink-700" : "text-ink-300")}>
                  {tripStageLabels[s]}
                </p>
              </li>
            ))}
          </ol>

          {stage === "rfid-detected" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-50 px-3.5 py-2.5 text-xs font-bold text-primary-800 animate-fade-up">
              <ScanLine className="h-4 w-4 animate-pulse" aria-hidden /> RFID TRK-98312 detected at gate — matching booking…
            </div>
          )}
          {stage === "lane-assigned" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-50 px-3.5 py-2.5 text-xs font-bold text-primary-800 animate-fade-up">
              <Radar className="h-4 w-4" aria-hidden /> Assigned to LANE 03 · proceed to weighbridge
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-ink-100 bg-earth-50/60 p-4">
          <Link to="/driver/navigation"><Button icon={<Navigation className="h-4 w-4" />}>Start navigation</Button></Link>
          <Link to="/driver/rfid"><Button variant="outline" icon={<ScanLine className="h-4 w-4" />}>RFID status</Button></Link>
          <Button variant="ghost" icon={<Phone className="h-4 w-4" />} onClick={() => window.open("tel:+917122564410")}>Call centre</Button>
        </div>
      </Card>

      <Link to="/driver/trips" className="mt-5 flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition hover:shadow-lift">
        <span className="text-sm font-bold text-ink-900">All my trips & history</span>
        <ChevronRight className="h-5 w-5 text-ink-300" aria-hidden />
      </Link>
    </div>
  );
}
