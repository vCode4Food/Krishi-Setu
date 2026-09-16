/** Central domain types for the KrushiSetu prototype. */

export type UserMode = "farmer" | "centre";

export interface Farmer {
  farmerId: string;
  name: string;
  location: string;
  village: string;
  state: string;
  landAcres: number;
  crops: string[];
  currentCrop: string;
  registeredQtyKg: number;
  bookedQtyKg: number;
  procuredQtyKg: number;
  remainingQtyKg: number;
  phone: string;
  avatarUrl: string;
  memberSince: number;
  pmKisan: boolean;
  rating: number;
}

export type CentreStatus = "available" | "busy" | "full" | "closed";

export interface ProcurementCentre {
  centreId: string;
  name: string;
  city: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  image: string;
  capacityKg: number;
  remainingCapacityKg: number;
  queue: number;
  avgWeighingMinutes: number;
  lanes: number;
  status: CentreStatus;
  supportedCrops: string[];
  slots: SlotAvailability[];
  operatorName: string;
  phone: string;
}

export interface SlotAvailability {
  time: string;
  capacityKg: number;
  bookedKg: number;
}

export type SlotStatus = "confirmed" | "completed" | "cancelled";

export interface SlotBooking {
  slotId: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  centreName: string;
  crop: string;
  quantityKg: number;
  date: string;
  time: string;
  status: SlotStatus;
  qrRef: string;
  createdAt: string;
}

export interface Truck {
  truckId: string;
  rfid: string;
  registrationNumber: string;
  farmerId: string;
  farmerName: string;
  status: "registered" | "en-route" | "at-gate" | "in-lane" | "weighing" | "completed";
  bookingId?: string;
  crop: string;
}

export type TransactionStatus =
  | "processing"
  | "verified"
  | "warning"
  | "completed"
  | "manual-review";

export interface Transaction {
  transactionId: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  centreName: string;
  truckId: string;
  rfid: string;
  registrationNumber: string;
  crop: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  pricePerQuintal: number;
  amount: number;
  cvVerification: {
    expected: string;
    detected: string;
    confidence: number;
    result: "verified" | "warning" | "rejected";
  };
  status: TransactionStatus;
  timestamp: string;
  integrity: {
    farmerVerified: boolean;
    rfidMatched: boolean;
    digitalWeight: boolean;
    produceVerified: boolean;
    capacityValidated: boolean;
    auditRecorded: boolean;
  };
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  description: string;
  transactionId?: string;
  device: string;
  status: "success" | "warning" | "flagged";
  hashRef: `0x${string}`;
}

export interface Scheme {
  id: string;
  name: string;
  department: string;
  description: string;
  eligibility: string[];
  benefit: string;
  deadline: string;
  category: string;
  crops: string[];
  state: string;
  farmerType: string[];
  income: string;
  irrigation: string[];
  insurance: string;
  equipment: string[];
  credit: string;
  image: string;
  status: "open" | "closing-soon" | "enrolled" | "closed";
  applied?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  date: string;
  summary: string;
  image: string;
  readTime: number;
  source: string;
  featured?: boolean;
}

export type NewsCategory =
  | "Agriculture"
  | "Procurement"
  | "Weather"
  | "Government"
  | "Markets"
  | "Technology"
  | "Crop Advisory";

export interface Expert {
  id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  languages: string[];
  rating: number;
  reviews: number;
  modes: ("video" | "audio" | "chat" | "on-site")[];
  availableToday: boolean;
  nextSlot: string;
  image: string;
  location: string;
  fee: number;
}

export interface CropAnalysis {
  crop: string;
  healthScore: number;
  statusLabel: "Healthy" | "Moderate" | "Stressed";
  breakdown: {
    plantHealth: number;
    diseaseRisk: number;
    pestRisk: number;
    waterStress: number;
    nutrientStress: number;
  };
  findings: string[];
  recommendations: string[];
  analyzedAt: string;
  imageLabel: string;
}

export interface Notification {
  id: string;
  type:
    | "slot-reminder"
    | "procurement-update"
    | "scheme-alert"
    | "crop-health-alert"
    | "expert-consultation"
    | "centre-capacity-alert"
    | "weather-advisory"
    | "verification-warning";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actor?: "farmer" | "centre";
}

export interface WaitingPrediction {
  minutes: number;
  confidence: number;
  trucksAhead: number;
  activeLanes: number;
  avgWeighingMinutes: number;
  factors: string[];
}

export interface ChatMessage {
  id: string;
  role: "farmer" | "ai";
  text: string;
  timestamp: string;
  language?: string;
  attachments?: { label: string; href: string }[];
}

export interface IntentResult {
  need: string;
  location: string;
  preference: string;
  matchedAction: { label: string; to: string }[];
  resultsSummary: string;
}

export interface MspEntry {
  crop: string;
  price: string;
  change: string;
  up: boolean;
}

export interface Weather {
  temp: number;
  condition: string;
  humidity: string;
  wind: string;
  forecast: { day: string; icon: "sun" | "cloud" | "rain"; max: number; min: number }[];
}
