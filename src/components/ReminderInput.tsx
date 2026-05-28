import { LoaderCircle, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

import api from "../api/axios";
import { Reminder } from "../types";
import { useToast } from "./ui/toast";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

type Props = {
  onCreated: (reminder: Reminder) => void;
  googleCalendarConnected: boolean;
  onRequireCalendarConnect: () => void;
};

const examples = [
  "Follow up with Priya today 5pm",
  "Call Amit day after tomorrow 10am, amit@company.com",
  "Meet Rahul on Friday 6pm",
];

export function ReminderInput({
  onCreated,
  googleCalendarConnected,
  onRequireCalendarConnect,
}: Props) {
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({
    title: "",
    remind_at: "",
    client_email: "",
    client_name: "",
    client_message: "",
  });
  const { showToast } = useToast();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!rawInput.trim()) return;
    if (!googleCalendarConnected) {
      showToast("Connect Google Calendar before adding reminders", "info");
      onRequireCalendarConnect();
      return;
    }
    setLoading(true);
    setShowManual(false);
    try {
      const { data } = await api.post<Reminder>("/reminders", { raw_input: rawInput });
      onCreated(data);
      setRawInput("");
      setManual({ title: "", remind_at: "", client_email: "", client_name: "", client_message: "" });
      showToast("Reminder added! ✓", "success");
      if (data.client_email) {
        showToast("Client email will be sent at reminder time", "info");
      }
    } catch {
      setShowManual(true);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  async function submitManual() {
    if (!manual.title || !manual.remind_at) return;
    if (!googleCalendarConnected) {
      showToast("Connect Google Calendar before adding reminders", "info");
      onRequireCalendarConnect();
      return;
    }
    const { data } = await api.post<Reminder>("/reminders/manual", {
      raw_input: rawInput,
      ...manual,
    });
    onCreated(data);
    setRawInput("");
    setShowManual(false);
    setManual({ title: "", remind_at: "", client_email: "", client_name: "", client_message: "" });
    showToast("Reminder added! ✓", "success");
  }

  return (
    <Card className="p-5">
      {!googleCalendarConnected && (
        <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Google Calendar sync is required for PingMe reminders. Connect your calendar in Profile before adding tasks.
        </div>
      )}
      <form className="flex flex-col gap-4 md:flex-row" onSubmit={submit}>
        <Input
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          placeholder="Type a reminder... e.g. Follow up with Rahul tomorrow 3pm, rahul@company.com"
          className="flex-1"
        />
        <Button type="submit" className="md:min-w-40">
          {loading ? <LoaderCircle className="animate-spin" size={18} /> : "Add Reminder"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            className="inline-flex min-h-11 items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 text-sm text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200"
            onClick={() => setRawInput(example)}
            type="button"
          >
            <Sparkles size={14} className="mr-2" />
            {example}
          </button>
        ))}
      </div>
      {showManual && (
        <div className="mt-6 grid gap-3 rounded-3xl border border-dashed border-slate-300 p-4 dark:border-slate-700 md:grid-cols-2">
          <Input
            placeholder="Reminder title"
            value={manual.title}
            onChange={(event) => setManual((current) => ({ ...current, title: event.target.value }))}
          />
          <Input
            type="datetime-local"
            value={manual.remind_at}
            onChange={(event) => setManual((current) => ({ ...current, remind_at: event.target.value }))}
          />
          <Input
            placeholder="Client email"
            value={manual.client_email}
            onChange={(event) => setManual((current) => ({ ...current, client_email: event.target.value }))}
          />
          <Input
            placeholder="Client name"
            value={manual.client_name}
            onChange={(event) => setManual((current) => ({ ...current, client_name: event.target.value }))}
          />
          <Input
            placeholder="Follow-up message"
            className="md:col-span-2"
            value={manual.client_message}
            onChange={(event) => setManual((current) => ({ ...current, client_message: event.target.value }))}
          />
          <Button type="button" className="md:col-span-2" onClick={submitManual}>
            Save manually
          </Button>
        </div>
      )}
    </Card>
  );
}
