import { useMemo, useState } from "react";
import { Printer, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Transaction } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { TxnStatusBadge, StatusBadge } from "@/components/common/Badges";
import { EmptyState } from "@/components/common/Card";
import { formatINR, formatKg } from "@/utils/format";

export default function CentreTransactions() {
  const { transactions, pushToast } = useApp();
  const [status, setStatus] = useState("All");
  const [crop, setCrop] = useState("All");
  const [detail, setDetail] = useState<Transaction | null>(null);

  const crops = useMemo(() => Array.from(new Set(transactions.map((t) => t.crop))), [transactions]);
  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) => (status === "All" || t.status === status.toLowerCase().replace(" ", "-")) && (crop === "All" || t.crop === crop),
      ),
    [transactions, status, crop],
  );

  return (
    <div>
      <PageHeader
        title="Procurement Transactions"
        description="Complete register of centre weighments with verification outcomes."
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "Transactions" }]}
        actions={
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ kind: "info", title: "Demo export", body: "Export is simulated in this prototype." })}>
            Export register
          </Button>
        }
      />

      <Card className="mb-5 flex flex-wrap gap-3 p-4">
        <label className="flex-1">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500">
            {["All", "Processing", "Verified", "Warning", "Completed", "Manual Review"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex-1">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Crop</span>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500">
            <option>All</option>
            {crops.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-earth-50 text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-bold">Txn ID</th>
                <th className="px-4 py-3 font-bold">Time</th>
                <th className="px-4 py-3 font-bold">Farmer</th>
                <th className="px-4 py-3 font-bold">Truck / RFID</th>
                <th className="px-4 py-3 font-bold">Crop</th>
                <th className="px-4 py-3 text-right font-bold">Gross</th>
                <th className="px-4 py-3 text-right font-bold">Tare</th>
                <th className="px-4 py-3 text-right font-bold">Net</th>
                <th className="px-4 py-3 text-right font-bold">Amount</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.transactionId} className="border-b border-ink-100/70 last:border-0 hover:bg-earth-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-ink-900">{t.transactionId}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-500">{t.timestamp}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{t.farmerName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">{t.registrationNumber}<br />{t.rfid}</td>
                  <td className="px-4 py-3">{t.crop}</td>
                  <td className="px-4 py-3 text-right">{t.grossWeightKg.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">{t.tareWeightKg.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-bold">{t.netWeightKg.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary-700">{formatINR(t.amount)}</td>
                  <td className="px-4 py-3"><TxnStatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setDetail(t)}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-6"><EmptyState title="No transactions match" body="Adjust the status or crop filters." /></div>}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Weighment Record" size="lg">
        {detail && (
          <div>
            <p className="rounded-xl bg-primary-700 px-4 py-2.5 text-center font-mono text-sm font-bold text-white">{detail.transactionId}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              {[
                ["Farmer", `${detail.farmerName} (${detail.farmerId})`],
                ["Centre", detail.centreName],
                ["Truck", detail.registrationNumber],
                ["RFID", detail.rfid],
                ["Gross", formatKg(detail.grossWeightKg)],
                ["Tare", formatKg(detail.tareWeightKg)],
                ["Net", formatKg(detail.netWeightKg)],
                ["Amount", formatINR(detail.amount)],
                ["CV", `${detail.cvVerification.detected} · ${detail.cvVerification.confidence}%`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-xl bg-earth-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Integrity checks</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.values(detail.integrity).every(Boolean) ? (
                  <StatusBadge tone="green" label="All 6 checks passed" />
                ) : (
                  Object.entries(detail.integrity).filter(([, v]) => !v).map(([k]) => (
                    <StatusBadge key={k} tone="red" label={`✕ ${k}`} />
                  ))
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
