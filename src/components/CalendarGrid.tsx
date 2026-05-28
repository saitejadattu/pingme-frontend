import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Mail } from "lucide-react";

import { CalendarItem } from "../types";
import { cn } from "../lib/utils";

type Props = {
  currentMonth: Date;
  items: CalendarItem[];
  onSelectDate: (date: Date) => void;
};

export function CalendarGrid({ currentMonth, items, onSelectDate }: Props) {
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));
  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <div
            key={label}
            className="border-r border-slate-200 px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 last:border-r-0 dark:border-slate-800"
          >
          {label}
        </div>
      ))}
      </div>
      <div className="grid grid-cols-7">
      {days.map((calendarDay) => {
        const dayItems = items.filter((item) => isSameDay(new Date(item.start), calendarDay));
        return (
          <button
            key={calendarDay.toISOString()}
            onClick={() => onSelectDate(calendarDay)}
            className={cn(
              "min-h-36 border-r border-b border-slate-200 bg-white p-3 text-left align-top transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/20 dark:hover:bg-slate-900/40",
              !isSameMonth(calendarDay, currentMonth) && "opacity-40",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                  isSameDay(calendarDay, new Date())
                    ? "bg-indigo-500 text-white"
                    : "text-slate-700 dark:text-slate-200",
                )}
              >
                {format(calendarDay, "d")}
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {dayItems.slice(0, 3).map((item) => (
                <div
                  key={`${item.source}-${item.id}`}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
                    item.source === "google" || item.sync_source === "google"
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                      : item.is_done
                        ? "bg-slate-200 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-400"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
                  )}
                >
                  <span className="truncate">{item.title}</span>
                  {item.client_email && <Mail size={11} className="shrink-0" />}
                </div>
              ))}
              {dayItems.length > 3 && (
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  +{dayItems.length - 3} more
                </div>
              )}
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}
