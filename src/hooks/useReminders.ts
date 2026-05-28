import { useEffect, useState } from "react";

import api from "../api/axios";
import { Reminder } from "../types";

export function useReminders(enabled = true) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(enabled);

  async function fetchReminders() {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<Reminder[]>("/reminders");
      setReminders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void fetchReminders();
  }, [enabled]);

  return {
    reminders,
    loading,
    setReminders,
    refresh: fetchReminders,
  };
}
