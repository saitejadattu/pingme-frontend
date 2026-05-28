import { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/60 bg-white/80 shadow-glow backdrop-blur dark:border-slate-800 dark:bg-slate-900/75",
        className,
      )}
      {...props}
    />
  );
}
