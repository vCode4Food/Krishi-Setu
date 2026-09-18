import logoUrl from "@/assets/krushisetu-logo.png";
import { cn } from "@/utils/format";

/**
 * KrushiSetu brand mark (official logo).
 * The artwork ships with a transparent background, so it composites on any
 * surface. On dark backgrounds pass a light tile class (e.g. "bg-white/10")
 * so the deep-green leaf keeps contrast.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("select-none object-contain", className)}
    />
  );
}
