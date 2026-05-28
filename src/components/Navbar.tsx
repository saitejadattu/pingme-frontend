import { Bell, ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-glow">
            <Bell size={20} />
          </div>
          <div>
            <div className="text-lg font-semibold">PingMe</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Smart reminders for client follow-ups
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {location.pathname !== "/login" && location.pathname !== "/signup" && <ThemeToggle />}
          {user && (
            <div className="relative">
              <Button variant="outline" className="gap-2 rounded-full" onClick={() => setOpen(!open)}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                  {user.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <ChevronDown size={16} />
              </Button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <Link
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    to="/profile"
                    onClick={() => setOpen(false)}
                  >
                    <UserCircle2 size={16} />
                    Profile
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={logout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
