import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "traqr-user";

export interface AuthUser {
  uid: string;
  name: string;
}

function sanitize(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 50);
}

export async function setUserCookie(name: string): Promise<AuthUser> {
  const uid = sanitize(name);
  if (!uid) throw new Error("Name cannot be empty");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  return { uid, name: name.trim() };
}

export async function clearUserCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const uid = cookieStore.get(COOKIE_NAME)?.value;
  if (!uid) return null;
  return { uid, name: uid };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No user — redirect to /login");
  }
  return user;
}
