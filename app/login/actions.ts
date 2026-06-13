"use server";

import { setUserCookie } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Please enter your name" };
  }
  try {
    await setUserCookie(name.trim());
  } catch {
    return { error: "Something went wrong. Try a different name." };
  }
  redirect("/");
}
