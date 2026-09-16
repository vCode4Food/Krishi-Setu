import { useMemo, useState } from "react";
import { Lock, Fingerprint, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { auditEvents } from "@/data/transactions";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badges";
import { cn } from "@/utils/format";

export default function AuditTrail() {
  const { transactions } = useApp();
  const [txnFilter, setTxnFilter] = useState("All");

  const txnIds = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.transactionId))),
    [transactions],
  );

  const events = useMemo(
    () => (txnFilter === "All" ? auditEvents : auditEvents.filter((e) => e.transactionId === txnFilter)),
    [txnFilter],
  );

  return (
    <div>
      <PageHeader
        title="Secure Audit Trail"
        description="Every operational event is timestamped, attributed to an actor/device and hash-referenced. Records are append-only in this simulation."
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "Audit Trail" }]}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800">
            <Lock className="h-3.5 w-3.5" aria-hidden /> Append-only log
          </span>
        }
      />

      <Card className="mb-5 p-4">
        <label className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Filter by transaction</span>
          <select
            value={txnFilter}
            onChange={(e) => setTxnFilter(e.target.value)}
            className="h-10 min-w-56 rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500"
          >
            <option>All</option>
            {txnIds.map((id) => <option key={id}>{id}</option>)}
          </select>
          <span className="text-xs font-semibold text-ink-400">{events.length} events</span>
        </label>
      </Card>

      <Card className="p-5 md:p-6">
        <ol className="relative space-y-0">
          {events.map((e, i) => (
            <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < events.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 bg-ink-100" aria-hidden />}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  e.status === "success" ? "bg-primary-100 text-primary-700" : e.status === "flagged" ? "bg-alert-100 text-alert-600" : "bg-saffron-100 text-saffron-600",
                )}
              >
                {e.status === "success" ? <CheckCircle2 className="h-4.5 w-4.5" aria-hidden /> : <AlertTriangle className="h-4.5 w-4.5" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-ink-100 bg-earth-50/60 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-sm font-extrabold text-ink-900">{e.timestamp}</span>
                  <span className="text-sm font-bold text-primary-800">{e.action}</span>
                  <StatusBadge tone={e.status === "success" ? "green" : e.status === "flagged" ? "red" : "amber"} label={e.status === "success" ? "Success" : e.status === "flagged" ? "Flagged" : "Warning"} />
                </div>
                <p className="mt-1 text-sm text-ink-700">{e.description}</p>
                <div className="mt-2.5 grid gap-x-6 gap-y-1 text-[11px] font-semibold text-ink-400 sm:grid-cols-2 lg:grid-cols-4">
                  <span className="flex items-center gap-1.5"><Fingerprint className="h-3.5 w-3.5" aria-hidden /> Actor: {e.actor}</span>
                  <span>Device: {e.device}</span>
                  {e.transactionId && <span className="font-mono">Txn: {e.transactionId}</span>}
                  <span className="font-mono text-primary-700">Hash: {e.hashRef}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-2 flex items-start gap-2.5 rounded-xl bg-primary-50 px-4 py-3 text-xs leading-relaxed text-primary-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Chain references link each entry to the previous record. In production these would be
          cryptographically verifiable; in this prototype they demonstrate the traceability UX.
        </div>
      </Card>
    </div>
  );
}
