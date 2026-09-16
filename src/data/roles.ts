/** Role-scoped demo datasets for driver, manager, district and state experiences. */

export interface DriverTrip {
  tripId: string;
  bookingId: string;
  farmerName: string;
  farmerId: string;
  centreId: string;
  centreName: string;
  crop: string;
  quantityKg: number;
  status: "assigned" | "en-route" | "arrived" | "rfid-detected" | "lane-assigned" | "weighing" | "completed";
  lane?: string;
  etaMin: number;
  distanceKm: number;
}

export const driverTrips: DriverTrip[] = [
  {
    tripId: "TRP-8801",
    bookingId: "KS-PROC-2026-00482",
    farmerName: "Ramesh Patil",
    farmerId: "FRM-10482",
    centreId: "CRC-NAG-01",
    centreName: "Nagpur Central Procurement Centre",
    crop: "Wheat",
    quantityKg: 8000,
    status: "en-route",
    etaMin: 18,
    distanceKm: 4.2,
  },
  {
    tripId: "TRP-8794",
    bookingId: "KS-PROC-2026-00477",
    farmerName: "Sunita Devi",
    farmerId: "FRM-10231",
    centreId: "CRC-NSK-03",
    centreName: "Nashik Grape & Grain Complex",
    crop: "Onion",
    quantityKg: 4000,
    status: "completed",
    lane: "LANE 02",
    etaMin: 0,
    distanceKm: 0,
  },
];

export const tripStages = [
  "assigned",
  "en-route",
  "arrived",
  "rfid-detected",
  "lane-assigned",
  "weighing",
  "completed",
] as const;

export const tripStageLabels: Record<DriverTrip["status"], string> = {
  assigned: "Assigned",
  "en-route": "En Route",
  arrived: "Arrived",
  "rfid-detected": "RFID Detected",
  "lane-assigned": "Lane Assigned",
  weighing: "Weighing",
  completed: "Completed",
};

/* ------------------------------ District ------------------------------- */

export interface DistrictCentre {
  centreId: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  capacityT: number;
  remainingT: number;
  queue: number;
  waitMin: number;
  status: "available" | "busy" | "full" | "offline";
  crops: string[];
}

export const districtCentres: DistrictCentre[] = [
  { centreId: "CRC-NAG-01", name: "Nagpur Central", city: "Nagpur", lat: 21.1458, lng: 79.0882, capacityT: 40, remainingT: 10, queue: 7, waitMin: 24, status: "available", crops: ["Wheat", "Soybean", "Cotton"] },
  { centreId: "CRC-NAG-02", name: "Kamptee Agri Node", city: "Kamptee", lat: 21.2176, lng: 79.1939, capacityT: 24, remainingT: 18, queue: 2, waitMin: 9, status: "available", crops: ["Wheat", "Rice"] },
  { centreId: "CRC-NAG-03", name: "Katol Grain Centre", city: "Katol", lat: 21.2689, lng: 78.5867, capacityT: 20, remainingT: 0, queue: 11, waitMin: 46, status: "full", crops: ["Wheat", "Chickpea"] },
  { centreId: "CRC-NAG-04", name: "Saoner Procurement Point", city: "Saoner", lat: 21.4167, lng: 78.9167, capacityT: 16, remainingT: 4, queue: 8, waitMin: 31, status: "busy", crops: ["Cotton", "Soybean"] },
  { centreId: "CRC-NAG-05", name: "Umred Krushi Kendra", city: "Umred", lat: 20.8537, lng: 79.3246, capacityT: 18, remainingT: 15, queue: 1, waitMin: 6, status: "available", crops: ["Rice", "Wheat"] },
  { centreId: "CRC-NAG-06", name: "Ramtek Collection Centre", city: "Ramtek", lat: 21.4, lng: 79.3333, capacityT: 14, remainingT: 12, queue: 0, waitMin: 0, status: "offline", crops: ["Rice"] },
];

export const districtStats = {
  centres: 6,
  active: 5,
  farmers: 12480,
  volumeT: 1840,
  queueTotal: 29,
  avgWaitMin: 23,
  capacityUtilisation: 71,
  alerts: 3,
};

/* -------------------------------- State -------------------------------- */

export interface StateDistrict {
  districtId: string;
  name: string;
  centres: number;
  farmers: number;
  volumeT: number;
  queue: number;
  avgWaitMin: number;
  utilisation: number;
  status: "normal" | "watch" | "critical";
}

export const stateDistricts: StateDistrict[] = [
  { districtId: "D-NAG", name: "Nagpur", centres: 6, farmers: 12480, volumeT: 1840, queue: 29, avgWaitMin: 23, utilisation: 71, status: "watch" },
  { districtId: "D-PUN", name: "Pune", centres: 9, farmers: 18720, volumeT: 2640, queue: 34, avgWaitMin: 19, utilisation: 64, status: "normal" },
  { districtId: "D-NSK", name: "Nashik", centres: 8, farmers: 15310, volumeT: 2210, queue: 41, avgWaitMin: 34, utilisation: 82, status: "critical" },
  { districtId: "D-AMT", name: "Amravati", centres: 5, farmers: 9840, volumeT: 1320, queue: 18, avgWaitMin: 17, utilisation: 58, status: "normal" },
  { districtId: "D-AKO", name: "Akola", centres: 4, farmers: 7620, volumeT: 1080, queue: 12, avgWaitMin: 14, utilisation: 49, status: "normal" },
  { districtId: "D-AUR", name: "Aurangabad", centres: 7, farmers: 14190, volumeT: 1960, queue: 27, avgWaitMin: 22, utilisation: 67, status: "watch" },
];

export const fraudAlerts = [
  {
    id: "FRD-001",
    severity: "high" as const,
    centre: "CRC-NSK-03",
    district: "Nashik",
    title: "Repeat CV mismatches",
    body: "4 loads flagged as Mixed Grain in 48h from the same vehicle cluster. Recommend manual audit.",
    time: "2h ago",
  },
  {
    id: "FRD-002",
    severity: "medium" as const,
    centre: "CRC-NAG-04",
    district: "Nagpur",
    title: "Weight variance pattern",
    body: "Tare weights consistently 4% below fleet average for TRK-98620. Possible tampering.",
    time: "5h ago",
  },
  {
    id: "FRD-003",
    severity: "low" as const,
    centre: "CRC-PUN-02",
    district: "Pune",
    title: "Slot no-show cluster",
    body: "9 booked slots unused yesterday — possible duplicate booking ring.",
    time: "Yesterday",
  },
];

export const adminAlerts = [
  { id: "ALT-101", level: "critical" as const, centre: "CRC-NAG-03", text: "Katol centre at 100% capacity — queue overflow onto highway.", time: "20 min ago" },
  { id: "ALT-102", level: "warning" as const, centre: "CRC-NAG-06", text: "Ramtek centre offline — weighbridge connectivity lost.", time: "1h ago" },
  { id: "ALT-103", level: "warning" as const, centre: "CRC-NSK-03", text: "Average wait exceeded 30 min for 3rd consecutive day.", time: "3h ago" },
  { id: "ALT-104", level: "info" as const, centre: "CRC-PUN-02", text: "Pune crossed 2,600 t seasonal procurement milestone.", time: "Yesterday" },
];
