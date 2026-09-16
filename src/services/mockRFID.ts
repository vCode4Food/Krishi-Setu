import type { Truck } from "@/types";
import { trucks, getTruckByRfid } from "@/data/trucks";
import { delay } from "./delay";

export type RfidScanState = "scanning" | "identified" | "unknown" | "mismatch";

export interface RfidScanResult {
  state: RfidScanState;
  rfid?: string;
  truck?: Truck;
  checks?: { labelKey: string; ok: boolean }[];
  message?: string;
}

/** Simulate a truck arriving at the RFID gate and being identified. */
export const identifyTruck = async (
  rfid?: string,
): Promise<RfidScanResult> => {
  await delay(1800); // gate scan animation

  const known = rfid ? getTruckByRfid(rfid) : undefined;

  if (rfid && !known) {
    return {
      state: "unknown",
      rfid,
      message: "Unrecognized Vehicle — Manual verification required.",
    };
  }

  const truck = known ?? trucks[0];

  return {
    state: "identified",
    rfid: truck.rfid,
    truck,
    checks: [
      { labelKey: "weighing.checkRegistered", ok: true },
      { labelKey: "weighing.checkFarmer", ok: Boolean(truck.farmerId) },
      { labelKey: "weighing.checkBooking", ok: Boolean(truck.bookingId) },
    ],
  };
};

/** Return a stream of gate events used to animate the queue feed. */
export const nextGateTruck = (): Truck => {
  const pool = trucks.filter((t) => t.status === "en-route" || t.status === "registered");
  return pool[Math.floor(Math.random() * pool.length)];
};
