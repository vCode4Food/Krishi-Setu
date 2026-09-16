import type { IntentResult } from "@/types";

/** Mock natural-language intent examples surfaced in the search UI. */
export const searchExamples = [
  "Find wheat procurement centres near me",
  "माझ्या जवळ कापूस खरेदी केंद्र शोधा",
  "Show schemes for small farmers",
  "माझ्या पिकाची तपासणी करायची आहे",
  "I need an agricultural expert",
  "Find centres with less waiting time",
];

const cropKeywords: Record<string, string[]> = {
  Wheat: ["wheat", "गेहूं", "गहू", "कणक", "kanak"],
  Cotton: ["cotton", "कपास", "कापूस", "narma", "ਨਰਮਾ"],
  Rice: ["rice", "धान", "भात", "paddy", "ਝੋਨਾ", "వరి"],
  Soybean: ["soybean", "सोयाबीन"],
  Onion: ["onion", "प्याज", "कांदा", "ડુંગળી"],
  Tomato: ["tomato", "टमाटर", "टोमॅटो"],
};

export const detectIntent = (query: string): IntentResult => {
  const q = query.toLowerCase();

  let crop = "Wheat";
  for (const [name, words] of Object.entries(cropKeywords)) {
    if (words.some((w) => q.includes(w))) {
      crop = name;
      break;
    }
  }

  const wantsLowWait = /waiting|wait|queue|प्रतीक्षा|कम|less/.test(q);
  const isScheme = /scheme|yojana|योजना|योजने|प्रकल्प|किसान|small farmer|subsidy/.test(q);
  const isCropHealth = /पिक|पीक|crop|तपास|फसल|disease|analysis|health/.test(q);
  const isExpert = /expert|विशेषज्ञ|तज्ज्ञ|consult|doctor/.test(q);
  const isSlot = /slot|book|बुक|स्लॉट/.test(q);

  if (isScheme) {
    return {
      need: "Government Schemes",
      location: "All India",
      preference: "For small & marginal farmers",
      matchedAction: [{ label: "Browse Schemes", to: "/farmer/schemes" }],
      resultsSummary:
        "5 schemes match your profile — PM-KISAN, PMFBY, KCC, e-NAM Bonus and SMAM machinery subsidy.",
    };
  }
  if (isCropHealth) {
    return {
      need: "Crop Health Analysis",
      location: "Your farm (Kamptee Road, Nagpur)",
      preference: `${crop} — photo diagnosis`,
      matchedAction: [{ label: "Analyze Crop", to: "/farmer/crop-health" }],
      resultsSummary:
        "Start a fresh AI analysis, or review your last report (Wheat — 82/100, mild nitrogen deficiency).",
    };
  }
  if (isExpert) {
    return {
      need: "Agricultural Expert",
      location: "Any state",
      preference: "Available today",
      matchedAction: [{ label: "Find Experts", to: "/farmer/experts" }],
      resultsSummary:
        "3 experts are available today — Dr. Anjali Sharma (10:30 AM), Dr. Vilas Deshmukh (12:00 PM) and Dr. Simran Kaur (03:30 PM).",
    };
  }
  if (isSlot) {
    return {
      need: "Slot Booking",
      location: "Nearby centres",
      preference: wantsLowWait ? "Low waiting time" : "Any",
      matchedAction: [{ label: "Book a Slot", to: "/farmer/book-slot" }],
      resultsSummary:
        "Morning slots between 09:00 and 10:30 AM have the shortest predicted waits at your registered centre.",
    };
  }

  return {
    need: `${crop} Procurement`,
    location: "Nearby",
    preference: wantsLowWait ? "Low Waiting Time" : "Highest remaining capacity",
    matchedAction: [
      { label: "View Centres Map", to: "/farmer/centres" },
      { label: "Book a Slot", to: "/farmer/book-slot" },
    ],
    resultsSummary: `3 official ${crop} centres found near you — Nagpur Central (10,000 kg left, 27 min), Pune Market Yard (21,000 kg left, 14 min) and Indore Krushi Upaj Kendra (27,500 kg left, 9 min).`,
  };
};
