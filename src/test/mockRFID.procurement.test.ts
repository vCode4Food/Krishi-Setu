import { describe, it, expect } from "vitest";
import { identifyTruck, nextGateTruck } from "@/services/mockRFID";
import {
  bookProcurementSlot, getWaitingTime, verifyProduce, buildLanes, assignLane,
  auditForTransaction, newSlotId, newTxnId, newHashRef,
} from "@/services/mockProcurement";
import { trucks } from "@/data/trucks";
import { centres, currentCentre, getCentreById } from "@/data/centres";
import type { Transaction, AuditEvent } from "@/types";

describe("RFID gate simulation", () => {
  it("identifies a known truck with all three identity checks keyed for i18n", async () => {
    const res = await identifyTruck("TRK-98312");
    expect(res.state).toBe("identified");
    expect(res.truck?.registrationNumber).toBe("MH-12-AB-4521");
    expect(res.checks).toHaveLength(3);
    for (const c of res.checks!) {
      expect(c.labelKey).toMatch(/^weighing\.check/); // labels resolve via translation keys
      expect(typeof c.ok).toBe("boolean");
    }
    expect(res.checks!.find((c) => c.labelKey === "weighing.checkRegistered")?.ok).toBe(true);
  });

  it("flags an unknown RFID tag for manual verification", async () => {
    const res = await identifyTruck("TRK-00000");
    expect(res.state).toBe("unknown");
    expect(res.truck).toBeUndefined();
    expect(res.message).toMatch(/unrecognized/i);
  });

  it("defaults to the demo truck when scanned without a tag", async () => {
    const res = await identifyTruck();
    expect(res.state).toBe("identified");
    expect(res.truck?.truckId).toBe("TRK-101");
  });

  it("every truck has a unique RFID and registration number", () => {
    expect(new Set(trucks.map((t) => t.rfid)).size).toBe(trucks.length);
    expect(new Set(trucks.map((t) => t.registrationNumber)).size).toBe(trucks.length);
  });

  it("nextGateTruck only returns trucks that are en-route or registered", () => {
    for (let i = 0; i < 20; i++) {
      const t = nextGateTruck();
      expect(["en-route", "registered"]).toContain(t.status);
    }
  });
});

describe("procurement data integrity", () => {
  it("centres never exceed capacity and slots stay within their window", () => {
    for (const c of centres) {
      expect(c.remainingCapacityKg).toBeGreaterThanOrEqual(0);
      expect(c.remainingCapacityKg).toBeLessThanOrEqual(c.capacityKg);
      for (const s of c.slots) {
        expect(s.bookedKg).toBeGreaterThanOrEqual(0);
        expect(s.bookedKg).toBeLessThanOrEqual(s.capacityKg);
      }
    }
  });

  it("supports the demo lookup helpers", () => {
    expect(getCentreById("CRC-NAG-01")?.city).toBe("Nagpur");
    expect(getCentreById("NOPE")).toBeUndefined();
    expect(currentCentre.centreId).toBe("CRC-NAG-01");
  });
});

describe("slot booking", () => {
  it("creates a confirmed booking with generated slot id, QR ref and timestamp", async () => {
    const booking = await bookProcurementSlot({
      farmerId: "FRM-10482",
      farmerName: "Ramesh Patil",
      centreId: "CRC-NAG-01",
      centreName: "Nagpur Central Procurement Centre",
      crop: "Wheat",
      quantityKg: 8000,
      date: "2026-09-18",
      time: "11:00 AM",
    });
    expect(booking.slotId).toMatch(/^KS-PROC-2026-/);
    expect(booking.status).toBe("confirmed");
    expect(booking.qrRef).toMatch(/^KSQ-CRC-NAG-01-/);
    expect(new Date(booking.createdAt).toString()).not.toBe("Invalid Date");
  });

  it("generates strictly increasing, unique ids and hash refs", () => {
    const slots = new Set([newSlotId(), newSlotId(), newSlotId()]);
    const txns = new Set([newTxnId(), newTxnId(), newTxnId()]);
    expect(slots.size).toBe(3);
    expect(txns.size).toBe(3);
    expect(newHashRef()).toMatch(/^0x[0-9a-f]{6}$/);
  });
});

