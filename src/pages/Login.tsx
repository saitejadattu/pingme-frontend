import { Bell } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/toast";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const googleError = searchParams.get("google_error");
    if (googleError === "access_denied") {
      showToast("Google sign-in was cancelled", "muted");
    } else if (googleError) {
      showToast("Google sign-in failed", "error");
    }
  }, [searchParams, showToast]);

  const googleLoginUrl = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/google/login`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500 text-white shadow-glow">
            <Bell size={28} />
          </div>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage reminders, follow-ups, and calendar sync.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
        <a href={googleLoginUrl}>
          <Button className="w-full" variant="outline" type="button">
            Continue with Google
          </Button>
        </a>
        <p className="mt-2 text-center text-xs text-slate-400">
          Google sign-in also grants calendar access for reminder sync.
        </p>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
