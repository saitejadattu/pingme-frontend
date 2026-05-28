import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Card } from "../components/ui/card";
import { useToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { setOAuthAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const isVerified = searchParams.get("is_verified");

    if (!token || !id || !name || !email) {
      showToast("Google sign-in failed", "error");
      navigate("/login");
      return;
    }

    setOAuthAuth(token, {
      id,
      name,
      email,
      phone: phone || null,
      is_verified: isVerified === "true",
    });
  }, [navigate, searchParams, setOAuthAuth, showToast]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-semibold">Signing you in</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Completing your Google authentication...
        </p>
      </Card>
    </div>
  );
}
