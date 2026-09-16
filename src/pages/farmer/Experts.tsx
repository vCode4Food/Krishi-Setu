import { useState } from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { experts, consultationDates, consultationTimes, consultationModeLabels } from "@/data/experts";
import type { Expert } from "@/types";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ExpertCard } from "@/components/farmer/ExpertCard";
import { Carousel } from "@/components/common/Carousel";
import { StatusBadge } from "@/components/common/Badges";
import { cn } from "@/utils/format";
import { formatINR } from "@/utils/format";

type Booking = { expert: Expert; date: string; time: string; mode: string } | null;

export default function Experts() {
  const { pushToast, pushNotification } = useApp();
  const [booking, setBooking] = useState<Booking>(null);
  const [expert, setExpert] = useState<Expert | null>(null);
  const [date, setDate] = useState(consultationDates[0]);
  const [time, setTime] = useState<string | null>(null);
  const [mode, setMode] = useState<string>("video");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openBooking = (e: Expert) => {
    setExpert(e);
    setDate(consultationDates[0]);
    setTime(null);
    setMode(e.modes[0]);
    setConfirmed(false);
  };

  const confirm = async () => {
    if (!expert || !time) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setBooking({ expert, date, time, mode });
    setSubmitting(false);
    setConfirmed(true);
    pushToast({
      kind: "success",
      title: "Consultation booked",
      body: `${expert.name} · ${date} at ${time} (${consultationModeLabels[mode]})`,
    });
    pushNotification({
      type: "expert-consultation",
      title: `Consultation confirmed — ${expert.name}`,
      body: `${date} at ${time} · ${consultationModeLabels[mode]}. Join link activates 5 minutes before start.`,
      actor: "farmer",
    });
  };

  return (
    <div>
      <PageHeader
        title="Agricultural Experts"
        description="Book video, audio or on-site consultations with verified agronomy, pest and market experts."
      />

      <section className="mb-8">
        <Carousel ariaLabel="Available experts" itemClassName="w-[92%] sm:w-[47%] lg:w-[31.5%]">
          {experts.map((e) => (
            <ExpertCard key={e.id} expert={e} onBook={openBooking} />
          ))}
        </Carousel>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {experts.map((e) => (
          <ExpertCard key={e.id} expert={e} onBook={openBooking} />
        ))}
      </div>

      {/* Booking modal */}
      <Modal
        open={!!expert}
        onClose={() => setExpert(null)}
        title={confirmed ? "Booking Confirmed" : `Book · ${expert?.name ?? ""}`}
        size="md"
      >
        {expert && !confirmed && (
          <div>
            <div className="flex items-center gap-3 rounded-2xl bg-earth-50 p-3">
              <img src={expert.image} alt={expert.name} className="h-14 w-14 rounded-xl object-cover" />
              <div>
                <p className="font-bold text-ink-900">{expert.name}</p>
                <p className="text-xs font-semibold text-primary-700">{expert.specialization}</p>
                <StatusBadge tone={expert.availableToday ? "green" : "gray"} label={expert.availableToday ? "Available today" : `Next: ${expert.nextSlot}`} />
              </div>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-400">1 · Date</p>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {consultationDates.map((d) => (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  className={cn(
                    "whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
                    date === d ? "border-primary-700 bg-primary-700 text-white" : "border-ink-200 hover:border-primary-400",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-400">2 · Time</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {consultationTimes.map((t, i) => {
                const taken = !expert.availableToday && i === 0;
                return (
                  <button
                    key={t}
                    disabled={taken}
                    onClick={() => setTime(t)}
                    className={cn(
                      "rounded-xl border py-2.5 text-sm font-semibold transition",
                      taken
                        ? "cursor-not-allowed border-ink-100 bg-earth-100 text-ink-300"
                        : time === t
                          ? "border-primary-700 bg-primary-700 text-white"
                          : "border-ink-200 hover:border-primary-400",
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-400">3 · Consultation type</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {expert.modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                    mode === m ? "border-primary-700 bg-primary-50 text-primary-800" : "border-ink-200 hover:border-primary-400",
                  )}
                >
                  {consultationModeLabels[m]}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3 text-sm">
              <span className="font-semibold text-ink-700">Consultation fee</span>
              <span className="font-display text-lg font-extrabold text-primary-800">{formatINR(expert.fee)}</span>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExpert(null)}>Cancel</Button>
              <Button disabled={!time} loading={submitting} onClick={confirm} icon={<CalendarCheck className="h-4 w-4" />}>
                Confirm booking
              </Button>
            </div>
          </div>
        )}

        {expert && confirmed && booking && (
          <div className="py-4 text-center">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary-600" aria-hidden />
            </motion.div>
            <h3 className="mt-3 text-xl font-bold text-ink-900">Consultation confirmed!</h3>
            <p className="mt-1 text-sm text-ink-500">
              {booking.expert.name} · {booking.date} at {booking.time} · {consultationModeLabels[booking.mode]}
            </p>
            <p className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-xs font-semibold text-primary-900">
              A join link and reminder will appear in your notifications. (Prototype — no real video call is scheduled.)
            </p>
            <Button className="mt-4" variant="outline" onClick={() => setExpert(null)}>Done</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
