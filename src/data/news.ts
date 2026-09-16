import type { NewsArticle, MspEntry } from "@/types";
import { images } from "./images";

export const newsCategories: NewsArticle["category"][] = [
  "Agriculture",
  "Procurement",
  "Weather",
  "Government",
  "Markets",
  "Technology",
  "Crop Advisory",
];

export const news: NewsArticle[] = [
  {
    id: "NWS-001",
    title: "Rabi procurement season opens: 412 centres live on KrushiSetu network",
    category: "Procurement",
    date: "14 Sep 2026",
    summary:
      "Digital slot booking, RFID truck identification and digital weighment go live across 412 procurement centres in six states, with real-time capacity visible to every registered farmer.",
    image: images.news.mandi,
    readTime: 3,
    source: "KrushiSetu Desk",
    featured: true,
  },
  {
    id: "NWS-002",
    title: "Monsoon withdrawal begins: advisory for standing cotton and soybean",
    category: "Weather",
    date: "13 Sep 2026",
    summary:
      "IMD forecasts withdrawal of monsoon from Vidarbha over the next 72 hours. Experts advise early picking of bolls and drainage management in waterlogged soybean plots.",
    image: images.news.weather,
    readTime: 4,
    source: "IMD Advisory",
    featured: true,
  },
  {
    id: "NWS-003",
    title: "MSP for wheat raised to ₹2,425 per quintal for 2026-27",
    category: "Government",
    date: "12 Sep 2026",
    summary:
      "Cabinet approves ₹150 increase in wheat MSP. Procurement will be credited directly to bank accounts within 48 hours of digital weighment.",
    image: images.news.wheat,
    readTime: 3,
    source: "PIB",
    featured: true,
  },
  {
    id: "NWS-004",
    title: "Drone spraying pilot covers 1.2 lakh acres under Nagpur division",
    category: "Technology",
    date: "11 Sep 2026",
    summary:
      "Kisan drones under the SMAM subsidy sprayed micronutrients across 1.2 lakh acres this season. Farmers report 18% input-cost savings versus manual spraying.",
    image: images.news.drone,
    readTime: 5,
    source: "AgriTech Weekly",
  },
  {
    id: "NWS-005",
    title: "Onion prices stabilise as Nashik arrivals normalise",
    category: "Markets",
    date: "10 Sep 2026",
    summary:
      "Lasalgaon mandi arrivals rose 14% this week, cooling prices to ₹1,850/quintal. Export duty revision expected to keep farm-gate rates steady.",
    image: images.news.market,
    readTime: 3,
    source: "Market Intelligence",
  },
  {
    id: "NWS-006",
    title: "e-NAM integration bonus: ₹1,000 for first digital sale",
    category: "Agriculture",
    date: "9 Sep 2026",
    summary:
      "Farmers completing their first online sale through e-NAM linked centres receive a one-time ₹1,000 incentive plus 2% transport subsidy under the new scheme.",
    image: images.news.scheme,
    readTime: 2,
    source: "e-NAM Cell",
  },
  {
    id: "NWS-007",
    title: "Crop Advisory: nitrogen top-dressing window for standing wheat",
    category: "Crop Advisory",
    date: "8 Sep 2026",
    summary:
      "Agronomists recommend the second urea split within the next 7 days for wheat sown in the first fortnight. Broadcast after irrigation for best uptake.",
    image: images.crops.wheat,
    readTime: 4,
    source: "ICAR Advisory",
  },
  {
    id: "NWS-008",
    title: "Anti-fraud CV verification flagged 340 mismatch attempts this season",
    category: "Procurement",
    date: "7 Sep 2026",
    summary:
      "Computer-vision produce verification at KrushiSetu centres detected 340 quality-mismatch attempts, protecting genuine farmers and ensuring transparent procurement.",
    image: images.centres.nagpur,
    readTime: 3,
    source: "KrushiSetu Desk",
  },
];

export const mspTicker: MspEntry[] = [
  { crop: "Wheat", price: "₹2,425/q", change: "+₹150", up: true },
  { crop: "Paddy (common)", price: "₹2,300/q", change: "+₹115", up: true },
  { crop: "Cotton", price: "₹7,521/q", change: "+₹240", up: true },
  { crop: "Soybean", price: "₹4,892/q", change: "-₹60", up: false },
  { crop: "Maize", price: "₹2,400/q", change: "+₹100", up: true },
];
