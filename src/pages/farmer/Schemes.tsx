import { useMemo, useState } from "react";
import { Award, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { schemes, schemeFilters } from "@/data/schemes";
import type { Scheme } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Chip } from "@/components/common/Badges";
import { SchemeCard } from "@/components/farmer/SchemeCard";
import { Carousel } from "@/components/common/Carousel";
import { cn } from "@/utils/format";

export default function Schemes() {
  const { pushToast, farmer } = useApp();
  const [crop, setCrop] = useState("All");
  const [farmerType, setFarmerType] = useState("Any");
  const [state, setState] = useState("All India");
  const [income, setIncome] = useState("Any");
  const [irrigation, setIrrigation] = useState("Any");
  const [insurance, setInsurance] = useState("Any");
  const [equipment, setEquipment] = useState("Any");
  const [credit, setCredit] = useState("Any");
  const [eligScheme, setEligScheme] = useState<Scheme | null>(null);
  const [eligStep, setEligStep] = useState(0);
  const [eligAnswers, setEligAnswers] = useState<Record<string, string>>({});
  const [appliedIds, setAppliedIds] = useState<string[]>(schemes.filter((s) => s.applied).map((s) => s.id));

  const filtered = useMemo(
    () =>
      schemes.filter((s) => {
        if (crop !== "All" && !s.crops.includes(crop) && !s.crops.includes("All crops")) return false;
        if (farmerType !== "Any" && !s.farmerType.includes(farmerType)) return false;
        if (state !== "All India" && s.state !== "All India" && s.state !== state) return false;
        if (income !== "Any" && s.income !== "Any" && s.income !== income) return false;
        if (irrigation !== "Any" && !s.irrigation.includes(irrigation) && !s.irrigation.includes("Any")) return false;
        if (insurance !== "Any" && s.insurance !== "Any" && s.insurance !== insurance) return false;
        if (equipment !== "Any" && !s.equipment.includes(equipment) && !s.equipment.includes("Any")) return false;
        if (credit !== "Any" && s.credit !== "Any" && s.credit !== credit) return false;
        return true;
      }),
    [crop, farmerType, state, income, irrigation, insurance, equipment, credit],
  );

  const featured = schemes.filter((s) => s.status === "closing-soon" || s.status === "enrolled");

  const startWizard = (s: Scheme) => {
    setEligScheme(s);
    setEligStep(0);
    setEligAnswers({});
  };

  const wizardQuestions = eligScheme
    ? [
        { key: "land", q: `Do you cultivate land in your name (or as tenant)?`, options: ["Yes", "No"] },
        { key: "aadhaar", q: "Is your bank account Aadhaar-linked?", options: ["Yes", "No"] },
        { key: "crop", q: `Do you grow ${eligScheme.crops.includes("All crops") ? "any crop" : eligScheme.crops.join(" / ")}?`, options: ["Yes", "No"] },
        { key: "type", q: "What is your farmer category?", options: schemeFilters.farmerTypes.slice(1) },
      ]
    : [];

  const evaluateEligibility = () => {
    if (!eligScheme) return;
    const land = eligAnswers.land === "Yes";
    const aadhaar = eligAnswers.aadhaar === "Yes";
    const cropOk = eligAnswers.crop === "Yes";
    const eligible = land && aadhaar && cropOk;
    pushToast({
      kind: eligible ? "success" : "warning",
      title: eligible ? "You appear eligible ✓" : "Check requirements",
      body: eligible
        ? `${eligScheme.name}: based on your answers you qualify. Apply before ${eligScheme.deadline}.`
        : "Some requirements are missing — review the eligibility list on the scheme card.",
    });
    setEligStep(wizardQuestions.length);
  };

  return (
    <div>
      <PageHeader
        title="Government Schemes & Benefits"
        description={`Personalised for ${farmer.name} — ${farmer.landAcres} acres, ${farmer.state}. Simulated eligibility in this prototype.`}
        actions={<Chip active>{filtered.length} schemes match</Chip>}
      />

      {/* Featured strip */}
      <section className="mb-8">
        <Carousel ariaLabel="Featured schemes" itemClassName="w-[85%] sm:w-[47%] lg:w-[31.5%]">
          {featured.map((s) => (
            <SchemeCard key={s.id} scheme={{ ...s, applied: appliedIds.includes(s.id) }} onApply={applyFor} onEligibility={startWizard} />
          ))}
        </Carousel>
      </section>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Crop", value: crop, set: setCrop, options: schemeFilters.crops },
            { label: "Farmer type", value: farmerType, set: setFarmerType, options: schemeFilters.farmerTypes },
            { label: "State", value: state, set: setState, options: schemeFilters.states },
            { label: "Income", value: income, set: setIncome, options: schemeFilters.income },
            { label: "Irrigation", value: irrigation, set: setIrrigation, options: schemeFilters.irrigation },
            { label: "Insurance", value: insurance, set: setInsurance, options: schemeFilters.insurance },
            { label: "Equipment", value: equipment, set: setEquipment, options: schemeFilters.equipment },
            { label: "Credit", value: credit, set: setCredit, options: schemeFilters.credit },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-400">{f.label}</span>
              <select
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-ink-200 bg-earth-50 px-3 text-sm font-semibold outline-none focus:border-primary-500"
              >
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Award className="mx-auto h-10 w-10 text-ink-300" aria-hidden />
          <h3 className="mt-3 font-bold text-ink-900">No schemes match these filters</h3>
          <p className="mt-1 text-sm text-ink-500">Try resetting a filter — most central schemes apply to all states.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <SchemeCard
              key={s.id}
              scheme={{ ...s, applied: appliedIds.includes(s.id) }}
              onApply={applyFor}
              onEligibility={startWizard}
              onDetails={() => startWizard(s)}
            />
          ))}
        </div>
      )}

      {/* Eligibility wizard */}
      <Modal open={!!eligScheme} onClose={() => setEligScheme(null)} title="Check My Eligibility" size="md">
        {eligScheme && (
          <div>
            <div className="rounded-2xl bg-primary-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-700">Simulated eligibility check</p>
              <h3 className="mt-1 font-bold text-ink-900">{eligScheme.name}</h3>
            </div>

            {eligStep < wizardQuestions.length ? (
              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-earth-200">
                  <motion.div className="h-full rounded-full bg-primary-600" animate={{ width: `${(eligStep / wizardQuestions.length) * 100}%` }} />
                </div>
                <p className="mt-4 text-sm font-bold text-ink-900">
                  Q{eligStep + 1}. {wizardQuestions[eligStep].q}
                </p>
                <div className="mt-3 grid gap-2">
                  {wizardQuestions[eligStep].options.map((o) => (
                    <button
                      key={o}
                      onClick={() => {
                        setEligAnswers((a) => ({ ...a, [wizardQuestions[eligStep].key]: o }));
                        if (eligStep < wizardQuestions.length - 1) setEligStep((s) => s + 1);
                        else evaluateEligibility();
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition",
                        eligAnswers[wizardQuestions[eligStep].key] === o
                          ? "border-primary-700 bg-primary-50 text-primary-800"
                          : "border-ink-200 hover:border-primary-400",
                      )}
                    >
                      {o}
                      <ArrowRight className="h-4 w-4 text-ink-300" aria-hidden />
                    </button>
                  ))}
                </div>
                {eligStep > 0 && (
                  <Button variant="ghost" size="sm" className="mt-3" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setEligStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-4 text-center">
                {(() => {
                  const eligible =
                    eligAnswers.land === "Yes" && eligAnswers.aadhaar === "Yes" && eligAnswers.crop === "Yes";
                  return (
                    <>
                      <span className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", eligible ? "bg-primary-100 text-primary-700" : "bg-saffron-100 text-saffron-600")}>
                        {eligible ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
                      </span>
                      <h3 className="mt-3 text-lg font-bold text-ink-900">
                        {eligible ? "You appear eligible ✓" : "Requirements missing"}
                      </h3>
                      <ul className="mx-auto mt-3 max-w-sm space-y-1.5 text-left text-sm">
                        {eligScheme.eligibility.map((e) => (
                          <li key={e} className="flex items-start gap-2 text-ink-700">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden /> {e}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-earth-100 px-3 py-1 text-xs font-semibold text-ink-500">
                        <Info className="h-3.5 w-3.5" aria-hidden /> Prototype simulation — not an official determination
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button variant="outline" onClick={() => setEligScheme(null)}>Close</Button>
                        {eligible && (
                          <Button onClick={() => { applyFor(eligScheme); setEligScheme(null); }} iconRight={<ArrowRight className="h-4 w-4" />}>
                            Apply now
                          </Button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );

  function applyFor(s: Scheme) {
    setAppliedIds((ids) => (ids.includes(s.id) ? ids : [...ids, s.id]));
    pushToast({
      kind: "success",
      title: "Application submitted",
      body: `${s.name} — application reference KSA-${Date.now().toString().slice(-6)} (simulated).`,
    });
  }
}
