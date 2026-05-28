import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "../../lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  default:
    "bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400",
  outline:
    "border border-slate-200 bg-white/70 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className, variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
      variants[variant],
      className,
    )}
    {...props}
  />
));

Button.displayName = "Button";
