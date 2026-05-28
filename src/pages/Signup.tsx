import { Bell } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [success, setSuccess] = useState(false);
  const googleLoginUrl = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/google/login`;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await signup(form);
      setSuccess(true);
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Something went wrong", "error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500 text-white shadow-glow">
            <Bell size={28} />
          </div>
          <h1 className="text-3xl font-semibold">Create your PingMe account</h1>
        </div>
        {success ? (
          <Card className="border-indigo-100 bg-indigo-50/90 p-6 text-center dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-200">
              Check your email to verify your account
            </h2>
          </Card>
        ) : (
          <>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="md:col-span-2"
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="md:col-span-2"
              />
              <Input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
              <Input
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
              <Button className="md:col-span-2" type="submit">
                Create account
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
              Google sign-in also connects your calendar for direct event sync.
            </p>
          </>
        )}
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
