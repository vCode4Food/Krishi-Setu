import { Star, MapPin, Video, Phone, MessageSquare, CarFront, CalendarPlus } from "lucide-react";
import type { Expert } from "@/types";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badges";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/format";

const modeIcons = {
  video: Video,
  audio: Phone,
  chat: MessageSquare,
  "on-site": CarFront,
} as const;

const modeLabels = {
  video: "Video",
  audio: "Audio",
  chat: "Chat",
  "on-site": "On-site",
} as const;

export function ExpertCard({ expert, onBook }: { expert: Expert; onBook: (e: Expert) => void }) {
  return (
    <Card hover className="flex h-full flex-col">
      <div className="flex gap-4 p-4">
        <img
          src={expert.image}
          alt={expert.name}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold text-ink-900">{expert.name}</h3>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-saffron-100 px-2 py-0.5 text-xs font-bold text-saffron-600">
              <Star className="h-3 w-3 fill-current" aria-hidden /> {expert.rating}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-primary-700">{expert.specialization}</p>
          <p className="mt-0.5 text-xs text-ink-500">
            {expert.experienceYears} yrs experience · {expert.reviews} consults
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {expert.location}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {expert.modes.map((m) => {
            const Icon = modeIcons[m];
            return (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-full bg-earth-100 px-2 py-1 text-[11px] font-semibold text-ink-700"
              >
                <Icon className="h-3 w-3" aria-hidden /> {modeLabels[m]}
              </span>
            );
          })}
          {expert.languages.map((l) => (
            <span key={l} className="rounded-full border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-500">
              {l}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
          <StatusBadge
            tone={expert.availableToday ? "green" : "gray"}
            label={expert.availableToday ? `Available today · ${expert.nextSlot}` : `Next: ${expert.nextSlot}`}
          />
          <Button
            size="sm"
            className={cn("!h-8 !px-3")}
            variant={expert.availableToday ? "primary" : "outline"}
            onClick={() => onBook(expert)}
            icon={<CalendarPlus className="h-3.5 w-3.5" />}
          >
            Book · ₹{expert.fee}
          </Button>
        </div>
      </div>
    </Card>
  );
}
