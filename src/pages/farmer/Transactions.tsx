import { useMemo, useState } from "react";
import { Download, Printer, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Transaction } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/Card";
import { TxnStatusBadge, StatusBadge } from "@/components/common/Badges";
import { formatINR, formatKg } from "@/utils/format";

const cropFilters = ["All", "Wheat", "Onion", "Rice", "Tomato"];
const statusFilters = ["All", "Completed", "Verified", "Processing", "Manual Review"];

const integrityLabels: Record<keyof Transaction["integrity"], string> = {
  farmerVerified: "Farmer verified",
  rfidMatched: "RFID matched",
  digitalWeight: "Weight captured digitally",
  produceVerified: "Produce verified",
  capacityValidated: "Capacity validated",
  auditRecorded: "Audit recorded",
};

export default function Transactions() {
  const { transactions, pushToast } = useApp();
  const [crop, setCrop] = useState("All");
  const [status, setStatus] = useState("All");
  const [centre, setCentre] = useState("All");
  const [range, setRange] = useState("all");
  const [detail, setDetail] = useState<Transaction | null>(null);

  const centreOptions = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.centreName))),
    [transactions],
  );

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        if (crop !== "All" && t.crop !== crop) return false;
        if (status !== "All" && t.status.replace("-", " ") !== status.toLowerCase()) return false;
        if (centre !== "All" && t.centreName !== centre) return false;
        if (range === "7d") {
          // demo: all mock data is "today" — keep visible
          return true;
        }
        return true;
      }),
    [transactions, crop, status, centre, range],
  );

  const totals = useMemo(
    () => ({
      net: filtered.reduce((s, t) => s + t.netWeightKg, 0),
      amount: filtered.reduce((s, t) => s + t.amount, 0),
    }),
    [filtered],
  );

  return (
    <div>
      <PageHeader
        title="My Transactions"
        description="Every procurement linked to your farmer ID — weights, verification and payments."
        actions={
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ kind: "info", title: "Demo export", body: "CSV export is simulated in this prototype." })}>
            Export CSV
          </Button>
        }
      />

      {/* Filter bar */}
      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Crop</span>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500"
            >
              {cropFilters.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500"
            >
              {statusFilters.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Centre</span>
            <select
              value={centre}
              onChange={(e) => setCentre(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500"
            >
              <option>All</option>
              {centreOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-400">Date</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500"
            >
              <option value="all">All dates</option>
              <option value="7d">Last 7 days</option>
            </select>
          </label>
        </div>
      </Card>

      {/* Summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-xs font-bold uppercase text-ink-400">Transactions</p><p className="mt-1 font-display text-xl font-extrabold">{filtered.length}</p></Card>
        <Card className="p-4"><p className="text-xs font-bold uppercase text-ink-400">Net weight</p><p className="mt-1 font-display text-xl font-extrabold">{formatKg(totals.net)}</p></Card>
        <Card className="p-4"><p className="text-xs font-bold uppercase text-ink-400">Total earned</p><p className="mt-1 font-display text-xl font-extrabold text-primary-700">{formatINR(totals.amount)}</p></Card>
        <Card className="p-4"><p className="text-xs font-bold uppercase text-ink-400">Avg price</p><p className="mt-1 font-display text-xl font-extrabold">₹{filtered.length ? Math.round(filtered.reduce((s, t) => s + t.pricePerQuintal, 0) / filtered.length).toLocaleString("en-IN") : 0}/q</p></Card>
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-earth-50 text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-bold">Transaction</th>
                <th className="px-4 py-3 font-bold">Centre</th>
                <th className="px-4 py-3 font-bold">Crop</th>
                <th className="px-4 py-3 text-right font-bold">Net weight</th>
                <th className="px-4 py-3 text-right font-bold">Amount</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.transactionId} className="border-b border-ink-100/70 last:border-0 hover:bg-earth-50/60">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-bold text-ink-900">{t.transactionId}</p>
                    <p className="text-xs text-ink-400">{t.timestamp}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{t.centreName}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{t.crop}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-900">{formatKg(t.netWeightKg)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary-700">{formatINR(t.amount)}</td>
                  <td className="px-4 py-3"><TxnStatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setDetail(t)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-6"><EmptyState title="No transactions found" body="Adjust the filters to see more of your procurement history." /></div>}
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((t) => (
          <button key={t.transactionId} onClick={() => setDetail(t)} className="w-full">
            <Card className="p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-ink-900">{t.transactionId}</p>
                  <p className="mt-0.5 text-sm font-bold text-ink-900">{formatINR(t.amount)}</p>
                  <p className="text-xs text-ink-500">{t.crop} · {formatKg(t.netWeightKg)}</p>
                </div>
                <TxnStatusBadge status={t.status} />
              </div>
              <p className="mt-2 text-xs text-ink-400">{t.centreName} · {t.timestamp}</p>
            </Card>
          </button>
        ))}
        {filtered.length === 0 && <EmptyState title="No transactions found" body="Adjust the filters to see more of your procurement history." />}
      </div>

      {/* Detail / receipt modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Transaction Details" size="lg">
        {detail && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-primary-700 px-4 py-3 text-white">
              <div>
                <p className="text-xs font-semibold text-primary-200">Transaction ID</p>
                <p className="font-mono text-lg font-bold">{detail.transactionId}</p>
              </div>
              <TxnStatusBadge status={detail.status} className="!border-white/20 !bg-white/10 !text-white" />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              {[
                ["Farmer", `${detail.farmerName} (${detail.farmerId})`],
                ["Centre", detail.centreName],
                ["Truck", detail.registrationNumber],
                ["RFID", detail.rfid],
                ["Crop", detail.crop],
                ["Timestamp", detail.timestamp],
                ["Gross weight", formatKg(detail.grossWeightKg)],
                ["Tare weight", formatKg(detail.tareWeightKg)],
                ["Net weight", formatKg(detail.netWeightKg)],
                ["Rate", `₹${detail.pricePerQuintal}/quintal`],
                ["Amount credited", formatINR(detail.amount)],
                ["CV verification", `${detail.cvVerification.detected} · ${detail.cvVerification.confidence}%`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-primary-800">
                <ShieldCheck className="h-4.5 w-4.5" aria-hidden /> Transaction Integrity
              </p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {(Object.keys(detail.integrity) as Array<keyof Transaction["integrity"]>).map((k) => (
                  <li key={k} className="flex items-center gap-2 text-xs font-semibold">
                    <StatusBadge
                      tone={detail.integrity[k] ? "green" : "red"}
                      label={`${detail.integrity[k] ? "✓" : "✕"} ${integrityLabels[k]}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print receipt</Button>
          <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => pushToast({ kind: "info", title: "Demo download", body: "Receipt download is simulated in this prototype." })}>
            Download PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
}
