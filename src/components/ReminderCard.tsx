import { Mail, Trash2, CheckCircle2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { FormEvent, useState } from "react";

import { Reminder } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";
import { Input } from "./ui/input";

type Props = {
  reminder: Reminder;
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, payload: ReminderEditPayload) => Promise<void>;
};

export type ReminderEditPayload = {
  title: string;
  remind_at: string;
  client_email?: string | null;
  client_name?: string | null;
  client_topic?: string | null;
  client_message?: string | null;
};

export function ReminderCard({ reminder, onDone, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: reminder.title,
    remind_at: format(new Date(reminder.remind_at), "yyyy-MM-dd'T'HH:mm"),
    client_email: reminder.client_email ?? "",
    client_name: reminder.client_name ?? "",
    client_topic: reminder.client_topic ?? "",
    client_message: reminder.client_message ?? "",
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onEdit(reminder.id, {
        title: form.title,
        remind_at: new Date(form.remind_at).toISOString(),
        client_email: form.client_email || null,
        client_name: form.client_name || null,
        client_topic: form.client_topic || null,
        client_message: form.client_message || null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          "flex items-start gap-4 border-l-4 p-5",
          reminder.is_done ? "border-slate-400" : "border-indigo-500",
        )}
      >
        <div className="flex-1">
          {editing ? (
            <form className="space-y-3" onSubmit={submit}>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <Input
                type="datetime-local"
                value={form.remind_at}
                onChange={(event) => setForm((current) => ({ ...current, remind_at: event.target.value }))}
              />
              <Input
                placeholder="Client email"
                value={form.client_email}
                onChange={(event) => setForm((current) => ({ ...current, client_email: event.target.value }))}
              />
              <Input
                placeholder="Client name"
                value={form.client_name}
                onChange={(event) => setForm((current) => ({ ...current, client_name: event.target.value }))}
              />
              <Input
                placeholder="Discussion topic"
                value={form.client_topic}
                onChange={(event) => setForm((current) => ({ ...current, client_topic: event.target.value }))}
              />
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-950"
                placeholder="Follow-up message"
                value={form.client_message}
                onChange={(event) => setForm((current) => ({ ...current, client_message: event.target.value }))}
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
              <div className={cn("text-lg font-semibold", reminder.is_done && "text-slate-400 line-through")}>
                {reminder.title}
              </div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {format(new Date(reminder.remind_at), "h:mm a")}
              </div>
              {reminder.sync_source === "google" && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                  Google Calendar
                </div>
              )}
              {reminder.client_email && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                  <Mail size={12} />
                  {reminder.client_email}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-11 w-11 rounded-full p-0" onClick={() => setEditing((current) => !current)}>
            <Pencil size={18} />
          </Button>
          <Button variant="ghost" className="h-11 w-11 rounded-full p-0" onClick={() => onDone(reminder.id)}>
            <CheckCircle2 size={18} />
          </Button>
          <Button variant="ghost" className="h-11 w-11 rounded-full p-0 text-rose-500" onClick={() => onDelete(reminder.id)}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
