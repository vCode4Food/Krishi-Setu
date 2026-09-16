import { useState } from "react";
import { Camera, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { verifyProduce } from "@/services/mockProcurement";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/Badges";
import { cn } from "@/utils/format";

export default function VerificationPage() {
  const { transactions, pushToast } = useApp();
  const flagged = transactions.filter((t) => t.status === "manual-review" || t.cvVerification.result !== "verified");
  const [checked, setChecked] = useState<Record<string, string>>({});

  const runCheck = async (txnId: string, crop: string) => {
    const r = await verifyProduce(crop, Math.random() < 0.4);
    setChecked((c) => ({ ...c, [txnId]: r.result }));
    pushToast({
      kind: r.result === "verified" ? "success" : "warning",
      title: r.result === "verified" ? "Re-verification passed" : "Mismatch persists",
      body: `${crop} — ${r.detected} at ${r.confidence}% confidence.`,
    });
  };

  return (
    <div>
      <PageHeader
        title="CV Verification Console"
        description="Computer-vision produce checks. Mismatched loads require review before settlement."
        breadcrumb={[{ label: "Centre", to: "/centre" }, { label: "CV Verification" }]}
        actions={<StatusBadge tone="green" label="● CV engine v4.2 online" />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {flagged.length === 0 && (
          <Card className="p-10 text-center lg:col-span-2">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary-600" aria-hidden />
            <h3 className="mt-3 font-bold text-ink-900">No pending verifications</h3>
            <p className="mt-1 text-sm text-ink-500">All recent loads passed the produce check.</p>
          </Card>
        )}
        {flagged.map((t) => {
          const decision = checked[t.transactionId];
          return (
            <Card key={t.transactionId} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-100 p-4">
                <div>
                  <h3 className="font-mono text-sm font-extrabold text-ink-900">{t.transactionId}</h3>
                  <p className="text-xs text-ink-500">{t.farmerName} · {t.registrationNumber}</p>
                </div>
                <StatusBadge tone={t.cvVerification.result === "verified" ? "green" : "amber"} label={t.cvVerification.result === "verified" ? "Verified" : "Mismatch"} />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-earth-100">
                    <Camera className="h-8 w-8 text-ink-400" aria-hidden />
                  </div>
                  <div className={cn("flex-1 rounded-xl p-3", t.cvVerification.result === "verified" ? "bg-primary-50" : "bg-saffron-50")}>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Expected / Detected</p>
                    <p className="mt-0.5 text-sm font-bold text-ink-900">
                      {t.cvVerification.expected} → {t.cvVerification.detected}
                    </p>
                    <p className="text-xs font-semibold text-ink-500">Confidence {t.cvVerification.confidence}%</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                      <div className={cn("h-full", t.cvVerification.result === "verified" ? "bg-primary-500" : "bg-saffron-400")} style={{ width: `${t.cvVerification.confidence}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setChecked((c) => ({ ...c, [t.transactionId]: "accepted" }))} icon={<CheckCircle2 className="h-4 w-4" />}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => runCheck(t.transactionId, t.crop)}>
                    Re-run CV check
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setChecked((c) => ({ ...c, [t.transactionId]: "evidence" }))}>
                    Capture evidence
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setChecked((c) => ({ ...c, [t.transactionId]: "rejected" }))} icon={<XCircle className="h-4 w-4" />}>
                    Reject
                  </Button>
                </div>
                {decision && (
                  <p className={cn(
                    "mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold",
                    decision === "rejected" ? "bg-alert-50 text-alert-700" : decision === "evidence" ? "bg-info-50 text-info-600" : decision === "warning" ? "bg-saffron-50 text-saffron-600" : "bg-primary-50 text-primary-800",
                  )}>
                    {decision === "rejected" ? <><XCircle className="h-4 w-4" /> Rejected — settlement blocked, audit updated</> :
                     decision === "evidence" ? <><Camera className="h-4 w-4" /> Evidence frame stored to audit trail</> :
                     decision === "warning" ? <><AlertTriangle className="h-4 w-4" /> Re-check flagged mismatch again</> :
                     <><CheckCircle2 className="h-4 w-4" /> Accepted — transaction may proceed</>}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
