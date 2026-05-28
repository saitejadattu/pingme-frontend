import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { CalendarGrid } from "../components/CalendarGrid";
import { ReminderInput } from "../components/ReminderInput";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";
import { useReminders } from "../hooks/useReminders";
import {
  clearCalendarRangeInFlight,
  getCalendarRangeCache,
  getCalendarRangeInFlight,
  setCalendarRangeCache,
  setCalendarRangeInFlight,
  upsertGoogleEventIntoCalendarRangeCaches,
  upsertReminderIntoCalendarRangeCaches,
} from "../lib/calendarRangeCache";
import { CalendarItem, CalendarRangeResponse, GoogleCalendarEvent, Reminder } from "../types";

function applyGoogleEventTruth(reminder: Reminder, event?: GoogleCalendarEvent): Reminder {
  if (!event) return reminder;
  return {
    ...reminder,
    title: event.title,
    remind_at: event.start,
  };
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { reminders, setReminders, loading } = useReminders(!user?.google_calendar_connected);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [rangeLoading, setRangeLoading] = useState(Boolean(user?.google_calendar_connected));

  useEffect(() => {
    async function fetchGoogleEvents() {
      if (!user?.google_calendar_connected) {
        setGoogleEvents([]);
        setRangeLoading(false);
        return;
      }
      const rangeStart = startOfWeek(startOfMonth(currentMonth)).toISOString();
      const rangeEnd = endOfWeek(endOfMonth(currentMonth)).toISOString();
      const cacheKey = `${rangeStart}:${rangeEnd}`;
      const cached = getCalendarRangeCache(cacheKey);
      if (cached) {
        setReminders(cached.reminders);
        setGoogleEvents(cached.events);
        setRangeLoading(false);
        return;
      }

      setRangeLoading(true);
      let request = getCalendarRangeInFlight(cacheKey);
      if (!request) {
        request = api
          .get<CalendarRangeResponse>("/google-calendar/range", {
            params: { date_from: rangeStart, date_to: rangeEnd },
          })
          .then((response) => response.data)
          .finally(() => clearCalendarRangeInFlight(cacheKey));
        setCalendarRangeInFlight(cacheKey, request);
      }
      const data = await request;
      setCalendarRangeCache(cacheKey, rangeStart, rangeEnd, data);
      setReminders(data.reminders);
      setGoogleEvents(data.events);
      setRangeLoading(false);
    }

    void fetchGoogleEvents();
  }, [currentMonth, user?.google_calendar_connected]);

  const rangeStart = startOfWeek(startOfMonth(currentMonth));
  const rangeEnd = endOfWeek(endOfMonth(currentMonth));
  const googleEventIds = useMemo(() => new Set(googleEvents.map((event) => event.id)), [googleEvents]);
  const googleEventsById = useMemo(
    () => new Map(googleEvents.map((event) => [event.id, event])),
    [googleEvents],
  );
  const syncedVisibleReminders = useMemo(
    () =>
      reminders.filter((reminder) => {
        if (!reminder.google_event_id) return true;
        const reminderDate = new Date(reminder.remind_at);
        const isVisible = isWithinInterval(reminderDate, { start: rangeStart, end: rangeEnd });
        if (!isVisible) return true;
        return googleEventIds.has(reminder.google_event_id);
      }),
    [googleEventIds, rangeEnd, rangeStart, reminders],
  );
  const mergedVisibleReminders = useMemo(
    () =>
      syncedVisibleReminders.map((reminder) =>
        applyGoogleEventTruth(
          reminder,
          reminder.google_event_id ? googleEventsById.get(reminder.google_event_id) : undefined,
        ),
      ),
    [googleEventsById, syncedVisibleReminders],
  );

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const reminderItems = mergedVisibleReminders.map((reminder) => ({
      id: `reminder-${reminder.id}`,
      reminder_id: reminder.id,
      title: reminder.title,
      start: reminder.remind_at,
      end: reminder.remind_at,
      source: "pingme" as const,
      sync_source: reminder.sync_source ?? "pingme",
      is_done: reminder.is_done,
      client_email: reminder.client_email,
      google_event_id: reminder.google_event_id,
      is_all_day: false,
    }));
    const reminderGoogleIds = new Set(
      mergedVisibleReminders.map((reminder) => reminder.google_event_id).filter(Boolean),
    );
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
  }, [googleEvents, mergedVisibleReminders]);

  const sortedReminders = useMemo(
    () =>
      [...mergedVisibleReminders].sort(
        (a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime(),
      ),
    [mergedVisibleReminders],
  );

  function handleCreated(reminder: Reminder) {
    setReminders((current) =>
      [...current, reminder].sort(
        (a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime(),
      ),
    );
    upsertReminderIntoCalendarRangeCaches(reminder);
    if (reminder.google_event_id) {
      const createdGoogleEvent: GoogleCalendarEvent = {
        id: reminder.google_event_id,
        title: reminder.title,
        start: reminder.remind_at,
        end: reminder.remind_at,
        is_all_day: false,
        source: "google",
      };
      setGoogleEvents((current) =>
        [...current.filter((event) => event.id !== createdGoogleEvent.id), createdGoogleEvent].sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        ),
      );
      upsertGoogleEventIntoCalendarRangeCaches(createdGoogleEvent);
    }
  }

  async function markDone(id: string) {
    const { data } = await api.patch<Reminder>(`/reminders/${id}/done`);
    setReminders((current) => current.map((item) => (item.id === id ? data : item)));
    showToast("Marked as done ✓", "info");
  }

  async function deleteReminder(id: string) {
    await api.delete(`/reminders/${id}`);
    setReminders((current) => current.filter((item) => item.id !== id));
    showToast("Reminder deleted", "muted");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <ReminderInput
        onCreated={handleCreated}
        googleCalendarConnected={Boolean(user?.google_calendar_connected)}
        onRequireCalendarConnect={() => navigate("/profile")}
      />
      <Card className="p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11 w-11 rounded-full p-0" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="outline" className="h-11 w-11 rounded-full p-0" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h1>
          </div>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </div>
        {loading || rangeLoading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">Loading calendar events...</div>
        ) : (
          <CalendarGrid
            currentMonth={currentMonth}
            items={calendarItems}
            onSelectDate={(date) => navigate(`/day/${format(date, "yyyy-MM-dd")}`)}
          />
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {sortedReminders.slice(0, 4).map((reminder) => (
          <Card key={reminder.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{reminder.title}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {format(new Date(reminder.remind_at), "dd MMM, h:mm a")}
                </div>
                {reminder.sync_source === "google" && (
                  <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                    Synced from Google Calendar
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!reminder.is_done && (
                  <Button variant="ghost" onClick={() => markDone(reminder.id)}>
                    Done
                  </Button>
                )}
                <Button variant="ghost" className="text-rose-500" onClick={() => deleteReminder(reminder.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
