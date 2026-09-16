import type {
  ProcurementCentre,
  SlotBooking,
  Transaction,
  WaitingPrediction,
  AuditEvent,
  ChatMessage,
} from "@/types";
import { centres, getCentreById } from "@/data/centres";
import { detectIntent } from "@/data/nlsearch";
import { chatIntents, fallbackReply } from "@/data/chatbot";
import { delay, pick } from "./delay";

let slotCounter = 483;
let txnCounter = 8422;

export const newSlotId = () => `KS-PROC-2026-00${++slotCounter}`;
export const newTxnId = () => `KS-TXN-2026-00${++txnCounter}`;
export const newHashRef = () =>
  `0x${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

/* ----------------------------- Booking ------------------------------ */

export const bookProcurementSlot = async (
  booking: Omit<SlotBooking, "slotId" | "status" | "qrRef" | "createdAt">,
): Promise<SlotBooking> => {
  await delay(1100);
  return {
    ...booking,
    slotId: newSlotId(),
    status: "confirmed",
    qrRef: `KSQ-${booking.centreId}-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
};

/* --------------------- Waiting-time prediction ---------------------- */

export const getWaitingTime = async (
  centre: ProcurementCentre,
  trucksAhead = centre.queue,
): Promise<WaitingPrediction> => {
  await delay(450);
  const activeLanes = Math.max(1, centre.lanes - 1);
  const base = (trucksAhead / activeLanes) * centre.avgWeighingMinutes;
  const minutes = Math.max(4, Math.round(base + pick([0, 2, 4, 6])));
  const confidence = Math.min(97, Math.max(78, 94 - Math.round(trucksAhead / 2) + pick([0, 1, 2])));

  return {
    minutes,
    confidence,
    trucksAhead,
    activeLanes,
    avgWeighingMinutes: centre.avgWeighingMinutes,
    factors: [
      `${trucksAhead} truck${trucksAhead === 1 ? "" : "s"} ahead in queue`,
      `${activeLanes} of ${centre.lanes} lanes active`,
      `${centre.avgWeighingMinutes} min average weighment`,
      `Processing speed: ${centre.status === "available" ? "normal" : "slightly delayed"}`,
    ],
  };
};

/* ------------------------- CV verification -------------------------- */

export interface CvResult {
  expected: string;
  detected: string;
  confidence: number;
  result: "verified" | "warning" | "rejected";
}

export const verifyProduce = async (expected: string, forceMismatch = false): Promise<CvResult> => {
  await delay(1600);
  const mismatch = forceMismatch || Math.random() < 0.22;
  if (!mismatch) {
    return {
      expected,
      detected: expected,
      confidence: 93 + Math.floor(Math.random() * 6),
      result: "verified",
    };
  }
  const mixed = ["Mixed Grain", "Foreign Matter", "Undried Produce"];
  return {
    expected,
    detected: pick(mixed),
    confidence: 76 + Math.floor(Math.random() * 10),
    result: "warning",
  };
};

/* ------------------------- Lane assignment -------------------------- */

export interface Lane {
  id: string;
  name: string;
  state: "available" | "weighing" | "loading" | "maintenance";
  truck?: string;
  operation?: string;
}

export const buildLanes = (count: number): Lane[] =>
  Array.from({ length: count }, (_, i) => {
    if (i === count - 1) return { id: `LANE-0${i + 1}`, name: `LANE 0${i + 1}`, state: "maintenance" as const };
    if (i === 0)
      return {
        id: `LANE-0${i + 1}`,
        name: `LANE 0${i + 1}`,
        state: "weighing" as const,
        truck: "MH-12-AB-4521",
        operation: "Weighing — KS-TXN-2026-008421",
      };
    if (i === 1)
      return {
        id: `LANE-0${i + 1}`,
        name: `LANE 0${i + 1}`,
        state: "loading" as const,
        truck: "MH-14-CD-8241",
        operation: "Loading",
      };
    return { id: `LANE-0${i + 1}`, name: `LANE 0${i + 1}`, state: "available" as const };
  });

/** Automatically assign a truck to the best available lane. */
export const assignLane = async (
  lanes: Lane[],
  truckReg: string,
  operation = "Weighing",
): Promise<{ lane: Lane | null; lanes: Lane[] }> => {
  await delay(900);
  const target = lanes.find((l) => l.state === "available");
  if (!target) return { lane: null, lanes };
  const updated = lanes.map((l) =>
    l.id === target.id ? { ...l, state: "weighing" as const, truck: truckReg, operation } : l,
  );
  return { lane: { ...target, truck: truckReg, operation }, lanes: updated };
};

/* ----------------------------- Chat / NL ---------------------------- */

export const sendChatMessage = async (
  text: string,
  language: string,
): Promise<ChatMessage & { actions?: { label: string; to: string }[] }> => {
  await delay(900 + Math.random() * 700);
  const q = text.toLowerCase();
  const intent = chatIntents.find((i) => i.keywords.some((k) => q.includes(k)));
  const reply = intent
    ? (intent.replies[language] ?? intent.replies.en ?? "")
    : (fallbackReply[language] ?? fallbackReply.en);
  return {
    id: `msg-${Date.now()}`,
    role: "ai",
    text: reply,
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    language,
    actions: intent?.actions ?? [],
  };
};

export const searchNaturalLanguage = async (query: string) => {
  await delay(800);
  return detectIntent(query);
};

/* ------------------------------ Audit ------------------------------- */

export const auditForTransaction = (
  txn: Transaction,
  baseEvents: AuditEvent[],
): AuditEvent[] =>
  baseEvents.filter((e) => !txn || e.transactionId === txn.transactionId);

export const getNearbyCentres = async () => {
  await delay(500);
  return centres;
};

export const getCentreAvailability = async (centreId: string) => {
  await delay(350);
  return getCentreById(centreId);
};
