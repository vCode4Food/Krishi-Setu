/** Tiny className combiner (avoids an external dependency). */
export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatINR = (n: number) => inrFormatter.format(n);

export const formatINRShort = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return formatINR(n);
};

export const formatKg = (n: number) => `${new Intl.NumberFormat("en-IN").format(n)} kg`;

export const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);

export const formatQuintal = (kg: number) => `${(kg / 100).toFixed(1)} q`;

export const capacityPercent = (remaining: number, total: number) =>
  total === 0 ? 0 : Math.round((remaining / total) * 100);

export const timeAgoLabel = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
