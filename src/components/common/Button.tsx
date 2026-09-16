import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/format";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "amber";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-soft disabled:bg-primary-700/40",
  secondary:
    "bg-primary-100 text-primary-800 hover:bg-primary-200 disabled:opacity-50",
  outline:
    "border border-ink-200 bg-white text-ink-900 hover:border-primary-500 hover:text-primary-700 disabled:opacity-50",
  ghost: "text-ink-700 hover:bg-primary-50 hover:text-primary-800 disabled:opacity-50",
  danger: "bg-alert-600 text-white hover:bg-alert-700 shadow-soft disabled:opacity-50",
  amber: "bg-saffron-400 text-ink-900 hover:bg-saffron-300 shadow-soft disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-500",
        "disabled:cursor-not-allowed active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  );
}
