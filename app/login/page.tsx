"use client";

import { useState, useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const initialState: LoginState = {};

export default function LoginPage() {
  const [name, setName] = useState("");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center justify-center size-12 rounded-full bg-blue-500/10">
            <GraduationCap className="size-6 text-blue-500" />
          </div>
          <CardTitle className="text-xl">Welcome to Traqr</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your name to get started
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Rahul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {state.error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={!name.trim() || isPending}
            >
              {isPending ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
