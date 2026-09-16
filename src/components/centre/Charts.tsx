import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const GREEN = "#2c9960";
const DARK = "#1a5c38";
const AMBER = "#f7a90b";
const RED = "#ef4444";
const EARTH = "#d0c5ae";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8e4",
  boxShadow: "0 8px 24px -8px rgba(16,27,20,.18)",
  fontSize: 12,
  fontWeight: 600,
};

export const hourlyThroughput = [
  { hour: "07:00", trucks: 4, avgMin: 8.2 },
  { hour: "08:00", trucks: 7, trucksB: 0, avgMin: 8.9 },
  { hour: "09:00", trucks: 11, avgMin: 9.4 },
  { hour: "10:00", trucks: 9, avgMin: 8.1 },
  { hour: "11:00", trucks: 8, avgMin: 7.6 },
  { hour: "12:00", trucks: 6, avgMin: 7.2 },
  { hour: "13:00", trucks: 5, avgMin: 6.8 },
  { hour: "14:00", trucks: 7, avgMin: 7.4 },
];

export const cropVolumes = [
  { crop: "Wheat", tonnes: 482 },
  { crop: "Soybean", tonnes: 316 },
  { crop: "Cotton", tonnes: 204 },
  { crop: "Onion", tonnes: 158 },
  { crop: "Rice", tonnes: 141 },
];

export const verificationData = [
  { name: "Verified", value: 86, color: GREEN },
  { name: "Warning", value: 9, color: AMBER },
  { name: "Manual Review", value: 5, color: RED },
];

export const processingTimes = [
  { stage: "RFID Gate", min: 1.2 },
  { stage: "Queue", min: 14.6 },
  { stage: "Weighing", min: 8.9 },
  { stage: "CV Check", min: 1.4 },
  { stage: "Settlement", min: 2.1 },
];

export function ThroughputChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={hourlyThroughput} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gTrucks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#7d8f83" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="trucks" name="Trucks" stroke={DARK} strokeWidth={2.5} fill="url(#gTrucks)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CropVolumeChart() {
  const { t } = useTranslation();
  const localized = cropVolumes.map((d) => ({ ...d, crop: t(`crops.${d.crop}`) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={localized} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#7d8f83" }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="crop" width={72} tick={{ fontSize: 12, fill: "#33473b", fontWeight: 600 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} t`, "Volume"]} />
        <Bar dataKey="tonnes" name="Volume" fill={GREEN} radius={[0, 8, 8, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VerificationDonut() {
  const { t } = useTranslation();
  const localized = verificationData.map((d) => ({ ...d, name: t(`verification.${d.name}`) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={localized} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3} strokeWidth={0}>
          {localized.map((d) => (
            <Cell key={d.color} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v}%`, n]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ProcessingTimeChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={processingTimes} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e4" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#7d8f83" }} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={{ fontSize: 11, fill: "#7d8f83" }} tickLine={false} axisLine={false} unit="m" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} min`, "Avg time"]} />
        <Bar dataKey="min" name="Avg time" fill={AMBER} radius={[6, 6, 0, 0]} barSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const DonutLegend = () => {
  const { t } = useTranslation();
  return (
  <ul className="mt-1 space-y-1.5 text-xs font-semibold">
    {verificationData.map((d) => (
      <li key={d.name} className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-ink-700">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} aria-hidden />
          {t(`verification.${d.name}`)}
        </span>
        <span className="text-ink-900">{d.value}%</span>
      </li>
    ))}
  </ul>
  );
};

export const ChartColors = { GREEN, DARK, AMBER, RED, EARTH };
