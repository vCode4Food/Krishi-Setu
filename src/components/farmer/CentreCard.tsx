import { Link, useNavigate } from "react-router-dom";
import { MapPin, Truck, Clock, ArrowRight } from "lucide-react";
import type { ProcurementCentre } from "@/types";
import { Card } from "@/components/common/Card";
import { CentreStatusBadge } from "@/components/common/Badges";
import { CapacityMeter } from "@/components/common/CapacityMeter";
import { Button } from "@/components/common/Button";
import { formatKg } from "@/utils/format";

export function CentreCard({
  centre,
  distanceKm,
  waitMinutes,
  compact = false,
}: {
  centre: ProcurementCentre;
  distanceKm?: number;
  waitMinutes?: number;
  compact?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Card hover className="flex h-full flex-col overflow-hidden">
      {!compact && (
        <div className="relative h-36 w-full overflow-hidden">
          <img src={centre.image} alt={centre.name} className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3">
            <CentreStatusBadge status={centre.status} />
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-bold text-ink-900">{centre.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {centre.city}
              {distanceKm !== undefined && <> · {distanceKm} km away</>}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-lg bg-earth-50 px-2.5 py-2 font-semibold text-ink-700">
            <Truck className="h-3.5 w-3.5 text-ink-400" aria-hidden /> {centre.queue} in queue
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-earth-50 px-2.5 py-2 font-semibold text-ink-700">
            <Clock className="h-3.5 w-3.5 text-ink-400" aria-hidden /> ~{waitMinutes ?? centre.queue * centre.avgWeighingMinutes} min wait
          </span>
        </div>

        <div className="mt-3">
          <CapacityMeter remaining={centre.remainingCapacityKg} total={centre.capacityKg} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {centre.supportedCrops.map((c) => (
            <span key={c} className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-800">
              {c} ✓
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
          <span className="text-[11px] font-medium text-ink-400">{formatKg(centre.remainingCapacityKg)} free</span>
          <Button
            size="sm"
            variant={centre.status === "full" || centre.status === "closed" ? "outline" : "primary"}
            disabled={centre.status === "full" || centre.status === "closed"}
            className="!h-8 !px-3"
            onClick={() => navigate(`/farmer/book-slot?centre=${centre.centreId}`)}
            iconRight={<ArrowRight className="h-3.5 w-3.5" />}
          >
            {centre.status === "full" ? "Centre Full" : centre.status === "closed" ? "Closed" : "Book Slot"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function CentreMiniLink({ centreId, children }: { centreId: string; children: React.ReactNode }) {
  return (
    <Link to={`/farmer/centres?centre=${centreId}`} className="font-semibold text-primary-700 hover:text-primary-800">
      {children}
    </Link>
  );
}
