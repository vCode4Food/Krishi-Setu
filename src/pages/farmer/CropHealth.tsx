import { useRef, useState } from "react";
import {
  Upload,
  ImageIcon,
  ScanSearch,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Bug,
  Leaf,
  FlaskConical,
  Sun,
  Sprout,
} from "lucide-react";
import { motion } from "framer-motion";
import { analyzeCrop, analysisStages } from "@/services/mockAI";
import type { CropAnalysis } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badges";
import { cropImage } from "@/data/images";
import { useApp } from "@/context/AppContext";
import { cn } from "@/utils/format";

const crops = ["Wheat", "Rice", "Cotton", "Soybean", "Sugarcane", "Tomato", "Onion"] as const;

const sampleImages: Record<string, string> = {
  Wheat: cropImage("Wheat"),
  Rice: cropImage("Rice"),
  Cotton: cropImage("Cotton"),
  Soybean: cropImage("Soybean"),
  Sugarcane: cropImage("Sugarcane"),
  Tomato: cropImage("Tomato"),
  Onion: cropImage("Onion"),
};

function ScoreRing({ score }: { score: number }) {
  const size = 168;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "#2c9960" : score >= 72 ? "#f7a90b" : "#ef4444";

  return (
    <svg width={size} height={size} role="img" aria-label={`Health score ${score} of 100`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8e4" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="46%" textAnchor="middle" className="fill-ink-900 font-display text-4xl font-extrabold">
        {score}
      </text>
      <text x="50%" y="62%" textAnchor="middle" className="fill-ink-400 text-xs font-bold">
        / 100
      </text>
    </svg>
  );
}

export default function CropHealth() {
  const { setLastAnalysis, pushToast } = useApp();
  const [crop, setCrop] = useState<string>("Wheat");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<CropAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      pushToast({ kind: "error", title: "Unsupported file", body: "Please upload a JPG or PNG crop photo." });
      return;
    }
    setPreview(URL.createObjectURL(f));
    setFileName(f.name);
    setResult(null);
  };

  const runAnalysis = async () => {
    if (!preview) {
      pushToast({ kind: "warning", title: "No image selected", body: "Upload a crop photo or pick a sample image first." });
      return;
    }
    setAnalyzing(true);
    setResult(null);
    const analysis = await analyzeCrop(crop, (_s, i) => setStage(i));
    setAnalyzing(false);
    setResult(analysis);
    setLastAnalysis(analysis);
    pushToast({
      kind: "success",
      title: "Analysis complete",
      body: `${crop} health score: ${analysis.healthScore}/100 — ${analysis.statusLabel}`,
    });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const reset = () => {
    setPreview(null);
    setFileName(null);
    setResult(null);
    setStage(0);
    setAnalyzing(false);
  };

  const breakdownRows = result
    ? [
        { icon: Leaf, label: "Plant health", value: result.breakdown.plantHealth, good: true },
        { icon: FlaskConical, label: "Nutrient stress", value: result.breakdown.nutrientStress, good: false },
        { icon: Bug, label: "Pest risk", value: result.breakdown.pestRisk, good: false },
        { icon: Droplets, label: "Water stress", value: result.breakdown.waterStress, good: false },
        { icon: AlertTriangle, label: "Disease risk", value: result.breakdown.diseaseRisk, good: false },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="AI Crop Health Analysis"
        description="Upload a crop photo and KrushiSetu AI will detect symptoms, score plant health and suggest actions. (Simulated analysis — no images leave your device.)"
        actions={<StatusBadge tone="green" label="● KrushiSetu AI v4.2" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Input panel */}
        <div>
          <Card className="p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">1 · Select crop</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {crops.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCrop(c);
                    setResult(null);
                  }}
                  aria-pressed={crop === c}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    crop === c
                      ? "border-primary-700 bg-primary-700 text-white"
                      : "border-ink-200 bg-white text-ink-700 hover:border-primary-400",
                  )}
                >
                  <img src={sampleImages[c]} alt="" className="h-6 w-6 rounded-full object-cover" aria-hidden />
                  {c}
                </button>
              ))}
            </div>

            <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-400">2 · Provide a photo</h2>
            {preview ? (
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-ink-100">
                <img src={preview} alt={`Selected ${crop} sample`} className="max-h-80 w-full object-cover" />
                <button
                  onClick={reset}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-ink-700 shadow-soft hover:text-alert-600"
                  aria-label="Remove image"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/70 to-transparent px-4 py-2.5 text-xs font-semibold text-white">
                  {fileName ?? `${crop} — sample field image`}
                </p>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickFile(e.dataTransfer.files[0]);
                }}
                className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 bg-earth-50 px-6 py-10 text-center transition hover:border-primary-400 hover:bg-primary-50/50"
              >
                <Upload className="h-8 w-8 text-primary-600" aria-hidden />
                <span className="text-sm font-bold text-ink-900">Upload crop photo</span>
                <span className="text-xs text-ink-400">Drag & drop or click — JPG/PNG, up to 10 MB</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-400">Or pick a sample image</h2>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {crops.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCrop(c);
                    setPreview(sampleImages[c]);
                    setFileName(null);
                    setResult(null);
                  }}
                  className="group relative aspect-square overflow-hidden rounded-xl border-2 border-transparent transition hover:border-primary-400"
                  aria-label={`Use ${c} sample`}
                >
                  <img src={sampleImages[c]} alt={`${c} sample`} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-ink-900/55 py-0.5 text-[10px] font-bold text-white">
                    {c}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                size="lg"
                className="flex-1"
                onClick={runAnalysis}
                loading={analyzing}
                disabled={!preview}
                icon={<ScanSearch className="h-5 w-5" />}
              >
                {analyzing ? "Analyzing…" : "Analyze Crop"}
              </Button>
              {result && (
                <Button size="lg" variant="outline" onClick={reset}>
                  New Analysis
                </Button>
              )}
            </div>
            {!preview && (
              <p className="mt-2 text-center text-xs text-ink-400">
                Select a crop photo or sample to enable analysis
              </p>
            )}
          </Card>

          {/* Analysis pipeline */}
          {analyzing && (
            <Card className="mt-5 p-5">
              <h3 className="flex items-center gap-2 font-bold text-ink-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50">
                  <Sprout className="h-4 w-4 animate-pulse text-primary-600" aria-hidden />
                </span>
                KrushiSetu AI working…
              </h3>
              <ul className="mt-4 space-y-2.5">
                {analysisStages.map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm">
                    {i < stage ? (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-primary-600" aria-hidden />
                    ) : i === stage ? (
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center">
                        <span className="h-2.5 w-2.5 animate-ping rounded-full bg-saffron-400" aria-hidden />
                      </span>
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-ink-200" aria-hidden />
                    )}
                    <span className={cn(i <= stage ? "font-semibold text-ink-900" : "text-ink-400")}>{s}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-earth-200">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${((stage + 1) / analysisStages.length) * 100}%` }}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Result panel */}
        <div ref={resultRef}>
          {result ? (
            <Card className="overflow-hidden animate-fade-up">
              <div className="flex items-center gap-5 border-b border-ink-100 p-5">
                <ScoreRing score={result.healthScore} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-400">AI Health Score</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-ink-900">
                    {result.healthScore} / 100 — {result.statusLabel}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    {result.crop} · {result.imageLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">Analyzed {result.analyzedAt}</p>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-ink-400">Score Breakdown</h3>
                <ul className="mt-3 space-y-3">
                  {breakdownRows.map((r) => (
                    <li key={r.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-semibold text-ink-700">
                          <r.icon className="h-4 w-4 text-ink-400" aria-hidden /> {r.label}
                        </span>
                        <span className={cn("font-bold", r.good ? "text-primary-600" : r.value > 25 ? "text-alert-600" : "text-saffron-600")}>
                          {r.value}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-earth-200">
                        <motion.div
                          className={cn("h-full rounded-full", r.good ? "bg-primary-500" : r.value > 25 ? "bg-alert-500" : "bg-saffron-400")}
                          initial={{ width: 0 }}
                          animate={{ width: `${r.value}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-400">AI Findings</h3>
                <ul className="mt-3 space-y-2">
                  {result.findings.map((f) => (
                    <li key={f} className="flex items-start gap-2 rounded-xl bg-earth-50 px-3 py-2 text-sm text-ink-700">
                      <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>

                <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-400">Recommendations</h3>
                <ul className="mt-3 space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={r} className="flex items-start gap-2.5 rounded-xl border border-primary-100 bg-primary-50/60 px-3 py-2.5 text-sm text-ink-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-700 text-[10px] font-extrabold text-white">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button variant="secondary" icon={<ImageIcon className="h-4 w-4" />} onClick={() => window.print()}>
                    Save Report
                  </Button>
                  <Button variant="outline" icon={<Sun className="h-4 w-4" />} onClick={() => window.open("https://www.icar.org.in", "_blank", "noopener")}>
                    ICAR advisories
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[24rem] flex-col items-center justify-center p-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50">
                <ScanSearch className="h-8 w-8 text-primary-500" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">No analysis yet</h3>
              <p className="mt-1 max-w-sm text-sm text-ink-500">
                Choose your crop, upload or pick a field photo, then run the AI analysis to see your
                health score, findings and recommendations here.
              </p>
              <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2 text-[11px] font-semibold text-ink-400">
                {["Symptom detection", "Disease risk", "Action plan"].map((t) => (
                  <div key={t} className="rounded-xl border border-dashed border-ink-200 px-2 py-3">{t}</div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
