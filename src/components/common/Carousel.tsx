import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/format";
import { useCarousel } from "@/hooks/useCarousel";

export function Carousel({
  children,
  className,
  itemClassName,
  ariaLabel,
}: {
  children: ReactNode[];
  className?: string;
  /** Tailwind width classes applied to each slide, e.g. "w-[85%] sm:w-[46%] lg:w-[31%]" */
  itemClassName?: string;
  ariaLabel: string;
}) {
  const { trackRef, index, pages, next, prev } = useCarousel();
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={cn("relative", className)} role="region" aria-label={ariaLabel}>
      <div
        ref={trackRef}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {items.map((child, i) => (
          <div
            key={i}
            className={cn("shrink-0 snap-start", itemClassName ?? "w-[85%] sm:w-[47%] lg:w-[31.5%]")}
          >
            {child}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden>
              {Array.from({ length: pages }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-primary-600" : "w-1.5 bg-ink-200",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                disabled={index === 0}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:border-primary-500 hover:text-primary-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={next}
                disabled={index >= pages - 1}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:border-primary-500 hover:text-primary-700 disabled:opacity-40"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
