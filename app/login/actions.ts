"use server";

import { setUserCookie } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name || !name.trim()) return;
  await setUserCookie(name.trim());
  redirect("/");
}
