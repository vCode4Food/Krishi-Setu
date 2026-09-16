import { delay, randomBetween } from "./delay";

export const GROSS_TARGET_DEFAULT = 18420;
export const TARE_TARGET_DEFAULT = 7120;
export const WEIGHT_TOLERANCE_KG = 20;

/** Simulate the weighbridge settling on a target gross weight. */
export const captureGrossWeight = async (
  onTick: (kg: number) => void,
  target: number = GROSS_TARGET_DEFAULT,
): Promise<number> => {
  let kg = target - randomBetween(240, 420);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    kg += Math.round((target - kg) / (steps - i + 1)) + randomBetween(-18, 14);
    onTick(Math.max(0, kg));
    await delay(180);
  }
  onTick(target);
  return target;
};

/** Simulate tare capture (empty truck weight). */
export const captureTareWeight = async (
  onTick: (kg: number) => void,
  target: number = TARE_TARGET_DEFAULT,
): Promise<number> => {
  let kg = target + randomBetween(120, 260);
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    kg -= Math.round((kg - target) / (steps - i + 1)) + randomBetween(-12, 10);
    onTick(Math.max(0, kg));
    await delay(160);
  }
  onTick(target);
  return target;
};

export const isStable = (current: number, target: number) =>
  Math.abs(current - target) <= WEIGHT_TOLERANCE_KG;

export const netWeight = (gross: number, tare: number) =>
  Math.max(0, gross - tare);
