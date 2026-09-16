import { useEffect, useState } from "react";
import { Truck, Radio, ScanLine, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { trucks } from "@/data/trucks";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/Badges";
import { DemoModeNotice } from "@/components/common/Card";
import { cn } from "@/utils/format";

const statusTone = {
  registered: "green",
  "en-route": "blue",
  "at-gate": "amber",
  "in-lane": "amber",
  weighing: "amber",
  completed: "green",
} as const;

export default function IncomingTrucks() {
  const { pushToast } = useApp();
  const [fleet, setFleet] = useState(trucks);
  const [scanningId, setScanningId] = useState<string | null>(null);

  // simulate arrivals
  useEffect(() => {
    const t = setInterval(() => {
      setFleet((prev) =>
        prev.map((tr) =>
          tr.status === "en-route" && Math.random() < 0.4
            ? { ...tr, status: "at-gate" }
            : tr,
        ),
      );
    }, 7000);
    return () => clearInterval(t);
  }, []);

  const scan = async (truckId: string) => {
    setScanningId(truckId);
    await new Promise((r) => setTimeout(r, 1600));
    setFleet((prev) => prev.map((tr) => (tr.truckId === truckId ? { ...tr, status: "in-lane" } : tr)));
    setScanningId(null);
    const tr = fleet.find((t) => t.truckId === truckId);
    pushToast({ kind: "success", title: "RFID identified", body: `${tr?.registrationNumber} linked to ${tr?.farmerName} — ready for weighing.` });
  };

  return (
    <div>
      <PageHeader
        title="Incoming Trucks"
        description="Gate feed with RFID identification and farmer–truck–booking linkage."
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "Incoming Trucks" }]}
        actions={<DemoModeNotice />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fleet.map((t) => (
          <Card key={t.truckId} className={cn("p-4", scanningId === t.truckId && "ring-2 ring-primary-300")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Truck className="h-5.5 w-5.5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-mono text-sm font-extrabold text-ink-900">{t.registrationNumber}</h3>
                  <p className="text-xs text-ink-500">RFID {t.rfid}</p>
                </div>
              </div>
              <StatusBadge tone={statusTone[t.status]} label={t.status.replace("-", " ")} className="capitalize" />
            </div>

            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-ink-400">Farmer</dt><dd className="font-semibold text-ink-900">{t.farmerName}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-400">Produce</dt><dd className="font-semibold text-ink-900">{t.crop}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-400">Booking</dt><dd className="font-mono text-xs font-semibold text-ink-700">{t.bookingId ?? "—"}</dd></div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
              {scanningId === t.truckId ? (
                <p className="flex flex-1 items-center gap-2 text-xs font-bold text-primary-700">
                  <ScanLine className="h-4 w-4 animate-pulse" aria-hidden /> Scanning RFID…
                </p>
              ) : t.status === "completed" || t.status === "in-lane" ? (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                  <Radio className="h-4 w-4" aria-hidden /> RFID verified
                </p>
              ) : t.bookingId ? (
                <Button size="sm" onClick={() => scan(t.truckId)} icon={<ScanLine className="h-4 w-4" />}>
                  Scan at gate
                </Button>
              ) : (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-saffron-600">
                  <AlertTriangle className="h-4 w-4" aria-hidden /> No booking — manual entry
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
