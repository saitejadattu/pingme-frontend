import { useEffect, useState } from "react";

import api from "../api/axios";
import { Reminder } from "../types";

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReminders() {
    setLoading(true);
    try {
      const { data } = await api.get<Reminder[]>("/reminders");
      setReminders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchReminders();
  }, []);

  return {
    reminders,
    loading,
    setReminders,
    refresh: fetchReminders,
  };
}
