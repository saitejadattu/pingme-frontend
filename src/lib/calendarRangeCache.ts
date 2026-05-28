import { GoogleCalendarEvent, Reminder } from "../types";

export type CalendarRangeResponse = {
  reminders: Reminder[];
  events: GoogleCalendarEvent[];
};

type CacheEntry = {
  key: string;
  start: string;
  end: string;
  data: CalendarRangeResponse;
  timestamp: number;
};

const TTL_MS = 30_000;
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CalendarRangeResponse>>();

export function getCalendarRangeCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCalendarRangeCache(key: string, start: string, end: string, data: CalendarRangeResponse) {
  cache.set(key, {
    key,
    start,
    end,
    data,
    timestamp: Date.now(),
  });
}

export function getCalendarRangeInFlight(key: string) {
  return inFlight.get(key) ?? null;
}

export function setCalendarRangeInFlight(key: string, request: Promise<CalendarRangeResponse>) {
  inFlight.set(key, request);
}

export function clearCalendarRangeInFlight(key: string) {
  inFlight.delete(key);
}

export function findCalendarRangeContaining(start: string, end: string) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  for (const entry of cache.values()) {
    if (Date.now() - entry.timestamp > TTL_MS) continue;
    const entryStart = new Date(entry.start).getTime();
    const entryEnd = new Date(entry.end).getTime();
    if (entryStart <= startTime && entryEnd >= endTime) {
      return entry.data;
    }
  }

  return null;
}

export function upsertReminderIntoCalendarRangeCaches(reminder: Reminder) {
  const reminderTime = new Date(reminder.remind_at).getTime();

  for (const entry of cache.values()) {
    if (Date.now() - entry.timestamp > TTL_MS) continue;
    const entryStart = new Date(entry.start).getTime();
    const entryEnd = new Date(entry.end).getTime();
    if (entryStart <= reminderTime && entryEnd >= reminderTime) {
      const reminders = [
        ...entry.data.reminders.filter((item) => item.id !== reminder.id),
        reminder,
      ].sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime());
      entry.data = {
        ...entry.data,
        reminders,
      };
      entry.timestamp = Date.now();
    }
  }
}

export function upsertGoogleEventIntoCalendarRangeCaches(event: GoogleCalendarEvent) {
  const eventTime = new Date(event.start).getTime();

  for (const entry of cache.values()) {
    if (Date.now() - entry.timestamp > TTL_MS) continue;
    const entryStart = new Date(entry.start).getTime();
    const entryEnd = new Date(entry.end).getTime();
    if (entryStart <= eventTime && entryEnd >= eventTime) {
      const events = [
        ...entry.data.events.filter((item) => item.id !== event.id),
        event,
      ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      entry.data = {
        ...entry.data,
        events,
      };
      entry.timestamp = Date.now();
    }
  }
}
