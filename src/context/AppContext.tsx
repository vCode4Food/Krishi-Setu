import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CropAnalysis,
  Farmer,
  Notification,
  ProcurementCentre,
  SlotBooking,
  Transaction,
  UserMode,
} from "@/types";
import { demoFarmer } from "@/data/farmers";
import { centres as seedCentres } from "@/data/centres";
import { transactions as seedTransactions } from "@/data/transactions";
import { notifications as seedNotifications } from "@/data/notifications";

export interface Toast {
  id: number;
  kind: "success" | "error" | "info" | "warning";
  title: string;
  body?: string;
}

interface AppContextValue {
  mode: UserMode;
  setMode: (m: UserMode) => void;
  farmer: Farmer;
  centres: ProcurementCentre[];
  updateCentreCapacity: (centreId: string, deltaKg: number) => void;
  bookings: SlotBooking[];
  addBooking: (b: SlotBooking) => void;
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  lastAnalysis: CropAnalysis | null;
  setLastAnalysis: (a: CropAnalysis | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let toastSeq = 1;
let notifSeq = 100;

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<UserMode>("farmer");
  const [farmer] = useState<Farmer>(demoFarmer);
  const [centres, setCentres] = useState<ProcurementCentre[]>(seedCentres);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<CropAnalysis | null>(null);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = toastSeq++;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => dismissToast(id), 5200);
    },
    [dismissToast],
  );

  const pushNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      setNotifications((prev) => [
        {
          ...n,
          id: `NTF-${++notifSeq}`,
          timestamp: "Just now",
          read: false,
        },
        ...prev,
      ]);
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateCentreCapacity = useCallback((centreId: string, deltaKg: number) => {
    setCentres((prev) =>
      prev.map((c) =>
        c.centreId === centreId
          ? {
              ...c,
              remainingCapacityKg: Math.max(0, Math.min(c.capacityKg, c.remainingCapacityKg + deltaKg)),
            }
          : c,
      ),
    );
  }, []);

  const addBooking = useCallback((b: SlotBooking) => {
    setBookings((prev) => [b, ...prev]);
  }, []);

  const addTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => [t, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      farmer,
      centres,
      updateCentreCapacity,
      bookings,
      addBooking,
      transactions,
      addTransaction,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      toasts,
      pushToast,
      dismissToast,
      chatOpen,
      setChatOpen,
      lastAnalysis,
      setLastAnalysis,
    }),
    [
      mode,
      farmer,
      centres,
      updateCentreCapacity,
      bookings,
      addBooking,
      transactions,
      addTransaction,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      pushNotification,
      toasts,
      pushToast,
      dismissToast,
      chatOpen,
      lastAnalysis,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
