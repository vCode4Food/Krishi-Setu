import type { ReactNode } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CircleDot,
  Loader,
  Lock,
  Wrench,
} from "lucide-react";
import { cn } from "@/utils/format";
import type { CentreStatus, TransactionStatus } from "@/types";

type Tone = "green" | "amber" | "red" | "gray" | "blue";

const toneStyles: Record<Tone, string> = {
  green: "bg-primary-100 text-primary-800 border-primary-200",
  amber: "bg-saffron-100 text-saffron-600 border-saffron-200",
  red: "bg-alert-50 text-alert-600 border-alert-100",
  gray: "bg-earth-100 text-ink-500 border-earth-200",
  blue: "bg-info-50 text-info-600 border-info-500/20",
};

const toneDot: Record<Tone, ReactNode> = {
  green: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
  amber: <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
  red: <XCircle className="h-3.5 w-3.5" aria-hidden />,
  gray: <CircleDot className="h-3.5 w-3.5" aria-hidden />,
  blue: <Clock className="h-3.5 w-3.5" aria-hidden />,
};

export function StatusBadge({
  tone,
  label,
  className,
  icon,
}: {
  tone: Tone;
  label: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
    >
      {icon ?? toneDot[tone]}
      {label}
    </span>
  );
}

export function Chip({
  children,
  active = false,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
        active
          ? "border-primary-700 bg-primary-700 text-white"
          : "border-ink-200 bg-white text-ink-700 hover:border-primary-400 hover:text-primary-700",
        className,
      )}
    >
      {children}
    </button>
  );
}

const centreStatusMap: Record<CentreStatus, { tone: Tone; label: string }> = {
  available: { tone: "green", label: "● Available" },
  busy: { tone: "amber", label: "● Busy" },
  full: { tone: "red", label: "● Full" },
  closed: { tone: "gray", label: "● Temporarily Closed" },
};

export const CentreStatusBadge = ({ status }: { status: CentreStatus }) => {
  const s = centreStatusMap[status];
  return <StatusBadge tone={s.tone} label={s.label} />;
};

const txnStatusMap: Record<TransactionStatus, { tone: Tone; label: string }> = {
  processing: { tone: "blue", label: "Processing" },
  verified: { tone: "green", label: "Verified" },
  warning: { tone: "amber", label: "Warning" },
  completed: { tone: "green", label: "Completed" },
  "manual-review": { tone: "red", label: "Manual Review" },
};

export const TxnStatusBadge = ({ status, className }: { status: TransactionStatus; className?: string }) => {
  const s = txnStatusMap[status];
  return <StatusBadge tone={s.tone} label={s.label} className={className} />;
};

const laneStateMap = {
  available: { tone: "green" as Tone, label: "Available", icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> },
  weighing: { tone: "amber" as Tone, label: "Weighing", icon: <Loader className="h-3.5 w-3.5 animate-spin" aria-hidden /> },
  loading: { tone: "blue" as Tone, label: "Loading", icon: <Clock className="h-3.5 w-3.5" aria-hidden /> },
  maintenance: { tone: "gray" as Tone, label: "Maintenance", icon: <Wrench className="h-3.5 w-3.5" aria-hidden /> },
};

export const LaneStateBadge = ({
  state,
}: {
  state: "available" | "weighing" | "loading" | "maintenance";
}) => {
  const m = laneStateMap[state];
  return <StatusBadge tone={m.tone} label={m.label} icon={m.icon} />;
};

export const SecuredBadge = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
    <Lock className="h-3.5 w-3.5" aria-hidden />
    Audit-logged
  </span>
);
