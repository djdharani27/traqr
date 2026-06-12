"use server";

import { clearUserCookie } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await clearUserCookie();
  redirect("/login");
}
