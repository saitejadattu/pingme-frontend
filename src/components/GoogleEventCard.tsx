import { format } from "date-fns";
import { FormEvent, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { GoogleCalendarEvent } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

type GoogleEventEditPayload = {
  title: string;
  start: string;
  end: string;
  is_all_day: boolean;
};

type Props = {
  event: GoogleCalendarEvent;
  onEdit: (id: string, payload: GoogleEventEditPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function toDateTimeLocal(value: string) {
  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}

function toDateOnly(value: string) {
  const [datePart] = value.split("T");
  return datePart;
}

function addOneDay(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return format(date, "yyyy-MM-dd");
}

export function GoogleEventCard({ event, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: event.title,
    start: event.is_all_day ? toDateOnly(event.start) : toDateTimeLocal(event.start),
    end: event.end
      ? event.is_all_day
        ? toDateOnly(event.end)
        : toDateTimeLocal(event.end)
      : event.is_all_day
        ? addOneDay(toDateOnly(event.start))
        : toDateTimeLocal(event.start),
  });

  async function submit(formEvent: FormEvent) {
    formEvent.preventDefault();
    setSaving(true);
    try {
      await onEdit(event.id, {
        title: form.title,
        start: event.is_all_day ? form.start : new Date(form.start).toISOString(),
        end: event.is_all_day ? form.end : new Date(form.end).toISOString(),
        is_all_day: event.is_all_day,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-4 border-l-4 border-emerald-500 p-5">
        <div className="flex-1">
          {editing ? (
            <form className="space-y-3" onSubmit={submit}>
              <Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
              <Input
                type={event.is_all_day ? "date" : "datetime-local"}
                value={form.start}
                onChange={(e) => setForm((current) => ({ ...current, start: e.target.value }))}
              />
              <Input
                type={event.is_all_day ? "date" : "datetime-local"}
                value={form.end}
                onChange={(e) => setForm((current) => ({ ...current, end: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="text-lg font-semibold">{event.title}</div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {event.is_all_day ? "All day" : format(new Date(event.start), "h:mm a")}
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                Google Calendar
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-11 w-11 rounded-full p-0" onClick={() => setEditing((current) => !current)}>
            <Pencil size={18} />
          </Button>
          <Button variant="ghost" className="h-11 w-11 rounded-full p-0 text-rose-500" onClick={() => void onDelete(event.id)}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
