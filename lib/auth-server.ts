import "server-only";

import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { ensureAdminInitialized } from "./firebaseAdmin";

export async function setSessionCookie(
  idToken: string
): Promise<string> {
  console.log("[AUTH] setSessionCookie: ensuring Admin SDK initialized...");
  ensureAdminInitialized();
  const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days

  console.log("[AUTH] setSessionCookie: calling createSessionCookie...");
  let sessionCookie: string;
  try {
    sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
    console.log("[AUTH] setSessionCookie: createSessionCookie succeeded");
  } catch (err) {
    console.error("[AUTH] setSessionCookie: createSessionCookie FAILED:", err);
    throw err;
  }

  (await cookies()).set("__session", sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  console.log("[AUTH] setSessionCookie: __session cookie set");
  return sessionCookie;
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete("__session");
}

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  ensureAdminInitialized();
  try {
    const sessionCookie = (await cookies()).get("__session")?.value;
    if (!sessionCookie) return null;

    const decoded = await getAuth()
      .verifySessionCookie(sessionCookie, true);

    return {
      uid: decoded.uid,
      name: decoded.name ?? null,
      email: decoded.email ?? null,
      picture: decoded.picture ?? null,
    };
  } catch {
    return null;
  }
}
