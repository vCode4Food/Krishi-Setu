import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" role="status" aria-label="Loading">
      <div className="relative">
        <BrandLogo className="h-9 w-9 rounded-xl bg-white object-contain p-0.5 shadow-soft ring-1 ring-primary-100" />
        <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-saffron-400" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-ink-500">Loading KrushiSetu…</p>
    </div>
  );
}