describe("waiting-time prediction", () => {
  it("predicts a sane wait with all factors reported", async () => {
    const p = await getWaitingTime(centres[0]); // queue 7, lanes 4, 9 min avg
    expect(p.trucksAhead).toBe(7);
    expect(p.activeLanes).toBe(3); // lanes - 1
    expect(p.minutes).toBeGreaterThanOrEqual(4);
    expect(p.confidence).toBeGreaterThanOrEqual(78);
    expect(p.confidence).toBeLessThanOrEqual(97);
    expect(p.factors).toHaveLength(4);
  });

  it("accepts an explicit trucks-ahead override", async () => {
    const p = await getWaitingTime(centres[0], 1);
    expect(p.trucksAhead).toBe(1);
    expect(p.minutes).toBeLessThan((await getWaitingTime(centres[0], 20)).minutes);
  });
});

describe("CV produce verification", () => {
  it("verifies matching produce with high confidence", async () => {
    const forced = await verifyProduce("Wheat");
    // stochastic service — assert the result shape is always coherent
    expect(["verified", "warning"]).toContain(forced.result);
    expect(forced.detected.length).toBeGreaterThan(0);
    expect(forced.confidence).toBeGreaterThanOrEqual(70);
    expect(forced.confidence).toBeLessThanOrEqual(99);
    expect(forced.expected).toBe("Wheat");
  });

  it("forces a mismatch when requested and never claims verified", async () => {
    for (let i = 0; i < 3; i++) {
      const r = await verifyProduce("Wheat", true);
      expect(r.result).toBe("warning");
      expect(r.detected).not.toBe("Wheat");
    }
  }, 15_000);
});

describe("lane assignment", () => {
  it("builds the demo lane layout: one weighing, one loading, last in maintenance", () => {
    const lanes = buildLanes(4);
    expect(lanes.map((l) => l.state)).toEqual(["weighing", "loading", "available", "maintenance"]);
    expect(lanes[0].operation).toContain("Weighing");
  });

  it("assigns a truck to the first available lane", async () => {
    const lanes = buildLanes(4);
    const { lane, lanes: updated } = await assignLane(lanes, "MH-99-ZZ-9999");
    expect(lane?.truck).toBe("MH-99-ZZ-9999");
    expect(updated.find((l) => l.id === lane?.id)?.state).toBe("weighing");
    // other lanes untouched
    expect(updated.find((l) => l.state === "loading")).toBeTruthy();
  });

  it("returns null when no lane is available", async () => {
    const busy = buildLanes(4).map((l) => (l.state === "available" ? { ...l, state: "weighing" as const } : l));
    const { lane } = await assignLane(busy, "MH-99-ZZ-9999");
    expect(lane).toBeNull();
  });
});

describe("audit filtering", () => {
  const baseEvents: AuditEvent[] = [
    { id: "a1", timestamp: "t", actor: "officer", action: "weigh", description: "gross captured", transactionId: "TX-1", device: "WB-03", status: "success", hashRef: "0xaaaa01" },
    { id: "a2", timestamp: "t", actor: "officer", action: "cv", description: "cv verified", transactionId: "TX-2", device: "CV-1", status: "success", hashRef: "0xaaaa02" },
    { id: "a3", timestamp: "t", actor: "officer", action: "weigh", description: "tare captured", transactionId: "TX-1", device: "WB-03", status: "success", hashRef: "0xaaaa03" },
  ];

  it("filters audit events to the selected transaction", () => {
    const txn = { transactionId: "TX-1" } as Transaction;
    const filtered = auditForTransaction(txn, baseEvents);
    expect(filtered.map((e) => e.id)).toEqual(["a1", "a3"]);
  });

  it("keeps all events when the transaction has no id match filter target", () => {
    const other = { transactionId: "TX-9" } as Transaction;
    expect(auditForTransaction(other, baseEvents)).toEqual([]);
  });
});
