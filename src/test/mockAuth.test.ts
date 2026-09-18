import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  demoUsers, findUserByMobile, getPermissions, homeRouteFor, roleAllowsRoute,
  loginWithMobile, sendOTP, verifyOTP, persistSession, clearSession,
  getCurrentUser, getCurrentSession, isAuthenticated, SESSION_TTL_MS,
} from "@/services/mockAuth";
import type { Role } from "@/services/mockAuth";

const farmer = demoUsers[0];

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("demo user database integrity", () => {
  it("has exactly the six SIH26032 demo accounts", () => {
    expect(demoUsers).toHaveLength(6);
    expect(demoUsers.map((u) => u.mobile)).toEqual([
      "9876543210", "9876543211", "9876543212", "9876543213", "9876543214", "9876543215",
    ]);
  });

  it("has unique ids with permissions derived from the role", () => {
    expect(new Set(demoUsers.map((u) => u.id)).size).toBe(6);
    for (const u of demoUsers) {
      expect(u.permissions).toEqual(getPermissions(u.role));
      expect(u.permissions.length).toBeGreaterThan(0);
    }
  });

  it("gives the state admin system-wide powers the farmer lacks", () => {
    const sa = demoUsers.find((u) => u.role === "state_admin")!;
    expect(sa.permissions).toContain("view_fraud_alerts");
    expect(sa.permissions).toContain("system_overview");
    expect(farmer.permissions).not.toContain("capture_weight");
  });

  it("findUserByMobile tolerates formatting (spaces, +91, dashes)", () => {
    expect(findUserByMobile("9876543210")?.id).toBe(farmer.id);
    expect(findUserByMobile("+91 98765 43210")?.id).toBe(farmer.id);
    expect(findUserByMobile("98765-43210")?.id).toBe(farmer.id);
    expect(findUserByMobile("9999999999")).toBeUndefined();
  });

  it("homeRouteFor covers every role with a role-specific route", () => {
    const expected: Record<Role, string> = {
      farmer: "/farmer",
      truck_driver: "/driver",
      procurement_officer: "/officer",
      centre_manager: "/centre-manager",
      district_admin: "/admin/district",
      state_admin: "/admin/state",
      citizen: "/unauthorized",
    };
    (Object.keys(expected) as Role[]).forEach((role) => {
      expect(homeRouteFor(role)).toBe(expected[role]);
    });
  });

  it("roleAllowsRoute isolates role route-families", () => {
    expect(roleAllowsRoute("farmer", "/farmer")).toBe(true);
    expect(roleAllowsRoute("farmer", "/farmer/schemes")).toBe(true);
    expect(roleAllowsRoute("farmer", "/officer")).toBe(false);
    expect(roleAllowsRoute("procurement_officer", "/farmer")).toBe(false);
    expect(roleAllowsRoute("district_admin", "/admin/district")).toBe(true);
    expect(roleAllowsRoute("state_admin", "/admin/state")).toBe(true);
    expect(roleAllowsRoute("farmer", "/")).toBe(false); // unknown family denied
  });
});

describe("login + OTP lifecycle", () => {
  it("loginWithMobile rejects unregistered numbers with a localized reasonKey", async () => {
    const res = await loginWithMobile("9000000000");
    expect(res.success).toBe(false);
    expect(res.reasonKey).toBe("errNotRegistered");
    expect(res.user).toBeUndefined();
  });

  it("loginWithMobile accepts a registered number and requires OTP", async () => {
    const res = await loginWithMobile("+91 98765 43210");
    expect(res.success).toBe(true);
    expect(res.user?.id).toBe(farmer.id);
    expect(res.otpRequired).toBe(true);
  });

  it("issues a fresh 6-digit code on every send (demo rule: new OTP per login)", async () => {
    const a = await sendOTP(farmer.mobile);
    const b = await sendOTP(farmer.mobile);
    expect(a.sent).toBe(true);
    expect(a.demoOtp).toMatch(/^\d{6}$/);
    expect(b.demoOtp).toMatch(/^\d{6}$/);
    expect(b.demoOtp).not.toBe(a.demoOtp); // 1/900000 chance if not rotating
  });

  it("verifies the correct OTP, returns a session, and makes the OTP single-use", async () => {
    const { demoOtp } = await sendOTP(farmer.mobile);
    const ok = await verifyOTP(farmer.mobile, demoOtp);
    expect(ok.success).toBe(true);
    expect(ok.user?.id).toBe(farmer.id);
    expect(ok.session?.expiresAt).toBeGreaterThan(Date.now());

    const reused = await verifyOTP(farmer.mobile, demoOtp);
    expect(reused.success).toBe(false);
    expect(reused.reasonKey).toBe("no_otp"); // code was consumed
  });

  it("rejects a wrong code without consuming the valid one", async () => {
    const { demoOtp } = await sendOTP(farmer.mobile);
    const bad = await verifyOTP(farmer.mobile, "000000");
    expect(bad.success).toBe(false);
    expect(bad.reasonKey).toBe("wrong");

    const ok = await verifyOTP(farmer.mobile, demoOtp);
    expect(ok.success).toBe(true);
  });

  it("rejects verification when no OTP was ever sent", async () => {
    const res = await verifyOTP(farmer.mobile, "123456");
    expect(res.success).toBe(false);
    expect(res.reasonKey).toBe("no_otp");
  });

  it("expires OTPs after their TTL", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { demoOtp } = await sendOTP(farmer.mobile);
    vi.setSystemTime(Date.now() + 6 * 60 * 1000); // past the 5-minute TTL
    const res = await verifyOTP(farmer.mobile, demoOtp);
    expect(res.success).toBe(false);
    expect(res.reasonKey).toBe("expired");
  });
});

describe("session persistence & expiry", () => {
  const login = async () => {
    const { demoOtp } = await sendOTP(farmer.mobile);
    const res = await verifyOTP(farmer.mobile, demoOtp);
    persistSession(res.user!, res.session!);
    return res;
  };

  it("persists and restores the session across reloads", async () => {
    await login();
    expect(getCurrentUser()?.id).toBe(farmer.id);
    expect(getCurrentSession()?.userId).toBe(farmer.id);
    expect(isAuthenticated()).toBe(true);
  });

  it("expires the session after the 30-minute demo TTL and self-cleans storage", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await login();
    expect(getCurrentUser()?.id).toBe(farmer.id);

    vi.setSystemTime(Date.now() + SESSION_TTL_MS + 1000);
    expect(getCurrentUser()).toBeNull();
    expect(getCurrentSession()).toBeNull();
    expect(isAuthenticated()).toBe(false);
    expect(localStorage.getItem("krushisetu_session")).toBeNull();
  });

  it("treats corrupted session storage as logged out", () => {
    localStorage.setItem("krushisetu_session", "{not-json");
    expect(getCurrentUser()).toBeNull();
    expect(getCurrentSession()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("treats structurally-broken session payloads as logged out", () => {
    localStorage.setItem("krushisetu_session", JSON.stringify({ nonsense: true }));
    expect(getCurrentUser()).toBeNull();
  });

  it("clearSession removes the persisted session", async () => {
    await login();
    clearSession();
    expect(getCurrentUser()).toBeNull();
    expect(localStorage.getItem("krushisetu_session")).toBeNull();
  });
});
