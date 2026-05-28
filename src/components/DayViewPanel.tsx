import { addDays, format } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { CalendarItem } from "../types";
import { GoogleEventCard } from "./GoogleEventCard";
import { ReminderCard, ReminderEditPayload } from "./ReminderCard";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

type Props = {
  date: Date;
  items: CalendarItem[];
  loading?: boolean;
  onBack?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, payload: ReminderEditPayload) => Promise<void>;
  onEditGoogle: (id: string, payload: { title: string; start: string; end: string; is_all_day: boolean }) => Promise<void>;
  onDeleteGoogle: (id: string) => Promise<void>;
};

export function DayViewPanel({ date, items, loading = false, onBack, onPrev, onNext, onDone, onDelete, onEdit, onEditGoogle, onDeleteGoogle }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back to Calendar
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-semibold">{format(date, "EEEE, d MMMM yyyy")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {items.length} event{items.length === 1 ? "" : "s"} scheduled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11 w-11 rounded-full p-0" onClick={onPrev}>
            <ArrowLeft size={18} />
          </Button>
          <Button variant="outline" className="h-11 w-11 rounded-full p-0" onClick={onNext}>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
      {loading ? (
        <Card className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-xl font-semibold">Loading events...</div>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Fetching Google Calendar events and PingMe reminders for this day.
          </p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-6xl">🗓️</div>
          <div className="text-xl font-semibold">Nothing on this day yet</div>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Google Calendar events and PingMe reminders will appear together here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            if (item.sync_source === "google" && item.google_event_id) {
              return (
                <GoogleEventCard
                  key={item.id}
                  event={{
                    id: item.google_event_id,
                    title: item.title,
                    start: item.start,
                    end: item.end,
                    is_all_day: Boolean(item.is_all_day),
                    source: "google",
                  }}
                  onEdit={onEditGoogle}
                  onDelete={onDeleteGoogle}
                />
              );
            }

            if (item.reminder_id) {
              return (
                <ReminderCard
                  key={item.id}
                  reminder={{
                    id: item.reminder_id,
                    user_id: "",
                    title: item.title,
                    raw_input: "",
                    remind_at: item.start,
                    is_done: Boolean(item.is_done),
                    email_sent: false,
                    client_email: item.client_email ?? null,
                    client_name: item.client_name ?? null,
                    client_topic: item.client_topic ?? null,
                    client_message: item.client_message ?? null,
                    client_email_sent: false,
                    sync_source: item.sync_source ?? "pingme",
                    created_at: item.start,
                  }}
                  onDone={onDone}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              );
            }

            return (
              <GoogleEventCard
                key={item.id}
                event={{
                  id: item.id,
                  title: item.title,
                  start: item.start,
                  end: item.end,
                  is_all_day: Boolean(item.is_all_day),
                  source: "google",
                }}
                onEdit={onEditGoogle}
                onDelete={onDeleteGoogle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
