import type { CropAnalysis } from "@/types";
import { delay, randomBetween, seededRandom } from "./delay";

/** Progressive stage labels shown during simulated AI analysis. */
export const analysisStages = [
  "Uploading image…",
  "Processing crop…",
  "Detecting visual symptoms…",
  "Comparing crop patterns…",
  "Generating health report…",
];

const findingsBank: Record<string, string[]> = {
  Wheat: [
    "Mild nitrogen deficiency detected on older leaves",
    "No major fungal infection detected",
    "Leaf condition generally healthy",
    "Moderate moisture stress in afternoon hours",
  ],
  Rice: [
    "Early-stage brown spot visible on 8% of leaf area",
    "Adequate standing water maintained",
    "Panicle initiation on track",
    "Low pest pressure detected",
  ],
  Cotton: [
    "Minor leaf-curl virus symptoms on border rows",
    "Whitefly presence below economic threshold",
    "Boll development normal for growth stage",
    "Slight potassium deficiency on mature leaves",
  ],
  Soybean: [
    "Yellow mosaic pattern on younger leaves",
    "Nodulation appears healthy",
    "No girdle beetle damage detected",
    "Canopy density good",
  ],
  Sugarcane: [
    "Red rot not detected in sampled stalks",
    "Top growth vigorous",
    "Moderate whiptail aphid presence",
    "Irrigation schedule optimal",
  ],
  Tomato: [
    "Early blight lesions on lower canopy",
    "Fruit set healthy across trusses",
    "Calcium deficiency risk (blossom-end) low",
    "Leaf minor activity minimal",
  ],
  Onion: [
    "Purple blotch below treatment threshold",
    "Bulb swelling on schedule",
    "Thrips pressure moderate — monitor weekly",
    "No downy mildew detected",
  ],
};

const recommendationBank: Record<string, string[]> = {
  Wheat: [
    "Apply 25 kg urea/acre as second top-dress within 7 days, followed by light irrigation",
    "Scout weekly for yellow rust in cool, humid mornings",
    "Maintain soil moisture at 60–70% field capacity until grain filling",
  ],
  Rice: [
    "Spray propiconazole 1 ml/litre for brown spot if lesions spread beyond 10%",
    "Keep 5 cm standing water during panicle initiation",
    "Use pheromone traps at 8/acre for stem borer monitoring",
  ],
  Cotton: [
    "Destroy leaf-curl affected border plants to limit virus spread",
    "Release Chrysoperla cards for whitefly biological control",
    "Apply muriate of potash 10 kg/acre with next irrigation",
  ],
  Soybean: [
    "Rogue out yellow-mosaic plants and control whitefly vector",
    "Avoid moisture stress during pod filling stage",
    "Plan harvest when 80% pods turn brown",
  ],
  Sugarcane: [
    "Earth up rows and apply remaining N dose before monsoon withdrawal",
    "Set up light traps for early aphid control",
    "Schedule final irrigation 20 days before harvest",
  ],
  Tomato: [
    "Remove and destroy lower affected leaves; spray chlorothalonil 2 g/litre",
    "Mulch beds to stabilise soil moisture and reduce blight splash",
    "Maintain calcium via weekly foliar spray during fruit set",
  ],
  Onion: [
    "Alternate Mancozeb and tebuconazole sprays at 10-day intervals",
    "Reduce irrigation frequency as bulbs mature to improve storage",
    "Monitor thrips with blue sticky traps at 10/acre",
  ],
};

export const analyzeCrop = async (
  crop: string,
  onStage?: (stage: string, index: number) => void,
): Promise<CropAnalysis> => {
  const rand = seededRandom(crop + new Date().toDateString());

  for (let i = 0; i < analysisStages.length; i++) {
    onStage?.(analysisStages[i], i);
    await delay(700 + Math.floor(rand() * 500));
  }

  const healthScore = 68 + Math.floor(rand() * 28); // 68–95
  const statusLabel: CropAnalysis["statusLabel"] =
    healthScore >= 85 ? "Healthy" : healthScore >= 72 ? "Moderate" : "Stressed";

  const plantHealth = Math.min(99, healthScore + randomBetween(3, 8));
  const diseaseRisk = Math.max(4, Math.round((100 - healthScore) * 0.5) + randomBetween(0, 6));
  const pestRisk = Math.max(6, Math.round((100 - healthScore) * 0.55) + randomBetween(0, 6));
  const waterStress = randomBetween(8, 26);
  const nutrientStress = randomBetween(10, 24);

  return {
    crop,
    healthScore,
    statusLabel,
    breakdown: { plantHealth, diseaseRisk, pestRisk, waterStress, nutrientStress },
    findings: findingsBank[crop] ?? findingsBank.Wheat,
    recommendations: recommendationBank[crop] ?? recommendationBank.Wheat,
    analyzedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    imageLabel: `${crop} field sample`,
  };
};
