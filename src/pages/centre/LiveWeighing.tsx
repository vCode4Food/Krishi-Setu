import { useRef, useState } from "react";
import {
  Radio,
  ScanBarcode,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  RefreshCw,
  Fingerprint,
  Truck,
  User,
  Weight,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { identifyTruck, type RfidScanResult } from "@/services/mockRFID";
import { captureGrossWeight, captureTareWeight } from "@/services/mockWeighbridge";
import { verifyProduce, newTxnId, assignLane, buildLanes } from "@/services/mockProcurement";
import type { CvResult, Lane } from "@/services/mockProcurement";
import type { Transaction } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { StatusBadge, SecuredBadge } from "@/components/common/Badges";
import { cn, formatKg } from "@/utils/format";

type Phase = "idle" | "scanning" | "identified" | "weighing" | "cv" | "confirmed";

export default function LiveWeighing() {
  const { addTransaction, updateCentreCapacity, pushToast, pushNotification } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [rfidResult, setRfidResult] = useState<RfidScanResult | null>(null);
  const [liveKg, setLiveKg] = useState(0);
  const [gross, setGross] = useState<number | null>(null);
  const [tare, setTare] = useState<number | null>(null);
  const [capturedGross, setCapturedGross] = useState(false);
  const [capturedTare, setCapturedTare] = useState(false);
  const [cv, setCv] = useState<CvResult | null>(null);
  const [cvReviewed, setCvReviewed] = useState(false);
  const [lanes, setLanes] = useState<Lane[]>(() => buildLanes(4));
  const [assignedLane, setAssignedLane] = useState<string | null>(null);
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [busy, setBusy] = useState(false);
  const stabilizing = useRef(false);
  void lanes;

  const truck = rfidResult?.truck;
  const net = gross !== null && tare !== null ? gross - tare : null;

  /* ------------------------------ RFID -------------------------------- */
  const startScan = async (forceUnknown = false) => {
    setPhase("scanning");
    setRfidResult(null);
    setGross(null);
    setTare(null);
    setCapturedGross(false);
    setCapturedTare(false);
    setCv(null);
    setCvReviewed(false);
    setTxn(null);
    setAssignedLane(null);
    const r = await identifyTruck(forceUnknown ? "TRK-00000" : undefined);
    setRfidResult(r);
    if (r.state === "identified") {
      setPhase("identified");
      // auto lane assignment
      const res = await assignLane(buildLanes(4), r.truck!.registrationNumber);
      setLanes(res.lanes);
      setAssignedLane(res.lane?.name ?? null);
      pushToast({
        kind: "success",
        title: `Truck assigned to ${res.lane?.name ?? "queue"}`,
        body: `${r.truck!.registrationNumber} · ${r.truck!.farmerName}`,
      });
    } else {
      setPhase("idle");
      pushToast({
        kind: "warning",
        title: "Unrecognized vehicle",
        body: "Manual verification required before weighment.",
      });
    }
  };

  /* ----------------------------- Weighing ------------------------------ */
  const doCaptureGross = async () => {
    if (!truck || stabilizing.current) return;
    stabilizing.current = true;
    setBusy(true);
    const target = 18420;
    const g = await captureGrossWeight((kg) => setLiveKg(kg), target);
    setGross(g);
    setCapturedGross(true);
    setBusy(false);
    stabilizing.current = false;
    pushToast({ kind: "success", title: "Gross weight captured", body: `${formatKg(g)} — stable` });
  };

  const doCaptureTare = async () => {
    if (!truck || stabilizing.current) return;
    stabilizing.current = true;
    setBusy(true);
    const t = await captureTareWeight((kg) => setLiveKg(kg), 7120);
    setTare(t);
    setCapturedTare(true);
    setBusy(false);
    stabilizing.current = false;
    pushToast({ kind: "success", title: "Tare weight captured", body: `${formatKg(t)} — stable` });
  };

  const reweigh = () => {
    setCapturedGross(false);
    setCapturedTare(false);
    setGross(null);
    setTare(null);
    setLiveKg(0);
  };

  /* ------------------------------- CV ---------------------------------- */
  const doCv = async () => {
    if (!truck) return;
    setBusy(true);
    const result = await verifyProduce(truck.crop, Math.random() < 0.3);
    setCv(result);
    setBusy(false);
  };

  /* --------------------------- Confirm txn ------------------------------ */
  const confirmTxn = async () => {
    if (!truck || gross === null || tare === null || !cv || !cvReviewed) return;
    setBusy(true);
    const t: Transaction = {
      transactionId: newTxnId(),
      farmerId: truck.farmerId,
      farmerName: truck.farmerName,
      centreId: "CRC-NAG-01",
      centreName: "Nagpur Central Procurement Centre",
      truckId: truck.truckId,
      rfid: truck.rfid,
      registrationNumber: truck.registrationNumber,
      crop: truck.crop,
      grossWeightKg: gross,
      tareWeightKg: tare,
      netWeightKg: gross - tare,
      pricePerQuintal: truck.crop === "Wheat" ? 2425 : 1800,
      amount: Math.round(((gross - tare) / 100) * (truck.crop === "Wheat" ? 2425 : 1800)),
      cvVerification: {
        expected: cv.expected,
        detected: cv.detected,
        confidence: cv.confidence,
        result: cv.result,
      },
      status: cv.result === "verified" ? "completed" : "manual-review",
      timestamp: `Today, ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
      integrity: {
        farmerVerified: true,
        rfidMatched: true,
        digitalWeight: true,
        produceVerified: cv.result === "verified",
        capacityValidated: true,
        auditRecorded: true,
      },
    };
    await new Promise((r) => setTimeout(r, 700));
    setTxn(t);
    addTransaction(t);
    updateCentreCapacity("CRC-NAG-01", -(gross - tare));
    setPhase("confirmed");
    setBusy(false);
    pushToast({
      kind: cv.result === "verified" ? "success" : "warning",
      title: "Transaction recorded",
      body: `${t.transactionId} · ${formatKg(t.netWeightKg)} ${t.crop}`,
    });
    pushNotification({
      type: cv.result === "verified" ? "procurement-update" : "verification-warning",
      title: cv.result === "verified" ? "Weighment completed" : "CV mismatch flagged",
      body:
        cv.result === "verified"
          ? `${t.transactionId}: ${formatKg(t.netWeightKg)} of ${t.crop} for ${t.farmerName}.`
          : `${t.transactionId}: expected ${cv.expected}, detected ${cv.detected} (${cv.confidence}%). Manual review required.`,
      actor: "centre",
    });
  };

  const canConfirm = gross !== null && tare !== null && cv !== null && cvReviewed;

  return (
    <div>
      <PageHeader
        title="Live Weighing"
        description="RFID identification → lane assignment → digital weighment → CV verification → transaction."
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "Live Weighing" }]}
        actions={<SecuredBadge />}
      />

      {/* Phase indicator */}
      <ol className="mb-6 grid grid-cols-5 gap-1.5" aria-label="Weighing workflow">
        {[
          { key: "identified", label: "RFID", icon: Radio },
          { key: "weighing", label: "Weigh", icon: Scale },
          { key: "cv", label: "CV Check", icon: ScanBarcode },
          { key: "confirmed", label: "Confirm", icon: CheckCircle2 },
        ].map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-bold",
                phase === s.key || (s.key === "weighing" && ["weighing", "cv"].includes(phase))
                  ? "bg-primary-700 text-white"
                  : "bg-white text-ink-400 border border-ink-100",
              )}
            >
              <s.icon className="h-3.5 w-3.5" aria-hidden /> {s.label}
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* RFID + weight panel */}
        <div className="space-y-5">
          {/* RFID panel */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <h2 className="flex items-center gap-2 font-bold text-ink-900">
                <Radio className="h-5 w-5 text-primary-700" aria-hidden /> RFID Gate — Entry
              </h2>
              {phase !== "scanning" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startScan(false)} icon={<RotateCcw className="h-4 w-4" />}>
                    Simulate truck
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startScan(true)}>
                    Unknown RFID
                  </Button>
                </div>
              )}
            </div>

            <div className="relative p-5">
              {phase === "scanning" && (
                <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-primary-950">
                  <div className="absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-primary-400/60" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "conic-gradient(from 0deg, rgba(72,180,123,.4), transparent 22%)",
                      animation: "radar 1.2s linear infinite",
                    }}
                  />
                  <div className="relative z-10 text-center">
                    <Radio className="mx-auto h-8 w-8 animate-pulse text-primary-300" aria-hidden />
                    <p className="mt-2 text-sm font-bold tracking-widest text-primary-100">SCANNING RFID…</p>
                  </div>
                </div>
              )}

              {phase !== "scanning" && !rfidResult && (
                <div className="flex h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-earth-50 text-center">
                  <Truck className="h-9 w-9 text-ink-300" aria-hidden />
                  <p className="mt-2 text-sm font-semibold text-ink-500">No truck at gate</p>
                  <p className="text-xs text-ink-400">Press “Simulate truck” to start the arrival flow</p>
                </div>
              )}

              {rfidResult && rfidResult.state === "unknown" && (
                <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-alert-100 bg-alert-50 text-center animate-fade-up">
                  <XCircle className="h-9 w-9 text-alert-600" aria-hidden />
                  <p className="mt-2 text-sm font-bold text-alert-700">⚠ Unrecognized Vehicle</p>
                  <p className="text-xs text-ink-500">Manual verification required before weighment.</p>
                </div>
              )}

              {rfidResult?.state === "identified" && truck && (
                <div className="animate-fade-up rounded-2xl border border-primary-200 bg-primary-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-extrabold tracking-wide text-primary-900">
                      <CheckCircle2 className="h-5 w-5 text-primary-600" aria-hidden /> RFID DETECTED — {truck.rfid}
                    </p>
                    <StatusBadge tone="green" label="Identified" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div><p className="text-[11px] font-bold uppercase text-ink-400">Truck</p><p className="font-mono font-bold text-ink-900">{truck.registrationNumber}</p></div>
                    <div><p className="text-[11px] font-bold uppercase text-ink-400">Farmer</p><p className="font-bold text-ink-900">{truck.farmerName}</p></div>
                    <div><p className="text-[11px] font-bold uppercase text-ink-400">Produce</p><p className="font-bold text-ink-900">{truck.crop}</p></div>
                    <div><p className="text-[11px] font-bold uppercase text-ink-400">Lane</p><p className="font-bold text-primary-800">{assignedLane ?? "—"}</p></div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {rfidResult.checks?.map((c) => (
                      <li key={c.label}>
                        <StatusBadge tone={c.ok ? "green" : "amber"} label={`${c.ok ? "✓" : "…"} ${c.label}`} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Weighbridge panel */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <h2 className="flex items-center gap-2 font-bold text-ink-900">
                <Scale className="h-5 w-5 text-primary-700" aria-hidden /> Weighbridge WB-03
              </h2>
              <StatusBadge
                tone={busy ? "amber" : capturedGross || capturedTare ? "green" : "gray"}
                label={busy ? "MEASURING…" : capturedGross || capturedTare ? "STABLE" : "IDLE"}
              />
            </div>
            <div className="p-5">
              {/* Digital weight display */}
              <div className="rounded-2xl bg-primary-950 p-6 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-300">Current Weight</p>
                <AnimatePresence mode="popLayout">
                  <motion.p
                    key={liveKg}
                    initial={{ opacity: 0.35, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-5xl font-extrabold tracking-tight text-white md:text-6xl"
                  >
                    {liveKg.toLocaleString("en-IN")}
                    <span className="ml-2 text-xl font-bold text-primary-300">kg</span>
                  </motion.p>
                </AnimatePresence>
                <p className="mt-1 text-xs font-semibold text-primary-200">
                  {busy ? "Stabilising…" : capturedGross || capturedTare ? "● Stable reading" : "Awaiting truck"}
                </p>
              </div>

              {/* Weight controls */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button variant="primary" disabled={!truck || phase === "scanning"} loading={busy && !capturedGross} onClick={doCaptureGross} icon={<Weight className="h-4 w-4" />}>
                  Capture Gross
                </Button>
                <Button variant="secondary" disabled={!capturedGross || capturedTare} loading={busy && capturedGross && !capturedTare} onClick={doCaptureTare}>
                  Capture Tare
                </Button>
                <Button variant="outline" disabled={!capturedGross && !capturedTare} onClick={reweigh} icon={<RefreshCw className="h-4 w-4" />}>
                  Reweigh
                </Button>
                <Button variant="amber" disabled={!truck || !capturedGross || busy} onClick={doCv} icon={<ScanBarcode className="h-4 w-4" />}>
                  Verify Produce
                </Button>
              </div>

              {/* Gross/tare/net summary */}
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { k: "Gross", v: gross, tone: "text-ink-900" },
                  { k: "Tare", v: tare, tone: "text-ink-900" },
                  { k: "Net", v: net, tone: "text-primary-700" },
                ].map((x) => (
                  <div key={x.k} className="rounded-xl bg-earth-50 px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{x.k}</p>
                    <p className={cn("mt-0.5 font-display text-lg font-extrabold", x.tone)}>
                      {x.v === null ? "—" : `${x.v.toLocaleString("en-IN")} kg`}
                    </p>
                  </div>
                ))}
              </dl>
            </div>
          </Card>
        </div>

        {/* Right column: CV + transaction identity */}
        <div className="space-y-5">
          {/* CV verification */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <h2 className="flex items-center gap-2 font-bold text-ink-900">
                <Camera className="h-5 w-5 text-primary-700" aria-hidden /> CV Produce Verification
              </h2>
              {cv && (
                <StatusBadge tone={cv.result === "verified" ? "green" : "amber"} label={cv.result === "verified" ? "Verified" : "Mismatch"} />
              )}
            </div>
            <div className="p-5">
              {!truck && (
                <p className="rounded-xl bg-earth-50 px-4 py-6 text-center text-sm text-ink-400">
                  Identify a truck first — the camera is linked to the active lane.
                </p>
              )}
              {truck && !cv && (
                <div className="text-center">
                  <p className="text-sm text-ink-500">Expected produce: <strong className="text-ink-900">{truck.crop}</strong></p>
                  <p className="mt-2 rounded-xl bg-earth-50 px-4 py-6 text-sm text-ink-400">
                    Run “Verify Produce” after capturing weights. The CV engine samples the load through the lane camera.
                  </p>
                </div>
              )}
              {cv && (
                <div className="animate-fade-up">
                  <div className={cn("rounded-2xl border p-4", cv.result === "verified" ? "border-primary-200 bg-primary-50/60" : "border-saffron-200 bg-saffron-50")}>
                    {cv.result === "verified" ? (
                      <>
                        <p className="flex items-center gap-2 font-bold text-primary-800">
                          <CheckCircle2 className="h-5 w-5" aria-hidden /> Material Verified
                        </p>
                        <p className="mt-1 text-sm text-ink-700">
                          {cv.detected} — <strong>{cv.confidence}% confidence</strong>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center gap-2 font-bold text-saffron-600">
                          <AlertTriangle className="h-5 w-5" aria-hidden /> Material mismatch detected
                        </p>
                        <p className="mt-1 text-sm text-ink-700">
                          Expected: <strong>{cv.expected}</strong> · Detected: <strong>{cv.detected}</strong>
                          <br />Confidence: {cv.confidence}%
                        </p>
                      </>
                    )}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
                      <motion.div
                        className={cn("h-full rounded-full", cv.result === "verified" ? "bg-primary-500" : "bg-saffron-400")}
                        initial={{ width: 0 }}
                        animate={{ width: `${cv.confidence}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant={cv.result === "verified" ? "primary" : "outline"} onClick={() => setCvReviewed(true)} disabled={cvReviewed} icon={<CheckCircle2 className="h-4 w-4" />}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setCv(null)}>
                      Re-scan
                    </Button>
                    <Button size="sm" variant="ghost" icon={<Camera className="h-4 w-4" />} onClick={() => pushToast({ kind: "info", title: "Evidence captured", body: "Frame stored against the transaction audit trail (simulated)." })}>
                      Capture Evidence
                    </Button>
                    {cv.result !== "verified" && (
                      <Button size="sm" variant="danger" onClick={() => pushToast({ kind: "warning", title: "Sent to manual review", body: "Proceed at the supervisor console." })}>
                        Reject
                      </Button>
                    )}
                  </div>
                  {!cvReviewed && (
                    <p className="mt-2 text-xs font-semibold text-ink-400">
                      {cv.result === "verified"
                        ? "Accept the result to enable transaction confirmation."
                        : "Review is mandatory before a mismatched load can be accepted."}
                    </p>
                  )}
                  {cvReviewed && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary-700">
                      <ShieldCheck className="h-4 w-4" aria-hidden /> Verification reviewed & accepted
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Transaction identity */}
          <Card className="overflow-hidden">
            <div className="border-b border-ink-100 p-4">
              <h2 className="flex items-center gap-2 font-bold text-ink-900">
                <Fingerprint className="h-5 w-5 text-primary-700" aria-hidden /> Transaction Identity
              </h2>
              <p className="text-xs text-ink-400">Farmer → Truck RFID → Weighbridge → CV → Record</p>
            </div>
            <div className="p-5">
              {txn ? (
                <div className="animate-fade-up">
                  <p className="rounded-xl bg-primary-700 px-4 py-2.5 text-center font-mono text-sm font-bold tracking-wide text-white">
                    {txn.transactionId}
                  </p>
                  <ul className="mt-4 space-y-0">
                    {[
                      { icon: User, label: `Farmer ${txn.farmerId} — ${txn.farmerName}`, done: true },
                      { icon: Truck, label: `Truck ${txn.registrationNumber} · RFID ${txn.rfid}`, done: true },
                      { icon: Scale, label: `Gross ${formatKg(txn.grossWeightKg)} · Tare ${formatKg(txn.tareWeightKg)}`, done: true },
                      { icon: ScanBarcode, label: `CV: ${txn.cvVerification.detected} (${txn.cvVerification.confidence}%)`, done: txn.cvVerification.result === "verified" },
                      { icon: CheckCircle2, label: `Net ${formatKg(txn.netWeightKg)} → ₹${txn.amount.toLocaleString("en-IN")}`, done: true },
                    ].map((step, i, arr) => (
                      <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < arr.length - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-0.5 bg-primary-200" aria-hidden />}
                        <span className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", step.done ? "bg-primary-600 text-white" : "bg-saffron-400 text-ink-900")}>
                          <step.icon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <p className="pt-1 text-sm font-semibold text-ink-900">{step.label}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <SecuredBadge />
                    <StatusBadge tone="blue" label={`Lane ${assignedLane ?? "—"} · WB-03`} />
                    <StatusBadge tone="green" label="Capacity updated" />
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-earth-50 px-4 py-6 text-center text-sm text-ink-400">
                  The unified transaction (farmer + truck + weight + CV) appears here once weighing completes.
                </p>
              )}
            </div>
          </Card>

          {/* Confirm */}
          <Card className="border-primary-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink-900">Confirm Transaction</h3>
                <p className="text-xs text-ink-500">
                  {canConfirm ? "All checks complete — ready to record." : "Complete weighing, CV verification and review to enable."}
                </p>
              </div>
              <Button
                size="lg"
                disabled={!canConfirm || busy}
                loading={busy && canConfirm}
                onClick={confirmTxn}
                iconRight={<ArrowRight className="h-5 w-5" />}
              >
                Confirm Transaction
              </Button>
            </div>
            {!canConfirm && (
              <ul className="mt-3 grid gap-1 text-xs font-semibold text-ink-400 sm:grid-cols-3">
                <li>{gross !== null ? "✓" : "①"} Gross captured</li>
                <li>{tare !== null ? "✓" : "②"} Tare captured</li>
                <li>{cv && cvReviewed ? "✓" : "③"} CV reviewed</li>
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
