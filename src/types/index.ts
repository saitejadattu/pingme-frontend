export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  is_verified: boolean;
  google_calendar_connected?: boolean;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  raw_input: string;
  remind_at: string;
  is_done: boolean;
  email_sent: boolean;
  client_email?: string | null;
  client_name?: string | null;
  client_topic?: string | null;
  client_message?: string | null;
  client_email_sent: boolean;
  calendar_invite_sent?: boolean;
  google_event_id?: string | null;
  sync_source?: "pingme" | "google";
  created_at: string;
};

export type GoogleCalendarEvent = {
  id: string;
  title: string;
  description?: string | null;
  start: string;
  end?: string | null;
  is_all_day: boolean;
  source: "google";
};

export type CalendarRangeResponse = {
  reminders: Reminder[];
  events: GoogleCalendarEvent[];
};

export type CalendarItem = {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  source: "pingme" | "google";
  sync_source?: "pingme" | "google";
  is_done?: boolean;
  client_email?: string | null;
  client_name?: string | null;
  client_topic?: string | null;
  client_message?: string | null;
  reminder_id?: string;
  google_event_id?: string | null;
  is_all_day?: boolean;
};

export type AuthResponse = {
  access_token: string;
  user: User;
};
