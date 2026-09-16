import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Truck,
  Building2,
  Wheat,
  Scale,
  QrCode,
  Copy,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { bookProcurementSlot } from "@/services/mockProcurement";
import type { SlotBooking } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badges";
import { EmptyState } from "@/components/common/Card";
import { cn, formatKg, formatNumber } from "@/utils/format";

const cropOptions = ["Wheat", "Soybean", "Cotton", "Onion", "Tomato", "Rice"];

type Step = 1 | 2 | 3 | 4;

export default function BookSlot() {
  const { centres, farmer, addBooking, updateCentreCapacity, pushToast, pushNotification } = useApp();
  const [params] = useSearchParams();
  const preselected = params.get("centre");

  const [step, setStep] = useState<Step>(1);
  const [centreId, setCentreId] = useState<string | null>(preselected);
  const [crop, setCrop] = useState<string>(farmer.currentCrop);
  const [qty, setQty] = useState<number>(8000);
  const [slot, setSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState<SlotBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const centre = centres.find((c) => c.centreId === centreId) ?? null;

  const slotState = (bookedKg: number, capacityKg: number) => {
    const ratio = bookedKg / capacityKg;
    if (ratio >= 1) return "full" as const;
    if (ratio >= 0.9) return "limited" as const;
    return "available" as const;
  };

  const capacityOk = centre ? qty > 0 && qty <= centre.remainingCapacityKg : false;

  const confirm = async () => {
    if (!centre || !slot) return;
    setSubmitting(true);
    const b = await bookProcurementSlot({
      farmerId: farmer.farmerId,
      farmerName: farmer.name,
      centreId: centre.centreId,
      centreName: centre.name,
      crop,
      quantityKg: qty,
      date: new Date(Date.now() + 86400000).toISOString(),
      time: slot,
    });
    setBooking(b);
    addBooking(b);
    updateCentreCapacity(centre.centreId, -qty);
    pushToast({
      kind: "success",
      title: "Slot booked",
      body: `${b.slotId} · ${slot} at ${centre.name}`,
    });
    pushNotification({
      type: "slot-reminder",
      title: `Slot confirmed — ${centre.name}, ${slot}`,
      body: `${formatKg(qty)} of ${crop}. Show QR pass at the RFID gate 20 minutes early.`,
      actor: "farmer",
    });
    setSubmitting(false);
  };

  /* ------------------------- Confirmation screen ------------------------ */
  if (booking) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-3xl bg-primary-700 p-6 text-center text-white md:p-9">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary-200" aria-hidden />
          </motion.div>
          <h1 className="mt-3 font-display text-2xl font-extrabold md:text-3xl">Slot Confirmed!</h1>
          <p className="mt-1 text-primary-100">Your procurement slot has been reserved at {booking.centreName}.</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-mono text-lg font-bold tracking-wide">
            {booking.slotId}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(booking.slotId).catch(() => {});
                pushToast({ kind: "info", title: "Slot ID copied" });
              }}
              aria-label="Copy slot ID"
              className="text-primary-200 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </button>
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-earth-50 text-center">
              <QrCode className="h-10 w-10 text-ink-700" aria-hidden />
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-ink-400">QR at gate</p>
            </div>
            <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ["Farmer ID", farmer.farmerId],
                ["Farmer", farmer.name],
                ["Centre ID", booking.centreId],
                ["Centre", booking.centreName],
                ["Crop", booking.crop],
                ["Quantity", formatKg(booking.quantityKg)],
                ["Date", new Date(booking.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })],
                ["Time", booking.time],
                ["Status", "Confirmed"],
                ["Booking ref", booking.qrRef],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-5 rounded-xl bg-primary-50 px-4 py-3 text-xs leading-relaxed text-primary-900">
            <strong>What happens next:</strong> Arrive 20 minutes early with your truck. The RFID gate
            automatically links your farmer ID, truck and booking. After digital weighing and CV produce
            verification, payment is credited within 48 hours.
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setBooking(null); setSlot(null); setStep(1); }}>
              Book another slot
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ------------------------------ Wizard ------------------------------- */
  const steps = [
    { n: 1 as Step, label: "Centre" },
    { n: 2 as Step, label: "Crop & Quantity" },
    { n: 3 as Step, label: "Capacity & Slot" },
    { n: 4 as Step, label: "Confirm" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Book Procurement Slot"
        description="Capacity-checked booking — reserve your slot and skip the queue."
      />

      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2" aria-label="Booking steps">
        {steps.map((s, i) => (
          <li key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition",
                step > s.n
                  ? "bg-primary-600 text-white"
                  : step === s.n
                    ? "bg-primary-700 text-white ring-4 ring-primary-100"
                    : "bg-earth-200 text-ink-400",
              )}
              aria-current={step === s.n ? "step" : undefined}
            >
              {step > s.n ? "✓" : s.n}
            </span>
            <span className={cn("hidden text-xs font-bold sm:block", step >= s.n ? "text-ink-900" : "text-ink-400")}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="h-0.5 flex-1 rounded bg-earth-200" aria-hidden />}
          </li>
        ))}
      </ol>

      {/* Step 1 — Centre */}
      {step === 1 && (
        <Card className="p-5 animate-fade-up">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Building2 className="h-5 w-5 text-primary-700" aria-hidden /> Select procurement centre
          </h2>
          {centres.length === 0 ? (
            <EmptyState title="No centres" body="Centres will appear here once the network data loads." />
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {centres.map((c) => {
                const pct = Math.round((c.remainingCapacityKg / c.capacityKg) * 100);
                const disabled = c.status === "full" || c.status === "closed";
                return (
                  <button
                    key={c.centreId}
                    disabled={disabled}
                    onClick={() => {
                      setCentreId(c.centreId);
                      setStep(2);
                    }}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      disabled
                        ? "cursor-not-allowed border-ink-100 bg-earth-50 opacity-60"
                        : "border-ink-100 bg-white hover:border-primary-500 hover:shadow-soft",
                      centreId === c.centreId && "border-primary-600 ring-2 ring-primary-100",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-ink-900">{c.name}</h3>
                      <StatusBadge
                        tone={c.status === "available" ? "green" : c.status === "busy" ? "amber" : "red"}
                        label={c.status === "available" ? "● Available" : c.status === "busy" ? "● Busy" : c.status === "full" ? "● Full" : "● Closed"}
                      />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                      <MapPin className="h-3.5 w-3.5" aria-hidden /> {c.city}, {c.state}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-ink-700">
                      {formatKg(c.remainingCapacityKg)} free ({pct}%) · {c.queue} trucks waiting
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.supportedCrops.slice(0, 3).map((sc) => (
                        <span key={sc} className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-800">{sc}</span>
                      ))}
                    </div>
                    {disabled && (
                      <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-alert-600">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Not accepting bookings today
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Step 2 — Crop & quantity */}
      {step === 2 && centre && (
        <Card className="p-5 animate-fade-up">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Wheat className="h-5 w-5 text-primary-700" aria-hidden /> Crop & expected quantity
          </h2>
          <p className="mt-1 text-sm text-ink-500">Booking at <strong className="text-ink-900">{centre.name}</strong></p>

          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-400">Crop to sell</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {cropOptions.map((c) => {
              const supported = centre.supportedCrops.includes(c);
              return (
                <button
                  key={c}
                  disabled={!supported}
                  onClick={() => setCrop(c)}
                  aria-pressed={crop === c}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                    crop === c
                      ? "border-primary-700 bg-primary-700 text-white"
                      : supported
                        ? "border-ink-200 bg-white text-ink-700 hover:border-primary-400"
                        : "cursor-not-allowed border-ink-100 bg-earth-50 text-ink-300",
                  )}
                  title={supported ? undefined : `${centre.name} does not accept ${c}`}
                >
                  {c}{!supported && " ✕"}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-400">Expected quantity (kg)</p>
          <div className="mt-2 flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => setQty((q) => Math.max(500, q - 500))} aria-label="Decrease quantity">−</Button>
            <input
              type="number"
              min={500}
              step={500}
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
              aria-label="Expected quantity in kilograms"
              className="h-12 w-full max-w-48 rounded-xl border border-ink-200 bg-earth-50 px-4 text-center font-display text-lg font-bold text-ink-900 outline-none focus:border-primary-500 focus:bg-white"
            />
            <Button variant="outline" size="md" onClick={() => setQty((q) => q + 500)} aria-label="Increase quantity">+</Button>
            <div className="hidden gap-1.5 sm:flex">
              {[4000, 8000, 12000].map((v) => (
                <button
                  key={v}
                  onClick={() => setQty(v)}
                  className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-500 hover:border-primary-400 hover:text-primary-700"
                >
                  {v / 1000}t
                </button>
              ))}
            </div>
          </div>
          {qty <= 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-alert-600">
              <AlertTriangle className="h-4 w-4" aria-hidden /> Enter a quantity above zero to continue.
            </p>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep(1)}>Back</Button>
            <Button disabled={qty <= 0} onClick={() => setStep(3)} iconRight={<ArrowRight className="h-4 w-4" />}>
              Check capacity
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — Capacity check + slots */}
      {step === 3 && centre && (
        <div className="animate-fade-up">
          <Card className={cn("p-5", capacityOk ? "border-primary-200" : "border-alert-100")}>
            {capacityOk ? (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-primary-800">✓ Capacity Available</h3>
                  <p className="mt-1 text-sm text-ink-700">
                    <strong>{formatKg(qty)}</strong> requested · <strong>{formatKg(centre.remainingCapacityKg)}</strong> remaining
                    · <strong>{formatKg(centre.remainingCapacityKg - qty)}</strong> left after booking
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-earth-200">
                    <motion.div
                      className="h-full rounded-full bg-primary-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((centre.capacityKg - centre.remainingCapacityKg + qty) / centre.capacityKg) * 100)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-alert-50 text-alert-600">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-alert-700">⚠ Capacity Insufficient</h3>
                  <p className="mt-1 text-sm text-ink-700">
                    Requested <strong>{formatKg(qty)}</strong> · Available <strong>{formatKg(centre.remainingCapacityKg)}</strong>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-ink-500">Try another centre or reduce quantity — booking is blocked to keep centre queues realistic.</p>
                </div>
              </div>
            )}
          </Card>

          {capacityOk && (
            <Card className="mt-4 p-5">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink-900">
                <Clock className="h-5 w-5 text-primary-700" aria-hidden /> Tomorrow's available slots
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Predicted wait once you arrive: <strong>~{centre.queue > 0 ? Math.round((centre.queue / Math.max(1, centre.lanes - 1)) * centre.avgWeighingMinutes) : 8} min</strong> · {centre.queue} trucks ahead
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {centre.slots.map((s) => {
                  const st = slotState(s.bookedKg, s.capacityKg);
                  const disabled = st === "full";
                  return (
                    <button
                      key={s.time}
                      disabled={disabled}
                      onClick={() => setSlot(s.time)}
                      className={cn(
                        "rounded-xl border p-3 text-center transition",
                        disabled
                          ? "cursor-not-allowed border-ink-100 bg-earth-100"
                          : slot === s.time
                            ? "border-primary-700 bg-primary-700 text-white ring-4 ring-primary-100"
                            : "border-ink-200 bg-white hover:border-primary-400",
                      )}
                    >
                      <p className={cn("text-sm font-bold", slot === s.time ? "text-white" : "text-ink-900")}>{s.time}</p>
                      <p
                        className={cn(
                          "mt-0.5 text-[11px] font-bold",
                          disabled ? "text-alert-600" : slot === s.time ? "text-primary-100" : st === "limited" ? "text-saffron-600" : "text-primary-600",
                        )}
                      >
                        {st === "full" ? "● Full" : st === "limited" ? "● Limited" : "● Available"}
                      </p>
                      <p className={cn("mt-0.5 text-[10px]", slot === s.time ? "text-primary-200" : "text-ink-400")}>
                        {formatNumber(s.capacityKg - s.bookedKg)} kg free
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-between">
                <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep(2)}>Back</Button>
                <Button disabled={!slot} onClick={() => setStep(4)} iconRight={<ArrowRight className="h-4 w-4" />}>
                  Review booking
                </Button>
              </div>
            </Card>
          )}
          {!capacityOk && (
            <div className="mt-4 flex justify-between">
              <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep(2)}>Back</Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4 — Confirm */}
      {step === 4 && centre && slot && (
        <Card className="p-5 animate-fade-up">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Scale className="h-5 w-5 text-primary-700" aria-hidden /> Review & confirm
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-earth-50 p-4 text-sm md:grid-cols-3">
            {[
              ["Farmer", `${farmer.name} (${farmer.farmerId})`],
              ["Centre", centre.name],
              ["Centre ID", centre.centreId],
              ["Crop", crop],
              ["Quantity", formatKg(qty)],
              ["Date", new Date(Date.now() + 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })],
              ["Time", slot],
              ["Truck", "MH-12-AB-4521 (linked via RFID)"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{k}</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
            <Truck className="h-4 w-4" aria-hidden /> Capacity will be reserved the moment you confirm; centre dashboards update instantly.
          </p>
          <div className="mt-5 flex justify-between">
            <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep(3)}>Back</Button>
            <Button loading={submitting} onClick={confirm} size="lg">
              Confirm booking
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
