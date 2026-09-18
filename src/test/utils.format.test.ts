import { describe, it, expect } from "vitest";
import { cn, formatINR, formatINRShort, formatKg, formatNumber, formatQuintal, capacityPercent } from "@/utils/format";

describe("cn — className combiner", () => {
  it("joins truthy parts and drops falsy ones", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
    expect(cn()).toBe("");
    expect(cn(0 as unknown as string)).toBe(""); // 0 is falsy, dropped
  });
});

describe("Indian currency & number formatting", () => {
  it("formats INR with Indian digit grouping", () => {
    expect(formatINR(274025)).toContain("2,74,025");
    expect(formatINR(1000)).toContain("1,000");
  });

  it("uses lakh/crore shorthand at scale", () => {
    expect(formatINRShort(274025)).toBe("₹2.74 L");
    expect(formatINRShort(11500000)).toBe("₹1.15 Cr");
    expect(formatINRShort(999)).toContain("999");
  });

  it("formats kg and numbers with Indian grouping", () => {
    expect(formatKg(11300)).toBe("11,300 kg");
    expect(formatNumber(78160)).toBe("78,160");
  });

  it("converts kg to quintals", () => {
    expect(formatQuintal(11300)).toBe("113.0 q");
    expect(formatQuintal(0)).toBe("0.0 q");
  });

  it("computes capacity percent with a divide-by-zero guard", () => {
    expect(capacityPercent(25, 100)).toBe(25);
    expect(capacityPercent(10, 0)).toBe(0);
    expect(capacityPercent(0, 50)).toBe(0);
  });
});
