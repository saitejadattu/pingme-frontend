import { BellRing, CalendarDays } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../api/axios";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });

  useEffect(() => {
    setForm({ name: user?.name || "", phone: user?.phone || "" });
  }, [user]);

  useEffect(() => {
    if (searchParams.get("google") === "connected") {
      void refreshProfile();
      showToast("Google Calendar connected", "success");
    }
  }, [refreshProfile, searchParams, showToast]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const { data } = await api.patch("/profile", form);
    await refreshProfile();
    showToast("Profile updated! ✓", "success");
    return data;
  }

  async function connectGoogle() {
    const { data } = await api.get<{ auth_url: string }>("/google-calendar/connect");
    window.location.href = data.auth_url;
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex w-full max-w-xs flex-col items-center justify-center rounded-3xl bg-indigo-50 p-8 text-center dark:bg-indigo-500/10">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500 text-3xl font-semibold text-white">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <h1 className="mt-4 text-2xl font-semibold">{user.name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-indigo-700 dark:bg-slate-900 dark:text-indigo-200">
              <BellRing size={14} />
              Verified account
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <CalendarDays size={14} />
              {user.google_calendar_connected ? "Google Calendar sync connected" : "Email calendar invites enabled by default"}
            </div>
          </div>
          <form className="flex-1 space-y-4" onSubmit={saveProfile}>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
            />
            <Input value={user.email} readOnly placeholder="Email" />
            <Input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Phone"
            />
            <Card className="border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              {user.google_calendar_connected
                ? "PingMe already connected your Google Calendar during Google sign-in. New reminders will sync directly to your personal calendar."
                : "PingMe uses Google Calendar as the source of truth. If you signed up with email and password, connect Google Calendar once here to sync reminders directly into your personal calendar."}
            </Card>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Save</Button>
              {!user.google_calendar_connected ? (
                <Button type="button" variant="outline" onClick={connectGoogle}>
                  <CalendarDays size={16} className="mr-2" />
                  Connect Google Calendar
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
