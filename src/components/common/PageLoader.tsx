import { Loader2, Sprout } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" role="status" aria-label="Loading">
      <div className="relative">
        <Sprout className="h-8 w-8 text-primary-600" aria-hidden />
        <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-saffron-400" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-ink-500">Loading KrushiSetu…</p>
    </div>
  );
}
