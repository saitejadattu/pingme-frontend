import { addDays, format, isSameDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import { DayViewPanel } from "../components/DayViewPanel";
import { useToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";
import { useReminders } from "../hooks/useReminders";
import { CalendarItem, GoogleCalendarEvent, Reminder } from "../types";

function applyGoogleEventTruth(reminder: Reminder, event?: GoogleCalendarEvent): Reminder {
  if (!event) return reminder;
  return {
    ...reminder,
    title: event.title,
    remind_at: event.start,
  };
}

export default function DayView() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { reminders, setReminders } = useReminders();
  const { showToast } = useToast();
  const { user } = useAuth();
  const selectedDate = date ? new Date(`${date}T00:00:00`) : new Date();
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);

  useEffect(() => {
    async function fetchGoogleEvents() {
      if (!user?.google_calendar_connected) {
        setGoogleEvents([]);
        return;
      }
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      const { data: syncedReminders } = await api.post<Reminder[]>("/google-calendar/sync", null, {
        params: { date_from: start.toISOString(), date_to: end.toISOString() },
      });
      setReminders(syncedReminders);
      const { data } = await api.get<GoogleCalendarEvent[]>("/google-calendar/events", {
        params: { date_from: start.toISOString(), date_to: end.toISOString() },
      });
      setGoogleEvents(data);
    }

    void fetchGoogleEvents();
  }, [selectedDate, user?.google_calendar_connected]);

  const googleEventIds = useMemo(() => new Set(googleEvents.map((event) => event.id)), [googleEvents]);
  const googleEventsById = useMemo(
    () => new Map(googleEvents.map((event) => [event.id, event])),
    [googleEvents],
  );
  const syncedDayReminders = useMemo(
    () =>
      reminders
        .filter((item) => isSameDay(new Date(item.remind_at), selectedDate))
        .filter((item) => !item.google_event_id || googleEventIds.has(item.google_event_id)),
    [googleEventIds, reminders, selectedDate],
  );
  const mergedDayReminders = useMemo(
    () =>
      syncedDayReminders.map((reminder) =>
        applyGoogleEventTruth(
          reminder,
          reminder.google_event_id ? googleEventsById.get(reminder.google_event_id) : undefined,
        ),
      ),
    [googleEventsById, syncedDayReminders],
  );

  const dayItems = useMemo<CalendarItem[]>(() => {
    const reminderItems = mergedDayReminders.map((item) => ({
        id: `reminder-${item.id}`,
        reminder_id: item.id,
        title: item.title,
        start: item.remind_at,
        end: item.remind_at,
        source: "pingme" as const,
        sync_source: item.sync_source ?? "pingme",
        is_done: item.is_done,
        client_email: item.client_email,
        client_name: item.client_name,
        client_topic: item.client_topic,
        client_message: item.client_message,
        google_event_id: item.google_event_id,
        is_all_day: false,
      }));
    const reminderGoogleIds = new Set(reminderItems.map((item) => item.google_event_id).filter(Boolean));
    const googleOnlyItems = googleEvents
      .filter((event) => !reminderGoogleIds.has(event.id))
      .map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end ?? event.start,
        source: "google" as const,
        is_all_day: event.is_all_day,
      }));
    return [...reminderItems, ...googleOnlyItems].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  }, [googleEvents, mergedDayReminders]);

  async function onDone(id: string) {
    const { data } = await api.patch<Reminder>(`/reminders/${id}/done`);
    setReminders((current) => current.map((item) => (item.id === id ? data : item)));
    showToast("Marked as done ✓", "info");
  }

  async function onDelete(id: string) {
    await api.delete(`/reminders/${id}`);
    setReminders((current) => current.filter((item) => item.id !== id));
    showToast("Reminder deleted", "muted");
  }

  async function onEdit(
    id: string,
    payload: {
      title: string;
      remind_at: string;
      client_email?: string | null;
      client_name?: string | null;
      client_topic?: string | null;
      client_message?: string | null;
    },
  ) {
    const { data } = await api.patch<Reminder>(`/reminders/${id}`, payload);
    setReminders((current) => current.map((item) => (item.id === id ? data : item)));
    showToast("Reminder updated! ✓", "success");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <DayViewPanel
        date={selectedDate}
        items={dayItems}
        onBack={() => navigate("/")}
        onPrev={() => navigate(`/day/${format(addDays(selectedDate, -1), "yyyy-MM-dd")}`)}
        onNext={() => navigate(`/day/${format(addDays(selectedDate, 1), "yyyy-MM-dd")}`)}
        onDone={onDone}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
}
