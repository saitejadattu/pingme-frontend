import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import { cn } from "../../lib/utils";

type ToastTone = "success" | "error" | "info" | "muted";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

const toastStyles: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100",
  error: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-100",
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/70 dark:text-sky-100",
  muted: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
};

const ToastContext = createContext<{
  showToast: (message: string, tone?: ToastTone) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      showToast: (message: string, tone: ToastTone = "muted") => {
        const id = Date.now() + Math.random();
        setToasts((current) => [...current, { id, message, tone }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3000);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur animate-[slideUp_.2s_ease-out]",
              toastStyles[toast.tone],
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
