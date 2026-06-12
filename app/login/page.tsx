"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

const AUTH_ERROR_MAP: Record<string, string> = {
  "auth/unauthorized-domain":
    "This domain is not authorized for sign-in. Add it in Firebase Console > Authentication > Settings.",
  "auth/popup-blocked":
    "Sign-in popup was blocked. Please allow popups for this site.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/cancelled-popup-request":
    "Sign-in popup was dismissed.",
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string" && AUTH_ERROR_MAP[err]) return AUTH_ERROR_MAP[err];
  const code = (err as { code?: string })?.code;
  if (code && AUTH_ERROR_MAP[code]) return AUTH_ERROR_MAP[code];
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred. Please try again.";
}

export default function LoginPage() {
  const { user, loading, error, signIn, clearError } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleSignIn() {
    setSigningIn(true);
    clearError();
    try {
      await signIn();
      router.push("/");
    } catch {
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center justify-center size-12 rounded-full bg-blue-500/10">
            <GraduationCap className="size-6 text-blue-500" />
          </div>
          <CardTitle className="text-xl">Sign in to Traqr</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your exam preparation
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full gap-3"
            size="lg"
            onClick={handleSignIn}
            disabled={loading || signingIn}
          >
            <svg viewBox="0 0 24 24" className="size-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{getErrorMessage(error)}</span>
            </div>
          )}
          {loading && (
            <p className="text-center text-sm text-muted-foreground">
              Checking session...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
