import { delay } from "./delay";

/** Roles defined by SIH26032 stakeholder model. */
export type Role =
  | "farmer"
  | "truck_driver"
  | "procurement_officer"
  | "centre_manager"
  | "district_admin"
  | "state_admin"
  | "citizen";

export interface DemoUser {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  roleLabel: string;
  farmerId?: string;
  employeeId?: string;
  centreId?: string;
  district?: string;
  state?: string;
  avatar: string;
  truckReg?: string;
  rfid?: string;
  permissions: string[];
}

/** Central permission map per SIH26032 RBAC spec. */
const PERMISSIONS: Record<Role, string[]> = {
  farmer: [
    "view_own_profile", "analyze_crop", "view_centres", "book_slot",
    "view_own_bookings", "view_own_transactions", "view_schemes", "view_news",
    "chat_ai", "consult_expert",
  ],
  truck_driver: [
    "view_assigned_trips", "view_assigned_booking", "view_vehicle", "view_rfid",
    "view_lane_assignment", "update_trip_status", "view_navigation", "chat_ai",
  ],
  procurement_officer: [
    "view_centre_operations", "manage_queue", "identify_truck", "verify_farmer",
    "capture_weight", "perform_cv_verification", "create_transaction",
    "view_transactions", "view_audit", "chat_ai",
  ],
  centre_manager: [
    "view_centre_operations", "manage_queue", "identify_truck", "verify_farmer",
    "capture_weight", "perform_cv_verification", "create_transaction",
    "view_transactions", "view_audit", "view_capacity", "manage_lanes",
    "manage_slots", "monitor_staff", "view_centre_analytics", "chat_ai",
  ],
  district_admin: [
    "view_district_centres", "view_district_analytics", "monitor_procurement",
    "monitor_capacity", "monitor_queues", "view_audit", "view_reports", "chat_ai",
  ],
  state_admin: [
    "view_state_analytics", "view_all_centres", "monitor_districts",
    "monitor_procurement", "view_fraud_alerts", "view_audit", "view_reports",
    "system_overview", "chat_ai",
  ],
  citizen: ["view_news", "chat_ai"],
};

const u = (
  partial: Omit<DemoUser, "permissions" | "roleLabel"> & { role: Role; roleLabel: string },
): DemoUser => {
  const { role, ...rest } = partial;
  return { ...rest, role, roleLabel: rest.roleLabel, permissions: PERMISSIONS[role] };
};

export const demoUsers: DemoUser[] = [
  u({
    id: "USR-10482",
    name: "Ramesh Patil",
    mobile: "9876543210",
    role: "farmer",
    roleLabel: "Farmer",
    farmerId: "FRM-10482",
    district: "Nagpur",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  }),
  u({
    id: "USR-2041",
    name: "Suresh Jadhav",
    mobile: "9876543211",
    role: "truck_driver",
    roleLabel: "Truck Driver",
    employeeId: "DRV-2041",
    truckReg: "MH-12-AB-4521",
    rfid: "TRK-98312",
    district: "Nagpur",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  }),
  u({
    id: "USR-20102",
    name: "Amit Deshmukh",
    mobile: "9876543212",
    role: "procurement_officer",
    roleLabel: "Procurement Officer",
    employeeId: "PO-102",
    centreId: "CRC-NAG-01",
    district: "Nagpur",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  }),
  u({
    id: "USR-30041",
    name: "Priya Kulkarni",
    mobile: "9876543213",
    role: "centre_manager",
    roleLabel: "Centre Manager",
    employeeId: "CM-041",
    centreId: "CRC-NAG-01",
    district: "Nagpur",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  }),
  u({
    id: "USR-40018",
    name: "Vivek Sharma",
    mobile: "9876543214",
    role: "district_admin",
    roleLabel: "District Administrator",
    employeeId: "ADM-D-018",
    district: "Nagpur",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  }),
  u({
    id: "USR-50007",
    name: "Anjali Mehta",
    mobile: "9876543215",
    role: "state_admin",
    roleLabel: "State Administrator",
    employeeId: "ADM-S-007",
    state: "Maharashtra",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  }),
];

/**
 * Match a mobile number against the demo directory.
 * Tolerates paste-with-country-code ("+91 98765 43210" → 12 digits starting
 * with 91) as well as spaces/dashes; bare 10-digit input is the primary path.
 */
