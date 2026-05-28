import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const token = searchParams.get("token") || "";

  useEffect(() => {
    async function run() {
      try {
        await verifyEmail(token);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    if (token) {
      void run();
    } else {
      setStatus("error");
    }
  }, [token, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-semibold">Verify Email</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {status === "loading" && "Verifying your email..."}
          {status === "success" && "Email verified! You can now login"}
          {status === "error" && "Invalid or expired link"}
        </p>
        <Link to="/login">
          <Button className="mt-6 w-full">Go to login</Button>
        </Link>
      </Card>
    </div>
  );
}