export const findUserByMobile = (mobile: string): DemoUser | undefined => {
  const digits = mobile.replace(/\D/g, "");
  const normalized = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return demoUsers.find((usr) => usr.mobile === normalized);
};

export const getPermissions = (role: Role): string[] => PERMISSIONS[role] ?? [];

export const homeRouteFor = (role: Role): string =>
  ({
    farmer: "/farmer",
    truck_driver: "/driver",
    procurement_officer: "/officer",
    centre_manager: "/centre-manager",
    district_admin: "/admin/district",
    state_admin: "/admin/state",
    citizen: "/unauthorized",
  })[role];

/** Role allowed to visit a route family, e.g. "/centre" -> centre family. */
export const roleAllowsRoute = (role: Role, pathname: string): boolean => {
  const family = `/${pathname.split("/")[1]}`;
  const allowed: Record<string, Role[]> = {
    "/farmer": ["farmer"],
    "/driver": ["truck_driver"],
    "/officer": ["procurement_officer"],
    "/centre-manager": ["centre_manager"],
    "/admin": ["district_admin", "state_admin"],
  };
  return (allowed[family] ?? []).includes(role);
};

/* --------------------------- Mock auth service -------------------------- */

const OTP_TTL_MS = 5 * 60 * 1000;

interface OtpEntry { code: string; expiresAt: number }
const otpStore = new Map<string, OtpEntry>();
export const SESSION_TTL_MS = 30 * 60 * 1000; // demo session expiry

export interface Session {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

export const loginWithMobile = async (mobile: string) => {
  await delay(800);
  const user = findUserByMobile(mobile);
  if (!user) {
    return { success: false as const, reason: "This number is not registered on the KrushiSetu demo network.", reasonKey: "errNotRegistered" as const, user: undefined };
  }
  return { success: true as const, user, otpRequired: true as const };
};

export const sendOTP = async (mobile: string) => {
  await delay(700);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(mobile.replace(/\D/g, ""), { code, expiresAt: Date.now() + OTP_TTL_MS });
  return { sent: true as const, demoOtp: code, expiresInSec: OTP_TTL_MS / 1000 };
};

export const verifyOTP = async (
  mobile: string,
  code: string,
): Promise<{ success: boolean; user?: DemoUser; session?: Session; reason?: string; reasonKey?: "no_otp" | "expired" | "wrong" | "not_registered" }> => {
  await delay(650);
  const key = mobile.replace(/\D/g, "");
  const entry = otpStore.get(key);
  if (!entry) return { success: false, reason: "No OTP was sent to this number. Request a new code.", reasonKey: "no_otp" as const };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return { success: false, reason: "OTP expired. Request a new code.", reasonKey: "expired" as const };
  }
  if (entry.code !== code) {
    return { success: false, reason: "Incorrect OTP. Please check the latest code and retry.", reasonKey: "wrong" as const };
  }
  otpStore.delete(key);
  const user = findUserByMobile(mobile);
  if (!user) return { success: false, reason: "This number is not registered.", reasonKey: "not_registered" as const };
  const issuedAt = Date.now();
  return { success: true, user, session: { userId: user.id, issuedAt, expiresAt: issuedAt + SESSION_TTL_MS } };
};

export const getCurrentUser = (): DemoUser | null => {
  try {
    const raw = localStorage.getItem("krushisetu_session");
    if (!raw) return null;
    const { user, session } = JSON.parse(raw) as { user: DemoUser; session: Session };
    if (!user?.id || !session?.expiresAt) return null;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("krushisetu_session");
      return null;
    }
    return user;
  } catch {
    return null;
  }
};

export const getCurrentSession = (): Session | null => {
  try {
    const raw = localStorage.getItem("krushisetu_session");
    if (!raw) return null;
    const { session } = JSON.parse(raw) as { session: Session };
    if (!session?.expiresAt || Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
};

export const persistSession = (user: DemoUser, session: Session) =>
  localStorage.setItem("krushisetu_session", JSON.stringify({ user, session }));

export const clearSession = () => localStorage.removeItem("krushisetu_session");

export const isAuthenticated = () => getCurrentUser() !== null;
